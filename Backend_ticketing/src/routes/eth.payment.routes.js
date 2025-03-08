import express from "express";
import { verifyEthPayment } from "../controllers/ticket.controller.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

router.post("/verify", authenticateUser, verifyEthPayment);

export default router;
