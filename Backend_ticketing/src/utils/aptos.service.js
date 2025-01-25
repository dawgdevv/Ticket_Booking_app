<<<<<<< HEAD
import { AptosClient, AptosAccount, FaucetClient, TokenClient } from "aptos";
import dotenv from "dotenv";

dotenv.config();

const NODE_URL =
	process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com";
const FAUCET_URL =
	process.env.APTOS_FAUCET_URL || "https://faucet.testnet.aptoslabs.com";

export class AptosTicketService {
	constructor() {
		this.client = new AptosClient(NODE_URL);
		this.tokenClient = new TokenClient(this.client);
		this.faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
		this.moduleAddress = process.env.APTOS_MODULE_ADDRESS;
	}

	async mintTicket(receiverAddress, eventDetails) {
		try {
			const adminAccount = new AptosAccount(
				Buffer.from(process.env.APTOS_PRIVATE_KEY, "hex")
			);

			const payload = {
				type: "entry_function_payload",
				function: `${this.moduleAddress}::ticket::mint_ticket`,
				type_arguments: [],
				arguments: [
					receiverAddress,
					Buffer.from(eventDetails.name).toString("hex"),
					Buffer.from(eventDetails.date.toString()).toString("hex"),
					Buffer.from(eventDetails.seat).toString("hex"),
				],
			};

			const txnRequest = await this.client.generateTransaction(
				adminAccount.address(),
				payload
			);

			const signedTxn = await this.client.signTransaction(
				adminAccount,
				txnRequest
			);

			const txnResult = await this.client.submitTransaction(signedTxn);
			await this.client.waitForTransaction(txnResult.hash);

			return {
				success: true,
				hash: txnResult.hash,
			};
		} catch (error) {
			console.error("Error minting ticket on Aptos:", error);
			throw error;
		}
	}
}
=======
import { AptosClient, AptosAccount, FaucetClient, TokenClient } from "aptos";
import dotenv from "dotenv";

dotenv.config();

const NODE_URL =
	process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com";
const FAUCET_URL =
	process.env.APTOS_FAUCET_URL || "https://faucet.testnet.aptoslabs.com";

export class AptosTicketService {
	constructor() {
		this.client = new AptosClient(NODE_URL);
		this.tokenClient = new TokenClient(this.client);
		this.faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
		this.moduleAddress = process.env.APTOS_MODULE_ADDRESS;
	}

	async mintTicket(receiverAddress, eventDetails) {
		try {
			const adminAccount = new AptosAccount(
				Buffer.from(process.env.APTOS_PRIVATE_KEY, "hex")
			);

			const payload = {
				type: "entry_function_payload",
				function: `${this.moduleAddress}::ticket::mint_ticket`,
				type_arguments: [],
				arguments: [
					receiverAddress,
					Buffer.from(eventDetails.name).toString("hex"),
					Buffer.from(eventDetails.date.toString()).toString("hex"),
					Buffer.from(eventDetails.seat).toString("hex"),
				],
			};

			const txnRequest = await this.client.generateTransaction(
				adminAccount.address(),
				payload
			);

			const signedTxn = await this.client.signTransaction(
				adminAccount,
				txnRequest
			);

			const txnResult = await this.client.submitTransaction(signedTxn);
			await this.client.waitForTransaction(txnResult.hash);

			return {
				success: true,
				hash: txnResult.hash,
			};
		} catch (error) {
			console.error("Error minting ticket on Aptos:", error);
			throw error;
		}
	}
}
>>>>>>> 21314f2 (Refactor code formatting and add new routes for auction functionality)
