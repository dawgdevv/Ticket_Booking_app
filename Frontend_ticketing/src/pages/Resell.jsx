import { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import axios from "axios";

const ResellTickets = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resellPrice, setResellPrice] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
        console.error(error);
      }
    };
    fetchUserTickets();
  }, []);
  useEffect(() => {
    if (alert.open) {
      setTimeout(() => {
        setAlert({ ...alert, open: false });
      }, 3000);
      return () => clearTimeout();
    }
  }, [alert]);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleResellPriceChange = (e) => {
    setResellPrice(e.target.value);
  };

  const handleResellTicket = async () => {
    if (selectedTicket && resellPrice) {
      try {
        const response = await axios.post(
          "http://localhost:8000/tickets/resell",
          { ticketId: selectedTicket._id, price: resellPrice },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            timeout: 5000,
          }
        );
        console.log("Resell response:", response.data);
        const updatedTickets = userTickets.map((ticket) => {
          if (ticket._id === selectedTicket._id) {
            return { ...ticket, price: resellPrice };
          } else {
            return ticket;
          }
        });
        console.log("Updated tickets:", updatedTickets);
        setUserTickets(updatedTickets);

        setSelectedTicket(null);
        setResellPrice("");
        setAlert({
          open: true,
          message: "Ticket listed for resale successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Reselling ticket failed:", error);
        alert("Reselling ticket failed. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
        Resell Your Tickets
      </h1>
      {alert.open && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          className="mb-4"
        >
          <AlertTitle>
            {alert.severity === "success" ? "Success" : "Error"}
          </AlertTitle>
          {alert.message}
        </Alert>
      )}
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
            Resell Selected Ticket
          </h2>
          {selectedTicket ? (
            <div>
              <p className="mb-2">
                <span className="font-semibold">Event:</span>{" "}
                {selectedTicket.event.name}
              </p>
              <p className="mb-4">
                <span className="font-semibold">Date:</span>
                {""}
                {new Date(selectedTicket.event.date).toLocaleDateString()}
              </p>
              <div className="mb-4">
                <label
                  htmlFor="resellPrice"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Price :
                </label>
                <input
                  type="number"
                  id="resellPrice"
                  value={resellPrice}
                  onChange={handleResellPriceChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <button
                onClick={handleResellTicket}
                className="w-full bg-black text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
              >
                List for Resale
              </button>
            </div>
          ) : (
            <p className="text-gray-600">Select a ticket to resell</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResellTickets;
