import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { motion } from "framer-motion";
import Confetti from "./Confetti";
import BidHistory from "./BidHistory";
import Leaderboard from "./Leaderboard";
import useSound from "use-sound";
import Modal from "./modal";
import {
  AuctionStripeModal,
  AuctionSolanaModal,
  AuctionAptosModal,
} from "../components/AuctionPaymentModals";

const AuctionRoom = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidderName, setHighestBidderName] = useState(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isBiddingWar, setIsBiddingWar] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [userPublicKey, setUserPublicKey] = useState("");

  const [playBidSound] = useSound("/sounds/bid.mp3");
  const [playCountdownSound] = useSound("/sounds/countdown.mp3");
  const [playWinnerSound] = useSound("/sounds/winner.mp3");

  const bidWarTimeoutRef = useRef(null);

  const fetchLatestAuctionDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/auctionrooms/auctionitems`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const auction = response.data.find(
        (auction) => auction._id === auctionId
      );

      if (!auction) {
        setError("Auction not found. Please verify the auction ID.");
        return;
      }

      setAuctionDetails(auction);
      setHighestBid(auction.currentBid || auction.startingBid);
      setHighestBidderName(auction.highestBidder?.username || "No bids yet");
    } catch (error) {
      console.error("Detailed fetch error:", error.response || error);
      setError("Failed to fetch auction details.");
    }
  }, [auctionId]);

  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);

    fetchLatestAuctionDetails();

    newSocket.emit("joinAuction", auctionId);

    newSocket.on("participantsUpdate", ({ participants }) => {
      setParticipantsCount(participants);
    });

    newSocket.on(
      "bidUpdate",
      ({ highestBid, highestBidderName, bidder, amount }) => {
        setHighestBid(highestBid);
        setHighestBidderName(highestBidderName);
        setTimeRemaining(30); // Reset timer to 30 seconds when a new bid is placed
        playBidSound();

        // Update bid history
        setBidHistory((prevHistory) => [
          { bidder, amount, timestamp: new Date() },
          ...prevHistory.slice(0, 9),
        ]);

        // Update leaderboard
        setLeaderboard((prevLeaderboard) => {
          const updatedLeaderboard = [...prevLeaderboard];
          const bidderIndex = updatedLeaderboard.findIndex(
            (item) => item.bidder === bidder
          );
          if (bidderIndex !== -1) {
            updatedLeaderboard[bidderIndex].amount = amount;
          } else {
            updatedLeaderboard.push({ bidder, amount });
          }
          return updatedLeaderboard
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
        });

        // Trigger bidding war effect
        setIsBiddingWar(true);
        if (bidWarTimeoutRef.current) clearTimeout(bidWarTimeoutRef.current);
        bidWarTimeoutRef.current = setTimeout(
          () => setIsBiddingWar(false),
          5000
        );
      }
    );

    newSocket.on("auctionEnded", ({ message, winner, ticketId }) => {
      setShowConfetti(true);
      playWinnerSound();

      setTimeout(() => {
        if (winner) {
          const isWinner = winner === localStorage.getItem("username");
          if (isWinner) {
            setIsPaymentModalOpen(true);
            if (window.confirm(message + "\n\nClick OK to view your ticket.")) {
              navigate(`/tickets/${ticketId}`);
            } else {
              navigate("/auctions"); // Fallback navigation
            }
          } else {
            alert(message);
            navigate("/auction");
          }
        } else {
          alert(message);
          navigate("/auction");
        }
      }, 2000); // Give time for confetti animation
    });

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 0) {
          if (prev <= 5) playCountdownSound();
          return prev - 1;
        }
        if (prev === 0) {
          newSocket.emit("forceEndAuction", { auctionId });
        }
        return 0;
      });
    }, 1000);

    return () => {
      newSocket.disconnect();
      clearInterval(timer);
      if (bidWarTimeoutRef.current) clearTimeout(bidWarTimeoutRef.current);
    };
  }, [
    auctionId,
    navigate,
    fetchLatestAuctionDetails,
    playBidSound,
    playCountdownSound,
    playWinnerSound,
  ]);

  const handlePlaceBid = async () => {
    if (!socket) return;

    const parsedBidAmount = Number.parseFloat(bidAmount);

    if (!parsedBidAmount || isNaN(parsedBidAmount)) {
      alert("Please enter a valid bid amount.");
      return;
    }

    if (parsedBidAmount <= highestBid) {
      alert("Your bid must be higher than the current highest bid.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8000/auctionrooms/auction/${auctionId}/bid`,
        { bidAmount: parsedBidAmount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      socket.emit("placeBid", {
        auctionId,
        userId,
        bidAmount: parsedBidAmount,
      });

      fetchLatestAuctionDetails();
      setBidAmount("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place bid");
    }
  };

  const handlePaymentSuccess = async (txHash, method) => {
    try {
      await axios.post(
        `http://localhost:8000/auctions/${auctionId}/complete`,
        {
          txHash,
          paymentMethod: method,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      navigate(`/tickets`);
    } catch (error) {
      console.error("Payment completion failed:", error);
    }
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!auctionDetails) return <div>Loading...</div>;

  return (
    <div className="auction-room p-4 max-w-4xl mx-auto">
      {showConfetti && <Confetti />}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="auction-info space-y-2">
          <h1 className="text-2xl font-bold mb-4">
            Auction: {auctionDetails.event?.name || "Auction"}
          </h1>
          <p>Organizer: {auctionDetails.organizer?.username || "Unknown"}</p>
          <p>Seat: {auctionDetails.seat}</p>
          <p>Starting Bid: ₹{auctionDetails.startingBid}</p>
          <motion.div
            animate={{
              scale: isBiddingWar ? [1, 1.1, 1] : 1,
              transition: {
                duration: 0.5,
                repeat: isBiddingWar ? Number.POSITIVE_INFINITY : 0,
              },
            }}
          >
            <p className="text-2xl font-bold text-green-600">
              Current Highest Bid: ₹{highestBid}
            </p>
            <p className="text-xl">Highest Bidder: {highestBidderName}</p>
          </motion.div>
          <motion.p
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 0.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1,
            }}
          >
            Participants: {participantsCount}
          </motion.p>
          <motion.p
            className="text-3xl font-bold"
            animate={{
              scale: timeRemaining <= 10 ? [1, 1.1, 1] : 1,
              color:
                timeRemaining <= 10
                  ? ["#ef4444", "#ff0000", "#ef4444"]
                  : "#000000",
            }}
            transition={{
              duration: 0.5,
              repeat: timeRemaining <= 10 ? Number.POSITIVE_INFINITY : 0,
            }}
          >
            Time Remaining: {timeRemaining} seconds
          </motion.p>
        </div>

        <div className="bid-section mt-4">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter your bid"
            className="w-full border p-2 rounded mb-2"
            disabled={timeRemaining === 0}
          />
          <motion.button
            onClick={handlePlaceBid}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded"
            disabled={timeRemaining === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Place Bid
          </motion.button>
        </div>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <BidHistory history={bidHistory} />
        <Leaderboard leaderboard={leaderboard} />
      </div>

      {isPaymentModalOpen && (
        <Modal isOpen={true} onClose={() => setIsPaymentModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              Complete Your Auction Purchase
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
              <button
                onClick={() => setPaymentMethod("aptos")}
                className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-3 rounded-lg"
              >
                Pay with Aptos
              </button>
            </div>
          </div>
        </Modal>
      )}

      {paymentMethod === "stripe" && (
        <Modal isOpen={true} onClose={() => setPaymentMethod(null)}>
          <AuctionStripeModal
            amount={highestBid * 100}
            onSuccess={(tx) => handlePaymentSuccess(tx, "stripe")}
          />
        </Modal>
      )}

      {paymentMethod === "solana" && (
        <Modal isOpen={true} onClose={() => setPaymentMethod(null)}>
          <AuctionSolanaModal
            amount={highestBid}
            userPublicKey={userPublicKey}
            setUserPublicKey={setUserPublicKey}
            handlePayment={() => handlePaymentSuccess(null, "solana")}
          />
        </Modal>
      )}

      {paymentMethod === "aptos" && (
        <Modal isOpen={true} onClose={() => setPaymentMethod(null)}>
          <AuctionAptosModal
            auction={auctionDetails}
            onSuccess={(tx) => handlePaymentSuccess(tx, "aptos")}
          />
        </Modal>
      )}
    </div>
  );
};

export default AuctionRoom;
