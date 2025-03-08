import express from "express";
import {
	mintNFT,
	verifyTicket,
	resellNFTTicket,
	buyNFTResellTicket,
	getContractDetails,
} from "../controllers/nft.controller.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

// Existing routes
router.post("/mint/:ticketId", authenticateUser, mintNFT);
router.get("/verify/:tokenId", verifyTicket);

// New NFT reselling routes
router.post("/resell", authenticateUser, resellNFTTicket);
router.post("/purchase", authenticateUser, buyNFTResellTicket);

// Add this new route
router.get("/contract-details", authenticateUser, getContractDetails);

export default router;
