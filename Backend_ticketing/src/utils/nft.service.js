<<<<<<< HEAD
const generateNFTMetadata = (ticket, event) => {
	return {
		name: `${event.name} Ticket`,
		symbol: "TIX",
		description: `Ticket for ${event.name} at ${event.location}`,
		attributes: [
			{
				trait_type: "Event",
				value: event.name,
			},
			{
				trait_type: "Venue",
				value: event.location,
			},
			{
				trait_type: "Seat",
				value: ticket.seats.join(", "),
			},
		],
	};
};

export { generateNFTMetadata };
=======
const generateNFTMetadata = (ticket, event) => {
	return {
		name: `${event.name} Ticket`,
		symbol: "TIX",
		description: `Ticket for ${event.name} at ${event.location}`,
		attributes: [
			{
				trait_type: "Event",
				value: event.name,
			},
			{
				trait_type: "Venue",
				value: event.location,
			},
			{
				trait_type: "Seat",
				value: ticket.seats.join(", "),
			},
		],
	};
};

export { generateNFTMetadata };
>>>>>>> 21314f2 (Refactor code formatting and add new routes for auction functionality)
