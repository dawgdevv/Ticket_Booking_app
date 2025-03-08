import { useState } from "react";
import { motion } from "framer-motion";
import { verifyTicketByTokenId } from "../services/nft.service";

const VerifyNFTTicket = () => {
  const [tokenId, setTokenId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!tokenId.trim()) {
      setError("Please enter a token ID");
      return;
    }

    try {
      setIsVerifying(true);
      setError("");
      setVerificationResult(null);

      const result = await verifyTicketByTokenId(tokenId);
      setVerificationResult(result);
      setIsVerifying(false);
    } catch (error) {
      console.error("Verification failed:", error);
      setError(error.response?.data?.message || "Failed to verify ticket");
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Verify NFT Ticket</h2>

      <form onSubmit={handleVerify}>
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
            required
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isVerifying}
          className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isVerifying ? "Verifying..." : "Verify Ticket"}
        </motion.button>

        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </form>

      {verificationResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Ticket Verified!
          </h3>
          <div className="space-y-2 text-gray-700">
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
              <span className="text-xs">{verificationResult.owner}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VerifyNFTTicket;
