import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  capacity: number;
  registeredUsers?: string[];
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsCollection = collection(firestore, 'events');
        const eventSnapshot = await getDocs(eventsCollection);
        const eventsList = eventSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        
        // Sort events by date (most recent first)
        eventsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
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

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
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
        <div className="text-center bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Evenimente viitoare
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Participă la atelierele și evenimentele noastre pentru a învăța mai multe despre terapie și dezvoltare personală.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">Nu există evenimente programate momentan.</p>
            <p className="text-gray-600 mt-2">Revino în curând pentru noutăți!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.imageUrl || 'https://via.placeholder.com/400x200'} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-blue-600 font-medium mb-2">
                    {formatDate(event.date)} • {event.time}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                  <Link 
                    to={`/events/${event.id}`}
                    className="block text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Vezi detalii
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentUser && currentUser.isAdmin && (
          <div className="mt-12 text-center">
            <Link 
              to="/admin/events"
              className="inline-block py-2 px-6 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              Administrează evenimente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
