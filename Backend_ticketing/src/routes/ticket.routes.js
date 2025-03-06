import express from "express";
import {
	bookTicket,
	resellTicket,
	getresellTickets,
	buyresellTickets,
	getAuctionItems,
	createAuction,
	placeBid,

	// Ensure this controller is implemented
} from "../controllers/ticket.controller.js";
import { authenticateUser } from "../middlewares/auth.js";
import { getAuctionWonTickets } from "../controllers/ticket.controller.js";

const router = express.Router();

// Route to book a ticket
router.post("/book", authenticateUser, bookTicket);

// Route to list tickets for resell
router.post("/resell", authenticateUser, resellTicket);

// Route to fetch all resell tickets
router.get("/marketplace", authenticateUser, getresellTickets);

// Route to purchase a resell ticket
router.post("/purchase", authenticateUser, buyresellTickets);

// Route to create an auction
router.post("/auction", authenticateUser, createAuction);

// Route to fetch all auction items
router.get("/auctionitems", authenticateUser, getAuctionItems);

// Route to place a bid on an auction
router.post("/auction/:id/bid", authenticateUser, placeBid);

// Solana roues

// Get auction won tickets
router.get("/auction-won-tickets", authenticateUser, getAuctionWonTickets);

export default router;
