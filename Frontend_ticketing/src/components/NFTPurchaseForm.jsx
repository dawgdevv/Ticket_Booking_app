import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import PropTypes from "prop-types";
import { ethers } from "ethers";

// Use a simplified ABI with just the functions we need
const ERC721_ABI = [
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId)",
];

const NFTPurchaseForm = ({ ticket, onSuccess, onCancel }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [contractDetails, setContractDetails] = useState(null);

  // Fetch contract addresses when component mounts
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

        console.log("Contract details response:", response.data);
        setContractDetails(response.data);
      } catch (err) {
        console.error("Failed to fetch contract details:", err);
        setError("Unable to fetch contract details. Please try again later.");
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
            await provider.send("wallet_switchEthereumChain", [
              { chainId: chainIdHex },
            ]);
          } catch (switchError) {
            console.warn("Network switching failed:", switchError);
          }
        }

        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
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

  const formatEventName = () => {
    try {
      if (ticket.ticket && ticket.ticket.event && ticket.ticket.event.name) {
        return ticket.ticket.event.name;
      }
      return "Event";
    } catch (e) {
      return "Event";
    }
  };

  const formatSeats = () => {
    try {
      if (ticket.ticket && ticket.ticket.seats) {
        return ticket.ticket.seats.join(", ");
      }
      return "N/A";
    } catch (e) {
      return "N/A";
    }
  };

  // Get seller's address from the ticket
  const getSellerAddress = () => {
    if (ticket.sellerWalletAddress) {
      return ticket.sellerWalletAddress;
    }
    if (ticket.seller && ticket.seller.walletAddress) {
      return ticket.seller.walletAddress;
    }
    return null;
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
      // Verify token owner on the blockchain before proceeding
      if (contractDetails?.contractAddress && ticket.tokenId) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(
            contractDetails.contractAddress,
            ERC721_ABI,
            provider
          );

          const tokenId = parseInt(ticket.tokenId);
          if (!isNaN(tokenId)) {
            try {
              const currentOwner = await contract.ownerOf(tokenId);
              const sellerAddress = getSellerAddress();

              if (
                sellerAddress &&
                currentOwner.toLowerCase() !== sellerAddress.toLowerCase()
              ) {
                throw new Error(
                  `Token ownership mismatch. Listed seller is not the current owner on the blockchain.`
                );
              }

              console.log("Token owner verified:", currentOwner);
            } catch (ownerError) {
              console.warn("Owner verification failed:", ownerError);
              // Continue with purchase even if verification fails
            }
          }
        } catch (verifyError) {
          console.warn("Blockchain verification failed:", verifyError);
          // Continue with purchase even if verification fails
        }
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

      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      setIsSubmitting(false);

      // Improved error message handling
      let errorMsg =
        error.response?.data?.message || "Failed to purchase NFT ticket";

      // Format more specific error messages
      if (error.response?.data?.error) {
        const errorStr = error.response.data.error;

        if (errorStr.includes("caller is not token owner or approved")) {
          errorMsg =
            "The seller needs to approve the NFT transfer from their wallet. Please contact the seller or try again later.";
        } else if (errorStr.includes("owner query for nonexistent token")) {
          errorMsg =
            "This NFT token does not exist on the blockchain. The ticket may have already been transferred.";
        } else if (errorStr.includes("execution reverted")) {
          errorMsg =
            "Transaction failed on the blockchain. This could be due to approval issues or the seller no longer owns the token.";
        } else if (errorStr.includes("could not decode result data")) {
          errorMsg =
            "Contract interaction failed due to ABI mismatch. Please contact support.";
        }
      }

      setError(errorMsg);
      console.error("Error purchasing NFT ticket:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md max-w-md w-full"
    >
      <h3 className="text-xl font-bold mb-4">Purchase NFT Ticket</h3>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="mb-2">
          <span className="font-semibold">Event:</span> {formatEventName()}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Seat:</span> {formatSeats()}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Price:</span> ₹{ticket.price}
        </p>
        <p>
          <span className="font-semibold">Token ID:</span>{" "}
          <span className="font-mono text-sm">{ticket.tokenId}</span>
        </p>
        {getSellerAddress() && (
          <p className="mt-2 text-xs text-gray-600">
            <span className="font-medium">Seller address:</span>{" "}
            <span className="font-mono">{`${getSellerAddress().substring(
              0,
              6
            )}...${getSellerAddress().substring(
              getSellerAddress().length - 4
            )}`}</span>
          </p>
        )}
        {contractDetails && contractDetails.contractAddress && (
          <p className="mt-2 text-xs text-gray-600">
            <span className="font-medium">Contract address:</span>{" "}
            <span className="font-mono">{`${contractDetails.contractAddress.substring(
              0,
              6
            )}...${contractDetails.contractAddress.substring(
              contractDetails.contractAddress.length - 4
            )}`}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-medium mb-2">Connect Wallet to Receive NFT</h4>
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

      <div className="flex space-x-4">
        <button
          onClick={handleSubmit}
          disabled={!walletAddress || isSubmitting}
          className="flex-1 bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

NFTPurchaseForm.propTypes = {
  ticket: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default NFTPurchaseForm;
