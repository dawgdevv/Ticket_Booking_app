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

		console.log("MoonPay URL sign request:", req.body);

		if (!baseCurrencyCode || !quoteCurrencyCode) {
			return res.status(400).json({ error: "Required parameters missing" });
		}

		// For test mode only - no production mode needed
		const baseUrl = "https://buy-sandbox.moonpay.com";
		const isTestMode = true;

		// Create URL with parameters
		const url = new URL(baseUrl);
		const urlParams = {
			apiKey: "pk_test_wUPqKxr806opExV8m35w9BjruhYsPa", // Hardcode the test API key
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

		console.log("URL parameters:", urlParams);

		// Add all URL parameters
		Object.entries(urlParams).forEach(([key, value]) => {
			url.searchParams.append(key, value);
		});

		// For test mode, use the hardcoded secret key
		// This is just for testing - in production you'd use env vars
		const secretKey = "sk_test_your_test_secret_key"; // Replace with your actual test secret key

		if (!secretKey) {
			console.error("Missing MoonPay TEST secret key");
			return res.status(500).json({ error: "Missing API configuration" });
		}

		// Create signature
		const signature = crypto
			.createHmac("sha256", secretKey)
			.update(url.search)
			.digest("base64");

		// Add signature to URL
		url.searchParams.append("signature", signature);

		console.log(
			"Generated signed URL (partial):",
			url.toString().substring(0, 60) + "..."
		);

		// Return the signed URL
		return res.status(200).json({
			signedUrl: url.toString(),
			isTestMode,
		});
	} catch (error) {
		console.error("Error signing MoonPay URL:", error);
		return res
			.status(500)
			.json({ error: "Failed to sign URL: " + error.message });
	}
};
