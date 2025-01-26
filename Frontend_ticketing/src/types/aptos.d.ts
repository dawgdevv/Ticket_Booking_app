export interface AptosEventDetails {
  name: string;
  price: number;
  seats?: string[];
  date?: string;
  venue?: string;
}

export interface AptosTicketDetails extends AptosEventDetails {
  txHash: string;
  blockchain: "aptos";
  ticketId?: string;
  owner?: string;
}

export interface AptosBookingProps {
  event: AptosEventDetails;
  onSuccess: (txHash: string) => void;
  selectedSeats?: string[];
}
