import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../pages/CheckoutForm";
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

AuctionStripeModal.propTypes = {
  amount: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
