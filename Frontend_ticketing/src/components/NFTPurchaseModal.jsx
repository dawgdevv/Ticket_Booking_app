import { useState } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import axios from "axios";

const NFTPurchaseModal = ({ ticket, onSuccess, onCancel }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    setIsConnecting(true);
    setError("");

    try {
      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to proceed."
        );
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length === 0) {
        throw new Error("No Ethereum accounts found. Please unlock MetaMask.");
      }

      setWalletAddress(accounts[0]);
    } catch (error) {
      setError(error.message || "Failed to connect wallet");
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!walletAddress) {
        throw new Error("Please connect your wallet first");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/nft/purchase`,
        {
          resellTicketId: ticket._id,
          walletAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onSuccess(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to purchase NFT ticket"
      );
      console.error("Error purchasing NFT ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">Purchase NFT Ticket</h2>

      <div className="mb-6">
        <p className="font-medium mb-1">
          Event: {ticket.ticket.event?.name || "Unknown Event"}
        </p>
        <p className="font-medium mb-1">
          Seat(s): {ticket.ticket.seats?.join(", ") || "N/A"}
        </p>
        <p className="font-medium mb-1">Price: ₹{ticket.price}</p>
        <p className="font-medium mb-1">
          Token ID: <span className="font-mono text-sm">{ticket.tokenId}</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {isConnecting ? "Connecting..." : "Connect MetaMask Wallet"}
        </button>
      ) : (
        <div>
          <p className="mb-4 p-2 bg-green-100 text-green-800 rounded-md font-mono text-sm break-all">
            Connected: {walletAddress}
          </p>

          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition-colors"
            >
              {isSubmitting ? "Processing..." : "Confirm Purchase"}
            </button>

            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

NFTPurchaseModal.propTypes = {
  ticket: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default NFTPurchaseModal;
