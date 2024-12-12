import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenticateUser = (req, res, next) => {
	const token = req.header("Authorization")?.split(" ")[1];

	if (!token) {
		return res.status(401).json({ message: "Access Denied" });
	}

	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		console.log("Verified user:", verified);
		req.user = verified;
		next();
	} catch (error) {
		res.status(400).json({ message: "Invalid Token" });
	}
};

export { authenticateUser };
