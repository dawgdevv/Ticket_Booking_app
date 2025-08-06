# DTIX: TICKETING ON STEROIDS

## Overview

The Ticket Booking App is a full-stack application designed to simplify the process of booking tickets for various events. Users can browse events, select seats, make payments seamlessly, and access advanced features like NFT ticketing, auction rooms, and blockchain integration.

## Features

### Core Features

- **User Authentication:** Sign up, log in, and manage profiles.
- **Event Listings:** Browse and search for events.
- **Seat Selection:** Choose preferred seats with an interactive grid system.
- **Payment Integration:** Multiple secure payment gateways including Stripe, MoonPay, and HIVE blockchain.
- **Booking History:** View past bookings and transactions.
- **Ticket Management:** Download tickets as PDF and view details.
- **Resell:** List tickets for resale with secure transfer mechanism.
- **Auction System:** Create and join real-time auction rooms for exclusive tickets.

### Advanced Features

- **Ticket NFTs:** Convert tickets into NFTs stored on blockchain for authenticity and transferability.
- **Auction System:** Bid on exclusive tickets in real-time auction rooms with dynamic timers.
- **Resell Marketplace:** Resell purchased tickets with secure transfer of ownership.
- **HIVE Blockchain Integration:** Use HIVE blockchain for ticket transactions with Resource Credits.
- **MoonPay Integration:** Buy and sell crypto for ticket purchases.
- **AI-powered Event Assistant:** Get information about events using natural language queries.

## Technical Implementation

### Frontend Architecture

- **React + Vite:** Component-based UI with fast development environment
- **Framer Motion:** All animations and transitions
- **Tailwind CSS:** Utility-first styling for the entire UI
- **Context API:** State management for user authentication
- **Socket.io Client:** Real-time bidding in auction rooms
- **PDF Generation:** Client-side ticket PDF generation with jsPDF

### Backend Architecture

- **Express.js:** RESTful API architecture
- **MongoDB/Mongoose:** Database with schemas for users, events, tickets, auctions
- **Socket.io:** Real-time communication for auction system
- **JWT Authentication:** Secure user sessions
- **Blockchain Integration:**
  - HIVE Keychain integration for crypto payments
  - Ethereum smart contracts for NFT tickets
- **IPFS:** Storage for NFT metadata
- **AI Service:** Integration with AI models for event information

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript, React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT
- **Payment Gateways:** Stripe, MoonPay, HIVE blockchain
- **Blockchain:** Ethereum (for NFTs), HIVE (for payments)
- **Real-time:** Socket.io
- **AI:** Google AI models for event information

## Installation

### Prerequisites

- Node.js
- npm or yarn
- MongoDB
- Metamask or other Ethereum wallet (for NFT features)
- HIVE Keychain browser extension (for HIVE payments)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Ticket_Booking_app.git
```

## Navigate to the project directory:

cd Ticket_booking_app

## Install dependencies for both frontend and backend:

```bash
cd Frontend_ticketing
npm install
cd ../Backend_ticketing
npm install
```

## Set up environment variables:

1. Create a `.env` file in the `Backend_ticketing` directory.
2. Add the following environment variables:

```bash
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
TICKET_NFT_CONTRACT_ADDRESS=your_nft_contract_address
PRIVATE_KEY=your_ethereum_private_key
SESSION_SECRET=your_session_secret
```

3. Create a `.env` file in the `Frontend_ticketing` directory:

```bash
VITE_BACKEND_URL=http://localhost:8000
VITE_MOONPAY_TEST_PUBLIC_KEY=your_moonpay_test_key
```

## Usage

1. Start the backend server:

```bash
cd Backend_ticketing
npm run dev
```

2. Start the frontend server:

```bash
cd Frontend_ticketing
npm run dev
```

3. Open the browser and navigate to `http://localhost:5173`.

## Feature Details

### User Authentication

- Standard email/password authentication with JWT
- HIVE blockchain authentication option for decentralized identity

### Event Discovery & Booking

- Browse events with dynamic filtering and search
- Interactive seat selection grid
- Multiple payment options (Credit Card, HIVE, MoonPay)

### Ticket Management

- View purchased tickets with details
- Download tickets as PDF
- Convert tickets to NFTs

### NFT Ticketing

- Mint tickets as ERC-721 NFTs
- Transfer tickets securely on blockchain
- View NFT ticket metadata and ownership history

### Auction System

- Create auction rooms with custom parameters
- Real-time bidding with dynamic timers
- Bidding war detection
- Leaderboards and bid history

### Resell Marketplace

- List owned tickets for resale
- NFT-based proof of authenticity
- Secure transfer mechanism

### HIVE Integration

- Authentication with HIVE Keychain
- Resource Credits-based simulated payments
- Blockchain record of ticket transactions

### Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [JWT](https://jwt.io/)
- [Stripe](https://stripe.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Socket.io](https://socket.io/)
- [HIVE Blockchain](https://hive.io/)
- [MoonPay](https://www.moonpay.com/)
- [Ethereum](https://ethereum.org/)
- [IPFS](https://ipfs.io/)

