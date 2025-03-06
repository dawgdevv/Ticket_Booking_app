import { motion } from "framer-motion";

const TicketDetails = ({
  ticket,
  formatPrice,
  onDownload,
  hiveUser,
  isBroadcasted,
  paymentMethod,
  hivePayment,
}) => {
  if (!ticket) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-6 rounded-lg shadow-lg border border-amber-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-amber-800">
          Your Ticket is Ready!
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-semibold">Event:</span>
            <span>{ticket.event?.name || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Venue:</span>
            <span>{ticket.venue || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Seats:</span>
            <span>{ticket.seats?.join(", ") || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Price:</span>
            <span>{formatPrice(ticket.price) || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Quantity:</span>
            <span>{ticket.quantity || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Ticket ID:</span>
            <span className="text-xs">{ticket._id || "N/A"}</span>
          </div>

          {/* Payment method information */}
          <div className="flex justify-between">
            <span className="font-semibold">Payment Method:</span>
            <span>
              {paymentMethod === "hive" ? "HIVE Blockchain" : "Credit Card"}
            </span>
          </div>

          {/* Show Hive payment details if available */}
          {hivePayment && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-700 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-blue-700">
                  <div>
                    {hivePayment.simulatedPayment
                      ? "Simulated payment of " +
                        hivePayment.amount +
                        " HIVE successful"
                      : "Payment of " + hivePayment.amount + " HIVE successful"}
                  </div>
                  <div className="text-xs mt-1">
                    Transaction ID:{" "}
                    <span className="font-mono">
                      {hivePayment.transactionId}
                    </span>
                  </div>
                  <div className="text-xs mt-1">
                    Time: {new Date(hivePayment.timestamp).toLocaleString()}
                  </div>
                  {hivePayment.simulatedPayment && (
                    <div className="text-xs mt-1 italic">
                      This was a test transaction using Resource Credits only
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hive blockchain broadcast status */}
          {isBroadcasted && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center text-green-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Broadcasted to Hive blockchain by @{hiveUser?.username}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onDownload}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketDetails;
