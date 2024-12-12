import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUser({
          name: parsedUserData.username,
          email: parsedUserData.email,
        });
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem("user"); // Clear invalid data
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/auth/logout");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="mb-4 flex space-x-4">
        <button
          className={`px-2 py-1 ${
            activeTab === "profile" ? "border-b-2 border-black" : ""
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
      </div>
      {activeTab === "profile" && (
        <div>
          <div className="mb-2">
            <label htmlFor="name" className="block text-sm">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={user.name}
              readOnly
              className="w-full p-1 bg-gray-100 border rounded"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="email" className="block text-sm">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              readOnly
              className="w-full p-1 bg-gray-100 border rounded"
            />
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;
