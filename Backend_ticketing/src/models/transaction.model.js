import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema({
	buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
	seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
	ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
	amount: { type: Number, required: true },
	transactionType: {
		type: String,
		enum: ["primary-sale", "resale", "nft-resale", "auction"],
		required: true,
	},
	timestamp: { type: Date, default: Date.now },
	blockchainTxData: { type: Schema.Types.Mixed },
	resaleRef: { type: String, unique: true },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
