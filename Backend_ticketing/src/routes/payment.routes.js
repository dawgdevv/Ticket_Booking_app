import express from "express";
import { createPaymentIntent } from "../controllers/payment.controller.js";
import { authenticateUser } from "../middlewares/auth.js";
const router = express.Router();

router.post("/create-payment-intent", authenticateUser, createPaymentIntent);
export default router;
