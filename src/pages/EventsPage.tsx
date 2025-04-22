import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FilterBar from "../components/events/FilterBar";
import EventModal from "../components/events/EventModal";
import { motion } from "framer-motion";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { ErrorMessage } from "../components";

// Define Event type
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  isLive?: boolean;
  description?: string;
  capacity?: number;
  registeredUsers?: string[];
}

// Define EventUser type for the EventModal component
interface EventUser {
  id: string;
  name: string;
  email: string;
}

// Mock data for events in case Firebase doesn't return anything
const mockEvents: Event[] = [
  {
    id: "business-lider-1",
    title: "Business Lider - Conferință pentru antreprenori",
    description: "O conferință dedicată antreprenorilor și liderilor de afaceri, unde veți învăța strategii de succes de la experți în domeniu și veți avea oportunitatea de networking cu alți profesioniști.",
    date: "2025-05-15",
    time: "10:00",
    location: "Petroșani, Hotel Rusu, Sala de conferințe",
    imageUrl: "/images/BussinesLider.jpg",
    capacity: 50,
    registeredUsers: []
  },
  {
    id: "mock-event-1",
    title: "Workshop de terapie prin artă",
    description: "Un workshop interactiv dedicat terapiei prin artă, unde participanții vor avea ocazia să exploreze diferite tehnici artistice ca metode de vindecare emoțională și dezvoltare personală.",
    date: "2025-06-10",
    time: "14:00",
    location: "Petroșani, Centrul Cultural Drăgan, Sala Studio",
    imageUrl: "/images/AdobeStock_370191089.jpeg",
    capacity: 20,
    registeredUsers: []
  },
  {
    id: "mock-event-2",
    title: "Conferință: Echilibrul interior în lumea modernă",
    description: "O conferință despre găsirea și menținerea echilibrului interior într-o lume în continuă schimbare, cu sfaturi practice și exerciții de mindfulness.",
    date: "2025-07-22",
    time: "18:30",
    location: "Petroșani, Teatrul Dramatic I.D. Sîrbu",
    imageUrl: "/images/AdobeStock_217770381.jpeg",
    capacity: 50,
    registeredUsers: []
  },
  {
    id: "mock-event-past",
    title: "Workshop: Tehnici de mindfulness și relaxare",
    description: "Un workshop practic unde veți învăța tehnici de mindfulness și relaxare pentru a reduce stresul și a îmbunătăți calitatea vieții.",
    date: "2024-03-15",
    time: "16:00",
    location: "Petroșani, Centrul de Sănătate Mintală",
    imageUrl: "/images/AdobeStock_367103665.jpeg",
    capacity: 30,
    registeredUsers: ["user1", "user2", "user3"]
  }
];

const EventsPage: React.FC = () => {
  const getSavedFilter = (): "all" | "upcoming" | "past" => {
    const saved = localStorage.getItem("eventsFilter");
    return (saved as "all" | "upcoming" | "past") || "all";
  };

  const [filter, setFilter] = useState<"all" | "upcoming" | "past">(getSavedFilter);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    localStorage.setItem("eventsFilter", filter);
  }, [filter]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent));
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const eventUser: EventUser = { id: "default", name: "Utilizator", email: "" };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const timeoutId = setTimeout(() => {
          console.log("Loading timeout reached, using mock data");
          setEvents(mockEvents);
          setLoading(false);
        }, isMobile ? 5000 : 10000);

        try {
          const eventsCollection = collection(db, "events");
          const eventsQuery = query(eventsCollection, orderBy("date", "desc"));
          const eventsSnapshot = await getDocs(eventsQuery);

          if (eventsSnapshot.empty) {
            console.log("No events found in Firebase, using mock data");
            setEvents(mockEvents);
          } else {
            const eventsList = eventsSnapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data()
                } as Event)
            );

            setEvents(eventsList.length > 0 ? eventsList : mockEvents);
          }
        } catch (firestoreError) {
          console.error("Firestore error:", firestoreError);
          setEvents(mockEvents);
        } finally {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in event loading process:", err);
        setEvents(mockEvents);
        setError(null);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data indisponibilă";

    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      return new Date(dateString).toLocaleDateString("ro-RO", options);
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString;
    }
  };

  const today = new Date();

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });

  const pastEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate < today;
  });

  const filteredEvents =
    filter === "upcoming" ? upcomingEvents : filter === "past" ? pastEvents : events;

  const isEventPast = (eventDate: string): boolean => {
    return new Date(eventDate) < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <FilterBar filter={filter} setFilter={setFilter} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-md p-4 md:p-6 mb-6">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Evenimente</h1>

          <FilterBar filter={filter} setFilter={setFilter} />

          <div className="flex justify-center mt-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex space-x-6">
              <div>
                <span className="font-medium">Toate:</span> {events.length}
              </div>
              <div>
                <span className="font-medium">Viitoare:</span> {upcomingEvents.length}
              </div>
              <div>
                <span className="font-medium">Trecute:</span> {pastEvents.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage message={error} onRetry={() => window.location.reload()} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Nu există evenimente disponibile pentru filtrele selectate.
          </p>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden 
                  ${isEventPast(event.date) ? "border-l-4 border-gray-400" : "border-l-4 border-green-500"}`}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-48">
                  <img
                    src={event.imageUrl || "/images/BussinesLider.jpg"}
                    alt={event.title}
                    className={`w-full h-full object-cover ${isEventPast(event.date) ? "opacity-80" : ""}`}
                    onError={(e) => {
                      console.error("Eroare la încărcarea imaginii:", event.imageUrl);
                      e.currentTarget.src = "/images/BussinesLider.jpg";
                    }}
                  />
                  {event.isLive && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      Live acum
                    </span>
                  )}

                  <span
                    className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded
                    ${isEventPast(event.date) ? "bg-gray-700 text-white" : "bg-green-600 text-white"}`}
                  >
                    {isEventPast(event.date) ? "Trecut" : "Viitor"}
                  </span>
                </div>

                <div className="p-4">
                  <div className="text-blue-600 text-sm font-medium mb-2">
                    {formatDate(event.date)} • {event.time || "Ora indisponibilă"}
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {event.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.location}</p>

                  <div className="h-20 overflow-hidden mb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4">
                      {event.description?.substring(0, 150)}
                      {event.description && event.description.length > 150 ? "..." : ""}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {event.registeredUsers ? (
                        <span>
                          {event.registeredUsers.length}/{event.capacity} participanți
                        </span>
                      ) : (
                        <span>0/{event.capacity || "?"} participanți</span>
                      )}
                    </div>

                    <Link
                      to={`/events/${event.id}`}
                      className={`px-4 py-2 rounded-md transition-colors text-sm 
                        ${isEventPast(event.date) ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                    >
                      {isEventPast(event.date) ? "Vezi detalii" : "Înscrie-te acum"}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          currentUser={eventUser}
        />
      )}
    </div>
  );
};

export default EventsPage;
