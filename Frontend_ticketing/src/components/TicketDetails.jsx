import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Web3Connect from "./Web3Connect";
import { mintTicketAsNFT } from "../services/nft.service";

const TicketDetails = ({
  ticket,
  formatPrice,
  onDownload,
  hiveUser,
  isBroadcasted,
  paymentMethod,
  hivePayment,
  moonpayPayment,
}) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isNFTMinting, setIsNFTMinting] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);
  const [nftError, setNftError] = useState("");
  const [nftTokenId, setNftTokenId] = useState(null);
  const [hiveWallet, setHiveWallet] = useState("");

  // If the ticket already has a token ID, set nftMinted to true
  useEffect(() => {
    if (ticket && ticket.tokenId) {
      setNftMinted(true);
      // Handle potential array of token IDs (comma-separated string)
      setNftTokenId(ticket.tokenId);
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    console.log("Connected wallet:", address);
  };

  const handleHiveConnect = (wallet) => {
    setHiveWallet(wallet);
    console.log("Connected Hive wallet:", wallet);
  };

  const handleMintNFT = async () => {
    if (!walletAddress && !hiveWallet) {
      setNftError("Please connect a wallet first");
      return;
    }

    try {
      setIsNFTMinting(true);
      setNftError("");

      console.log("Minting NFT for ticket:", ticket._id);
      console.log("Event ID:", ticket.event?._id);
      console.log("Seat(s):", ticket.seats);

      // Add mock parameter (false by default) to use real blockchain
      const result = await mintTicketAsNFT(
        ticket._id,
        walletAddress || hiveWallet,
        ticket.event?._id,
        false
      );

      console.log("Minting result:", result);
      setNftMinted(true);
      setNftTokenId(result.tokenId);
      setIsNFTMinting(false);
    } catch (error) {
      console.error("Minting failed:", error);
      console.error("NFT minting error:", error);

      // Better error extraction
      let errorMessage = "Failed to mint NFT";

      try {
        // Check for insufficient funds error specifically
        if (
          error.response?.data?.error &&
          error.response.data.error.includes("insufficient funds")
        ) {
          // Try again with mock NFT as a fallback
          try {
            setNftError("Trying mock NFT mode...");

            const mockResult = await mintTicketAsNFT(
              ticket._id,
              walletAddress || hiveWallet,
              ticket.event?._id,
              true // Use mock mode
            );

            console.log("Mock minting result:", mockResult);
            setNftMinted(true);
            setNftTokenId(mockResult.tokenId);
            setIsNFTMinting(false);
            setNftError("");
            return;
          } catch (mockError) {
            console.error("Mock minting failed:", mockError);
            errorMessage =
              "Could not mint NFT: The server doesn't have enough ETH to cover gas fees, and mock mode also failed.";
          }
        }
        // Check for other specific errors
        else if (error.response?.data?.error) {
          if (
            error.response.data.error.includes("BigNumberish") ||
            error.response.data.error.includes("BigInt")
          ) {
            errorMessage = "Invalid event ID format. Please contact support.";
          } else if (error.response.data.error.includes("execution reverted")) {
            const match = error.response.data.error.match(/reason="([^"]+)"/);
            errorMessage =
              match && match[1] ? match[1] : "Contract execution failed";
          } else {
            errorMessage =
              error.response.data.message || error.response.data.error;
          }
        }
      } catch (parseError) {
        console.error("Error parsing error:", parseError);
      }

      setNftError(errorMessage);
      setIsNFTMinting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-6 rounded-lg shadow-lg border border-amber-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-amber-800">
          Your Ticket is Ready!
        </h2>

        {/* Ticket details section - unchanged */}
        <div className="space-y-4">
          {/* Existing ticket details */}
          <div className="flex justify-between">
            <span className="font-semibold">Event:</span>
            <span>{ticket.event?.name || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Venue:</span>
            <span>{ticket.venue || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Seats:</span>
            <span>{ticket.seats?.join(", ") || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Price:</span>
            <span>{formatPrice(ticket.price) || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Quantity:</span>
            <span>{ticket.quantity || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Ticket ID:</span>
            <span className="text-xs">{ticket._id || "N/A"}</span>
          </div>

          {/* Show Hive payment details if available */}
          {hivePayment && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-700 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-blue-700">
                  <div>
                    {hivePayment.simulatedPayment
                      ? "Simulated payment of " +
                        hivePayment.amount +
                        " HIVE successful"
                      : "Payment of " + hivePayment.amount + " HIVE successful"}
                  </div>
                  <div className="text-xs mt-1">
                    Transaction ID:{" "}
                    <span className="font-mono">
                      {hivePayment.transactionId}
                    </span>
                  </div>
                  <div className="text-xs mt-1">
                    Time: {new Date(hivePayment.timestamp).toLocaleString()}
                  </div>
                  {hivePayment.simulatedPayment && (
                    <div className="text-xs mt-1 italic">
                      This was a test transaction using Resource Credits only
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add MoonPay payment details */}
          {paymentMethod === "moonpay" && moonpayPayment && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-700 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-blue-800">
                    MoonPay Transaction Details
                  </p>
                  <p className="mt-1">
                    Transaction ID: {moonpayPayment.transactionId}
                  </p>
                  {moonpayPayment.mode === "buy" ? (
                    <>
                      <p>
                        Purchased: {moonpayPayment.cryptoAmount}{" "}
                        {moonpayPayment.cryptoCurrency}
                      </p>
                      <p>
                        Paid: {moonpayPayment.fiatAmount}{" "}
                        {moonpayPayment.fiatCurrency}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Sold: {moonpayPayment.cryptoAmount}{" "}
                        {moonpayPayment.cryptoCurrency}
                      </p>
                      <p>
                        Received: {moonpayPayment.fiatAmount}{" "}
                        {moonpayPayment.fiatCurrency}
                      </p>
                    </>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(moonpayPayment.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hive blockchain broadcast status */}
          {isBroadcasted && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center text-green-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Broadcasted to Hive blockchain by @{hiveUser?.username}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* NFT Section - Updated with better error handling */}
        <div className="mt-6 pt-6 border-t border-amber-300">
          <h3 className="text-xl font-semibold text-amber-800 mb-3">
            Make it an NFT
          </h3>
          <p className="text-gray-700 mb-4">Turn your ticket into an NFT</p>

          {ticket.tokenId ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                This ticket is already an NFT! (Token ID: {ticket.tokenId})
              </p>
            </div>
          ) : nftMinted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                NFT successfully minted! Token ID: {nftTokenId}
              </p>
            </div>
          ) : (
            <>
              {/* Wallet connection options */}
              <div className="space-y-4 mb-4">
                {!hiveUser && <Web3Connect onConnect={handleWalletConnect} />}
                {hiveUser && !hiveWallet && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Connected with Hive as @{hiveUser.username}
                    </p>
                    <button
                      onClick={() => handleHiveConnect(hiveUser.username)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Use Hive Account for NFT
                    </button>
                  </div>
                )}
              </div>

              {/* Minting button */}
              {(walletAddress || hiveWallet) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMintNFT}
                  disabled={isNFTMinting}
                  className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isNFTMinting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Minting...
                    </div>
                  ) : (
                    "Mint as NFT"
                  )}
                </motion.button>
              )}

              {nftError && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {nftError}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Download button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onDownload}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
};

TicketDetails.propTypes = {
  ticket: PropTypes.object.isRequired,
  formatPrice: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  hiveUser: PropTypes.object,
  isBroadcasted: PropTypes.bool,
  paymentMethod: PropTypes.string,
  hivePayment: PropTypes.object,
  moonpayPayment: PropTypes.object,
};

export default TicketDetails;
