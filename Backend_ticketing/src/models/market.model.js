import mongoose, { Schema } from "mongoose";

const marketplaceSchema = new Schema({
	tickets: [{ type: Schema.Types.ObjectId, ref: "ResellTicket" }],
});

const Marketplace = mongoose.model("Marketplace", marketplaceSchema);
export default Marketplace;
