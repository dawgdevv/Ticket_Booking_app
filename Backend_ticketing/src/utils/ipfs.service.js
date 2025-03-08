import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

// Get Pinata API keys from environment variables
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

/**
 * Uploads content to IPFS using Pinata
 * @param {string} content - The content to upload (usually JSON)
 * @returns {string} - The IPFS gateway URL of the uploaded content
 */
export const uploadToIPFS = async (content) => {
	try {
		console.log("Uploading to IPFS via Pinata...");

		// Create form data for the Pinata API request
		const data = new FormData();

		// Add the file to form data
		data.append("file", Buffer.from(content), {
			filename: "metadata.json",
			contentType: "application/json",
		});

		// Add pinata metadata
		data.append(
			"pinataMetadata",
			JSON.stringify({
				name: `ticket-metadata-${Date.now()}`,
			})
		);

		// Add pinata options
		data.append(
			"pinataOptions",
			JSON.stringify({
				cidVersion: 1,
			})
		);

		// Upload to Pinata
		const res = await axios.post(
			"https://api.pinata.cloud/pinning/pinFileToIPFS",
			data,
			{
				maxBodyLength: "Infinity",
				headers: {
					"Content-Type": `multipart/form-data; boundary=${data._boundary}`,
					pinata_api_key: PINATA_API_KEY,
					pinata_secret_api_key: PINATA_API_SECRET,
				},
			}
		);

		const ipfsHash = res.data.IpfsHash;
		console.log("Content uploaded to IPFS with CID:", ipfsHash);

		// Construct and return the IPFS gateway URL
		const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
		return gatewayUrl;
	} catch (error) {
		console.error("Error uploading to IPFS via Pinata:", error);
		throw new Error(`IPFS upload failed: ${error.message}`);
	}
};
