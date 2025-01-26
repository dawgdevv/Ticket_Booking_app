import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    // Check for token in localStorage to determine login status
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    // Clear the token from localStorage and update login state
    localStorage.removeItem("token");
    setIsLoggedIn(false);

    // Redirect to the home page after logout
    navigate("/");
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <nav className="shadow-lg text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-6 w-6 mr-3 text-red-300"
                src="img/tickets.png"
                alt="Logo"
              />
            </Link>
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-2xl font-bold">
              DTIX
            </p>
            {isLoggedIn ? (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/events"
                    className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Events
                  </Link>
                  <Link
                    to="/marketplace"
                    className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Marketplace
                  </Link>
                  <Link
                    to="/resell"
                    className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Resell
                  </Link>
                  <Link
                    to="/organize-auction"
                    className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Auction
                  </Link>
                  <Link
                    to="/auction"
                    className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Auction Rooms
                  </Link>
                  <Link
                    to="/search"
                    className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Search
                  </Link>
                  <Link
                    to="/store"
                    className="hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Store
                  </Link>
                </div>
              </div>
            ) : (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
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
            )}
          </div>

          <div className="ml-auto flex items-center">
            {isLoggedIn && (
              <div className="flex items-center space-x-2 relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FiUser className="mr-2" size={20} />
                  <span>Profile</span>
                </button>
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md py-2 w-48 z-10"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
