import { useState, useEffect } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "./modal.jsx";
import CheckoutForm from "./CheckoutForm.jsx";
import { jsPDF } from "jspdf";
import TicketDetails from "../components/TicketDetails";

const stripePromise = loadStripe(
  "pk_test_51QLIkbRwlFB03Gh52W76kjQaqVtMXt1tlXl61HihY6CcPcRfaRff6rDXKbBWcAnATNifWIP9TsV5Fu9w4UL8Wnmz00keNN6jlM"
);

const TicketMarketplace = () => {
  const [resaleTickets, setResaleTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [userPublicKey, setUserPublicKey] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);

  useEffect(() => {
    const fetchResellTickets = async () => {
      setIsLoading(true);
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
      } catch (error) {
        console.error("Error fetching resell tickets:", error);
      }
      setIsLoading(false);
    };
    fetchResellTickets();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const handlePaymentSuccess = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/tickets/purchase",
        { resellTicketId: selectedTicket._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTicketDetails(response.data.ticket);
      setIsPaymentModalOpen(false);
      setPaymentMethod(null);

      // Update tickets list
      const updatedTickets = resaleTickets.filter(
        (ticket) => ticket._id !== selectedTicket._id
      );
      setResaleTickets(updatedTickets);
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    }
  };

  const handleSolanaPayment = async () => {
    if (!selectedTicket || !userPublicKey) {
      alert("Please enter your Solana public key.");
      return;
    }

    try {
      const amount = selectedTicket.price;

      const paymentResponse = await axios.post(
        "http://localhost:8000/payment/solana",
        {
          amount,
          userPublicKey,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (paymentResponse.data.success) {
        const purchaseResponse = await axios.post(
          "http://localhost:8000/tickets/purchase-solana",
          {
            resellTicketId: selectedTicket._id,
            userPublicKey,
            paymentSignature: paymentResponse.data.signature,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setTicketDetails(purchaseResponse.data.ticket);
        setIsPaymentModalOpen(false);
        setPaymentMethod(null);

        // Update tickets list
        const updatedTickets = resaleTickets.filter(
          (ticket) => ticket._id !== selectedTicket._id
        );
        setResaleTickets(updatedTickets);
      }
    } catch (error) {
      console.error("Solana payment failed:", error);
      alert(
        error.response?.data?.message || "Payment failed. Please try again."
      );
    }
  };

  const generateTicketPDF = () => {
    if (!ticketDetails) return;

    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.text("🎟️ Ticket Details", 20, 20);

    doc.setFontSize(12);
    doc.text(`Event: ${ticketDetails?.event?.name || "N/A"}`, 20, 40);
    doc.text(`Venue: ${ticketDetails?.venue || "N/A"}`, 20, 50);
    doc.text(`Seats: ${ticketDetails?.seats?.join(", ") || "N/A"}`, 20, 60);
    doc.text(`Price: ${formatPrice(ticketDetails?.price) || "N/A"}`, 20, 70);
    doc.text(`Quantity: ${ticketDetails?.quantity || "N/A"}`, 20, 80);
    doc.text(`Ticket ID: ${ticketDetails?._id || "N/A"}`, 20, 90);

    doc.save(`${ticketDetails?._id}_ticket.pdf`);
    setTicketDetails(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-blue-100"
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-amber-800">
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

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-amber-500 rounded-full border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <span className="font-medium">Price:</span>{" "}
                  {formatPrice(ticket.price)}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Seller:</span>{" "}
                  {ticket.ticket.owner.username}
                </p>
                <button
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setIsPaymentModalOpen(true);
                  }}
                  className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors duration-300"
                >
                  Purchase Ticket
                </button>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {isPaymentModalOpen && (
            <Modal isOpen={true} onClose={() => setIsPaymentModalOpen(false)}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  Choose Payment Method
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg"
                  >
                    Pay with Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod("solana")}
                    className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-3 rounded-lg"
                  >
                    Pay with Solana
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {paymentMethod && (
            <Modal isOpen={true} onClose={() => setPaymentMethod(null)}>
              {paymentMethod === "stripe" ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    amount={selectedTicket?.price * 100}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Pay with Solana</h2>
                  <input
                    type="text"
                    value={userPublicKey}
                    onChange={(e) => setUserPublicKey(e.target.value)}
                    placeholder="Enter your Solana public key"
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <button
                    onClick={handleSolanaPayment}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Complete Payment
                  </button>
                </div>
              )}
            </Modal>
          )}

          {ticketDetails && (
            <Modal isOpen={true} onClose={() => setTicketDetails(null)}>
              <TicketDetails
                ticket={ticketDetails}
                formatPrice={formatPrice}
                onDownload={generateTicketPDF}
              />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TicketMarketplace;
