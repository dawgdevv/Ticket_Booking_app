import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import PropTypes from "prop-types";
import { ethers } from "ethers";

// Import the correct ABI
const ERC721_ABI = [
  // Only include the functions we need
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function setApprovalForAll(address operator, bool approved)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId)",
];

const NFTResellForm = ({ ticket, onSuccess, onCancel }) => {
  const [price, setPrice] = useState(ticket.price || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [contractDetails, setContractDetails] = useState(null);

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/nft/contract-details`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          console.log("Contract details:", response.data);
          setContractDetails(response.data);
        } else {
          console.error(
            "Failed to fetch contract details:",
            response.data.message
          );
          setError("Failed to fetch contract details. Please try again.");
        }
      } catch (err) {
        console.error("Failed to fetch contract details:", err);
        setError("Network error when fetching contract details");
      }
    };

    fetchContractDetails();
  }, []);

  const connectWallet = async () => {
    setIsConnectingWallet(true);
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Handle network switching if needed
        if (contractDetails?.networkId) {
          try {
            const chainIdHex = `0x${Number(contractDetails.networkId).toString(
              16
            )}`;
            const currentChainId = await provider.send("eth_chainId", []);

            if (currentChainId !== chainIdHex) {
              try {
                await provider.send("wallet_switchEthereumChain", [
                  { chainId: chainIdHex },
                ]);
              } catch (switchError) {
                // Network doesn't exist, add it (this is common for local testnets)
                if (switchError.code === 4902) {
                  await provider.send("wallet_addEthereumChain", [
                    {
                      chainId: chainIdHex,
                      chainName: contractDetails.networkName || "Local Testnet",
                      nativeCurrency: {
                        name: "ETH",
                        symbol: "ETH",
                        decimals: 18,
                      },
                      rpcUrls: [
                        contractDetails.rpcUrl || "http://localhost:8545",
                      ],
                    },
                  ]);
                } else {
                  throw switchError;
                }
              }
            }
          } catch (error) {
            console.warn("Network switching failed:", error);
          }
        }

        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        console.log("Wallet connected:", address);
        return true;
      } else {
        setError(
          "MetaMask is not installed. Please install MetaMask to connect your wallet."
        );
        return false;
      }
    } catch (error) {
      setError(
        "Failed to connect wallet: " + (error.message || "Unknown error")
      );
      return false;
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const approveTransfer = async () => {
    if (!walletAddress || !contractDetails?.contractAddress) {
      setError("Wallet or contract details not available");
      return false;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Use a simpler ABI to avoid decoding errors
      const contract = new ethers.Contract(
        contractDetails.contractAddress,
        ERC721_ABI,
        signer
      );

      console.log("Checking approval for:", {
        owner: walletAddress,
        operator:
          contractDetails.contractOwnerAddress ||
          contractDetails.contractAddress,
      });

      try {
        // Try to check if already approved
        const operatorToApprove =
          contractDetails.contractOwnerAddress ||
          contractDetails.contractAddress;

        // This line was failing, so we'll catch and handle any error
        const isApproved = await contract.isApprovedForAll(
          walletAddress,
          operatorToApprove
        );
        console.log("Approval status:", isApproved);

        if (isApproved) {
          setIsApproved(true);
          return true;
        }
      } catch (checkError) {
        console.warn(
          "Error checking approval status, proceeding with approval:",
          checkError
        );
        // Continue with approval even if check fails
      }

      // Set approval
      const operatorToApprove =
        contractDetails.contractOwnerAddress || contractDetails.contractAddress;
      console.log("Setting approval for operator:", operatorToApprove);

      const tx = await contract.setApprovalForAll(operatorToApprove, true);
      console.log("Approval transaction sent:", tx);

      const receipt = await tx.wait();
      console.log("Approval transaction confirmed:", receipt);

      setIsApproved(true);
      return true;
    } catch (error) {
      console.error("Approval error:", error);
      setError(`Failed to approve transfer: ${error.message}`);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletAddress) {
      setError("Please connect your wallet first to resell an NFT ticket");
      return;
    }

    if (!isApproved) {
      const approved = await approveTransfer();
      if (!approved) return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/nft/resell`,
        {
          ticketId: ticket._id,
          price: parseFloat(price),
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
        onSuccess(response.data.resellTicket);
      }
    } catch (error) {
      setIsSubmitting(false);
      setError(
        error.response?.data?.message || "Failed to list NFT ticket for resale"
      );
      console.error("Error listing NFT ticket for resale:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h3 className="text-xl font-bold mb-4">List NFT Ticket For Resale</h3>

      <div className="mb-4">
        <p>
          <span className="font-semibold">Event:</span> {ticket.event?.name}
        </p>
        <p>
          <span className="font-semibold">Seat:</span>{" "}
          {ticket.seats?.join(", ")}
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
        <h4 className="font-medium mb-2">Connect Wallet for Resale</h4>
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            disabled={isConnectingWallet || !contractDetails}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isConnectingWallet
              ? "Connecting..."
              : !contractDetails
              ? "Loading Contract Details..."
              : "Connect Wallet"}
          </button>
        ) : (
          <div className="p-3 bg-gray-100 rounded-md break-all">
            <p className="font-mono text-sm">{walletAddress}</p>
            <p className="text-green-600 text-sm mt-1">
              Wallet connected successfully!
            </p>
          </div>
        )}
      </div>

      {walletAddress && !isApproved && (
        <div className="mb-6">
          <button
            onClick={approveTransfer}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Approve NFT Transfer
          </button>
          <p className="text-sm text-gray-600 mt-1 text-center">
            Required one-time approval for the marketplace to transfer this NFT
            when sold
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Resale Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-amber-500"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting || !walletAddress || !isApproved}
            className="flex-1 bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "List for Resale"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

NFTResellForm.propTypes = {
  ticket: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default NFTResellForm;
