import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropType from "prop-types";

const Auction = () => {
  const [auctionItems, setAuctionItems] = useState([]);
  const [completedAuctions, setCompletedAuctions] = useState([]);
  const [alreadyJoinedAuction, setAlreadyJoinedAuction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctionItems();
    const interval = setInterval(fetchAuctionItems, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAuctionItems = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/tickets/auctionitems",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Filter out auctions with a winner or sold ticket
      const now = new Date();
      const ongoing = response.data.filter(
        (item) =>
          new Date(item.auctionEnd) > now &&
          !item.isEnded &&
          !item.ticket.isSold
      );

      const completed = response.data.filter(
        (item) =>
          (new Date(item.auctionEnd) <= now || item.isEnded) &&
          !item.ticket.isSold
      );

      setAuctionItems(ongoing);
      setCompletedAuctions(completed);
    } catch (error) {
      console.error("Error fetching auction items:", error);
    }
  };

  const joinAuction = async (auctionId) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL +
          `/auctionrooms/auction/${auctionId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.alreadyJoined) {
        setAlreadyJoinedAuction(auctionId);
      } else {
        navigate(`/auctionroom/${auctionId}`);
      }
    } catch (error) {
      console.error("Error joining auction:", error);
      alert(error.response?.data?.message || "Failed to join the auction.");
    }
  };

  const handleAlreadyJoinedAuction = () => {
    if (alreadyJoinedAuction) {
      navigate(`/auctionroom/${alreadyJoinedAuction}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {alreadyJoinedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Already Joined Auction</h2>
            <p className="mb-6">You have already joined this auction.</p>
            <button
              onClick={handleAlreadyJoinedAuction}
              className="bg-amber-600 text-white py-2 px-6 rounded-md hover:bg-amber-700 transition-colors"
            >
              Let&apos;s Bid
            </button>
          </div>
        </div>
      )}

      {/* Ongoing Auctions Section */}
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        Ongoing Auctions
      </h1>
      {auctionItems.length === 0 ? (
        <p className="text-center text-gray-500">
          No ongoing auctions at the moment
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {auctionItems.map((item) => (
            <motion.div
              key={item._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <h2 className="text-xl font-semibold text-black mb-2">
                {item.ticket.event.name}
              </h2>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Starting Bid:</span>{" "}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(item.startingBid)}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Highest Bid:</span>{" "}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(item.highestBid)}
              </p>
              <CountdownTimer endDate={item.auctionEnd} />
              <motion.button
                onClick={() => joinAuction(item._id)}
                className="mt-4 w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join Auction
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Completed Auctions Section */}
      {completedAuctions.length > 0 && (
        <>
          <h1 className="text-3xl font-bold mt-12 mb-8 text-center text-black">
            Completed Auctions
          </h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedAuctions.map((item) => (
              <div
                key={item._id}
                className="bg-gray-100 p-6 rounded-lg shadow-md opacity-60"
              >
                <h2 className="text-xl font-semibold text-black mb-2">
                  {item.ticket.event.name}
                </h2>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Final Bid:</span>{" "}
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(item.highestBid)}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Winner:</span>{" "}
                  {item.highestBidder?.username || "No winner"}
                </p>
                <p className="text-red-500">Auction Closed</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(endDate) - +new Date();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      min: Math.floor((difference / 1000 / 60) % 60),
      sec: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  if (!timeLeft) {
    return <p className="text-red-500">Auction has ended</p>;
  }

  return (
    <div className="mt-2 grid grid-cols-4 gap-2 text-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <motion.div
          key={unit}
          className="bg-amber-200 p-2 rounded-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xl font-bold text-amber-800">{value}</span>
          <span className="text-xs text-amber-700">{unit}</span>
        </motion.div>
      ))}
    </div>
  );
};

CountdownTimer.propTypes = {
  endDate: PropType.string.isRequired,
};

export default Auction;
