import { useState, useEffect } from "react";
import { KeychainSDK } from "keychain-sdk";

const HiveAuth = ({ onSignIn }) => {
  const [username, setUsername] = useState("");
  const [isKeychainAvailable, setIsKeychainAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkKeychain = async () => {
      try {
        const keychain = new KeychainSDK(window);
        const isInstalled = await keychain.isKeychainInstalled();
        setIsKeychainAvailable(isInstalled);
      } catch (error) {
        console.error("Error checking Keychain:", error);
        setIsKeychainAvailable(false);
      }
    };

    checkKeychain();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your Hive username");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const keychain = new KeychainSDK(window);
      const loginData = {
        username: username,
        message: JSON.stringify({
          app: "TicketBookingApp",
          timestamp: new Date().getTime(),
        }),
        method: "Posting",
        title: "Login to Ticket Booking App",
      };

      const loginResult = await keychain.login(loginData);

      if (loginResult && loginResult.success) {
        // Store user info in local storage
        localStorage.setItem("hiveName", username);
        localStorage.setItem("hivePublicKey", loginResult.publicKey);

        // Call the parent component's sign-in handler
        onSignIn({
          username,
          publicKey: loginResult.publicKey,
        });
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Hive login error:", error);
      setError(`Login failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isKeychainAvailable) {
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p>
          Hive Keychain extension is not installed. Please install it to use
          Hive authentication.
        </p>
        <a
          href="https://hive-keychain.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Download Hive Keychain
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Sign In with Hive</h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Hive Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            placeholder="Enter your Hive username"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
        >
          {isLoading ? "Signing in..." : "Sign in with Keychain"}
        </button>
      </form>
    </div>
  );
};

export default HiveAuth;
