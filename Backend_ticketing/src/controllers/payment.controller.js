import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
	const { amount } = req.body;

	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: "inr",
		});

		res.status(200).json({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
