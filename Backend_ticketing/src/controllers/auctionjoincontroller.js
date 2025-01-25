import AuctionTicket from "../models/auction.model.js";
import Bid from "../models/bids.model.js";
import User from "../models/user.model.js";


const endAuction = async (req, res) => {
    const { id } = req.params;
  
    try {
      const auction = await AuctionTicket.findById(id)
        .populate('ticket')
        .populate('highestBidder', 'username');
  
      // Check if auction has already ended
      if (!auction || auction.isEnded) {
        return res.status(400).json({ message: "Auction has already ended" });
      }
  
      // If there's a highest bidder, assign the ticket
      if (auction.highestBidder) {
        await User.findByIdAndUpdate(auction.highestBidder._id, {
          $push: { tickets: auction.ticket._id }
        });
  
        // Mark auction as ended
        auction.isEnded = true;
        await auction.save();
  
        return res.status(200).json({ 
          message: "Auction ended successfully",
          winner: auction.highestBidder.username 
        });
      }
  
      // If no bids, simply mark as ended
      auction.isEnded = true;
      await auction.save();
  
      return res.status(200).json({ 
        message: "Auction ended with no winner" 
      });
    } catch (error) {
      console.error("Error ending auction:", error);
      res.status(500).json({ message: error.message });
    }
  };

const joinAuction = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      const auction = await AuctionTicket.findById(id);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
  
      const currentDateTime = new Date();
      if (auction.auctionEnd <= currentDateTime) {
        return res.status(400).json({ message: "This auction has already ended." });
      }
  
      // Check if the user is already a participant
      if (auction.participants.includes(userId)) {
        return res.status(200).json({ 
          message: "You have already joined this auction.", 
          alreadyJoined: true,
          auctionId: id 
        });
      }
  
      // Add the user to the participants list
      auction.participants.push(userId);
      await auction.save();
  
      res.status(200).json({ 
        message: "Successfully joined the auction", 
        auctionId: id 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const placeBid = async (req, res) => {
    const { id } = req.params;
    const { bidAmount } = req.body;
    const userId = req.user.id;
  
    try {
      const auction = await AuctionTicket.findById(id);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
  
      if (bidAmount <= auction.currentBid) {
        return res.status(400).json({ message: "Bid must be higher than current bid" });
      }
  
      // Create new bid
      const newBid = new Bid({
        auctionTicket: id,
        bidder: userId,
        amount: bidAmount
      });
      await newBid.save();
  
      // Update auction details
      auction.currentBid = bidAmount;
      auction.highestBidder = userId;
      await auction.save();
  
      // Update user's bids
      await User.findByIdAndUpdate(userId, 
        { $push: { bids: newBid._id } }
      );
  
      res.status(200).json({ 
        message: "Bid placed successfully", 
        auction: auction 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const getAuctionItems = async (req, res) => {
    try {
        const auctions = await AuctionTicket.find()
            .populate('event')
            .populate('ticket')
            .populate('organizer');
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { joinAuction, placeBid, getAuctionItems ,endAuction};  