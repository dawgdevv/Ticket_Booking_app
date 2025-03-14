import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const mintTicketAsNFT = async (
  ticketId,
  walletAddress,
  eventId,
  useMockNFT = false
) => {
  try {
    console.log(`Minting ticket ${ticketId} for wallet ${walletAddress}`);

    const response = await axios.post(
      `${API_URL}/nft/mint/${ticketId}`,
      {
        walletAddress,
        eventId: eventId?.toString() || "", // Convert to string or empty string if undefined
        useMockNFT, // Tell backend to use mock mode if true
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        timeout: 30000, // 30 second timeout for blockchain operations
      }
    );

    return response.data;
  } catch (error) {
    console.error("NFT minting error:", error);

    // If we're in development, provide a mock NFT as fallback
    if (import.meta.env.VITE_USE_MOCK_NFT === "true" && error.code) {
      console.log("Using frontend mock fallback due to error");
      return {
        success: true,
        message: "NFT minted successfully (Frontend Mock)",
        tokenId: `frontend-mock-${Date.now()}`,
        txHash: "0x" + Math.random().toString(16).slice(2, 34),
      };
    }

    throw error;
  }
};

export const verifyTicketByTokenId = async (tokenId) => {
  try {
    const response = await axios.get(`${API_URL}/nft/verify/${tokenId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("NFT verification error:", error);
    throw error;
  }
};
