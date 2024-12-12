import { useState, useEffect } from "react";
import axios from "axios";

const TicketMarketplace = () => {
  const [resaleTickets, setResaleTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    const fetchResellTickets = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/tickets/marketplace",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setResaleTickets(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching resell tickets:", error);
      }
    };
    fetchResellTickets();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const handlePurchase = async (resellTicketId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/tickets/purchase",
        { resellTicketId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("purchase:", response.data);
      const updatedTickets = resaleTickets.filter(
        (ticket) => ticket._id !== resellTicketId
      );
      setResaleTickets(updatedTickets);

      alert("Ticket purchased successfully!");
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      alert("Error purchasing ticket. Please try again.");
    }
  };

  const filteredAndSortedTickets = resaleTickets
    .filter(
      (ticket) =>
        ticket.ticket.event.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        ticket.seller.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date")
        return new Date(a.ticket.event.date) - new Date(b.ticket.event.date);
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "event")
        return a.ticket.event.name.localeCompare(b.ticket.event.name);
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
        Ticket Resale Marketplace
      </h1>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <input
          type="text"
          placeholder="Search events or sellers"
          value={searchTerm}
          onChange={handleSearch}
          className="mb-4 md:mb-0 w-full md:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center">
          <label htmlFor="sortBy" className="mr-2 text-gray-700">
            Sort by:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={handleSort}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="date">Date</option>
            <option value="price">Price</option>
            <option value="event">Event Name</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedTickets.map((ticket) => (
          <div
            key={ticket._id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold mb-2 text-black">
              {ticket.ticket.event.name}
            </h2>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Date:</span>{" "}
              {new Date(ticket.ticket.event.date).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Price:</span>
              {ticket.price}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">Seller:</span>{" "}
              {ticket.ticket.owner.username}
            </p>
            <button
              onClick={() => handlePurchase(ticket._id)}
              className="w-full bg-black text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
            >
              Purchase Ticket
            </button>
          </div>
        ))}
      </div>

      {filteredAndSortedTickets.length === 0 && (
        <p className="text-center text-gray-600 mt-8">
          No tickets found matching your search.
        </p>
      )}
    </div>
  );
};

export default TicketMarketplace;
