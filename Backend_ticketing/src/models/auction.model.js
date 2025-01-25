import mongoose, { Schema } from "mongoose";

const auctionTicketSchema = new mongoose.Schema({
	event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
	ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
	seat: { type: String, required: true },
	startingBid: { type: Number, required: true },
	currentBid: { type: Number, default: 0 },
	highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
	auctionEnd: { type: Date, required: true },
	organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // New field
  });
  

const AuctionTicket = mongoose.model("AuctionTicket", auctionTicketSchema);
export default AuctionTicket;
