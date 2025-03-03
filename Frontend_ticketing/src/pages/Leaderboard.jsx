import { motion } from "framer-motion";
import Proptypes from "prop-types";
const Leaderboard = ({ leaderboard }) => {
  return (
    <div className="leaderboard">
      <h2 className="text-xl font-bold mb-2">Top Bidders</h2>
      <ul className="space-y-2">
        {leaderboard.map((bidder, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-100 p-2 rounded flex justify-between items-center"
          >
            <span className="font-semibold">{bidder.bidder}</span>
            <span>₹{bidder.amount}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

Leaderboard.propTypes = {
  leaderboard: Proptypes.array.isRequired,
};

export default Leaderboard;
