import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../pages/CheckoutForm";
import AptosBooking from "./AptosBooking";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51QLIkbRwlFB03Gh52W76kjQaqVtMXt1tlXl61HihY6CcPcRfaRff6rDXKbBWcAnATNifWIP9TsV5Fu9w4UL8Wnmz00keNN6jlM"
);

export const AuctionStripeModal = ({ amount, onSuccess }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-6">Complete Auction Payment</h2>
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} onPaymentSuccess={onSuccess} />
    </Elements>
  </div>
);

export const AuctionSolanaModal = ({
  amount,
  userPublicKey,
  setUserPublicKey,
  handlePayment,
}) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-6">
      Complete Auction Payment with Solana
    </h2>
    <input
      type="text"
      value={userPublicKey}
      onChange={(e) => setUserPublicKey(e.target.value)}
      placeholder="Your Solana Wallet Address"
      className="w-full p-2 border rounded mb-4"
    />
    <button
      onClick={handlePayment}
      className="w-full bg-blue-500 text-white p-3 rounded"
    >
      Pay {amount} SOL
    </button>
  </div>
);

export const AuctionAptosModal = ({ auction, onSuccess }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-6">
      Complete Auction Payment with Aptos
    </h2>
    <AptosBooking
      event={{
        name: auction.eventName,
        price: auction.currentBid,
      }}
      selectedSeats={[auction.seat]}
      onSuccess={onSuccess}
    />
  </div>
);

AuctionStripeModal.propTypes = {
  amount: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

AuctionAptosModal.propTypes = {
  auction: PropTypes.shape({
    eventName: PropTypes.string.isRequired,
    currentBid: PropTypes.number.isRequired,
    seat: PropTypes.string.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
};

AuctionSolanaModal.propTypes = {
  amount: PropTypes.number.isRequired,
  userPublicKey: PropTypes.string.isRequired,
  setUserPublicKey: PropTypes.func.isRequired,
  handlePayment: PropTypes.func.isRequired,
  auction: PropTypes.shape({
    eventName: PropTypes.string.isRequired,
    currentBid: PropTypes.number.isRequired,
    seat: PropTypes.string.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
};
