import mongoose, { Schema } from "mongoose";

const resellTicketSchema = new Schema({
	ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
	seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
	price: { type: Number, required: true },
	dateListed: { type: Date, default: Date.now },
	// Add NFT-specific fields
	isNFT: { type: Boolean, default: false },
	tokenId: { type: String, default: null },
	tokenURI: { type: String, default: null },
	// Add unique resale reference
	resaleRef: { type: String, unique: true, sparse: true },
	// Store seller's wallet address directly on the document
	sellerWalletAddress: { type: String },
});

const ResellTicket = mongoose.model("ResellTicket", resellTicketSchema);
export default ResellTicket;
