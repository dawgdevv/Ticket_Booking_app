import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import NFTResellForm from "../components/NFTResellForm";
import Modal from "./modal"; // Import your modal component

const NFTTickets = () => {
  const [activeTab, setActiveTab] = useState("verify");
  const [tokenId, setTokenId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showResellModal, setShowResellModal] = useState(false);

  useEffect(() => {
    const fetchNFTTickets = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/nft-tickets`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching NFT tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTTickets();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsConnecting(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        setWallet({
          address: accounts[0],
          provider,
          signer,
        });
        setIsConnecting(false);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setError("Failed to connect wallet. Please try again.");
        setIsConnecting(false);
      }
    } else {
      setError(
        "MetaMask is not installed. Please install MetaMask to use this feature."
      );
    }
  };

  const verifyTicket = async (e) => {
    e.preventDefault();
    if (!tokenId.trim()) {
      setError("Please enter a token ID");
      return;
    }

    try {
      setIsVerifying(true);
      setError("");
      setVerificationResult(null);

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"
        }/nft/verify/${tokenId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to verify ticket: ${response.statusText}`);
      }

      const data = await response.json();
      setVerificationResult(data);
      setIsVerifying(false);
    } catch (error) {
      console.error("Verification failed:", error);
      setError(error.message || "Failed to verify ticket");
      setIsVerifying(false);
    }
  };

  const handleResellClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowResellModal(true);
  };

  const handleResellSuccess = () => {
    setShowResellModal(false);
    // Refresh the tickets list
    fetchNFTTickets();
  };

  const fetchNFTTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/auth/nft-tickets`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching NFT tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-amber-800">
          NFT Tickets
        </h1>

        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab("verify")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === "verify"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-amber-800 hover:bg-amber-100"
              }`}
            >
              Verify Ticket
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === "about"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-amber-800 hover:bg-amber-100"
              }`}
            >
              About NFT Tickets
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6">Verify NFT Ticket</h2>

              {!wallet ? (
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Connect your wallet to verify tickets on the blockchain.
                  </p>
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                  >
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </button>
                  {error && (
                    <p className="text-red-500 mt-2 text-sm">{error}</p>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-6">
                    <p className="text-green-700">
                      Connected: {wallet.address.substring(0, 6)}...
                      {wallet.address.substring(wallet.address.length - 4)}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={verifyTicket}>
                <div className="mb-4">
                  <label htmlFor="tokenId" className="block text-gray-700 mb-2">
                    NFT Token ID
                  </label>
                  <input
                    type="text"
                    id="tokenId"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="Enter token ID"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-70"
                >
                  {isVerifying ? "Verifying..." : "Verify Ticket"}
                </button>
              </form>

              {error && <p className="text-red-500 mt-4">{error}</p>}

              {verificationResult && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    Ticket Verification Result
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Valid:</span>
                      <span>{verificationResult.isValid ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Event ID:</span>
                      <span>{verificationResult.eventId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Seat:</span>
                      <span>{verificationResult.seat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Owner:</span>
                      <span className="text-xs break-all">
                        {verificationResult.owner}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4">About NFT Tickets</h2>
              <div className="prose prose-amber max-w-none">
                <p>
                  NFT (Non-Fungible Token) tickets represent unique digital
                  assets on the blockchain that prove ownership and authenticity
                  of your event tickets.
                </p>
                <h3>What makes NFT tickets special?</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Authenticity:</strong> Each ticket is
                    cryptographically secured on the blockchain, making
                    counterfeiting impossible.
                  </li>
                  <li>
                    <strong>Ownership:</strong> Clear proof of who owns the
                    ticket at any given time.
                  </li>
                  <li>
                    <strong>Transferability:</strong> Easily and securely
                    transfer tickets to others.
                  </li>
                  <li>
                    <strong>Collectibility:</strong> Keep your ticket as a
                    digital souvenir after the event.
                  </li>
                  <li>
                    <strong>Programmability:</strong> Smart contracts can enable
                    special features like royalties on resales.
                  </li>
                </ul>
                <h3>How to use NFT tickets:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Purchase a ticket through our regular checkout</li>
                  <li>Connect your Ethereum wallet (like MetaMask)</li>
                  <li>Mint your ticket as an NFT</li>
                  <li>The NFT will be sent to your wallet</li>
                  <li>Present the NFT for verification at the event</li>
                </ol>
                <p className="mt-4">
                  NFT tickets require an Ethereum wallet and a small amount of
                  ETH to cover network fees.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My NFT Tickets</h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">
              You don't have any NFT tickets yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="font-bold text-xl mb-2">
                    {ticket.event?.name}
                  </h2>
                  <p className="mb-1">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(ticket.event?.date).toLocaleDateString()}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Seats:</span>{" "}
                    {ticket.seats?.join(", ")}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Token ID:</span>{" "}
                    <span className="font-mono text-sm">{ticket.tokenId}</span>
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {!ticket.resale ? (
                      <button
                        onClick={() => handleResellClick(ticket)}
                        className="w-full bg-amber-500 text-white py-2 rounded hover:bg-amber-600 transition-colors"
                      >
                        Resell This Ticket
                      </button>
                    ) : (
                      <p className="text-center text-green-600">
                        Listed for resale
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Resell Modal */}
        <Modal
          isOpen={showResellModal}
          onClose={() => setShowResellModal(false)}
        >
          {selectedTicket && (
            <NFTResellForm
              ticket={selectedTicket}
              onSuccess={handleResellSuccess}
            />
          )}
        </Modal>
      </div>
    </motion.div>
  );
};

export default NFTTickets;
