<<<<<<< HEAD
import express from "express";
import session from "express-session";
import connectDB from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import aiRoutes from "./routes/ai.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(
	cors({
		origin: "http://localhost:5173",
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

app.use("/auth", userRoutes);
app.use("/events", eventRoutes);
app.use("/payment", paymentRoutes);
app.use("/tickets", ticketRoutes);
app.use("/ai", aiRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
=======
import express from "express";
import session from "express-session";
import connectDB from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import auctionjoin from "./routes/auctionjoin.route.js";
import aiRoutes from "./routes/ai.routes.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server and integrate with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
		credentials: true,
	},
});

app.use(express.json());
app.use(
	cors({
		origin: "http://localhost:5173",
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
		// Broadcast the current participants count
		const roomSize = io.sockets.adapter.rooms.get(auctionId)?.size || 0;
		io.to(auctionId).emit("participantsUpdate", { participants: roomSize });
	});

	socket.on("placeBid", async ({ auctionId, userId, bidAmount }) => {
		try {
			// Fetch and update the auction details in the database
			const auction = await AuctionTicket.findById(auctionId);
			if (!auction) {
				socket.emit("error", "Auction not found.");
				return;
			}

			if (bidAmount <= auction.highestBid) {
				socket.emit(
					"error",
					"Bid must be higher than the current highest bid."
				);
				return;
			}

			auction.highestBid = bidAmount;
			auction.highestBidder = userId;
			await auction.save();

			// Notify all users in the room about the new highest bid
			io.to(auctionId).emit("bidUpdate", {
				highestBid: auction.highestBid,
				highestBidder: auction.highestBidder,
			});

			// Set a timeout for inactivity
			if (auction.timeout) clearTimeout(auction.timeout);
			auction.timeout = setTimeout(async () => {
				// Finalize auction on timeout
				const ticket = await Ticket.findById(auction.ticket);
				ticket.owner = auction.highestBidder;
				ticket.resale = false;
				await ticket.save();

				auction.completed = true;
				await auction.save();

				io.to(auctionId).emit("auctionEnded", {
					message: `Auction ended. Ticket sold to user ${auction.highestBidder}`,
				});
			}, 30000);
		} catch (error) {
			console.error("Error handling bid:", error);
			socket.emit("error", "Failed to place bid. Please try again.");
		}
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected:", socket.id);
	});
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
>>>>>>> 21314f2 (Refactor code formatting and add new routes for auction functionality)
