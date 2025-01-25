import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
	username: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	joined: { type: Date, default: Date.now },
	tickets: [{ type: Schema.Types.ObjectId, ref: "Ticket" }],
	resellTickets: [{ type: Schema.Types.ObjectId, ref: "ResellTicket" }],
	bids: [{ type: Schema.Types.ObjectId, ref: "Bid" }],
});

const User = mongoose.model("User", userSchema);
export default User;
