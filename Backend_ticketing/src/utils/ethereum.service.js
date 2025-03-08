import { ethers } from "ethers";
import dotenv from "dotenv";
import TicketNFTAbi from "../contracts/TicketNFT.json" with { type: "json" };
import { uploadToIPFS } from "./ipfs.service.js";

dotenv.config();

const CONTRACT_ADDRESS = process.env.TICKET_NFT_CONTRACT_ADDRESS || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK || "sepolia";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";

export const getProvider = () => {
	// Choose provider based on the blockchain network specified in env
	const network = BLOCKCHAIN_NETWORK.toLowerCase();

	console.log(`Using blockchain network: ${network}`);

	if (network === "localhost" || network === "hardhat") {
		return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
	} else if (network === "sepolia") {
		return new ethers.JsonRpcProvider(
			`https://sepolia.infura.io/v3/${INFURA_API_KEY}`
		);
	} else if (network === "goerli") {
		return new ethers.JsonRpcProvider(
			`https://goerli.infura.io/v3/${INFURA_API_KEY}`
		);
	} else if (network === "mumbai") {
		return new ethers.JsonRpcProvider(
			`https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`
		);
	} else {
		console.warn(`Unknown network ${network}, falling back to Sepolia`);
		return new ethers.JsonRpcProvider(
			`https://sepolia.infura.io/v3/${INFURA_API_KEY}`
		);
	}
};

export const getWallet = () => {
	const provider = getProvider();
	return new ethers.Wallet(PRIVATE_KEY, provider);
};

export const getContract = () => {
	const wallet = getWallet();
	return new ethers.Contract(CONTRACT_ADDRESS, TicketNFTAbi.abi, wallet);
};

// Generate metadata for the NFT ticket
export const generateTicketMetadata = async (ticket, event) => {
	const metadata = {
		name: `${event.name} - Seat ${ticket.seats.join(", ")}`,
		description: `Ticket for ${event.name} at ${event.location} on ${new Date(event.date).toLocaleDateString()}`,
		image: event.image || "https://example.com/default-ticket.png",
		attributes: [
			{ trait_type: "Event", value: event.name },
			{ trait_type: "Date", value: new Date(event.date).toLocaleDateString() },
			{ trait_type: "Location", value: event.location },
			{ trait_type: "Seat", value: ticket.seats.join(", ") },
			{ trait_type: "Ticket ID", value: ticket._id.toString() },
		],
	};

	// Upload metadata to IPFS and return the URL
	const metadataURI = await uploadToIPFS(JSON.stringify(metadata));
	return metadataURI;
};

// Mint a new NFT ticket
export const mintNFTTicket = async (
	userAddress,
	eventId,
	seat,
	ticketMetadataURI
) => {
	try {
		// Enable mock mode (development fallback)
		if (process.env.USE_MOCK_NFT === "true") {
			console.log("Using mock NFT mode instead of blockchain interaction");
			return {
				success: true,
				tokenId: `mock-${Date.now()}`,
				txHash: "0x" + Math.random().toString(16).slice(2, 34),
			};
		}

		console.log(
			`Minting NFT for user ${userAddress}, event ${eventId}, seat ${seat}`
		);
		const contract = getContract();

		// Call the mintTicket function on the smart contract
		const tx = await contract.mintTicket(
			userAddress,
			eventId,
			seat,
			ticketMetadataURI
		);

		console.log(`Transaction submitted: ${tx.hash}`);

		// Wait for the transaction to be confirmed
		const receipt = await tx.wait();
		console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

		// Extract tokenId from the event emitted by the contract
		// Updated for ethers v6
		const ticketMintedEvent = receipt.logs
			.filter((log) => {
				try {
					return log.fragment && log.fragment.name === "TicketMinted";
				} catch (e) {
					return false;
				}
			})
			.map((log) => {
				return {
					event: log.fragment.name,
					args: log.args,
				};
			})[0];

		const tokenId = ticketMintedEvent?.args[0].toString();

		return {
			success: true,
			tokenId,
			txHash: receipt.hash,
		};
	} catch (error) {
		console.error("Error minting NFT ticket:", error);
		return {
			success: false,
			error: error.message || String(error),
		};
	}
};

// Verify a ticket's validity
export const verifyTicket = async (tokenId) => {
	try {
		const contract = getContract();
		const result = await contract.verifyTicket(tokenId);

		return {
			isValid: result[0],
			eventId: result[1].toString(),
			seat: result[2],
			owner: result[3],
			success: true,
		};
	} catch (error) {
		console.error("Error verifying ticket:", error);
		return {
			success: false,
			error: error.message,
		};
	}
};
