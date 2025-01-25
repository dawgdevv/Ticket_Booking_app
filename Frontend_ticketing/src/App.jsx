<<<<<<< HEAD
//import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResellTickets from "./pages/Resell";
import TicketMarketplace from "./pages/Marketplace";
import Auction from "./pages/Auction";
import OrganizeAuction from "./pages/Organizauction";
import Search from "./pages/Search";

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        {/* Background div */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>

        {/* App content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              {/* <Route path="/my-tickets" element={<MyTickets />} /> */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/resell" element={<ResellTickets />} />
              <Route path="/marketplace" element={<TicketMarketplace />} />
              <Route path="/organize-auction" element={<OrganizeAuction />} />
              <Route path="/auction" element={<Auction />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </main>
          <footer className="py-4 text-center text-gray-900 bg-opacity-30 backdrop-blur-sm">
            <p>&copy; 2024 DTIX. Made by Brocoders.</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
=======
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResellTickets from "./pages/Resell";
import TicketMarketplace from "./pages/Marketplace";
import Auction from "./pages/Auction";
import OrganizeAuction from "./pages/Organizauction";
import AuctionRoom from "./pages/AuctionRoom"; 
import Search from "./pages/Search";

function App() {
  return (
    <Router>
      <div className="relative min-h-screen overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-blue-100"></div>

        {/* Subtle paper texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCI+CiAgPGZpbHRlciBpZD0ibm9pc2UiPgogICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNzUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIC8+CiAgPC9maWx0ZXI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC4wNSIgLz4KPC9zdmc+')] opacity-30"></div>

        {/* Art Deco inspired pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIgLz4KICA8cGF0aCBkPSJNMzAgMEwwIDMwaDYweiIgZmlsbD0icmdiYSgyNTUsIDIxNSwgMCwgMC4wMykiIC8+CiAgPHBhdGggZD0iTTYwIDMwTDMwIDYwaDMweiIgZmlsbD0icmdiYSgyNTUsIDIxNSwgMCwgMC4wMykiIC8+Cjwvc3ZnPg==')] opacity-20"></div>

        {/* Animated subtle light effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-blue-100 opacity-10 animate-pulse"></div>

        {/* App content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/resell" element={<ResellTickets />} />
              <Route path="/marketplace" element={<TicketMarketplace />} />
              <Route path="/auction" element={<Auction />} />
              <Route path="/organize-auction" element={<OrganizeAuction />} />
              <Route path="/auctionroom/:auctionId" element={<AuctionRoom />} />
              <Route path="/search" element={<Search/>}/>
            </Routes>
          </main>
          <footer className="py-4 text-center text-gray-800 bg-white bg-opacity-30 backdrop-blur-sm">
            <p>&copy; 2025 DTIX. Made by Brocoders.</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
>>>>>>> 21314f2 (Refactor code formatting and add new routes for auction functionality)
