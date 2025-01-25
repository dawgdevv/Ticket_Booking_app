<<<<<<< HEAD
import express from "express";
import {
	bookTicket,
	resellTicket,
	getresellTickets,
	buyresellTickets,
	getAuctionItems,
	createAuction,
	bookTicketWithSolana,
	buyResellTicketWithSolana,
} from "../controllers/ticket.controller.js";
import { getEventInfo } from "../utils/ai.service.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

router.post("/book", authenticateUser, bookTicket);
router.post("/resell", authenticateUser, resellTicket);
router.get("/marketplace", authenticateUser, getresellTickets);
router.post("/purchase", authenticateUser, buyresellTickets);
router.post("/auction", authenticateUser, createAuction);
router.get("/auctionitems", authenticateUser, getAuctionItems);
router.post("/book-solana", authenticateUser, bookTicketWithSolana);
router.post("/purchase-solana", authenticateUser, buyResellTicketWithSolana);

export default router;
=======
import express from "express";
import {
  bookTicket,
  resellTicket,
  getresellTickets,
  buyresellTickets,
  getAuctionItems,
  createAuction,
  placeBid, 
  bookTicketWithSolana,
  buyResellTicketWithSolana
  // Ensure this controller is implemented
} from "../controllers/ticket.controller.js";
import { authenticateUser } from "../middlewares/auth.js";

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
router.post("/book-solana", authenticateUser, bookTicketWithSolana);
router.post("/purchase-solana", authenticateUser, buyResellTicketWithSolana);
export default router;
>>>>>>> 21314f2 (Refactor code formatting and add new routes for auction functionality)
