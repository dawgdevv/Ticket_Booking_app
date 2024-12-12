import express from "express";
import session from "express-session";
import connectDB from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";

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

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
