import mongoose, { Schema } from "mongoose";

const resellTicketSchema = new Schema({
	ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
	seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
	price: { type: Number, required: true },
	dateListed: { type: Date, default: Date.now },
});

const ResellTicket = mongoose.model("ResellTicket", resellTicketSchema);
export default ResellTicket;
