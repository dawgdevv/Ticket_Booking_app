import {
	Connection,
	PublicKey,
	Keypair,
	Transaction,
	SystemProgram,
} from "@solana/web3.js";
import {
	createMint,
	getOrCreateAssociatedTokenAccount,
	mintTo,
} from "@solana/spl-token";
import dotenv from "dotenv";

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
const payer = Keypair.fromSecretKey(
	new Uint8Array(JSON.parse(process.env.SOLANA_PRIVATE_KEY))
);

export const createSolanaPayment = async (amount, userPublicKey) => {
	try {
		const transaction = new Transaction().add(
			SystemProgram.transfer({
				fromPubkey: payer.publicKey,
				toPubkey: new PublicKey(userPublicKey),
				lamports: amount,
			})
		);

		const signature = await connection.sendTransaction(transaction, [payer]);
		await connection.confirmTransaction(signature, "confirmed");
		return signature;
	} catch (error) {
		throw new Error(`Solana payment failed: ${error.message}`);
	}
};

export const mintNFT = async (userPublicKey, metadata) => {
	try {
		const mint = await createMint(connection, payer, payer.publicKey, null, 0);
		const userTokenAccount = await getOrCreateAssociatedTokenAccount(
			connection,
			payer,
			mint,
			new PublicKey(userPublicKey)
		);

		await mintTo(connection, payer, mint, userTokenAccount.address, payer, 1);

		return {
			mintAddress: mint.toBase58(),
			tokenAccount: userTokenAccount.address.toBase58(),
			metadata: metadata,
		};
	} catch (error) {
		throw new Error(`NFT minting failed: ${error.message}`);
	}
};
