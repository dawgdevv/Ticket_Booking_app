import express from "express";
import {
	signup,
	login,
	update,
	logout,
	getUserTickets,
	getUserProfile,
} from "../controllers/user.controller.js";
import {
	signupValidation,
	loginValidation,
	updateValidation,
} from "../middlewares/user.validation.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/logout", logout);
router.get("/profile", authenticateUser, getUserProfile);
router.get("/tickets", authenticateUser, getUserTickets);

export default router;
