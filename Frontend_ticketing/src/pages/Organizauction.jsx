import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Tooltip } from "react-tooltip";
import { useSpring, animated } from "react-spring";

const OrganizeAuction = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [startingBid, setStartingBid] = useState("");
  const [auctionEnd, setAuctionEnd] = useState("");
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserTickets = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "https://dtix-backend-7f609a0e60c3.herokuapp.com/auth/tickets",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserTickets(response.data);
      } catch (error) {
        console.error("Error fetching user tickets:", error);
      }
      setIsLoading(false);
    };
    fetchUserTickets();
  }, []);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setStep(2);
  };

  const handleStartingBidChange = (e) => {
    setStartingBid(e.target.value);
  };

  const handleAuctionEndChange = (e) => {
    setAuctionEnd(e.target.value);
  };

  const handleCreateAuction = async () => {
    if (selectedTicket && startingBid && auctionEnd) {
      try {
        const response = await axios.post(
          "https://dtix-backend-7f609a0e60c3.herokuapp.com/tickets/auction",
          { ticketId: selectedTicket._id, startingBid, auctionEnd },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            timeout: 5000,
          }
        );
        console.log("Auction created:", response.data);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          resetForm();
        }, 5000);
      } catch (error) {
        console.error("Creating auction failed:", error);
        alert("Creating auction failed. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setSelectedTicket(null);
    setStartingBid("");
    setAuctionEnd("");
    setStep(1);
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <h2 className="text-2xl font-semibold mb-4 text-black">
              Step 1: Select a Ticket
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
                    <p className="font-semibold text-black">
                      {ticket.event.name}
                    </p>
                    <p className="text-sm text-black">
                      Date: {new Date(ticket.event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-blue-500">
                      Current Price: {formatPrice(ticket.price)}
                    </p>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <h2 className="text-2xl font-semibold mb-4 text-black">
              Step 2: Set Auction Details
            </h2>
            <div className="space-y-4">
              <AnimatedInput
                id="startingBid"
                label="Starting Bid:"
                value={startingBid}
                onChange={handleStartingBidChange}
                type="number"
                tooltipContent="Set the initial price for your auction"
              />
              <AnimatedInput
                id="auctionEnd"
                label="Auction End Date:"
                value={auctionEnd}
                onChange={handleAuctionEndChange}
                type="datetime-local"
                tooltipContent="Choose when your auction will end"
              />
              <motion.button
                onClick={() => setStep(3)}
                className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Preview Auction
              </motion.button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <h2 className="text-2xl font-semibold mb-4 text-black">
              Step 3: Preview and Create Auction
            </h2>
            <AuctionPreview
              selectedTicket={selectedTicket}
              startingBid={startingBid}
              auctionEnd={auctionEnd}
              formatPrice={formatPrice}
            />
            <div className="flex space-x-4 mt-6">
              <motion.button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
              <motion.button
                onClick={handleCreateAuction}
                className="flex-1 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Auction
              </motion.button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundElements />
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.h1
            className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Organize Auction
          </motion.h1>
          <motion.div
            className="bg-white bg-opacity-70 p-6 rounded-lg shadow-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </motion.div>
        </div>
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

const BackgroundElements = () => (
  <>
    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-blue-100"></div>
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCI+CiAgPGZpbHRlciBpZD0ibm9pc2UiPgogICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNzUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIC8+CiAgPC9maWx0ZXI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC4wNSIgLz4KPC9zdmc+')] opacity-30"></div>
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIgLz4KICA8cGF0aCBkPSJNMzAgMEwwIDMwaDYweiIgZmlsbD0icmdiYSgyNTUsIDIxNSwgMCwgMC4wMykiIC8+CiAgPHBhdGggZD0iTTYwIDMwTDMwIDYwaDMweiIgZmlsbD0icmdiYSgyNTUsIDIxNSwgMCwgMC4wMykiIC8+Cjwvc3ZnPg==')] opacity-20"></div>
  </>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
  </div>
);

const AnimatedInput = ({
  id,
  label,
  value,
  onChange,
  type,
  tooltipContent,
}) => {
  const inputProps = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 300, friction: 10 },
  });

  return (
    <animated.div style={inputProps}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-black"
        data-tooltip-id={`${id}-tooltip`}
        data-tooltip-content={tooltipContent}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder="Enter value"
        id={id}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
      />
      <Tooltip id={`${id}-tooltip`} />
    </animated.div>
  );
};

const AuctionPreview = ({
  selectedTicket,
  startingBid,
  auctionEnd,
  formatPrice,
}) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-md mb-6"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-xl font-semibold mb-2 text-black">
      {selectedTicket.event.name}
    </h3>
    <p className="text-black mb-2">
      <span className="font-semibold">Date:</span>{" "}
      {new Date(selectedTicket.event.date).toLocaleDateString()}
    </p>
    <p className="text-blue-500 mb-2">
      <span className="font-semibold">Starting Bid:</span>{" "}
      {formatPrice(startingBid)}
    </p>
    <p className="text-red-400 mb-4">
      <span className="font-semibold">Auction Ends:</span>{" "}
      {new Date(auctionEnd).toLocaleString()}
    </p>

    <div className="bg-amber-100 p-4 rounded-md">
      <h4 className="text-lg font-semibold mb-2 text-amber-800">
        Time Remaining:
      </h4>
      <CountdownTimer endDate={auctionEnd} />
    </div>
  </motion.div>
);

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(endDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const addLeadingZero = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {Object.keys(timeLeft).length === 0 ? (
        <p>Auction has ended</p>
      ) : (
        <>
          {Object.entries(timeLeft).map(([unit, value]) => (
            <motion.div
              key={unit}
              className="bg-amber-200 p-2 rounded-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-2xl font-bold text-amber-800">
                {addLeadingZero(value)}
              </span>
              <span className="text-xs text-amber-700 block">{unit}</span>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};

export default OrganizeAuction;
