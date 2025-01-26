import { useEffect, useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import CheckoutForm from "./CheckoutForm.jsx";
import Modal from "./modal";
import { jsPDF } from "jspdf";
import EventCard from "../components/EventCard";
import TicketDetails from "../components/TicketDetails";
import AptosBooking from "../components/AptosBooking.tsx";

const stripePromise = loadStripe(
  "pk_test_51QLIkbRwlFB03Gh52W76kjQaqVtMXt1tlXl61HihY6CcPcRfaRff6rDXKbBWcAnATNifWIP9TsV5Fu9w4UL8Wnmz00keNN6jlM"
);

const Events = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [userPublicKey, setUserPublicKey] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/events");
        setEvents(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Handle seat selection
  const handleSeatSelection = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedEvent) return 0;
    return selectedEvent.price * selectedSeats.length;
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    try {
      const response = await axios.post(
        "https://dtix-backend-7f609a0e60c3.herokuapp.com/tickets/book",
        {
          eventId: selectedEvent._id,
          quantity: selectedSeats.length,
          seats: selectedSeats,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTicketDetails(response.data.ticket);
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    }
  };

  // Handle Solana payment
  const handleSolanaPayment = async () => {
    if (!selectedEvent || !userPublicKey) {
      alert("Please enter your Solana public key.");
      return;
    }

    try {
      const amount = calculateTotalPrice(); // Get the total price

      // First process the Solana payment
      const paymentResponse = await axios.post(
        "https://dtix-backend-7f609a0e60c3.herokuapp.com/payment/solana",
        {
          amount: amount,
          userPublicKey: userPublicKey,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (paymentResponse.data.success) {
        // If payment successful, create the ticket
        const ticketResponse = await axios.post(
          "https://dtix-backend-7f609a0e60c3.herokuapp.com/tickets/book",
          {
            eventId: selectedEvent._id,
            quantity: selectedSeats.length,
            seats: selectedSeats,
            paymentSignature: paymentResponse.data.signature,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setTicketDetails(ticketResponse.data.ticket);
        setIsPaymentModalOpen(false);
        setPaymentMethod(null);
      }
    } catch (error) {
      console.error("Solana payment failed:", error);
      alert(
        error.response?.data?.message || "Payment failed. Please try again."
      );
    }
  };

  // Generate PDF ticket
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

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  // Render seat grid
  const renderSeatGrid = () => {
    const rows = 5;
    const cols = 5;
    const seats = [];

    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        const seat = `${String.fromCharCode(64 + row)}${col}`;
        seats.push(
          <button
            key={seat}
            onClick={() => handleSeatSelection(seat)}
            className={`seat w-16 h-16 mx-1 my-1 rounded-lg text-center font-bold transition-all duration-200 
              ${
                selectedSeats.includes(seat)
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-black"
              } 
              hover:bg-green-600`}
          >
            {seat}
          </button>
        );
      }
    }

    return (
      <div className="grid grid-cols-5 gap-4">
        {seats}
        <div className="col-span-5 text-center font-bold text-xl mt-4">
          Total Price: {formatPrice(calculateTotalPrice())}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-blue-100"
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-amber-800">
          Upcoming Events
        </h1>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-amber-500 rounded-full border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onSelectSeats={() => {
                  setSelectedEvent(event);
                  setIsSeatModalOpen(true);
                }}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {isSeatModalOpen && (
            <Modal isOpen={true} onClose={() => setIsSeatModalOpen(false)}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Select Your Seats</h2>
                {renderSeatGrid()}
                <button
                  onClick={() => {
                    setIsSeatModalOpen(false);
                    setIsPaymentModalOpen(true);
                  }}
                  className="mt-6 w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                >
                  Continue to Payment
                </button>
              </div>
            </Modal>
          )}

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
                  <AptosBooking
                    event={selectedEvent}
                    selectedSeats={selectedSeats}
                    onSuccess={(txHash) => {
                      setTicketDetails({
                        ...selectedEvent,
                        txHash,
                        blockchain: "aptos",
                        seats: selectedSeats,
                        quantity: selectedSeats.length,
                      });
                      setIsPaymentModalOpen(false);
                    }}
                  />
                </div>
              </div>
            </Modal>
          )}

          {paymentMethod && (
            <Modal isOpen={true} onClose={() => setPaymentMethod(null)}>
              {paymentMethod === "stripe" ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    amount={calculateTotalPrice() * 100}
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

export default Events;
