import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  capacity: number;
  registeredUsers: string[];
  price?: number;
  organizer?: string;
  additionalDetails?: string;
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const docRef = doc(firestore, 'events', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
        } else {
          setError('Evenimentul nu a fost găsit.');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('A apărut o eroare la încărcarea evenimentului.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  const isUserRegistered = () => {
    if (!currentUser || !event) return false;
    return event.registeredUsers?.includes(currentUser.uid);
  };

  const handleRegister = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (!event) return;

    try {
      setRegistering(true);
      const eventRef = doc(firestore, 'events', event.id);
      
      if (isUserRegistered()) {
        // Unregister
        await updateDoc(eventRef, {
          registeredUsers: arrayRemove(currentUser.uid)
        });
        
        setEvent({
          ...event,
          registeredUsers: event.registeredUsers.filter(uid => uid !== currentUser.uid)
        });
      } else {
        // Register
        if (event.registeredUsers.length >= event.capacity) {
          setError('Ne pare rău, dar capacitatea maximă a fost atinsă.');
          setRegistering(false);
          return;
        }
        
        await updateDoc(eventRef, {
          registeredUsers: arrayUnion(currentUser.uid)
        });
        
        setEvent({
          ...event,
          registeredUsers: [...event.registeredUsers, currentUser.uid]
        });
      }
    } catch (err) {
      console.error('Error updating registration:', err);
      setError('A apărut o eroare la procesarea înregistrării.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă evenimentul...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error || 'Evenimentul nu există.'}</div>
          <Button onClick={() => navigate('/events')}>Înapoi la evenimente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-64 md:h-80 w-full">
            <img 
              src={event.imageUrl || 'https://via.placeholder.com/800x400'} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>
                <div className="text-blue-600 font-medium">
                  {formatDate(event.date)} • {event.time}
                </div>
              </div>
              
              {event.price ? (
                <div className="mt-2 md:mt-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">
                  {event.price} lei
                </div>
              ) : (
                <div className="mt-2 md:mt-0 bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium">
                  Gratuit
                </div>
              )}
            </div>
            
            <div className="flex items-center text-gray-600 mb-6">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
            
            <div className="prose max-w-none mb-8">
              <p className="text-gray-700">{event.description}</p>
              
              {event.additionalDetails && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Detalii suplimentare</h3>
                  <p className="text-gray-700">{event.additionalDetails}</p>
                </div>
              )}
            </div>
            
            {event.organizer && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Organizator</h3>
                <p className="text-gray-700">{event.organizer}</p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Capacitate</div>
                  <div className="font-medium">
                    {event.registeredUsers.length} / {event.capacity} participanți
                  </div>
                </div>
                
                <div className="w-1/2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, (event.registeredUsers.length / event.capacity) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <Button 
                onClick={handleRegister}
                disabled={registering || (!isUserRegistered() && event.registeredUsers.length >= event.capacity)}
                className="w-full sm:w-auto mb-4 sm:mb-0"
              >
                {registering ? 'Se procesează...' : 
                 isUserRegistered() ? 'Anulează înscrierea' : 
                 event.registeredUsers.length >= event.capacity ? 'Nu mai sunt locuri disponibile' : 
                 'Înscrie-te acum'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/events')}
                className="w-full sm:w-auto"
              >
                Înapoi la evenimente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
