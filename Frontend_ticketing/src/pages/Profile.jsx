import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [auctionWonTickets, setAuctionWonTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "https://dtix-backend-7f609a0e60c3.herokuapp.com/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const fetchAuctionWonTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        "https://dtix-backend-7f609a0e60c3.herokuapp.com/tickets/auction-won-tickets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setAuctionWonTickets(response.data);
        setActiveTab("auctionWonTickets");
      }
    } catch (error) {
      console.error("Error fetching auction won tickets:", error);
      // Add user feedback
      alert(
        error.response?.data?.message || "Failed to fetch auction won tickets"
      );
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://dtix-backend-7f609a0e60c3.herokuapp.com/auth/logout"
      );
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "profile"
                ? "bg-amber-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "auctionWonTickets"
                ? "bg-amber-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={fetchAuctionWonTickets}
          >
            Auction Won Tickets
          </button>
        </div>

        {/* Content */}
        {activeTab === "profile" ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-3xl text-gray-600">
                  {user.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {user.name}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">Auction Won Tickets</h2>
            {auctionWonTickets.length === 0 ? (
              <p>No auction won tickets yet.</p>
            ) : (
              <div className="grid gap-4">
                {auctionWonTickets.map((wonTicket) => (
                  <div
                    key={wonTicket._id}
                    className="border p-4 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/tickets/${wonTicket.ticket._id}`)}
                  >
                    <p>
                      Event: {wonTicket.ticket?.event?.name || "Unknown Event"}
                    </p>
                    <p>Winning Bid: ₹{wonTicket.winningBid}</p>
                    <p>Won on: {new Date(wonTicket.wonAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
