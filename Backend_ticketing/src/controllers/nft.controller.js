import { ethers } from "ethers";
import Ticket from "../models/tickets.model.js";
import Event from "../models/events.model.js";
import User from "../models/user.model.js";
import { uploadToIPFS } from "../utils/ipfs.service.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
	mintNFTTicket,
	generateTicketMetadata as ethGenerateTicketMetadata,
	getContract,
} from "../utils/ethereum.service.js";
import ResellTicket from "../models/resell.model.js";
import Marketplace from "../models/market.model.js";
import Transaction from "../models/transaction.model.js";

// Convert __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contractPath = path.join(__dirname, "..", "contracts", "TicketNFT.json");

// Load the ABI
const TicketNFTAbi = JSON.parse(fs.readFileSync(contractPath, "utf8"));

dotenv.config();

const CONTRACT_ADDRESS = process.env.TICKET_NFT_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Generate metadata for the NFT ticket - renamed to avoid conflict
const createTicketMetadata = async (ticket, event, seat = null) => {
	const seatDisplay = seat ? seat : ticket.seats.join(", ");
	const metadata = {
		name: `${event.name} - Seat ${seatDisplay}`,
		description: `Ticket for ${event.name} at ${event.location} on ${new Date(event.date).toLocaleDateString()}`,
		image: event.image || "https://example.com/default-ticket.png",
		attributes: [
			{ trait_type: "Event", value: event.name },
			{ trait_type: "Date", value: new Date(event.date).toLocaleDateString() },
			{ trait_type: "Location", value: event.location },
			{ trait_type: "Seat", value: seatDisplay },
			{ trait_type: "Ticket ID", value: ticket._id.toString() },
			{ trait_type: "Event ID", value: event._id.toString() },
			{ trait_type: "Unique Seat ID", value: `${event._id}_${seatDisplay}` },
		],
	};

	// Upload metadata to IPFS
	const metadataURI = await uploadToIPFS(JSON.stringify(metadata));
	return metadataURI;
};

export const mintNFT = async (req, res) => {
	const { ticketId } = req.params;
	const { walletAddress, eventId, useMockNFT } = req.body;
	const userId = req.user.id;

	console.log(
		`NFT mint request for ticket ${ticketId}, wallet ${walletAddress}, useMock: ${useMockNFT}`
	);

	try {
		// Find the ticket
		const ticket = await Ticket.findById(ticketId).populate("event");
		if (!ticket) {
			return res
				.status(404)
				.json({ success: false, message: "Ticket not found" });
		}

		// Check if ticket is already minted as NFT
		if (ticket.tokenId) {
			return res.status(400).json({
				success: false,
				message: "Ticket is already minted as NFT",
				tokenId: ticket.tokenId,
			});
		}

		// If mock mode is enabled, skip blockchain interaction
		if (useMockNFT || process.env.USE_MOCK_NFT === "true") {
			console.log("Using mock NFT mode");

			// Generate mock token ID
			const mockTokenId = `mock-${Date.now()}-${ticketId.substring(0, 6)}`;

			// Update ticket with mock NFT information
			ticket.tokenId = mockTokenId;
			ticket.onChain = true;
			await ticket.save();

			// Update user wallet address if provided
			if (walletAddress) {
				await User.findByIdAndUpdate(userId, { walletAddress });
			}

			return res.status(200).json({
				success: true,
				message: "NFT minted successfully (Development Mode)",
				tokenId: mockTokenId,
				txHash: "0x" + Math.random().toString(16).slice(2, 34),
				ticket,
			});
		}

		// For real minting, generate metadata
		const metadataURI = await createTicketMetadata(ticket, ticket.event);

		// Attempt to mint the NFT on the blockchain
		try {
			const result = await mintNFTTicket(
				walletAddress,
				eventId || ticket.event._id.toString(),
				ticket.seats[0], // Using first seat for simplicity
				metadataURI
			);

			if (!result.success) {
				console.error("Mint failed:", result.error);
				return res.status(500).json({
					success: false,
					message: "Failed to mint NFT",
					error: result.error,
				});
			}

			// Update ticket with NFT information
			ticket.tokenId = result.tokenId;
			ticket.tokenURI = metadataURI;
			ticket.onChain = true;
			await ticket.save();

			// Update user wallet address if provided
			if (walletAddress) {
				await User.findByIdAndUpdate(userId, { walletAddress });
			}

			res.status(200).json({
				success: true,
				message: "NFT minted successfully",
				tokenId: result.tokenId,
				txHash: result.txHash,
				ticket,
			});
		} catch (mintError) {
			console.error("Mint operation error:", mintError);

			// Provide detailed error message
			res.status(500).json({
				success: false,
				message: "Error during NFT minting operation",
				error: mintError.message || String(mintError),
			});
		}
	} catch (error) {
		console.error("NFT controller error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during NFT minting",
			error: error.message || String(error),
		});
	}
};

// NFT resale functionality
export const resellNFTTicket = async (req, res) => {
	const { ticketId, price, walletAddress } = req.body;
	const userId = req.user.id;

	try {
		// Find the ticket with NFT data
		const ticket = await Ticket.findById(ticketId).populate("event");

		if (!ticket) {
			return res
				.status(404)
				.json({ success: false, message: "Ticket not found" });
		}

		// Check if it's an NFT ticket
		if (!ticket.tokenId) {
			return res.status(400).json({
				success: false,
				message:
					"This ticket is not an NFT. Please mint it as NFT first or use standard resale.",
			});
		}

		// Verify ticket ownership
		if (ticket.owner.toString() !== userId) {
			return res
				.status(403)
				.json({ success: false, message: "You don't own this ticket" });
		}

		// Validate wallet address
		if (!walletAddress) {
			return res.status(400).json({
				success: false,
				message: "Wallet address is required for NFT ticket resale",
			});
		}

		// Update user's wallet address if provided
		await User.findByIdAndUpdate(userId, { walletAddress });

		// Parse token IDs - they might be a comma-separated string if multiple were minted
		const tokenIds = ticket.tokenId.split(",");

		// Update ticket status for resale
		ticket.resale = true;
		await ticket.save();

		// Create a new resell ticket entry with NFT info
		const resellTicket = new ResellTicket({
			ticket: ticketId,
			seller: userId,
			price,
			isNFT: true,
			tokenId: ticket.tokenId, // Preserve the original token ID(s)
			tokenURI: ticket.tokenURI,
			// Generate a unique resale reference for this transaction
			resaleRef: `NFTRESALE-${Date.now()}-${ticket.event._id.toString().substring(0, 6)}-${userId.substring(0, 6)}`,
			sellerWalletAddress: walletAddress, // Store the seller's wallet address
		});

		await resellTicket.save();

		// Update user's resell tickets list
		await User.findByIdAndUpdate(userId, {
			$addToSet: { resellTickets: resellTicket._id },
		});

		// Add to marketplace
		const marketplace = await Marketplace.findOne({});
		if (!marketplace) {
			const newMarketplace = new Marketplace({ tickets: [resellTicket._id] });
			await newMarketplace.save();
		} else {
			marketplace.tickets.push(resellTicket._id);
			await marketplace.save();
		}

		// Return populated ticket details
		const populatedResellTicket = await ResellTicket.findById(resellTicket._id)
			.populate({
				path: "ticket",
				populate: {
					path: "event",
					select: "name date location",
				},
			})
			.populate("seller", "username walletAddress");

		res.status(201).json({
			success: true,
			message: "NFT ticket listed for resale successfully",
			resellTicket: populatedResellTicket,
		});
	} catch (error) {
		console.error("Error reselling NFT ticket:", error);
		res.status(500).json({
			success: false,
			message: "Failed to resell NFT ticket",
			error: error.message,
		});
	}
};

export const buyNFTResellTicket = async (req, res) => {
	const { resellTicketId } = req.body;
	const userId = req.user.id;
	const buyerWalletAddress = req.body.walletAddress;

	if (!buyerWalletAddress) {
		return res.status(400).json({
			success: false,
			message: "Wallet address is required to purchase an NFT ticket",
		});
	}

	try {
		// Find the resell ticket with populated ticket and seller
		const resellTicket = await ResellTicket.findById(resellTicketId)
			.populate({
				path: "ticket",
				populate: {
					path: "event",
				},
			})
			.populate("seller", "username walletAddress");

		if (!resellTicket) {
			return res.status(404).json({
				success: false,
				message: "Resell ticket not found",
			});
		}

		if (!resellTicket.isNFT || !resellTicket.tokenId) {
			return res.status(400).json({
				success: false,
				message: "This is not an NFT ticket. Use standard purchase endpoint.",
			});
		}

		// FIXED: First check for wallet address stored directly on the resell ticket document
		let sellerWalletAddress = resellTicket.sellerWalletAddress;

		// If not found on the resell document, check the seller's profile
		if (!sellerWalletAddress && resellTicket.seller?.walletAddress) {
			sellerWalletAddress = resellTicket.seller.walletAddress;
		}

		if (!sellerWalletAddress) {
			return res.status(400).json({
				success: false,
				message: "Seller wallet address not found. Transaction cannot proceed.",
			});
		}

		try {
			const contract = getContract();

			// Get the token IDs (may be multiple)
			const tokenIds = resellTicket.tokenId.split(",");
			const transferResults = [];

			// FIXED: Add approval check and transaction for each token
			for (const tokenId of tokenIds) {
				const trimmedId = tokenId.trim();
				const tokenIdValue = Number(trimmedId);

				if (isNaN(tokenIdValue)) {
					throw new Error(`Invalid token ID: ${trimmedId}`);
				}

				console.log("Transfer details:", {
					from: sellerWalletAddress,
					to: buyerWalletAddress,
					tokenId: tokenIdValue,
				});

				try {
					// FIXED: Check current owner
					const currentOwner = await contract.ownerOf(tokenIdValue);
					console.log("Current token owner:", currentOwner);

					if (
						currentOwner.toLowerCase() !== sellerWalletAddress.toLowerCase()
					) {
						throw new Error(
							`Seller is not the current owner of token ${tokenIdValue}. Current owner is ${currentOwner}`
						);
					}

					// FIXED: Check if contract is approved
					const isApproved = await contract.isApprovedForAll(
						sellerWalletAddress,
						process.env.CONTRACT_OWNER_ADDRESS
					);

					if (!isApproved) {
						console.log("Attempting to approve contract for transfer...");
						// Try to set approval if not already approved
						// This might fail if the contract doesn't support this from backend
						try {
							await contract.setApprovalForAll(
								process.env.CONTRACT_OWNER_ADDRESS,
								true,
								{
									from: sellerWalletAddress,
								}
							);
						} catch (approvalError) {
							console.error("Auto-approval failed:", approvalError);
							throw new Error(
								"Seller needs to approve NFT transfer from their wallet"
							);
						}
					}

					// FIXED: Add gasLimit to prevent estimateGas errors
					const tx = await contract.transferFrom(
						sellerWalletAddress, // From seller
						buyerWalletAddress, // To buyer
						tokenIdValue, // The NFT token ID
						{
							gasLimit: 300000, // Explicit gas limit
						}
					);

					const receipt = await tx.wait();
					transferResults.push({
						tokenId: trimmedId,
						txHash: receipt.transactionHash,
					});
				} catch (transferError) {
					console.error(
						`Error transferring token ${tokenIdValue}:`,
						transferError
					);

					// More specific error message
					let errorMsg = transferError.message;
					if (transferError.message.includes("ERC721")) {
						if (
							transferError.message.includes(
								"caller is not token owner or approved"
							)
						) {
							errorMsg = `NFT transfer requires seller approval. Please ask seller to approve the transfer from their wallet.`;
						} else if (
							transferError.message.includes(
								"owner query for nonexistent token"
							)
						) {
							errorMsg = `Token ${tokenIdValue} does not exist on the blockchain.`;
						}
					}

					throw new Error(errorMsg);
				}
			}

			// Only update database after successful blockchain transactions
			const ticket = await Ticket.findById(resellTicket.ticket._id);
			ticket.owner = userId;
			ticket.resale = false;

			// Store the buyer's wallet address
			await User.findByIdAndUpdate(userId, {
				walletAddress: buyerWalletAddress,
				$addToSet: { tickets: ticket._id },
			});

			await ticket.save();

			// Remove resell ticket from marketplace
			await Marketplace.updateOne({}, { $pull: { tickets: resellTicketId } });
			await ResellTicket.findByIdAndDelete(resellTicketId);

			// Create transaction record
			const transaction = new Transaction({
				buyer: userId,
				seller: resellTicket.seller._id,
				ticket: ticket._id,
				amount: resellTicket.price,
				transactionType: "nft-resale",
				blockchainTxData: transferResults,
				resaleRef: resellTicket.resaleRef || `NFTPURCHASE-${Date.now()}`,
			});

			await transaction.save();

			res.status(200).json({
				success: true,
				message: "NFT ticket purchased successfully",
				ticket: ticket,
				transferResults,
			});
		} catch (blockchainError) {
			console.error("Blockchain transfer error:", blockchainError);
			return res.status(500).json({
				success: false,
				message: "Failed to transfer NFT on blockchain",
				error: blockchainError.message,
			});
		}
	} catch (error) {
		console.error("Error buying NFT resell ticket:", error);
		res.status(500).json({
			success: false,
			message: "Failed to purchase NFT ticket",
			error: error.message,
		});
	}
};

export const verifyTicket = async (req, res) => {
	try {
		const { tokenId } = req.params;
		const contract = getContract();

		const result = await contract.verifyTicket(tokenId);

		res.status(200).json({
			isValid: result[0],
			eventId: result[1],
			seat: result[2],
			owner: result[3],
		});
	} catch (error) {
		console.error("Error verifying ticket:", error);
		res.status(500).json({
			success: false,
			message: "Failed to verify NFT ticket",
			error: error.message,
		});
	}
};

// Add this new controller method
export const getContractDetails = async (req, res) => {
	try {
		// For testnet environment - return hardcoded addresses for local development
		if (process.env.NODE_ENV === "development") {
			return res.status(200).json({
				success: true,
				contractAddress: process.env.TICKET_NFT_CONTRACT_ADDRESS,
				contractOwnerAddress: process.env.CONTRACT_OWNER_ADDRESS,
				networkId: "31337", // Hardhat's default chain ID
				networkName: "Hardhat",
				rpcUrl: "http://localhost:8545",
				contractType: "TicketNFT",
			});
		}

		// For production environment
		res.status(200).json({
			success: true,
			contractAddress: process.env.TICKET_NFT_CONTRACT_ADDRESS,
			contractOwnerAddress: process.env.CONTRACT_OWNER_ADDRESS,
			networkId: process.env.NETWORK_ID || "11155111", // Sepolia testnet as fallback
			networkName: process.env.NETWORK_NAME || "Sepolia",
			contractType: "TicketNFT",
		});
	} catch (error) {
		console.error("Error getting contract details:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get contract details",
			error: error.message,
		});
	}
};
