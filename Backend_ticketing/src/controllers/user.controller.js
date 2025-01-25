import Users from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const signup = async (req, res) => {
	const { username, email, password } = req.body;
	const usercheck = await Users.findOne({ email });
	if (usercheck) {
		return res.status(409).json({ message: "User already exists" });
	}
	const user = new Users({
		username,
		email,
		password,
	});

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(password, salt);

	try {
		const newUser = await user.save();
		res.status(201).json(newUser);
	} catch (error) {
		res.status(409).json({ message: error.message });
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await Users.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		console.log("JWT_SECRET:", process.env.JWT_SECRET);
		const token = jwt.sign(
			{ emial: user.email, id: user._id },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);
		res.status(201).json({
			message: "Logged in",
			success: true,
			token,
			email,
			username: user.username,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const logout = (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).json({ message: err.message });
		}
		res.clearCookie("connect.sid");
		res.json({ message: "Logged out" });
	});
};
const update = async (req, res) => {
	const { username } = req.body;
	if (!req.userId) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	if (!username) {
		return res.status(400).json({ message: "Invalid data" });
	}
	try {
		const user = await Users.findById(req.userId);
		user.username = username;
		await user.save();
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getUserTickets = async (req, res) => {
	try {
		const user = await Users.findById(req.user.id).populate({
			path: "tickets",
			populate: { path: "event", model: "Event" },
		});
		console.log("User:", user.id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(user.tickets);
	} catch (error) {
		console.log("Error fetching user tickets:", error);
		res.status(500).json({ message: error.message });
	}
};
export { signup, login, logout, update, getUserTickets };
