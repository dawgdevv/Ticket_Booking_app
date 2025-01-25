    import React, { useState, useEffect } from "react";
    import { useParams } from "react-router-dom";
    import io from "socket.io-client";
    import axios from "axios";

    const AuctionRoom = () => {
    const { auctionId } = useParams();
    const [socket, setSocket] = useState(null);
    const [auctionDetails, setAuctionDetails] = useState(null);
    const [highestBid, setHighestBid] = useState(0);
    const [highestBidder, setHighestBidder] = useState(null);
    const [participantsCount, setParticipantsCount] = useState(0);
    const [bidAmount, setBidAmount] = useState("");
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const newSocket = io("http://localhost:8000");
        setSocket(newSocket);

        const storedUserId = localStorage.getItem("userId");
        setUserId(storedUserId);

        const fetchAuctionDetails = async () => {
        try {
            const response = await axios.get(
            `http://localhost:8000/auctionrooms/auctionitems`, 
            {
                headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}` 
                }
            }
            );
            
            const auction = response.data.find(auction => auction._id === auctionId);
            
            if (!auction) {
            setError("Auction not found");
            return;
            }
            
            setAuctionDetails(auction);
            setHighestBid(auction.currentBid || auction.startingBid);
            setHighestBidder(auction.highestBidder);
        } catch (error) {
            console.error("Error fetching auction details:", error.response ? error.response.data : error.message);
            setError("Failed to fetch auction details.");
        }
        };

        fetchAuctionDetails();

        // Join auction
        const joinAuction = async () => {
        try {
            await axios.post(
            `http://localhost:8000/auctionrooms/auction/${auctionId}/join`, 
            {}, 
            {
                headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}` 
                }
            }
            );
        } catch (error) {
            console.error("Error joining auction:", error.response ? error.response.data : error.message);
        }
        };

        joinAuction();

        // Socket event listeners
        newSocket.on("participantsUpdate", ({ participants }) => {
        setParticipantsCount(participants);
        });

        const timer = setInterval(() => {
        setTimeRemaining((prev) => prev > 0 ? prev - 1 : 0);
        }, 1000);

        return () => {
        newSocket.disconnect();
        clearInterval(timer);
        };
    }, [auctionId]);

    const handlePlaceBid = async () => {
        if (!socket) return;

        const parsedBidAmount = parseFloat(bidAmount);

        if (!parsedBidAmount || isNaN(parsedBidAmount)) {
        alert("Please enter a valid bid amount.");
        return;
        }

        if (parsedBidAmount <= highestBid) {
        alert("Your bid must be higher than the current highest bid.");
        return;
        }

        try {
        const response = await axios.post(
            `http://localhost:8000/auctionrooms/auction/${auctionId}/bid`, 
            { bidAmount: parsedBidAmount }, 
            {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}` 
            }
            }
        );

        setHighestBid(response.data.auction.currentBid);
        setHighestBidder(response.data.auction.highestBidder);
        setBidAmount("");
        setTimeRemaining(30);
        } catch (error) {
        alert(error.response?.data?.message || "Failed to place bid");
        }
    };

    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!auctionDetails) return <div>Loading...</div>;

    return (
        <div className="auction-room p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">
            Auction: {auctionDetails.event?.name || 'Auction'}
        </h1>
        
        <div className="auction-info space-y-2">
            <p>Seat: {auctionDetails.seat}</p>
            <p>Starting Bid: ₹{auctionDetails.startingBid}</p>
            <p>Current Highest Bid: ₹{highestBid}</p>
            <p>
            Highest Bidder: {highestBidder ? 
                `User ID: ${highestBidder}` : 
                "No bids yet"}
            </p>
            <p>Participants: {participantsCount}</p>
            <p className="font-bold text-red-500">
            Time Remaining: {timeRemaining} seconds
            </p>
        </div>

        <div className="bid-section mt-4 flex">
            <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter your bid"
            className="border p-2 rounded flex-grow"
            />
            <button
            onClick={handlePlaceBid}
            className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
            disabled={timeRemaining === 0}
            >
            Place Bid
            </button>
        </div>
        </div>
    );
    };

    export default AuctionRoom;