import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); //using usestate hereto see if we are on moblile

  return (
    <nav className="shadow-lg text-gray-800">
      {" "}
      {/* Changed bg-blue-600 to text-gray-800 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/events" className="flex-shrink-0">
              <img className="h-6 w-6 mr-3" src="img/tickets.png" alt="Logo" />
            </Link>
            <p className="text-black text-2xl font-bold">DTIX</p>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/events"
                  className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Events
                </Link>
                <Link
                  to="/resell"
                  className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Resell
                </Link>
                <Link
                  to="/marketplace"
                  className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Marketplace
                </Link>
                <Link
                  to="/auction"
                  className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Auction
                </Link>
                <Link
                  to="/organize-auction"
                  className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {" "}
                  Organize Auction{" "}
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Link
                to="/profile"
                className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              <Link
                to="/login"
                className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Signup
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              to="/events"
              className="hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Events
            </Link>
            <Link
              to="/my-tickets"
              className="hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              My Tickets
            </Link>
            <Link
              to="/profile"
              className="hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Profile
            </Link>
            <Link
              to="/logout"
              className="hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Logout
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
