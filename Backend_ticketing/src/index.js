import express from "express";
import session from "express-session";
import connectDB from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import eventRoutes from "./routes/event.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import auctionjoin from "./routes/auction.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import AuctionTicket from "./models/auction.model.js";
import Ticket from "./models/tickets.model.js";
import AuctionWonTickets from "./models/auctionwontickets.model.js";
import http from "http";
import { Server } from "socket.io";
import User from "./models/user.model.js";
import Bid from "./models/bids.model.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);
const allowedOrigins = [
	"http://localhost:5173",
	"https://ticket-booking-app-c64o.vercel.app",
];

const io = new Server(server, {
	cors: {
		origin: allowedOrigins,

		credentials: true,
	},
});

app.use(express.json());
app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	})
);

connectDB();

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

app.get("/", (req, res) => {
	res.send("Backend server is running.");
});

// Routes
app.use("/auth", userRoutes);
app.use("/events", eventRoutes);
app.use("/payment", paymentRoutes);
app.use("/tickets", ticketRoutes);
app.use("/auctionrooms", auctionjoin);
app.use("/ai", aiRoutes);

// WebSocket logic for auction rooms
io.on("connection", (socket) => {
	console.log("A user connected:", socket.id);

	socket.on("joinAuction", (auctionId) => {
		socket.join(auctionId);
		console.log(`User joined auction room: ${auctionId}`);
		const roomSize = io.sockets.adapter.rooms.get(auctionId)?.size || 0;
		io.to(auctionId).emit("participantsUpdate", { participants: roomSize });
	});

	socket.on("placeBid", async ({ auctionId, userId, bidAmount }) => {
		try {
			const auction = await AuctionTicket.findById(auctionId)
				.populate("highestBidder", "username")
				.populate("ticket");

			if (!auction) {
				socket.emit("error", "Auction not found.");
				return;
			}

			if (bidAmount <= auction.currentBid) {
				socket.emit("error", "Bid must be higher than current bid.");
				return;
			}

			const user = await User.findById(userId);

			auction.currentBid = bidAmount;
			auction.highestBidder = userId;
			await auction.save();

			const newBid = new Bid({
				auctionTicket: auctionId,
				bidder: userId,
				amount: bidAmount,
			});
			await newBid.save();

			io.to(auctionId).emit("bidUpdate", {
				highestBid: auction.currentBid,
				highestBidderName: user.username,
			});

			if (auction.timeout) clearTimeout(auction.timeout);

			auction.timeout = setTimeout(async () => {
				try {
					const finalAuction = await AuctionTicket.findById(auctionId)
						.populate("ticket")
						.populate("highestBidder");

					if (finalAuction.highestBidder) {
						const ticket = await Ticket.findByIdAndUpdate(
							finalAuction.ticket._id,
							{
								owner: finalAuction.highestBidder._id,
								resale: false,
							},
							{ new: true }
						);

						await User.findByIdAndUpdate(finalAuction.highestBidder._id, {
							$addToSet: { tickets: ticket._id },
						});

						// Create auction won ticket
						const auctionWonTicket = new AuctionWonTickets({
							user: finalAuction.highestBidder._id,
							ticket: ticket._id,
							auctionTicket: auctionId,
							winningBid: finalAuction.currentBid,
						});
						await auctionWonTicket.save();

						finalAuction.isEnded = true;
						await finalAuction.save();

						io.to(auctionId).emit("auctionEnded", {
							message: `Auction ended. Ticket sold to ${finalAuction.highestBidder.username}`,
							winner: finalAuction.highestBidder.username,
							ticketId: ticket._id,
						});
					} else {
						await AuctionTicket.findByIdAndUpdate(auctionId, {
							isEnded: true,
						});

						io.to(auctionId).emit("auctionEnded", {
							message: "Auction ended with no winner",
							winner: null,
						});
					}
				} catch (endError) {
					console.error("Auction end error:", endError);
				}
			}, 300000);
		} catch (error) {
			console.error("Bid placement error:", error);
			socket.emit("error", "Failed to place bid. Please try again.");
		}
	});

	socket.on("forceEndAuction", async ({ auctionId }) => {
		let session;
		try {
			session = await mongoose.startSession();
			session.startTransaction();

			const auction = await AuctionTicket.findById(auctionId)
				.populate("ticket")
				.populate("highestBidder")
				.session(session);

			if (!auction || auction.isEnded) {
				throw new Error("Auction not found or already ended");
			}

			if (auction.highestBidder) {
				await AuctionWonTickets.findOneAndUpdate(
					{ auctionTicket: auctionId },
					{
						user: auction.highestBidder._id,
						ticket: auction.ticket._id,
						winningBid: auction.currentBid,
						wonAt: new Date(),
					},
					{
						upsert: true,
						new: true,
						session,
						runValidators: true,
					}
				);

				await Ticket.findByIdAndUpdate(
					auction.ticket._id,
					{
						owner: auction.highestBidder._id,
						resale: false,
					},
					{ session }
				);

				await User.findByIdAndUpdate(
					auction.highestBidder._id,
					{ $addToSet: { tickets: auction.ticket._id } },
					{ session }
				);
			}

			auction.isEnded = true;
			await auction.save({ session });
			await session.commitTransaction();

			io.to(auctionId).emit("auctionEnded", {
				message: auction.highestBidder
					? `Auction ended. Ticket sold to ${auction.highestBidder.username}!`
					: "Auction ended with no winner",
				winner: auction.highestBidder?.username || null,
				ticketId: auction.ticket?._id,
			});
		} catch (error) {
			if (session) {
				await session.abortTransaction();
			}
			console.error("Forced auction end error:", error);
			io.to(auctionId).emit("auctionEndError", {
				message: error.message || "Failed to end auction",
			});
		} finally {
			if (session) {
				await session.endSession();
			}
		}
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected:", socket.id);
	});
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
