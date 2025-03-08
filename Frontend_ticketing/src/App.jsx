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
import { UserProvider } from "./pages/UserContext";
import AuctionRoom from "./pages/AuctionRoom";
import NFTTickets from "./pages/NFTTickets"; // Add the new import
import MoonPayWrapper from "./components/MoonPayWrapper";
function App() {
  return (
    <MoonPayWrapper>
      <UserProvider>
        <Router>
          <div className="relative min-h-screen">
            {/* Background div */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-amber-50 via-rose-50 to-blue-100 "></div>

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
                  <Route
                    path="/organize-auction"
                    element={<OrganizeAuction />}
                  />
                  <Route path="/auction" element={<Auction />} />
                  <Route
                    path="/auctionroom/:auctionId"
                    element={<AuctionRoom />}
                  />
                  <Route path="/search" element={<Search />} />
                  <Route path="/nft-tickets" element={<NFTTickets />} />{" "}
                  {/* Add the new route */}
                </Routes>
              </main>
              <footer className="py-4 text-center text-gray-900 bg-opacity-30 backdrop-blur-sm">
                <p>&copy; 2025 DTIX.</p>
              </footer>
            </div>
          </div>
        </Router>
      </UserProvider>
    </MoonPayWrapper>
  );
}

export default App;
