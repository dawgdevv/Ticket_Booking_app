import express from "express";
import {
	joinAuction,
	placeBid,
	getAuctionItems,
	endAuction,
} from "../controllers/auction.controller.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

router.post("/auction/:id/join", authenticateUser, joinAuction);
router.post("/auction/:id/bid", authenticateUser, placeBid);
router.post("/auction/:id/end", authenticateUser, endAuction);
router.get("/auctionitems", authenticateUser, getAuctionItems);

router.post("/auctions/:id/complete", authenticateUser, async (req, res) => {
	try {
		const { id } = req.params;
		const { txHash, paymentMethod } = req.body;

		// Find auction
		const auction = await Auction.findById(id)
			.populate("ticket")
			.populate("highestBidder");

		if (!auction) {
			return res.status(404).json({ message: "Auction not found" });
		}

		// Verify winner
		if (auction.highestBidder._id.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Not authorized" });
		}

		// Create ticket for winner
		const newTicket = new Ticket({
			event: auction.ticket.event,
			owner: req.user._id,
			seat: auction.ticket.seat,
			price: auction.highestBid,
			paymentMethod,
			txHash,
			status: "sold",
			boughtVia: "auction",
		});

		await newTicket.save();

		// Update auction status
		auction.status = "completed";
		auction.paymentStatus = "paid";
		auction.paymentTxHash = txHash;
		await auction.save();

		res.status(200).json({
			success: true,
			ticket: newTicket,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
});

export default router;
