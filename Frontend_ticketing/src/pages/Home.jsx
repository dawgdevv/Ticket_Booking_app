import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ExplanationPopup from "./ExplanationPopup";
import PropTypes from "prop-types";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Authentication Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/events"
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  // Carousel Auto-Slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === events.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(timer);
  }, [events.length]);
  // Event Click Handler
  const handleEventClick = (event) => {
    if (isAuthenticated) {
      setSelectedEvent(event);
    } else {
      navigate("/login");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-blue-100"
    >
      <div className="relative">
        <div className="w-full h-[400px] relative overflow-hidden">
          {events.map((event, index) => (
            <div
              key={event._id}
              className={`
                absolute inset-0 transition-all duration-700 transform 
                ${
                  index === currentSlide
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                }
              `}
            >
              <img
                src={event.image || "/placeholder.svg?height=400&width=1200"}
                alt={event.name || "Event"}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <EventDetails
                  event={event}
                  onDetailsClick={() => setSelectedEvent(event)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {events.map((_, index) => (
            <div
              key={index}
              className={`
                w-2 h-2 rounded-full transition-all 
                ${index === currentSlide ? "bg-white w-4" : "bg-white/50"}
              `}
            />
          ))}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Events Grid */}
        <EventsGrid events={events} onEventClick={handleEventClick} />

        {/* Trending Events */}
        <TrendingEvents events={events} />
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onBuyTickets={() => navigate(`/events`)}
          />
        )}
      </AnimatePresence>
      {/* Explanation Popup */}
      <ExplanationPopup />
    </motion.div>
  );
};

// Extracted Components for Better Readability
// Extracted Components for Better Readability
const EventDetails = ({ event, onDetailsClick }) => (
  <>
    <h2 className="text-3xl font-bold mb-2">{event.name}</h2>
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <CalendarIcon className="w-5 h-5 mr-1" />
        <span className="text-sm">
          {new Date(event.date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="flex items-center">
        <LocationIcon className="w-5 h-5 mr-1" />
        <span className="text-sm">{event.location}</span>
      </div>
    </div>
    <button
      className="mt-4 bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors duration-300"
      onClick={onDetailsClick}
    >
      View Details
    </button>
  </>
);

const EventsGrid = ({ events, onEventClick }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    }}
    className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6"
  >
    {events.map((event) => (
      <motion.div
        key={event._id}
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onEventClick(event)}
      >
        <div className="aspect-[3/4] relative bg-gray-200">
          <img
            src={event.image || "/placeholder.svg?height=400&width=300"}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {event.name}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {new Date(event.date).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">{event.location}</p>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const TrendingEvents = ({ events }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending</h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {events.slice(0, 3).map((event) => (
        <div
          key={event._id}
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="aspect-[3/4] relative bg-gray-200">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {event.name}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              {new Date(event.date).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-gray-500 line-clamp-1">
              {event.location}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EventDetailsModal = ({ event, onClose, onBuyTickets }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
    >
      <button
        className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-500"
        onClick={onClose}
      >
        &times;
      </button>
      <div className="flex items-center space-x-4">
        <img
          src={event.image || "/placeholder.svg?height=400&width=300"}
          alt={event.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {event.name}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {new Date(event.date).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-500">{event.location}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-gray-800">{event.description}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors duration-300"
        onClick={onBuyTickets}
      >
        Buy Tickets
      </motion.button>
    </motion.div>
  </motion.div>
);

// SVG Icons (can be replaced with proper icon library)
const CalendarIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const LocationIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

EventDetails.propTypes = {
  events: PropTypes.object.isRequired,
  onDetailsClick: PropTypes.func.isRequired,
};
EventsGrid.propTypes = {
  events: PropTypes.array.isRequired,
  onEventClick: PropTypes.func.isRequired,
};

// For TrendingEvents
TrendingEvents.propTypes = {
  events: PropTypes.array.isRequired,
};

// For EventDetailsModal
EventDetailsModal.propTypes = {
  event: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onBuyTickets: PropTypes.func.isRequired,
};

EventDetails.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    image: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onDetailsClick: PropTypes.func.isRequired,
};

export default Home;
