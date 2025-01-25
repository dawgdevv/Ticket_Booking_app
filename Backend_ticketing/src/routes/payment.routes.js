import express from "express";
import { createPaymentIntent } from "../controllers/payment.controller.js";
import { authenticateUser } from "../middlewares/auth.js";
import { createSolanaPayment } from "../utils/solana.service.js";
const router = express.Router();

router.post("/create-payment-intent", authenticateUser, createPaymentIntent);
router.post("/solana", authenticateUser, async (req, res) => {
	try {
		const { amount, userPublicKey } = req.body;

		if (!amount || !userPublicKey) {
			return res.status(400).json({
				success: false,
				message: "Amount and public key are required",
			});
		}

		if (amount <= 0) {
			return res.status(400).json({
				success: false,
				message: "Amount must be greater than 0",
			});
		}

		const signature = await createSolanaPayment(amount, userPublicKey);

		res.status(200).json({
			success: true,
			signature,
			message: "Payment processed successfully",
		});
	} catch (error) {
		console.error("Solana payment error:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Payment failed",
		});
	}
});
export default router;
