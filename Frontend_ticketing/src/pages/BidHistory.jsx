import { motion, AnimatePresence } from "framer-motion";
import Proptypes from "prop-types";
const BidHistory = ({ history }) => {
  return (
    <div className="bid-history">
      <h2 className="text-xl font-bold mb-2">Bid History</h2>
      <ul className="space-y-2">
        <AnimatePresence>
          {history.map((bid, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-100 p-2 rounded"
            >
              <span className="font-semibold">{bid.bidder}</span> bid ₹
              {bid.amount}
              <span className="text-sm text-gray-500 ml-2">
                {new Date(bid.timestamp).toLocaleTimeString()}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

BidHistory.propTypes = {
  history: Proptypes.array.isRequired,
};

export default BidHistory;
