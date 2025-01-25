<<<<<<< HEAD
import express from "express";
import { getEventInfo } from "../utils/ai.service.js";

const router = express.Router();

router.post("/event-info", async (req, res) => {
	const { query } = req.body;
	try {
		const result = await getEventInfo(query);
		res.status(200).json(result);
	} catch (error) {
		console.error("Error in /event-info route:", error);
		res.status(500).json({ message: error.message });
	}
});

export default router;
=======
import express from "express";
import { getEventInfo } from "../utils/ai.service.js";

const router = express.Router();

router.post("/event-info", async (req, res) => {
	const { query } = req.body;
	try {
		const result = await getEventInfo(query);
		res.status(200).json(result);
	} catch (error) {
		console.error("Error in /event-info route:", error);
		res.status(500).json({ message: error.message });
	}
});

export default router;
>>>>>>> 21314f2 (Refactor code formatting and add new routes for auction functionality)
