import { useState, useEffect } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "./modal.jsx";
import CheckoutForm from "./CheckoutForm.jsx";
import { jsPDF } from "jspdf";
import TicketDetails from "../components/TicketDetails";
import NFTPurchaseForm from "../components/NFTPurchaseForm";

const stripePromise = loadStripe(
  "pk_test_51QLIkbRwlFB03Gh52W76kjQaqVtMXt1tlXl61HihY6CcPcRfaRff6rDXKbBWcAnATNifWIP9TsV5Fu9w4UL8Wnmz00keNN6jlM"
);

const TicketMarketplace = () => {
  const [resaleTickets, setResaleTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [showNFTPurchaseModal, setShowNFTPurchaseModal] = useState(false);

  useEffect(() => {
    fetchResellTickets();
  }, []);

  const fetchResellTickets = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/tickets/marketplace`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setResaleTickets(response.data);
    } catch (error) {
      console.error("Error fetching resell tickets:", error);
      toast.error("Failed to load marketplace tickets");
    }
    setIsLoading(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const handlePaymentSuccess = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/tickets/purchase`,
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
      toast.success("Ticket purchased successfully!");
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Purchase failed. Please try again.");
    }
  };

  const handleNFTPurchaseSuccess = async (data) => {
    // Update tickets list after successful NFT purchase
    const updatedTickets = resaleTickets.filter(
      (ticket) => ticket._id !== selectedTicket._id
    );
    setResaleTickets(updatedTickets);
    setShowNFTPurchaseModal(false);
    toast.success("NFT ticket purchased successfully!");

    // Set ticket details for PDF generation
    setTicketDetails(data.ticket);
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

    if (ticketDetails?.tokenId) {
      doc.text(`Token ID: ${ticketDetails?.tokenId || "N/A"}`, 20, 100);
      doc.text(`NFT Ticket: Yes`, 20, 110);
    }

    doc.save(`${ticketDetails?._id}_ticket.pdf`);
    setTicketDetails(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredAndSortedTickets = resaleTickets
    .filter((ticket) => {
      // Safe access to nested properties
      const eventName = ticket.ticket?.event?.name || "";
      const sellerName = ticket.seller?.username || "";

      return (
        eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sellerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.ticket?.event?.date
          ? new Date(a.ticket.event.date)
          : new Date();
        const dateB = b.ticket?.event?.date
          ? new Date(b.ticket.event.date)
          : new Date();
        return dateA - dateB;
      }
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "event") {
        const nameA = a.ticket?.event?.name || "";
        const nameB = b.ticket?.event?.name || "";
        return nameA.localeCompare(nameB);
      }
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
        ) : filteredAndSortedTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-medium text-gray-600">
              No tickets available
            </h3>
            <p className="text-gray-500 mt-2">
              Check back later for more tickets
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h2 className="text-xl font-semibold mb-2 text-black">
                  {ticket.ticket?.event?.name || "Event name unavailable"}
                  {ticket.isNFT && (
                    <span className="ml-2 bg-blue-500 text-xs text-white py-1 px-2 rounded-full">
                      NFT
                    </span>
                  )}
                </h2>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Date:</span>{" "}
                  {ticket.ticket?.event?.date
                    ? new Date(ticket.ticket.event.date).toLocaleDateString()
                    : "Date unavailable"}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Venue:</span>{" "}
                  {ticket.ticket?.venue || "Venue unavailable"}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Seats:</span>{" "}
                  {ticket.ticket?.seats?.join(", ") || "Seats unavailable"}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Price:</span>{" "}
                  {formatPrice(ticket.price)}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Seller:</span>{" "}
                  {ticket.seller?.username || "Seller unavailable"}
                </p>
                {ticket.isNFT && (
                  <div className="mt-2 mb-4 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Token ID:</span>{" "}
                      <span className="font-mono">{ticket.tokenId}</span>
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedTicket(ticket);
                    if (ticket.isNFT) {
                      // Open NFT purchase modal that will ask for wallet address
                      setShowNFTPurchaseModal(true);
                    } else {
                      // Go directly to Stripe checkout for regular tickets
                      setPaymentMethod("stripe");
                    }
                  }}
                  className={`w-full ${
                    ticket.isNFT
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  } text-white px-4 py-2 rounded transition-colors duration-300`}
                >
                  {ticket.isNFT ? "Purchase NFT Ticket" : "Purchase Ticket"}
                </button>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {paymentMethod && (
            <Modal isOpen={true} onClose={() => setPaymentMethod(null)}>
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  amount={selectedTicket?.price * 100}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            </Modal>
          )}

          {showNFTPurchaseModal && selectedTicket && (
            <Modal isOpen={true} onClose={() => setShowNFTPurchaseModal(false)}>
              <NFTPurchaseForm
                ticket={selectedTicket}
                onSuccess={handleNFTPurchaseSuccess}
                onCancel={() => setShowNFTPurchaseModal(false)}
              />
            </Modal>
          )}

          {ticketDetails && (
            <Modal isOpen={true} onClose={() => setTicketDetails(null)}>
              <TicketDetails
                ticket={ticketDetails}
                formatPrice={formatPrice}
                onDownload={generateTicketPDF}
                isNFT={!!ticketDetails.tokenId}
              />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TicketMarketplace;
