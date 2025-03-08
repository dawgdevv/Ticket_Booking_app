import express from "express";
import {
	createPaymentIntent,
	signMoonPayUrl,
} from "../controllers/payment.controller.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-payment-intent", authenticateUser, createPaymentIntent);
router.post("/sign-moonpay-url", authenticateUser, signMoonPayUrl);

export default router;
