import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { isUserAdmin } from '../utils/userRoles';
import { ErrorMessage } from '../components'; // Importăm componenta ErrorMessage

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // Stare pentru a verifica dacă utilizatorul este admin
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsCollection = collection(db, 'events');
        const eventsQuery = query(eventsCollection, orderBy('date', 'asc'));
        const querySnapshot = await getDocs(eventsQuery);

        const eventsList: Event[] = [];
        querySnapshot.forEach((doc) => {
          eventsList.push({
            id: doc.id,
            ...doc.data(),
          } as Event);
        });

        setEvents(eventsList);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('A apărut o eroare la încărcarea evenimentelor.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser?.email) {
        const admin = await isUserAdmin(currentUser.email);
        setIsAdmin(admin);
      }
    };

    if (currentUser) {
      checkAdmin();
    }
  }, [currentUser]);

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest eveniment?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      alert('Evenimentul a fost șters cu succes.');
    } catch (err) {
      console.error('Eroare la ștergerea evenimentului:', err);
      alert('A apărut o eroare la ștergerea evenimentului.');
    }
  };

  // Funcție pentru formatarea datei
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800 drop-shadow-lg bg-blue-100 py-4 rounded-lg">Evenimente</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă evenimentele...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800 drop-shadow-lg bg-blue-100 py-4 rounded-lg">Evenimente</h1>
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800 drop-shadow-lg bg-blue-100 py-4 rounded-lg">Evenimente</h1>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          "name": "Eveniment 1",
          "startDate": "2025-05-01T19:00",
          "endDate": "2025-05-01T22:00",
          "location": {
            "@type": "Place",
            "name": "Locație 1",
            "address": "Strada Exemplu, București, România"
          },
          "image": "https://example.com/images/event1.jpg",
          "description": "Descrierea evenimentului 1."
        })}
      </script>

      {events.length === 0 ? (
        <div className="text-center text-gray-600">
          Nu există evenimente programate în acest moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={event.imageUrl || '/images/BussinesLider.jpg'} // Actualizez fallback-ul imaginii
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-blue-600 text-sm mb-1">
                  {event.date ? formatDate(event.date) : 'Data indisponibilă'}
                </p>
                <h2 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                <div className="flex items-center justify-between">
                  <Link
                    to={`/events/${event.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Detalii
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Șterge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
