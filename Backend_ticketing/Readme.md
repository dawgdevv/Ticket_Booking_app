# Ticket Booking App
# (Nishant/ Dev/ Dhruv)

## Overview

The Ticket Booking App is a full-stack application designed to simplify the process of booking tickets for various events. Users can browse events, select seats, and make payments seamlessly.

## Features

- User Authentication: Sign up, log in, and manage profiles.
- Event Listings: Browse and search for events.
- Seat Selection: Choose preferred seats.
- Payment Integration: Secure payment gateway.
- Booking History: View past bookings and transactions.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript, React
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT
- **Payment Gateway:** Stripe

## Installation

1. Clone the repository:
   ```bash
   git clone hhtps/ssh link from the repo
   ```
2. Navigate to the project directory:
   ```bash
   cd ticket-booking-app
   ```
3. Install dependencies for both frontend and backend:
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     STRIPE_SECRET_KEY=your_stripe_secret_key
     ```

## Usage

1. Start the backend server:
   ```bash
   npm run server
   ```
2. Start the frontend development server:
   ```bash
   cd client
   npm start
   ```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request.

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, please contact nraj02415@gmail.com.
