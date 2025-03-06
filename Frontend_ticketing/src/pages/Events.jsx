import { useEffect, useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { KeychainSDK } from "keychain-sdk";
import { jsPDF } from "jspdf";
import CheckoutForm from "./CheckoutForm.jsx";
import Modal from "./modal";
import EventCard from "../components/EventCard";
import TicketDetails from "../components/TicketDetails";
import HiveAuth from "../components/HiveAuth";
import HivePayment from "../components/HivePayment";

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
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hivePaymentResult, setHivePaymentResult] = useState(null);

  // Hive related states
  const [hiveUser, setHiveUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHiveKeychainAvailable, setIsHiveKeychainAvailable] = useState(false);

  // Check if Hive Keychain is available and get stored user
  useEffect(() => {
    const checkKeychain = async () => {
      try {
        const keychain = new KeychainSDK(window);
        const isInstalled = await keychain.isKeychainInstalled();
        setIsHiveKeychainAvailable(isInstalled);
      } catch (error) {
        console.error("Error checking Keychain:", error);
        setIsHiveKeychainAvailable(false);
      }
    };

    checkKeychain();

    // Check if user is already signed in with Hive
    const storedUsername = localStorage.getItem("hiveName");
    const storedPublicKey = localStorage.getItem("hivePublicKey");

    if (storedUsername && storedPublicKey) {
      setHiveUser({
        username: storedUsername,
        publicKey: storedPublicKey,
      });
    }
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/events"
        );
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

  // Broadcast ticket purchase to Hive blockchain
  const broadcastTicketPurchase = async (ticketData, paymentDetails) => {
    if (!hiveUser || !isHiveKeychainAvailable) {
      console.log("Hive user not authenticated or Keychain not available");
      return false;
    }

    try {
      const keychain = new KeychainSDK(window);

      const memo = JSON.stringify({
        app: "TicketBookingApp",
        action: "ticket_purchase",
        event: ticketData.event.name,
        seats: ticketData.seats,
        timestamp: new Date().toISOString(),
        ticket_id: ticketData._id,
        payment: paymentDetails || "regular_payment",
      });

      const broadcastData = {
        username: hiveUser.username,
        operations: [
          [
            "custom_json",
            {
              required_auths: [],
              required_posting_auths: [hiveUser.username],
              id: "ticket_booking_app",
              json: memo,
            },
          ],
        ],
        method: "Posting",
      };

      const result = await keychain.requestBroadcast(broadcastData);
      console.log("Broadcast result:", result);

      return result.success;
    } catch (error) {
      console.error("Error broadcasting to Hive:", error);
      return false;
    }
  };

  // Handle payment success (for both Stripe and Hive)
  const handlePaymentSuccess = async (paymentDetails = null) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/tickets/book",
        {
          eventId: selectedEvent._id,
          quantity: selectedSeats.length,
          seats: selectedSeats,
          paymentMethod: paymentDetails ? "hive" : "stripe",
          paymentDetails: paymentDetails || {},
          simulatedPayment: paymentDetails?.simulatedPayment || false,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const ticketData = response.data.ticket;
      setTicketDetails(ticketData);
      setIsPaymentModalOpen(false);
      setPaymentMethod(null);

      // Store payment result for Hive payments
      if (paymentDetails) {
        setHivePaymentResult(paymentDetails);
        // Show a success message for Hive payment
        setTimeout(() => {
          const messagePrefix = paymentDetails.simulatedPayment
            ? "Test payment successful!"
            : "Payment successful!";
          alert(
            `${messagePrefix} Your ticket for ${ticketData.event.name} has been booked using HIVE blockchain.`
          );
        }, 500);
      } else {
        // Show a success message for regular payment
        setTimeout(() => {
          alert(
            `Payment successful! Your ticket for ${ticketData.event.name} has been booked.`
          );
        }, 500);
      }

      // Broadcast to Hive blockchain if user is authenticated and payment was made with HIVE
      if (hiveUser && paymentDetails) {
        await broadcastTicketPurchase(ticketData, paymentDetails);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    }
  };

  // Handle payment failure
  const handlePaymentFailure = (error) => {
    console.error("Payment failed:", error);
    alert(`Payment failed: ${error}`);
  };

  // Handle Hive sign in
  const handleHiveSignIn = (userData) => {
    setHiveUser(userData);
    setIsAuthModalOpen(false);
  };

  // Sign out of Hive
  const handleHiveSignOut = () => {
    localStorage.removeItem("hiveName");
    localStorage.removeItem("hivePublicKey");
    setHiveUser(null);
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

    // Add payment method info
    const paymentMethodText = hivePaymentResult
      ? hivePaymentResult.simulatedPayment
        ? "HIVE Blockchain (Test Mode)"
        : "HIVE Blockchain"
      : "Credit Card";
    doc.text(`Payment Method: ${paymentMethodText}`, 20, 100);

    if (hivePaymentResult) {
      doc.text(`Transaction ID: ${hivePaymentResult.transactionId}`, 20, 110);
      if (hivePaymentResult.simulatedPayment) {
        doc.text(
          "Note: This was a test transaction using Resource Credits",
          20,
          120
        );
      }
    }

    doc.save(`${ticketDetails?._id}_ticket.pdf`);
    setTicketDetails(null);
    setHivePaymentResult(null);
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
        {/* Hive Authentication Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-amber-800">Upcoming Events</h1>
          <div>
            {hiveUser ? (
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-medium">
                  @{hiveUser.username}
                </span>
                <button
                  onClick={handleHiveSignOut}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Sign in with Hive
              </button>
            )}
          </div>
        </div>

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
          {/* Hive Auth Modal */}
          {isAuthModalOpen && (
            <Modal isOpen={true} onClose={() => setIsAuthModalOpen(false)}>
              <div className="p-6">
                <HiveAuth onSignIn={handleHiveSignIn} />
              </div>
            </Modal>
          )}

          {isSeatModalOpen && (
            <Modal isOpen={true} onClose={() => setIsSeatModalOpen(false)}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Select Your Seats</h2>
                {renderSeatGrid()}
                <button
                  onClick={() => {
                    if (selectedSeats.length === 0) {
                      alert("Please select at least one seat");
                      return;
                    }
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
                  {/* Hive Payment Option - only show if logged in */}
                  {hiveUser ? (
                    <button
                      onClick={() => setPaymentMethod("hive")}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-3 rounded-lg flex items-center justify-center"
                    >
                      <img
                        src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png"
                        alt="Hive Logo"
                        className="h-6 mr-2"
                      />
                      Pay with HIVE
                    </button>
                  ) : (
                    <div className="p-3 bg-gray-100 rounded-lg mb-4">
                      <div className="flex items-center">
                        <div className="mr-3 text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-gray-600 font-medium">
                            HIVE Payment
                          </div>
                          <div className="text-xs text-gray-500">
                            <button
                              onClick={() => {
                                setIsPaymentModalOpen(false);
                                setIsAuthModalOpen(true);
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              Sign in with Hive
                            </button>{" "}
                            to enable blockchain payments
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Payment Option - always available */}
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg"
                  >
                    Pay with Card
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {paymentMethod && (
            <Modal isOpen={true} onClose={() => setPaymentMethod(null)}>
              {paymentMethod === "stripe" && (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    amount={calculateTotalPrice() * 100}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}

              {paymentMethod === "hive" && hiveUser ? (
                <HivePayment
                  amount={calculateTotalPrice()}
                  username={hiveUser.username}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                />
              ) : paymentMethod === "hive" ? (
                <div className="p-6 text-center">
                  <div className="mb-4 text-amber-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Authentication Required
                  </h3>
                  <p className="mb-4 text-gray-600">
                    You need to sign in with Hive to use HIVE payments.
                  </p>
                  <button
                    onClick={() => {
                      setPaymentMethod(null);
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                  >
                    Sign in with Hive
                  </button>
                </div>
              ) : null}
            </Modal>
          )}

          {ticketDetails && (
            <Modal isOpen={true} onClose={() => setTicketDetails(null)}>
              <TicketDetails
                ticket={ticketDetails}
                formatPrice={formatPrice}
                onDownload={generateTicketPDF}
                hiveUser={hiveUser}
                isBroadcasted={hiveUser !== null}
                paymentMethod={hivePaymentResult ? "hive" : "card"}
                hivePayment={hivePaymentResult}
              />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Events;
