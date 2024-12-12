import { useState, useEffect } from "react";
import axios from "axios";

const Auction = () => {
  const [auctionItems, setAuctionItems] = useState([]);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    const fetchAuctionItems = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/tickets/auctionitems",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAuctionItems(response.data);
      } catch (error) {
        console.error("Error fetching auction items:", error);
      }
    };

    fetchAuctionItems();
  }, []);

  const handleBidChange = (e) => {
    setBidAmount(e.target.value);
  };

  const placeBid = (itemId) => {
    const updatedItems = auctionItems.map((item) => {
      if (item._id === itemId && parseFloat(bidAmount) > item.highestBid) {
        return { ...item, highestBid: parseFloat(bidAmount) };
      }
      return item;
    });
    setAuctionItems(updatedItems);
    setBidAmount("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
        Auction for Premium Tickets
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
        {auctionItems.map((item) => (
          <div key={item._id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">
              {item.ticket.event.name}
            </h2>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Date:</span>{" "}
              {new Date(item.ticket.event.date).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Starting Bid:</span>
              {item.startingBid}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">Highest Bid:</span>
              {item.highestBid}
            </p>
            <input
              type="number"
              value={bidAmount}
              onChange={handleBidChange}
              className="mb-2 w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your bid"
            />
            <button
              onClick={() => placeBid(item._id)}
              className="w-full bg-black hover:bg-green-500 text-white py-2 rounded-md"
            >
              Place Bid
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Auction;
