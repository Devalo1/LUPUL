import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { FaMapMarkerAlt, FaClock, FaUsers, FaCalendarAlt, FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";

interface SpecialSessionEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  currentParticipants: number;
  price: number;
  specialistId: string;
  specialistName: string;
  specialistRole: string;
  location?: string;
  isOnline: boolean;
  imageUrl?: string;
  createdAt: Date;
}

interface SpecialistEventsProps {
  specialistId: string;
}

const SpecialistEvents: React.FC<SpecialistEventsProps> = ({ specialistId }) => {
  const [events, setEvents] = useState<SpecialSessionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialistEvents = async () => {
      if (!specialistId) return;

      try {
        setLoading(true);
        setError(null);

        const sessionsRef = collection(db, "specialSessions");
        const q = query(sessionsRef, where("specialistId", "==", specialistId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setEvents([]);
          return;
        }

        const eventsData: SpecialSessionEvent[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
          const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
          
          eventsData.push({
            id: doc.id,
            ...data,
            date,
            createdAt,
          } as SpecialSessionEvent);
        });

        // Sortare după dată, evenimentele viitoare primele
        eventsData.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        setEvents(eventsData);
      } catch (err) {
        console.error("Eroare la preluarea evenimentelor specialistului:", err);
        setError("Nu s-au putut încărca evenimentele. Vă rugăm să încercați din nou mai târziu.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialistEvents();
  }, [specialistId]);

  // Formatare dată pentru afișare
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Verifică dacă evenimentul a trecut
  const isEventPast = (date: Date) => {
    const today = new Date();
    return date < today;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
        <p className="text-gray-500">Acest specialist nu are evenimente programate momentan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event) => (
        <div 
          key={event.id} 
          className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition ${
            isEventPast(event.date) ? "opacity-70" : ""
          }`}
        >
          {event.imageUrl && (
            <div className="h-48 overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-5">
            <div className={`text-xs font-semibold inline-block px-2 py-1 rounded-full mb-2 ${
              isEventPast(event.date) 
                ? "bg-gray-200 text-gray-700" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {isEventPast(event.date) ? "Eveniment trecut" : "Eveniment viitor"}
            </div>
            
            <h3 className="text-xl font-bold mb-3">{event.title}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-start">
                <FaCalendarAlt className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span>{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-start">
                <FaClock className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
              
              <div className="flex items-start">
                {event.isOnline ? (
                  <>
                    <FaLink className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Eveniment online</span>
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span>{event.location || "Locație nespecificată"}</span>
                  </>
                )}
              </div>
              
              <div className="flex items-start">
                <FaUsers className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span>
                  {event.currentParticipants}/{event.capacity} participanți
                  {event.currentParticipants >= event.capacity && " (Complet)"}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 line-clamp-3">{event.description}</p>
            </div>
            
            <div className="flex justify-between items-center">
              {event.price > 0 ? (
                <span className="font-semibold text-lg">{event.price} RON</span>
              ) : (
                <span className="font-semibold text-green-600">Gratuit</span>
              )}
              
              <Link
                to={`/appointments?event=${event.id}`}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                  isEventPast(event.date) 
                    ? "bg-gray-400 cursor-not-allowed"
                    : event.currentParticipants >= event.capacity
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={(e) => {
                  if (isEventPast(event.date) || event.currentParticipants >= event.capacity) {
                    e.preventDefault();
                  }
                }}
              >
                {isEventPast(event.date) 
                  ? "Eveniment încheiat" 
                  : event.currentParticipants >= event.capacity
                    ? "Locuri epuizate"
                    : "Înscrie-te"}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecialistEvents;