import { useState, useCallback } from "react";
import { AptosService } from "../services/aptos.service";
import { AptosBookingProps } from "../types/aptos";

export const AptosBooking: React.FC<AptosBookingProps> = ({
  event,
  onSuccess,
  selectedSeats,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const aptosService = new AptosService();

  const handleBooking = useCallback(async () => {
    if (!selectedSeats?.length) {
      alert("Please select seats first");
      return;
    }

    setIsProcessing(true);
    try {
      // Connect wallet first
      const { address } = await aptosService.connectWallet();
      console.log("Connected wallet:", address);

      // Book tickets for each seat
      const bookingPromises = selectedSeats.map((seat) =>
        aptosService.bookTicket(event.name, event.price, seat)
      );

      const results = await Promise.all(bookingPromises);
      const lastTxHash = results[results.length - 1];

      if (lastTxHash) {
        onSuccess(lastTxHash);
      }
    } catch (error: any) {
      console.error("Booking failed:", error);
      alert(error.message || "Failed to book ticket");
    } finally {
      setIsProcessing(false);
    }
  }, [event, selectedSeats, onSuccess, aptosService]);

  return (
    <button
      type="button"
      onClick={handleBooking}
      disabled={isProcessing || !selectedSeats?.length}
      className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 cursor-pointer relative"
    >
      {isProcessing ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Processing...
        </div>
      ) : (
        "Book with Aptos"
      )}
    </button>
  );
};

export default AptosBooking;
