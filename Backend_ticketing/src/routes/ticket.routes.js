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
