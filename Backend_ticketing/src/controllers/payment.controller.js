import Stripe from "stripe";
import dotenv from "dotenv";
import crypto from "crypto";

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

// Add this method to sign MoonPay URLs for security
export const signMoonPayUrl = async (req, res) => {
	try {
		const { baseCurrencyCode, baseCurrencyAmount, quoteCurrencyCode } =
			req.body;

		if (!baseCurrencyCode || !quoteCurrencyCode) {
			return res.status(400).json({ error: "Required parameters missing" });
		}

		// Determine if we should use test or production URLs and keys
		const isTestMode = process.env.NODE_ENV !== "production";
		const baseUrl = isTestMode
			? "https://buy-sandbox.moonpay.com"
			: "https://buy.moonpay.com";

		// Create URL with parameters
		const url = new URL(baseUrl);
		const urlParams = {
			apiKey: isTestMode
				? process.env.MOONPAY_TEST_PUBLIC_KEY
				: process.env.MOONPAY_PUBLIC_KEY,
			baseCurrencyCode,
			quoteCurrencyCode,
		};

		// Add amount if provided
		if (baseCurrencyAmount) {
			urlParams.baseCurrencyAmount = baseCurrencyAmount;
		}

		// Add wallet address if needed (from authenticated user)
		if (req.user && req.user.walletAddress) {
			urlParams.walletAddress = req.user.walletAddress;
		}

		// Set return URL to your app
		urlParams.redirectURL = process.env.FRONTEND_URL || "http://localhost:5173";

		// Add all URL parameters
		Object.entries(urlParams).forEach(([key, value]) => {
			url.searchParams.append(key, value);
		});

		// Get the appropriate secret key
		const secretKey = isTestMode
			? process.env.MOONPAY_TEST_SECRET_KEY
			: process.env.MOONPAY_SECRET_KEY;

		// Create signature
		const signature = crypto
			.createHmac("sha256", secretKey)
			.update(url.search)
			.digest("base64");

		// Add signature to URL
		url.searchParams.append("signature", signature);

		// Return the signed URL
		return res.status(200).json({
			signedUrl: url.toString(),
			isTestMode,
		});
	} catch (error) {
		console.error("Error signing MoonPay URL:", error);
		return res.status(500).json({ error: "Failed to sign URL" });
	}
};
