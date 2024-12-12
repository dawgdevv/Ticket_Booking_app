import axios from "axios";
import { useEffect, useState } from "react";

const Home = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:8000/events");
        setEvents(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-primary">
        Welcome to Event Ticket Booking
      </h1>
      <p className="text-lg text-center mb-8 text-muted-foreground">
        Find and book tickets for your favorite events!
      </p>
      <div className="bg-primary/10 p-6 bg-gray-300 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-primary">
          Featured Events
        </h2>
        <ul className="space-y-6">
          {events.map((event) => (
            <li
              key={event._id}
              className="bg-background p-4 rounded-md shadow transition-all hover:shadow-md"
            >
              <h3 className="text-xl font-semibold mb-2 text-primary">
                {event.name}
              </h3>
              <p className="text-muted-foreground">
                <span className="font-medium">Date:</span>{" "}
                {new Date(event.date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Location:</span> {event.location}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
