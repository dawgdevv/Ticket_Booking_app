import mongoose, { Schema } from "mongoose";

const auctionTicketSchema = new Schema({
	event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
	ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
	seat: { type: String, required: true },
	startingBid: { type: Number, required: true },
	highestBid: { type: Number, default: 0 },
	highestBidder: { type: Schema.Types.ObjectId, ref: "User" },
	auctionEnd: { type: Date, required: true },
	organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const AuctionTicket = mongoose.model("AuctionTicket", auctionTicketSchema);
export default AuctionTicket;
