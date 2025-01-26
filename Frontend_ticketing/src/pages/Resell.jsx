import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "react-spring";
import Confetti from "react-confetti";
import PropTypes from "prop-types";

const ResellTickets = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resellPrice, setResellPrice] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchUserTickets = async () => {
      setIsLoading(true);
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
      setIsLoading(false);
    };
    fetchUserTickets();
  }, []);

  useEffect(() => {
    if (alert.open) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, open: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setResellPrice(ticket.price);
  };

  const handleResellPriceChange = (e) => {
    setResellPrice(e.target.value);
  };

  const handleResellTicket = async () => {
    if (selectedTicket && resellPrice) {
      try {
        await axios.post(
          "http://localhost:8000/tickets/resell",
          { ticketId: selectedTicket._id, price: resellPrice },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            timeout: 5000,
          }
        );
        const updatedTickets = userTickets.map((ticket) =>
          ticket._id === selectedTicket._id
            ? { ...ticket, price: resellPrice }
            : ticket
        );
        setUserTickets(updatedTickets);
        setSelectedTicket(null);
        setResellPrice("");
        setAlert({
          open: true,
          message: "Ticket listed for resale successfully",
          severity: "success",
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } catch (error) {
        console.error("Reselling ticket failed:", error);
        setAlert({
          open: true,
          message: "Reselling ticket failed. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -50 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-blue-50 text-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.h1
          className="text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Resell Your Tickets
        </motion.h1>
        <AnimatePresence>
          {alert.open && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-8 p-4 rounded-md ${
                alert.severity === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <p className="font-semibold">
                {alert.severity === "success" ? "Success" : "Error"}
              </p>
              <p>{alert.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="grid gap-8 md:grid-cols-2"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-semibold mb-6 text-black">
              Your Tickets
            </h2>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <ul className="space-y-4">
                {userTickets.map((ticket, index) => (
                  <motion.li
                    key={ticket._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-md cursor-pointer transition-all duration-300 ${
                      selectedTicket && selectedTicket._id === ticket._id
                        ? "bg-amber-100 border-2 border-amber-500 shadow-md"
                        : "bg-white hover:bg-amber-50 hover:shadow-md"
                    }`}
                    onClick={() => handleSelectTicket(ticket)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <p className="font-semibold text-xl text-black">
                      {ticket.event.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(ticket.event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Current Price: {formatPrice(ticket.price)}
                    </p>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-semibold mb-6 text-black">
              Resell Selected Ticket
            </h2>
            <AnimatePresence mode="wait">
              {selectedTicket ? (
                <motion.div
                  key="selected-ticket"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="ticket-shape bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 p-6 rounded-lg shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 w-8 h-8 bg-purple-900 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-1/2 w-8 h-8 bg-purple-900 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                    <div className="border-2 border-dashed border-white/50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-white mb-2">
                        {selectedTicket.event.name}
                      </p>
                      <p className="text-blue-200 mb-4">
                        Date:{" "}
                        {new Date(
                          selectedTicket.event.date
                        ).toLocaleDateString()}
                      </p>
                      <AnimatedInput
                        id="resellPrice"
                        label="New Resell Price:"
                        value={resellPrice}
                        onChange={handleResellPriceChange}
                        type="number"
                      />
                      <motion.button
                        onClick={handleResellTicket}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        List for Resale
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-ticket"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="ticket-shape bg-white p-6 rounded-lg shadow-xl flex items-center justify-center h-64"
                >
                  <p className="text-gray-500 text-center text-lg">
                    Select a ticket to resell
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
  </div>
);

const AnimatedInput = ({ id, label, value, onChange, type }) => {
  const inputProps = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 300, friction: 10 },
  });

  return (
    <animated.div style={inputProps} className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-blue-200 mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className="w-full bg-white/20 rounded-md border-blue-400 text-white placeholder-blue-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500/50 focus:ring-opacity-50 p-2"
        placeholder="Enter new price"
      />
    </animated.div>
  );
};

AnimatedInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

export default ResellTickets;
