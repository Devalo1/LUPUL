import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, sendEventRegistrationEmail } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ParticipantInfoForm from '../components/checkout/ParticipantInfoForm';
import { ErrorMessage } from '../components'; // Importăm componenta ErrorMessage

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

interface ParticipantInfo {
  fullName: string;
  expectations: string;
  age: string; // Added age property to match ParticipantInfoForm's interface
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showParticipantForm, setShowParticipantForm] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) {
        setError('ID-ul evenimentului lipsește.');
        navigate('/events');
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

  // Verifică dacă utilizatorul curent este înscris la eveniment
  const isUserRegistered = currentUser && event?.registeredUsers?.includes(currentUser.uid);

  const handleRegisterClick = () => {
    if (!currentUser) {
      alert('Trebuie să fii autentificat pentru a te înscrie la acest eveniment.');
      return;
    }

    if (!event) {
      setError('Informațiile evenimentului nu sunt disponibile.');
      return;
    }

    // Verifică dacă utilizatorul este deja înregistrat
    if (event.registeredUsers?.includes(currentUser.uid)) {
      setError('Ești deja înscris la acest eveniment.');
      return;
    }

    // Show participant form instead of registering immediately
    setShowParticipantForm(true);
  };

  const handleParticipantInfoSubmit = async (info: ParticipantInfo) => {
    setShowParticipantForm(false);
    
    // Proceed with registration
    await handleRegister(info);
  };

  const handleRegister = async (participantDetails: ParticipantInfo) => {
    if (!currentUser || !event) {
      return;
    }

    try {
      setError(null);
      const eventDoc = doc(db, 'events', id!);
      
      // Adaugă utilizatorul la lista de participanți
      await updateDoc(eventDoc, {
        registeredUsers: arrayUnion(currentUser.uid),
      });

      // Obține documentul actualizat cu noul număr de participanți
      const updatedEventSnap = await getDoc(eventDoc);
      const updatedEvent = updatedEventSnap.data();
      const participantCount = updatedEvent?.registeredUsers?.length || 1;

      try {
        // Trimite notificare prin email
        await sendEventRegistrationEmail({
          eventId: id,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          participantCount: participantCount,
          user: {
            id: currentUser.uid,
            email: currentUser.email || 'fara email',
            displayName: currentUser.displayName || 'Utilizator nedenumit'
          },
          participant: participantDetails // Include participant details
        });
      } catch (emailError) {
        console.error('Eroare la trimiterea emailului:', emailError);
        // Continuă execuția - utilizatorul este înregistrat chiar dacă emailul nu s-a trimis
      }

      setSuccessMessage('Te-ai înscris cu succes la acest eveniment!');
      
      // Actualizează starea evenimentului în interfață
      setEvent({
        ...event,
        registeredUsers: [...(event.registeredUsers || []), currentUser.uid]
      });
      
    } catch (err) {
      console.error('Eroare la înscrierea la eveniment:', err);
      setError('A apărut o eroare la înscrierea la eveniment. Te rugăm să încerci din nou.');
    }
  };

  const handleCancelRegistration = async () => {
    if (!currentUser || !event) {
      setError('Trebuie să fii autentificat pentru a anula înscrierea.');
      return;
    }

    if (!window.confirm('Ești sigur că vrei să anulezi înscrierea la acest eveniment?')) {
      return;
    }

    try {
      setError(null);
      setLoading(true); // Add loading state while processing
      const eventDoc = doc(db, 'events', id!);
      
      // Make sure the user is properly authenticated before attempting operation
      if (!currentUser.uid) {
        throw new Error('Sesiune de autentificare invalidă. Te rugăm să te reautentifici.');
      }
      
      // Using arrayRemove instead of filtering and replacing the entire array
      await updateDoc(eventDoc, {
        registeredUsers: arrayRemove(currentUser.uid)
      });

      // Actualizăm starea locală a evenimentului
      setEvent({
        ...event,
        registeredUsers: event.registeredUsers?.filter(userId => userId !== currentUser.uid) || []
      });

      setSuccessMessage('Înscrierea ta a fost anulată cu succes.');
      
      // După 3 secunde, eliminăm mesajul de succes
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (err: any) {
      console.error('Eroare la anularea înscrierii:', err);
      
      // Handle specific Firebase permission errors
      if (err.code === 'permission-denied') {
        setError('Nu ai permisiunea să anulezi această înscriere. Te rugăm să contactezi administratorul.');
      } else if (err.message && err.message.includes('permissions')) {
        setError('Problemă de permisiuni. Te rugăm să te reautentifici și să încerci din nou.');
      } else {
        setError('A apărut o eroare la anularea înscrierii. Te rugăm să încerci din nou.');
      }
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă detaliile evenimentului...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16">
        <ErrorMessage 
          message={error || 'A apărut o eroare la încărcarea evenimentului.'} 
          onRetry={() => window.location.reload()}
        />
        <div className="mt-4 text-center">
          <Link to="/events" className="text-blue-600 hover:underline">
            Înapoi la evenimente
          </Link>
        </div>
      </div>
    );
  }

  return (
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

        {showParticipantForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mt-8">
            <h2 className="text-xl font-bold mb-4">Completează informațiile pentru înregistrare</h2>
            <ParticipantInfoForm 
              onInfoSubmit={handleParticipantInfoSubmit} 
              initialValues={{
                fullName: currentUser?.displayName || '',
                expectations: '',
                age: '' // Added missing age property
              }}
            />
            <button
              onClick={() => setShowParticipantForm(false)}
              className="mt-4 text-gray-600 hover:underline"
            >
              Anulează
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 md:h-96 w-full relative">
              <img
                src={event.imageUrl || '/images/BussinesLider.jpg'}
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

              {successMessage && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                  {successMessage}
                </div>
              )}

              {error && (
                <ErrorMessage 
                  message={error}
                  type="warning"
                  onRetry={() => setError(null)}
                />
              )}

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

                  {isUserRegistered ? (
                    <button
                      onClick={handleCancelRegistration}
                      className="py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Anulează înscrierea
                    </button>
                  ) : (
                    <button
                      onClick={handleRegisterClick}
                      className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Înscrie-te la eveniment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
