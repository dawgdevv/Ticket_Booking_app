import AuctionTicket from "../models/auction.model.js";
import Bid from "../models/bids.model.js";
import User from "../models/user.model.js";

const endAuction = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { id } = req.params;

		const auction = await AuctionTicket.findById(id)
			.populate("ticket")
			.populate("highestBidder")
			.session(session);

		if (!auction || auction.isEnded) {
			throw new Error("Auction not found or already ended");
		}

		if (auction.highestBidder) {
			// Use findOneAndUpdate with upsert for atomic operation
			await AuctionWonTickets.findOneAndUpdate(
				{ auctionTicket: id },
				{
					user: auction.highestBidder._id,
					ticket: auction.ticket._id,
					winningBid: auction.currentBid,
				},
				{
					upsert: true,
					session,
					runValidators: true,
				}
			);

			// Update ticket ownership
			await Ticket.findByIdAndUpdate(
				auction.ticket._id,
				{
					owner: auction.highestBidder._id,
					resale: false,
				},
				{ session }
			);
		}

		auction.isEnded = true;
		await auction.save({ session });

		await session.commitTransaction();
		res.status(200).json({ message: "Auction ended successfully" });
	} catch (error) {
		await session.abortTransaction();
		console.error("Error ending auction:", error);
		res.status(500).json({ message: error.message });
	} finally {
		session.endSession();
	}
};

const getAuctionItems = async (req, res) => {
	try {
		const auctions = await AuctionTicket.find({
			isEnded: { $ne: true }, // Explicitly find non-ended auctions
		})
			.populate("event", "name")
			.populate("ticket", "_id")
			.populate("organizer", "username")
			.populate("highestBidder", "username");

		console.log("Total Active Auctions:", auctions.length);
		console.log(
			"Auction IDs:",
			auctions.map((auction) => auction._id.toString())
		);

		res.status(200).json(auctions);
	} catch (error) {
		console.error("Error fetching auction items:", error);
		res.status(500).json({
			message: "Error fetching auctions",
			error: error.message,
		});
	}
};
const joinAuction = async (req, res) => {
	const { id } = req.params;
	const userId = req.user.id;

	try {
		const auction = await AuctionTicket.findById(id);
		if (!auction) {
			return res.status(404).json({ message: "Auction not found" });
		}

		const currentDateTime = new Date();
		if (auction.auctionEnd <= currentDateTime) {
			return res
				.status(400)
				.json({ message: "This auction has already ended." });
		}

		// Check if the user is already a participant
		if (auction.participants.includes(userId)) {
			return res.status(200).json({
				message: "You have already joined this auction.",
				alreadyJoined: true,
				auctionId: id,
			});
		}

		// Add the user to the participants list
		auction.participants.push(userId);
		await auction.save();

		res.status(200).json({
			message: "Successfully joined the auction",
			auctionId: id,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const placeBid = async (req, res) => {
	const { id } = req.params;
	const { bidAmount } = req.body;
	const userId = req.user.id;

	try {
		const auction = await AuctionTicket.findById(id);
		if (!auction) {
			return res.status(404).json({ message: "Auction not found" });
		}

		if (bidAmount <= auction.currentBid) {
			return res
				.status(400)
				.json({ message: "Bid must be higher than current bid" });
		}

		// Create new bid
		const newBid = new Bid({
			auctionTicket: id,
			bidder: userId,
			amount: bidAmount,
		});
		await newBid.save();

		// Update auction details
		auction.currentBid = bidAmount;
		auction.highestBidder = userId;
		await auction.save();

		// Update user's bids
		await User.findByIdAndUpdate(userId, { $push: { bids: newBid._id } });

		res.status(200).json({
			message: "Bid placed successfully",
			auction: auction,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export { joinAuction, placeBid, getAuctionItems, endAuction };
