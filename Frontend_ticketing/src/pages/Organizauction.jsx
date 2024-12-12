import { useState, useEffect } from "react";
import axios from "axios";

const OrganizeAuction = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [startingBid, setStartingBid] = useState("");
  const [auctionEnd, setAuctionEnd] = useState("");

  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        const response = await axios.get("http://localhost:8000/auth/tickets", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserTickets(response.data);
      } catch (error) {
        console.error("Error fetching user tickets:", error);
      }
    };
    fetchUserTickets();
  }, []);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleStartingBidChange = (e) => {
    setStartingBid(e.target.value);
  };

  const handleAuctionEndChange = (e) => {
    setAuctionEnd(e.target.value);
  };

  const handleCreateAuction = async () => {
    if (selectedTicket && startingBid && auctionEnd) {
      console.log("Creating auction with:", {
        ticketId: selectedTicket._id,
        startingBid,
        auctionEnd,
      });
      try {
        const response = await axios.post(
          "http://localhost:8000/tickets/auction",
          { ticketId: selectedTicket._id, startingBid, auctionEnd },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            timeout: 5000,
          }
        );
        console.log("Auction created:", response.data);
        setSelectedTicket(null);
        setStartingBid("");
        setAuctionEnd("");
        alert("Auction created successfully!");
      } catch (error) {
        console.error("Creating auction failed:", error);
        alert("Creating auction failed. Please try again.");
      }
    } else {
      console.log("Missing required fields:", {
        selectedTicket,
        startingBid,
        auctionEnd,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
        Organize Auction
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Your Tickets
          </h2>
          <ul className="space-y-4">
            {userTickets.map((ticket) => (
              <li
                key={ticket._id}
                className={`p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                  selectedTicket && selectedTicket._id === ticket._id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleSelectTicket(ticket)}
              >
                <p className="font-semibold">{ticket.event.name}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(ticket.event.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Current Price: {ticket.price}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Create Auction
          </h2>
          {selectedTicket ? (
            <div>
              <p className="mb-2">
                <span className="font-semibold">Event:</span>{" "}
                {selectedTicket.event.name}
              </p>
              <p className="mb-4">
                <span className="font-semibold">Date:</span>{" "}
                {new Date(selectedTicket.event.date).toLocaleDateString()}
              </p>
              <div className="mb-4">
                <label
                  htmlFor="startingBid"
                  className="block text-sm font-medium text-gray-700"
                >
                  Starting Bid:
                </label>
                <input
                  type="number"
                  id="startingBid"
                  value={startingBid}
                  onChange={handleStartingBidChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="auctionEnd"
                  className="block text-sm font-medium text-gray-700"
                >
                  Auction End Date:
                </label>
                <input
                  type="datetime-local"
                  id="auctionEnd"
                  value={auctionEnd}
                  onChange={handleAuctionEndChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <button
                onClick={handleCreateAuction}
                className="w-full bg-black text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
              >
                Create Auction
              </button>
            </div>
          ) : (
            <p className="text-gray-600">Select a ticket to auction</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizeAuction;
