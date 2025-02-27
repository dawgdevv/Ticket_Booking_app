import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
  AccountAddress,
} from "@aptos-labs/ts-sdk";

export class AptosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AptosError";
  }
}

export class AptosService {
  private client: Aptos;
  private moduleAddress: string;

  constructor() {
    const config = new AptosConfig({
      network: Network.DEVNET,
      fullnode: "https://fullnode.devnet.aptoslabs.com/v1",
    });
    this.client = new Aptos(config);
    // Ensure the address has 0x prefix
    const addressFromEnv = import.meta.env.VITE_APTOS_MODULE_ADDRESS;
    this.moduleAddress = addressFromEnv.startsWith("0x")
      ? addressFromEnv
      : `0x${addressFromEnv}`;

    console.log("Using module address:", this.moduleAddress);
  }

  async connectWallet(): Promise<{ address: string }> {
    try {
      const petra = (window as any).petra;
      if (!petra) {
        throw new Error("Petra wallet not found!");
      }
      await petra.connect();
      const account = await petra.account();
      return { address: account.address };
    } catch (error) {
      console.error("Wallet connection failed:", error);
      throw error;
    }
  }

  async bookTicket(destination: string, price: number): Promise<string> {
    try {
      console.log("Starting ticket booking process");
      const petra = (window as any).petra;
      if (!petra) {
        console.error("Petra wallet not found");
        throw new Error("Petra wallet not found!");
      }

      console.log("Connecting to account");
      const account = await petra.account();
      console.log("Booking with account:", account.address);

      // Convert price to a string representing a u64 value
      // Since our contract expects a u64, we need to ensure it's properly formatted
      const priceInU64 = Math.floor(price).toString();

      const transaction = {
        function: `${this.moduleAddress}::ticket::book_ticket`,
        type_arguments: [],
        arguments: [destination, priceInU64],
      };

      console.log("Transaction data:", JSON.stringify(transaction, null, 2));
      console.log("Submitting transaction");

      // Use the newer API format
      const pendingTx = await petra.signAndSubmitTransaction({
        payload: transaction,
      });

      console.log("Transaction submitted:", pendingTx.hash);

      console.log("Waiting for transaction confirmation");
      const txn = await this.client.waitForTransaction({
        transactionHash: pendingTx.hash,
        checkSuccess: true,
      });
      console.log("Transaction confirmed:", txn);

      return pendingTx.hash;
    } catch (error: any) {
      console.error("Transaction failed:", error);
      if (error.message) {
        console.error("Error message:", error.message);
      }
      throw new AptosError(error.message || "Failed to book ticket");
    }
  }

  async getTickets(address: string): Promise<any[]> {
    try {
      const accountAddress = AccountAddress.fromString(address);
      const resources = await this.client.getAccountResources({
        accountAddress,
      });

      const ticketStore = resources.find(
        (r) => r.type === `${this.moduleAddress}::ticket::Ticket`
      );

      return ticketStore?.data?.tickets || [];
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  }

  async validateTransaction(hash: string): Promise<boolean> {
    try {
      const txn = await this.client.getTransactionByHash({
        hash,
      });
      return txn.success;
    } catch (error) {
      return false;
    }
  }

  getModuleAddress(): string {
    return this.moduleAddress;
  }
}
