import { motion } from "framer-motion";
import PropTypes from "prop-types";

const EventCard = ({ event, onSelectSeats, formatPrice }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <img
        src={event.image}
        alt={event.name}
        className="w-full h-48 object-cover mb-4 rounded-md"
      />
      <h2 className="text-2xl font-semibold mb-3 text-black">
        {event.name}
      </h2>
      <p className="text-gray-600 mb-2">
        <span className="font-medium text-gray-800">Date:</span>{" "}
        {new Date(event.date).toLocaleDateString()}
      </p>
      <p className="text-gray-600 mb-2">
        <span className="font-medium text-gray-800">Location:</span>{" "}
        {event.location}
      </p>
      <p className="text-blue-600 mb-4">
        <span className="font-medium text-gray-800">Price:</span>{" "}
        {formatPrice(event.price)}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectSeats(event)}
        className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors duration-300"
      >
        Book Tickets
      </motion.button>
    </motion.div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
  }).isRequired,
  onSelectSeats: PropTypes.func.isRequired,
  formatPrice: PropTypes.func.isRequired,
};

export default EventCard;