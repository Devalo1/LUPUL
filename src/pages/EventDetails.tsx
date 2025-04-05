import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/layout/Navbar';

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

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) {
        setError('ID-ul evenimentului lipsește.');
        navigate('/events'); // Redirecționează utilizatorul înapoi la lista de evenimente
        return;
      }

      try {
        setLoading(true);
        const eventDoc = doc(db, 'events', id);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
          setEvent({
            id: eventSnapshot.id,
            ...eventSnapshot.data(),
          } as Event);
        } else {
          setError('Evenimentul nu a fost găsit.');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('A apărut o eroare la încărcarea detaliilor evenimentului.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, navigate]);

  // Function to format date
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
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Se încarcă detaliile evenimentului...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center bg-red-100 text-red-700 p-4 rounded-lg">
            {error || 'A apărut o eroare la încărcarea evenimentului.'}
          </div>
          <div className="mt-4 text-center">
            <Link to="/events" className="text-blue-600 hover:underline">
              Înapoi la evenimente
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link to="/events" className="text-blue-600 hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Înapoi la evenimente
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 md:h-96 w-full relative">
              <img
                src={event.imageUrl || 'https://via.placeholder.com/1200x600'}
                alt={event.title || 'Eveniment'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-4 text-blue-600 font-medium">
                {event.date ? formatDate(event.date) : 'Data indisponibilă'} • {event.time || 'Ora indisponibilă'}
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                {event.title || 'Titlu indisponibil'}
              </h1>

              <div className="flex items-center text-gray-600 mb-6">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span>{event.location || 'Locație indisponibilă'}</span>
              </div>

              <div className="prose max-w-none mb-8">
                <p className="text-gray-700 whitespace-pre-line">
                  {event.description || 'Descriere indisponibilă'}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <p className="text-gray-600">
                      <span className="font-medium">Capacitate:</span> {event.capacity || 'Necunoscut'} participanți
                    </p>
                    {event.registeredUsers && (
                      <p className="text-gray-600">
                        <span className="font-medium">Înscriși:</span> {event.registeredUsers.length} participanți
                      </p>
                    )}
                  </div>

                  <button className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Înscrie-te la eveniment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
