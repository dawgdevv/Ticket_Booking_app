import { useEffect, useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../pages/checkoutform.jsx";
import Modal from "../pages/modal.jsx";
import { jsPDF } from "jspdf";

const stripePromise = loadStripe(
  "pk_test_51QLIkbRwlFB03Gh52W76kjQaqVtMXt1tlXl61HihY6CcPcRfaRff6rDXKbBWcAnATNifWIP9TsV5Fu9w4UL8Wnmz00keNN6jlM"
);

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [userPublicKey, setUserPublicKey] = useState("");
  const [showSolanaModal, setShowSolanaModal] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:8000/events");
        setEvents(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEvents();
  }, []);

  const handlePaymentSuccess = async () => {
    if (selectedEvent) {
      try {
        const payload = {
          eventId: selectedEvent._id,
          quantity: 1,
          seats: ["A1"],
        };
        console.log("Booking payload:", payload);
        const response = await axios.post(
          "http://localhost:8000/tickets/book",
          { eventId: selectedEvent._id, quantity: 1, seats: ["A1"] },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("Booking response:", response.data);

        setTicketDetails(response.data.ticket);
        setIsModalOpen(true);
      } catch (error) {
        console.error("Booking failed:", error);
        alert("Booking failed. Please try again.");
      }
    }
  };

  const handleSolanaPayment = async () => {
    if (selectedEvent && userPublicKey) {
      try {
        const response = await axios.post(
          "http://localhost:8000/tickets/book-solana",
          {
            eventId: selectedEvent._id,
            quantity: 1,
            seats: ["A1"],
            userPublicKey,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("Booking response:", response.data);

        setTicketDetails(response.data.ticket);
        setIsModalOpen(true);
      } catch (error) {
        console.error("Booking failed:", error);
        alert("Booking failed. Please try again.");
      }
    } else {
      alert("Please enter your Solana public key.");
    }
  };

  const handleSolanaModalOpen = (event) => {
    setSelectedEvent(event);
    setShowSolanaModal(true);
  };

  const handleSolanaModalClose = () => {
    setShowSolanaModal(false);
    setUserPublicKey("");
  };

  const generateTicketPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.text("🎟️ Ticket Details", 20, 20);

    doc.setFontSize(12);
    doc.text(`Event: ${ticketDetails?.event?.name || "N/A"}`, 20, 40);
    doc.text(`Venue: ${ticketDetails?.venue || "N/A"}`, 20, 50);
    doc.text(`Seats: ${ticketDetails?.seats?.join(", ") || "N/A"}`, 20, 60);
    doc.text(`Price: ${ticketDetails?.price || "N/A"}`, 20, 70);
    doc.text(`Quantity: ${ticketDetails?.quantity || "N/A"}`, 20, 80);
    doc.text(`Ticket ID: ${ticketDetails?._id || "N/A"}`, 20, 90);

    // Save the PDF
    doc.save(`${ticketDetails?._id}_ticket.pdf`);

    setTicketDetails(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-black">
        Upcoming Events
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={event.image}
              alt={event.name}
              className="event-image mb-4 rounded-md"
            />
            <h2 className="text-2xl font-semibold mb-3 text-black">
              {event.name}
            </h2>
            <p className="text-gray-600 mb-2">
              <span className="font-medium text-gray-800">Date:</span>{" "}
              {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium text-gray-800">Location:</span>{" "}
              {event.location}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-medium text-gray-800">Price:</span>{" "}
              {formatPrice(event.price)}
            </p>
            <div className="flex gap-2">
              <button
                className="w-1/2 bg-black text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
                onClick={() => {
                  setSelectedEvent(event);
                  setIsModalOpen(true);
                }}
              >
                Book with Card
              </button>
              <button
                className="w-1/2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors duration-300"
                onClick={() => handleSolanaModalOpen(event)}
              >
                Book with Solana
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stripe Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            amount={selectedEvent?.price * 100}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Elements>
      </Modal>

      {/* Solana Payment Modal */}
      <Modal isOpen={showSolanaModal} onClose={handleSolanaModalClose}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Book with Solana</h2>
          <div className="mb-4">
            <p className="text-lg font-semibold">{selectedEvent?.name}</p>
            <p className="text-gray-600">
              Price: {formatPrice(selectedEvent?.price)}
            </p>
          </div>
          <input
            type="text"
            placeholder="Enter your Solana public key"
            value={userPublicKey}
            onChange={(e) => setUserPublicKey(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <button
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors duration-300"
            onClick={handleSolanaPayment}
          >
            Confirm Payment
          </button>
        </div>
      </Modal>

      {/* Ticket Details Modal */}
      {ticketDetails && (
        <Modal isOpen={true} onClose={() => setTicketDetails(null)}>
          <div className="ticket-details p-6 bg-blue-50 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-4">🎟️ Ticket Details</h2>
            <p className="mb-2">
              <strong>Event:</strong> {ticketDetails?.event?.name || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Venue:</strong> {ticketDetails?.venue || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Seats:</strong>{" "}
              {ticketDetails?.seats?.join(", ") || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Price:</strong>{" "}
              {formatPrice(ticketDetails?.price) || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Quantity:</strong> {ticketDetails?.quantity || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Ticket ID:</strong> {ticketDetails?._id || "N/A"}
            </p>

            <button
              onClick={generateTicketPDF}
              className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors duration-300"
            >
              Download Ticket PDF
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Events;
