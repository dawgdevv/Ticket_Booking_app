# Ticket Booking App

## Overview

The Ticket Booking App is a full-stack application designed to simplify the process of booking tickets for various events. Users can browse events, select seats, and make payments seamlessly.

## Features

- **User Authentication:** Sign up, log in, and manage profiles.
- **Event Listings:** Browse and search for events.
- **Seat Selection:** Choose preferred seats.
- **Payment Integration:** Secure payment gateway.
- **Booking History:** View past bookings and transactions.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript, React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT
- **Payment Gateway:** Stripe

## Installation

### Prerequisites

- Node.js
- npm or yarn
- MongoDB

### Setup

1. Clone the repository:

```bash

git clone

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

## Contributing

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
