import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const Web3Connect = ({ onConnect }) => {
  const [accounts, setAccounts] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if MetaMask is installed
    const checkMetaMaskInstalled = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            setAccounts(accounts);
            onConnect(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error);
        }
      }
    };

    checkMetaMaskInstalled();
  }, [onConnect]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        setError("");

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setAccounts(accounts);
        onConnect(accounts[0]);
        setIsConnecting(false);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        setError("Failed to connect wallet");
        setIsConnecting(false);
      }
    } else {
      setError("MetaMask is not installed");
    }
  };

  return (
    <div className="my-6">
      {!accounts.length ? (
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </motion.button>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          {!window.ethereum && (
            <p className="text-amber-700 mt-2 text-sm">
              MetaMask not detected! Please install the MetaMask extension to
              use blockchain features.
            </p>
          )}
        </div>
      ) : (
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
            Connected: {accounts[0].substring(0, 6)}...
            {accounts[0].substring(accounts[0].length - 4)}
          </p>
        </div>
      )}
    </div>
  );
};

Web3Connect.propTypes = {
  onConnect: PropTypes.func.isRequired,
};

export default Web3Connect;
