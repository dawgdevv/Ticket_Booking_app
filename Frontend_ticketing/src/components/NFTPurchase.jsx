import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import PropTypes from "prop-types";
import Web3Connect from "./Web3Connect";

const NFTPurchase = ({ ticket, onSuccess, onCancel }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletAddress) {
      setError("Please connect a wallet first");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
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

      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(response.data.ticket);
      }
    } catch (error) {
      setIsSubmitting(false);
      setError(
        error.response?.data?.message || "Failed to purchase NFT ticket"
      );
      console.error("Error purchasing NFT ticket:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h3 className="text-xl font-bold mb-4">Purchase NFT Ticket</h3>

      <div className="mb-6">
        <p>
          <span className="font-semibold">Event:</span>{" "}
          {ticket.ticket.event.name}
        </p>
        <p>
          <span className="font-semibold">Seat:</span>{" "}
          {ticket.ticket.seats?.join(", ")}
        </p>
        <p>
          <span className="font-semibold">Price:</span> ₹{ticket.price}
        </p>
        <p>
          <span className="font-semibold">Token ID:</span> {ticket.tokenId}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-medium mb-2">Connect Wallet to Receive NFT</h4>
        <Web3Connect onConnect={handleWalletConnect} />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSubmit}
          disabled={!walletAddress || isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : "Confirm Purchase"}
        </button>

        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

NFTPurchase.propTypes = {
  ticket: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default NFTPurchase;
