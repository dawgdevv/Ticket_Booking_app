import PropTypes from "prop-types";

const TicketDetails = ({ ticket, formatPrice, onDownload }) => {
  return (
    <div className="ticket-details p-6 bg-blue-50 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4">🎟️ Ticket Details</h2>
      <p className="mb-2">
        <strong>Event:</strong> {ticket?.event?.name || "N/A"}
      </p>
      <p className="mb-2">
        <strong>Venue:</strong> {ticket?.venue || "N/A"}
      </p>
      <p className="mb-2">
        <strong>Seats:</strong> {ticket?.seats?.join(", ") || "N/A"}
      </p>
      <p className="mb-2">
        <strong>Price:</strong> {formatPrice(ticket?.price) || "N/A"}
      </p>
      <p className="mb-2">
        <strong>Quantity:</strong> {ticket?.quantity || "N/A"}
      </p>
      <p className="mb-2">
        <strong>Ticket ID:</strong> {ticket?._id || "N/A"}
      </p>
      <button
        onClick={onDownload}
        className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-300"
      >
        Download Ticket PDF
      </button>
    </div>
  );
};

TicketDetails.propTypes = {
  ticket: PropTypes.object.isRequired,
  formatPrice: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default TicketDetails;