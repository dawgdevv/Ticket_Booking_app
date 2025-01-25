import Ticket from "../models/tickets.model.js";
import User from "../models/user.model.js";
import Event from "../models/events.model.js";
import ResellTicket from "../models/resell.model.js";
import Marketplace from "../models/market.model.js";
import AuctionTicket from "../models/auction.model.js";
import { createSolanaPayment, mintNFT } from "../utils/solana.service.js";
import { generateNFTMetadata } from "../utils/nft.service.js";

export const bookTicketWithSolana = async (req, res) => {
	const { eventId, quantity, seats, userPublicKey } = req.body;
	const userId = req.user.id;

	try {
		// Validate event
		const event = await Event.findById(eventId);
		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Create ticket
		const ticket = new Ticket({
			event: eventId,
			owner: userId,
			price: event.price,
			quantity,
			seats,
			venue: event.location,
		});

		// Process Solana payment
		const amount = event.price * quantity * 1000000; // Convert to lamports
		const paymentSignature = await createSolanaPayment(amount, userPublicKey);

		// Generate NFT metadata
		const metadata = generateNFTMetadata(ticket, event);

		// Mint NFT
		const nftDetails = await mintNFT(userPublicKey, metadata);

		// Save ticket
		await ticket.save();

		// Update user and event
		const user = await User.findById(userId);
		user.tickets.push(ticket._id);
		await user.save();

		event.tickets.push(ticket._id);
		await event.save();

		// Return success response
		res.status(201).json({
			message: "Ticket booked successfully",
			ticket,
			paymentSignature,
			nftDetails,
		});
	} catch (error) {
		console.error("Booking error:", error);
		res.status(500).json({
			message: "Booking failed",
			error: error.message,
		});
	}
};

export const bookTicket = async (req, res) => {
	const { eventId, quantity, seats } = req.body;
	const userId = req.user.id; // User ID from the authenticated user
	console.log("Booking ticket for user:", userId); //  log the user ID
	console.log("Event ID:", eventId);

	try {
		// Find the event by ID

		const event = await Event.findById(eventId);
		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Create a new ticket
		const ticket = new Ticket({
			event: eventId,
			owner: userId,
			price: event.price,
			quantity,
			seats,
			venue: event.location,
		});

		// Save the ticket to the database
		await ticket.save();

		// Update the user's ticket list
		const user = await User.findById(userId);
		user.tickets.push(ticket._id);
		await user.save();

		// Update the event's ticket list
		event.tickets.push(ticket._id);
		await event.save();

		// Populate the event field to include full event details (not just the ID)
		const populatedTicket = await Ticket.findById(ticket._id).populate("event");

		// Respond with success and include the populated ticket information
		res.status(201).json({
			message: "Ticket booked successfully",
			ticket: populatedTicket, // Send the populated ticket with event details
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const resellTicket = async (req, res) => {
	const { ticketId, price } = req.body;
	const userId = req.user.id;
	console.log("Reselling ticket for user:", userId);

	try {
		const ticket = await Ticket.findById(ticketId);
		console.log("Ticket:", ticket);
		if (!ticket) {
			return res.status(404).json({ message: "Ticket not found" });
		}
		ticket.resale = true;
		await ticket.save();

		const resellTicket = new ResellTicket({
			ticket: ticketId,
			seller: userId,
			price,
		});
		console.log("Resell ticket:", resellTicket);

		await resellTicket.save();

		const user = await User.findById(userId);
		user.resellTickets.push(resellTicket._id);
		await user.save();

		const marketplace = await Marketplace.findOne({});
		if (!marketplace) {
			const newMarketplace = new Marketplace({ tickets: [resellTicket._id] });
			await newMarketplace.save();
		} else {
			marketplace.tickets.push(resellTicket._id);
			await marketplace.save();
		}

		const populatedResellTicket = await ResellTicket.findById(
			resellTicket._id
		).populate("ticket");

		console.log("Populated resell ticket:", populatedResellTicket);

		res.status(201).json({
			message: "Ticket resold successfully",
			resellTicket: populatedResellTicket,
		});
	} catch (error) {
		console.error("Error reselling ticket:", error);
		res.status(500).json({ message: error.message });
	}
};

export const getresellTickets = async (req, res) => {
	try {
		const resellTickets = await ResellTicket.find({}).populate({
			path: "ticket",
			populate: [
				{ path: "event", model: "Event" },
				{ path: "owner", model: "User" },
			],
		});

		console.log("Resell tickets:", resellTickets);
		res.status(200).json(resellTickets);
	} catch (error) {
		console.error("Error fetching resell tickets:", error);
		res.status(500).json({ message: error.message });
	}
};

export const buyresellTickets = async (req, res) => {
	const { resellTicketId } = req.body;
	const userId = req.user.id;

	try {
		const resellTicket =
			await ResellTicket.findById(resellTicketId).populate("ticket");
		if (!resellTicket) {
			return res.status(404).json({ message: "Resell ticket not found" });
		}

		// Check if the user is trying to buy their own ticket
		if (resellTicket.seller.toString() === userId) {
			return res.status(403).json({ message: "You can't buy your own ticket" });
		}

		const ticket = await Ticket.findById(resellTicket.ticket._id);
		if (!ticket) {
			return res.status(404).json({ message: "Ticket not found" });
		}

		// Transfer ownership of the ticket
		ticket.owner = userId;
		ticket.resale = false;
		await ticket.save();

		// Remove the resell ticket from the marketplace
		await ResellTicket.findByIdAndDelete(resellTicketId);

		// Update the user's ticket list
		const user = await User.findById(userId);
		user.tickets.push(ticket._id);
		await user.save();

		res.status(200).json({ message: "Ticket purchased successfully", ticket });
	} catch (error) {
		console.error("Error buying resell ticket:", error);
		res.status(500).json({ message: error.message });
	}
};

// Add new function for Solana marketplace purchase
export const buyResellTicketWithSolana = async (req, res) => {
	const { resellTicketId, userPublicKey } = req.body;
	const userId = req.user.id;

	try {
		const resellTicket =
			await ResellTicket.findById(resellTicketId).populate("ticket");
		if (!resellTicket) {
			return res.status(404).json({ message: "Resell ticket not found" });
		}

		// Process Solana payment
		const amount = resellTicket.price * 1000000; // Convert to lamports
		const paymentSignature = await createSolanaPayment(amount, userPublicKey);

		// Generate and mint NFT
		const metadata = generateNFTMetadata(
			resellTicket.ticket,
			resellTicket.ticket.event
		);
		const nftDetails = await mintNFT(userPublicKey, metadata);

		// Transfer ownership
		const ticket = await Ticket.findById(resellTicket.ticket._id);
		ticket.owner = userId;
		ticket.resale = false;
		await ticket.save();

		await ResellTicket.findByIdAndDelete(resellTicketId);

		const user = await User.findById(userId);
		user.tickets.push(ticket._id);
		await user.save();

		res.status(200).json({
			message: "Ticket purchased successfully",
			ticket,
			paymentSignature,
			nftDetails,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createAuction = async (req, res) => {
	const { ticketId, startingBid, auctionEnd } = req.body;
	const userId = req.user.id;

	try {
		const ticket = await Ticket.findById(ticketId).populate("event");
		if (!ticket) {
			return res.status(404).json({ message: "Ticket not found" });
		}

		const auctionTicket = new AuctionTicket({
			event: ticket.event,
			ticket: ticket._id,
			seat: ticket.seats[0], // Assuming single seat for simplicity
			startingBid,
			auctionEnd,
			organizer: userId,
		});

		await auctionTicket.save();
		res
			.status(201)
			.json({ message: "Auction created successfully", auctionTicket });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAuctionItems = async (req, res) => {
	try {
		const auctionItems = await AuctionTicket.find({}).populate(
			"event ticket organizer"
		);
		res.status(200).json(auctionItems);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
