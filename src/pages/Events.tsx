import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ErrorMessage } from '../components';
import { motion } from 'framer-motion';

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
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent));
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Set a safety timeout to prevent infinite loading on mobile
        const timeoutId = setTimeout(() => {
          if (loading) {
            console.log('Loading timeout reached, forcing completion');
            setLoading(false);
          }
        }, isMobile ? 7000 : 15000); // Shorter timeout for mobile
        
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event));
        
        setEvents(eventsList);
        setLoading(false);
        clearTimeout(timeoutId); // Clear timeout if loading completed successfully
        
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('A apărut o eroare la încărcarea evenimentelor. Te rugăm să încerci din nou.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isMobile]);

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
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800 drop-shadow-lg bg-blue-100 py-4 rounded-lg">Evenimente</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" 
               style={{transform: 'translateZ(0)', willChange: 'transform'}}></div>
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
      
      {events.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500">Nu există evenimente disponibile în acest moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <motion.div
              key={event.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-60 overflow-hidden">
                <img
                  src={event.imageUrl || '/images/BussinesLider.jpg'}
                  alt={event.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.error("Eroare la încărcarea imaginii:", event.imageUrl);
                    e.currentTarget.src = '/images/BussinesLider.jpg';
                  }}
                  loading="lazy" // Add lazy loading for better mobile performance
                />
              </div>
              
              <div className="p-6">
                <div className="text-blue-600 text-sm font-medium mb-2">
                  {event.date ? formatDate(event.date) : 'Data indisponibilă'} • {event.time || 'Ora indisponibilă'}
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {event.title}
                </h2>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm truncate">{event.location}</span>
                </div>
                
                <div className="h-20 overflow-hidden mb-4">
                  <p className="text-gray-600 text-sm line-clamp-4">
                    {event.description}
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {event.registeredUsers ? (
                      <span>{event.registeredUsers.length}/{event.capacity} participanți</span>
                    ) : (
                      <span>0/{event.capacity} participanți</span>
                    )}
                  </div>
                  
                  <Link
                    to={`/events/${event.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Vezi detalii
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
