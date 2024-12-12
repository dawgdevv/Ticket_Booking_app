import mongoose, { Schema } from "mongoose";

const bidSchema = new Schema({
	auctionTicket: {
		type: Schema.Types.ObjectId,
		ref: "AuctionTicket",
		required: true,
	},
	bidder: { type: Schema.Types.ObjectId, ref: "User", required: true },
	amount: { type: Number, required: true },
	date: { type: Date, default: Date.now },
});

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
