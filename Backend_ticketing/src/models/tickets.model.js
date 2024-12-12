import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema({
	event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
	owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
	price: { type: Number, required: true },
	quantity: { type: Number, required: true },
	seats: [String],
	venue: { type: String, required: true },
	resale: { type: Boolean, default: false },
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
