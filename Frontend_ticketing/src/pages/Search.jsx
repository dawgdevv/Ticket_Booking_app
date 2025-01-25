<<<<<<< HEAD
import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const Search = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventInfo = async (query) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/ai/event-info",
        { query },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching event info:", error);
      throw error;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await fetchEventInfo(query);
      setResponse(result);
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        Event Search Assistant
      </h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about events, dates, venues, or ticket availability..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-400"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {response && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              <ReactMarkdown>{response.answer}</ReactMarkdown>
            </p>
          </div>

          {/* Only show event details if available */}
          {response.eventDetails && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Event Details:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Name:</p>
                  <p>{response.eventDetails.name}</p>
                </div>
                <div>
                  <p className="font-medium">Date:</p>
                  <p>
                    {new Date(response.eventDetails.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Location:</p>
                  <p>{response.eventDetails.location}</p>
                </div>
                <div>
                  <p className="font-medium">Price:</p>
                  <p>₹{response.eventDetails.price}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-medium">Description:</p>
                <p className="mt-1">{response.eventDetails.description}</p>
              </div>
              {response.eventDetails.image && (
                <img
                  src={response.eventDetails.image}
                  alt={response.eventDetails.name}
                  className="mt-4 rounded-lg w-full h-48 object-cover"
                />
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !error && !response && (
        <div className="text-center text-gray-500 py-8">
          Enter your question above to get started
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Example Questions:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>What events are happening this weekend?</li>
          <li>Are there any music festivals in Jaipur?</li>
          <li>What&apos;s the ticket price for the Tech Conference?</li>
          <li>Which venues host regular events?</li>
        </ul>
      </div>
    </div>
  );
};

export default Search;
=======
import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const Search = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventInfo = async (query) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/ai/event-info",
        { query },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching event info:", error);
      throw error;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await fetchEventInfo(query);
      setResponse(result);
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        Event Search Assistant
      </h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about events, dates, venues, or ticket availability..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-400"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {response && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              <ReactMarkdown>{response.answer}</ReactMarkdown>
            </p>
          </div>

          {/* Only show event details if available */}
          {response.eventDetails && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Event Details:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Name:</p>
                  <p>{response.eventDetails.name}</p>
                </div>
                <div>
                  <p className="font-medium">Date:</p>
                  <p>
                    {new Date(response.eventDetails.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Location:</p>
                  <p>{response.eventDetails.location}</p>
                </div>
                <div>
                  <p className="font-medium">Price:</p>
                  <p>₹{response.eventDetails.price}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-medium">Description:</p>
                <p className="mt-1">{response.eventDetails.description}</p>
              </div>
              {response.eventDetails.image && (
                <img
                  src={response.eventDetails.image}
                  alt={response.eventDetails.name}
                  className="mt-4 rounded-lg w-full h-48 object-cover"
                />
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !error && !response && (
        <div className="text-center text-gray-500 py-8">
          Enter your question above to get started
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Example Questions:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>What events are happening this weekend?</li>
          <li>Are there any music festivals in Jaipur?</li>
          <li>What&apos;s the ticket price for the Tech Conference?</li>
          <li>Which venues host regular events?</li>
        </ul>
      </div>
    </div>
  );
};

export default Search;
>>>>>>> 21314f2 (Refactor code formatting and add new routes for auction functionality)
