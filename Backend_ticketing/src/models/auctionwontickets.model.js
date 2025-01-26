import mongoose from 'mongoose';

const auctionWonTicketsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  auctionTicket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionTicket',
    required: true
  },
  winningBid: {
    type: Number,
    required: true
  },
  wonAt: {
    type: Date,
    default: Date.now
  }
});

const AuctionWonTickets = mongoose.models.AuctionWonTickets || mongoose.model('AuctionWonTickets', auctionWonTicketsSchema);

auctionWonTicketsSchema.index({ user: 1, ticket: 1 }, { unique: true });


export default AuctionWonTickets;