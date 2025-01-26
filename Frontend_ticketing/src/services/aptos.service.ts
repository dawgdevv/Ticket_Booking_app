import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
  AccountAddress,
} from "@aptos-labs/ts-sdk";

export class AptosService {
  private client: Aptos;
  private moduleAddress: string;

  constructor() {
    const config = new AptosConfig({
      network: Network.DEVNET,
      fullnode: "https://fullnode.devnet.aptoslabs.com/v1",
    });
    this.client = new Aptos(config);
    this.moduleAddress = this.moduleAddress =
      import.meta.env.VITE_APTOS_MODULE_ADDRESS;
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

  async bookTicket(destination: string, seat: string): Promise<string> {
    try {
      const petra = (window as any).petra;
      if (!petra) throw new Error("Petra wallet not found!");

      const account = await petra.account();
      console.log("Booking with account:", account.address);

      const transaction = {
        function: `${this.moduleAddress}::ticket::book_ticket`,
        type_arguments: [],
        arguments: [destination, seat],
      };

      console.log("Submitting transaction:", transaction);
      const pendingTx = await petra.signAndSubmitTransaction(transaction);
      console.log("Transaction submitted:", pendingTx.hash);

      const txn = await this.client.waitForTransaction({
        transactionHash: pendingTx.hash,
        checkSuccess: true,
      });

      return txn.hash;
    } catch (error) {
      console.error("Transaction failed:", error);
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
}

class AptosError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "AptosError";
  }
}
