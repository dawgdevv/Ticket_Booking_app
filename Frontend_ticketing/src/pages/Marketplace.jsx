<<<<<<< HEAD
import { useState, useEffect } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Modal from "../pages/modal.jsx";
import CheckoutForm from "../pages/checkoutform.jsx";

const stripePromise = loadStripe("your_stripe_public_key");

const TicketMarketplace = () => {
  const [resaleTickets, setResaleTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [showSolanaModal, setShowSolanaModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [userPublicKey, setUserPublicKey] = useState("");
  const [showStripeModal, setShowStripeModal] = useState(false);

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

  const handleStripePayment = async (ticketId) => {
    setSelectedTicket(ticketId);
    setShowStripeModal(true);
  };

  const handleSolanaPayment = async (ticketId) => {
    setSelectedTicket(ticketId);
    setShowSolanaModal(true);
  };

  const handleSolanaConfirm = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/tickets/purchase-solana",
        {
          resellTicketId: selectedTicket,
          userPublicKey,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedTickets = resaleTickets.filter(
        (ticket) => ticket._id !== selectedTicket
      );
      setResaleTickets(updatedTickets);
      setShowSolanaModal(false);
      setUserPublicKey("");
      alert("Ticket purchased successfully with Solana!");
    } catch {
      alert("Error purchasing ticket with Solana. Please try again.");
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
            <div className="flex gap-2">
              <button
                onClick={() => handleStripePayment(ticket._id)}
                className="w-1/2 bg-black text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
              >
                Pay with Card
              </button>
              <button
                onClick={() => handleSolanaPayment(ticket._id)}
                className="w-1/2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors duration-300"
              >
                Pay with Solana
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedTickets.length === 0 && (
        <p className="text-center text-gray-600 mt-8">
          No tickets found matching your search.
        </p>
      )}

      {/* Stripe Modal */}
      <Modal isOpen={showStripeModal} onClose={() => setShowStripeModal(false)}>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            amount={
              selectedTicket
                ? resaleTickets.find((t) => t._id === selectedTicket)?.price *
                  100
                : 0
            }
            onPaymentSuccess={() => handlePurchase(selectedTicket)}
          />
        </Elements>
      </Modal>

      {/* Solana Modal */}
      <Modal
        isOpen={showSolanaModal}
        onClose={() => {
          setShowSolanaModal(false);
          setUserPublicKey("");
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Pay with Solana</h2>
          <input
            type="text"
            placeholder="Enter your Solana public key"
            value={userPublicKey}
            onChange={(e) => setUserPublicKey(e.target.value)}
            className="w-full px-4 py-2 rounded-md border mb-4"
          />
          <button
            onClick={handleSolanaConfirm}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded"
          >
            Confirm Payment
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TicketMarketplace;
=======
import React, { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { useSpring, animated } from "react-spring"

const TicketMarketplace = () => {
  const [resaleTickets, setResaleTickets] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchResellTickets = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get("http://localhost:8000/tickets/marketplace", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setResaleTickets(response.data)
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching resell tickets:", error)
      }
      setIsLoading(false)
    }
    fetchResellTickets()
  }, [])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSort = (e) => {
    setSortBy(e.target.value)
  }

  const handlePurchase = async (resellTicketId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/tickets/purchase",
        { resellTicketId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      console.log("purchase:", response.data)
      const updatedTickets = resaleTickets.filter((ticket) => ticket._id !== resellTicketId)
      setResaleTickets(updatedTickets)

      alert("Ticket purchased successfully!")
    } catch (error) {
      console.error("Error purchasing ticket:", error)
      alert("Error purchasing ticket. Please try again.")
    }
  }

  const filteredAndSortedTickets = resaleTickets
    .filter(
      (ticket) =>
        ticket.ticket.event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.seller.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "date") return new Date(a.ticket.event.date) - new Date(b.ticket.event.date)
      if (sortBy === "price") return a.price - b.price
      if (sortBy === "event") return a.ticket.event.name.localeCompare(b.ticket.event.name)
      return 0
    })

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  }

  const inputProps = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 300, friction: 10 },
  })

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"
      >
        Ticket Resale Marketplace
      </motion.h1>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <animated.input
          style={inputProps}
          type="text"
          placeholder="Search events or sellers"
          value={searchTerm}
          onChange={handleSearch}
          className="mb-4 md:mb-0 w-full md:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <animated.div style={inputProps} className="flex items-center">
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
        </animated.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredAndSortedTickets.map((ticket) => (
            <motion.div
              key={ticket._id}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold mb-2 text-black">{ticket.ticket.event.name}</h2>
              <p className="text-black mb-1">
                <span className="font-medium">Date:</span> {new Date(ticket.ticket.event.date).toLocaleDateString()}
              </p>
              <p className="text-blue-500 mb-1">
                <span className="font-medium">Price:</span>
                {ticket.price}
              </p>
              <p className="text-black mb-4">
                <span className="font-medium">Seller:</span> {ticket.ticket.owner.username}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePurchase(ticket._id)}
                className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
              >
                Purchase Ticket
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isLoading && filteredAndSortedTickets.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-600 mt-8"
        >
          No tickets found matching your search.
        </motion.p>
      )}
    </motion.div>
  )
}

export default TicketMarketplace

>>>>>>> 21314f2 (Refactor code formatting and add new routes for auction functionality)
