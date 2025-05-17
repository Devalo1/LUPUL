import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  capacity: number;
  createdAt?: Timestamp;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Organizăm evenimentele după dată, cele mai recente primele
        const eventsQuery = query(
          collection(db, "events"),
          orderBy("date", "desc")
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        
        setEvents(eventsData);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("A apărut o eroare la încărcarea evenimentelor.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Formatează data pentru afișare
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "d MMMM yyyy", { locale: ro });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Evenimente Lupul Corbul</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descoperă evenimentele noastre și participă la experiențe de neuitat 
            pentru a învăța și a te dezvolta.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-lg text-gray-600">Nu există evenimente disponibile momentan.</p>
            <p className="mt-2">Vă rugăm să reveniți în curând pentru actualizări.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div 
                key={event.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={event.imageUrl || "/images/event-placeholder.jpg"} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="text-sm text-blue-600 font-medium mb-2">
                    {formatDate(event.date)}
                    {event.time && ` • ${event.time}`}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {event.location}
                      </span>
                    </div>
                    
                    <Link 
                      to={`/events/${event.id}`} 
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Detalii →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;