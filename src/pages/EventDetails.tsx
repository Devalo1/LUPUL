import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, where, getDocs, writeBatch, Timestamp } from "firebase/firestore";
import { db, sendEventRegistrationEmail } from "../firebase";
import { useAuth } from "../contexts";
import ParticipantInfoForm from "../components/checkout/ParticipantInfoForm";
import { ErrorMessage } from "../components"; 
import EventImage from "../components/events/EventImage"; // Importăm noua componentă EventImage

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
  category?: string;
  specialistId?: string;
  specialistName?: string;
  organizerId?: string;
  organizerName?: string;
  organizerIsAdmin?: boolean;
  partnerId?: string;
  partnerName?: string;
  partnerDescription?: string;
}

interface ParticipantInfo {
  fullName: string;
  expectations: string;
  age: string; // Added age property to match ParticipantInfoForm's interface
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Ensure currentUser is defined in AuthContextType
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showParticipantForm, setShowParticipantForm] = useState(false);

  // Check if event is in the past
  const isEventPast = (eventDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for proper comparison
    return new Date(eventDate) < today;
  };

  // Funcție pentru a verifica dacă organizatorul este admin și a gestiona redirecționarea
  const handleOrganizerClick = () => {
    if (event?.organizerIsAdmin) {
      // Dacă organizatorul este admin, redirecționează către pagina About
      navigate("/about");
    } else if (event?.organizerId) {
      // Dacă există un ID de organizator non-admin, ar putea fi implementată navigarea
      // către o pagină de profil a organizatorului (implementare viitoare)
      console.log(`Navigare către profilul organizatorului: ${event.organizerId}`);
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) {
        setError("ID-ul evenimentului lipsește.");
        navigate("/events");
        return;
      }

      try {
        setLoading(true);
        
        // Prima dată verificăm în colecția "events"
        const eventDoc = doc(db, "events", id);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
          setEvent({
            id: eventSnapshot.id,
            ...eventSnapshot.data(),
          } as Event);
        } else {
          // Dacă nu există în "events", verificăm în "specialSessions"
          const specialSessionDoc = doc(db, "specialSessions", id);
          const specialSessionSnapshot = await getDoc(specialSessionDoc);
          
          if (specialSessionSnapshot.exists()) {
            const data = specialSessionSnapshot.data();
            const sessionDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
            
            // Formatăm datele din sesiune pentru a se potrivi cu interfața Event
            setEvent({
              id: specialSessionSnapshot.id,
              title: data.title,
              description: data.description,
              date: sessionDate.toISOString().split("T")[0],
              time: `${data.startTime} - ${data.endTime}`,
              location: data.isOnline ? "Online" : (data.location || "Locație nespecificată"),
              imageUrl: data.imageUrl || "/images/Events.jpeg",
              capacity: data.capacity,
              registeredUsers: [],
              currentParticipants: data.currentParticipants || 0,
              category: "partener",
              specialistId: data.specialistId,
              specialistName: data.specialistName,
              organizerId: data.specialistId, // Setăm organizerId ca fiind specialistId
              organizerName: data.specialistName, // Setăm organizerName ca fiind specialistName
              organizerIsAdmin: false // Organizatorul nu este admin, este specialist
            } as Event);
          } else {
            setError("Evenimentul nu a fost găsit.");
          }
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("A apărut o eroare la încărcarea detaliilor evenimentului.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, navigate]);

  // Verifică dacă utilizatorul curent este înscris la eveniment
  const isUserRegistered = (): boolean => {
    if (!currentUser || !event?.registeredUsers) {
      return false;
    }
    return event.registeredUsers.includes(currentUser.uid);
  };

  const handleRegisterClick = () => {
    if (!currentUser) {
      alert("Trebuie să fii autentificat pentru a te înscrie la acest eveniment.");
      return;
    }

    if (!event) {
      setError("Informațiile evenimentului nu sunt disponibile.");
      return;
    }

    // Verifică dacă evenimentul a trecut
    if (isEventPast(event.date)) {
      setError("Nu te poți înscrie la un eveniment care a trecut.");
      return;
    }

    // Verifică dacă utilizatorul este deja înregistrat
    if (isUserRegistered()) {
      setError("Ești deja înscris la acest eveniment.");
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
    
    // Verifică din nou dacă evenimentul a trecut (pentru siguranță)
    if (isEventPast(event.date)) {
      setError("Nu te poți înscrie la un eveniment care a trecut.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      // Folosim updateDoc direct pentru a adăuga utilizatorul în array-ul de participanți
      const eventDoc = doc(db, "events", id!);
      
      // Adaugă utilizatorul la lista de participanți în documentul evenimentului
      await updateDoc(eventDoc, {
        registeredUsers: arrayUnion(currentUser.uid),
      });

      // Obține documentul actualizat cu noul număr de participanți
      const updatedEventSnap = await getDoc(eventDoc);
      const updatedEvent = updatedEventSnap.data();
      const participantCount = updatedEvent?.registeredUsers?.length || 1;

      // Adaugă înregistrarea în colecția eventRegistrations folosind addDoc pentru a genera un ID
      try {
        const eventRegistrationData = {
          eventId: id,
          eventTitle: event.title,
          userId: currentUser.uid,
          userEmail: currentUser.email || "",
          name: participantDetails.fullName,
          email: currentUser.email || "",
          phone: "",  // Nu avem această informație, dar o adăugăm pentru compatibilitate
          additionalInfo: participantDetails.expectations,
          createdAt: new Date(),
          status: "confirmed"
        };

        // Folosim addDoc în loc de doc + setDoc pentru a evita problemele cu ID-ul
        const registrationRef = collection(db, "eventRegistrations");
        await addDoc(registrationRef, eventRegistrationData);
        console.log("Înregistrare adăugată în colecția eventRegistrations");
      } catch (registrationError) {
        console.error("Eroare la înregistrare în colecția eventRegistrations:", registrationError);
        // Nu aruncăm excepția mai departe - utilizatorul este deja adăugat în eveniment
      }

      try {
        // Trimite notificare prin email folosind funcția din firebase.ts
        await sendEventRegistrationEmail({
          eventId: id,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          participantCount: participantCount,
          user: {
            id: currentUser.uid,
            email: currentUser.email || "fara email",
            displayName: currentUser.displayName || "Utilizator nedenumit"
          },
          participant: {
            fullName: participantDetails.fullName,
            expectations: participantDetails.expectations || "",
            age: participantDetails.age || ""
          }
        });
      } catch (emailError) {
        console.error("Eroare la trimiterea emailului:", emailError);
        // Continuă execuția - utilizatorul este înregistrat chiar dacă emailul nu s-a trimis
      }

      setSuccessMessage("Te-ai înscris cu succes la acest eveniment!");
      
      // Actualizează starea evenimentului în interfață
      setEvent(prevEvent => {
        if (!prevEvent) return null;
        
        return {
          ...prevEvent,
          registeredUsers: [...(prevEvent.registeredUsers || []), currentUser.uid]
        };
      });
      
    } catch (err) {
      console.error("Registration error:", err);
      
      // Provide more specific error messages based on error type
      if (err instanceof Error) {
        // Check for permission errors specifically
        if (err.message.includes("permission") || err.message.includes("Missing or insufficient")) {
          setError("Eroare de permisiuni: Nu ai drepturi suficiente pentru a te înscrie. Te rugăm să contactezi administratorul site-ului.");
        } else {
          setError(`Eroare la înscrierea la eveniment: ${err.message}`);
        }
      } else if (typeof err === "string") {
        setError(`Eroare la înscrierea la eveniment: ${err}`);
      } else {
        setError("A apărut o eroare la înscrierea la eveniment. Te rugăm să încerci din nou.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!currentUser || !event) {
      setError("Trebuie să fii autentificat pentru a anula înscrierea.");
      return;
    }

    if (!window.confirm("Ești sigur că vrei să anulezi înscrierea la acest eveniment?")) {
      return;
    }

    try {
      setError(null);
      setLoading(true); // Add loading state while processing
      const eventDoc = doc(db, "events", id!);
      
      // Make sure the user is properly authenticated before attempting operation
      if (!currentUser.uid) {
        throw new Error("Sesiune de autentificare invalidă. Te rugăm să te reautentifici.");
      }
      
      // Using arrayRemove instead of filtering and replacing the entire array
      await updateDoc(eventDoc, {
        registeredUsers: arrayRemove(currentUser.uid)
      });

      // Șterge înregistrarea din colecția eventRegistrations
      try {
        // Găsim înregistrarea asociată cu acest utilizator și eveniment
        const registrationsRef = collection(db, "eventRegistrations");
        const q = query(
          registrationsRef,
          where("eventId", "==", id),
          where("userId", "==", currentUser.uid)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          // Șterge toate înregistrările găsite (ar trebui să fie doar una)
          const batch = writeBatch(db);
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
          console.log("Înregistrare ștearsă din colecția eventRegistrations");
        }
      } catch (deleteError) {
        console.error("Eroare la ștergerea înregistrării din eventRegistrations:", deleteError);
        // Continuă execuția - utilizatorul este eliminat din eveniment, dar înregistrarea poate rămâne în colecție
      }

      // Actualizăm starea locală a evenimentului
      setEvent({
        ...event,
        registeredUsers: event.registeredUsers?.filter(userId => userId !== currentUser.uid) || []
      });

      setSuccessMessage("Înscrierea ta a fost anulată cu succes.");
      
      // După 3 secunde, eliminăm mesajul de succes
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (err: any) {
      console.error("Eroare la anularea înscrierii:", err);
      
      // Handle specific Firebase permission errors
      if (err.code === "permission-denied") {
        setError("Nu ai permisiunea să anulezi această înscriere. Te rugăm să contactezi administratorul.");
      } else if (err.message && err.message.includes("permissions")) {
        setError("Problemă de permisiuni. Te rugăm să te reautentifici și să încerci din nou.");
      } else {
        setError("A apărut o eroare la anularea înscrierii. Te rugăm să încerci din nou.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("ro-RO", options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Se încarcă detaliile evenimentului...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <ErrorMessage 
          message={error || "A apărut o eroare la încărcarea evenimentului."} 
          onRetry={() => window.location.reload()}
        />
        <div className="mt-4 text-center">
          <Link to="/events" className="text-blue-600 hover:underline text-sm sm:text-base">
            Înapoi la evenimente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-6 sm:py-12 md:py-16 min-h-screen">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-4 sm:mb-8">
          <Link to="/events" className="text-blue-600 hover:underline flex items-center text-sm sm:text-base">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Înapoi la evenimente
          </Link>
        </div>

        {showParticipantForm ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 mt-4 sm:mt-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Completează informațiile pentru înregistrare</h2>
            <ParticipantInfoForm 
              onInfoSubmit={handleParticipantInfoSubmit} 
              initialValues={{
                fullName: currentUser?.displayName || "",
                expectations: "",
                age: "" // Added missing age property
              }}
            />
            <button
              onClick={() => setShowParticipantForm(false)}
              className="mt-4 text-gray-600 hover:underline text-sm sm:text-base"
            >
              Anulează
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 sm:h-64 md:h-96 w-full relative">
              <EventImage 
                imageUrl={event.imageUrl || "/images/BussinesLider.jpg"}
                eventId={id || ""}
                title={event.title || "Eveniment"}
                className="h-full"
              />
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <div className="mb-3 sm:mb-4 text-blue-600 font-medium text-sm sm:text-base">
                {event.date ? formatDate(event.date) : "Data indisponibilă"} • {event.time || "Ora indisponibilă"}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 break-words">
                {event.title || "Titlu indisponibil"}
              </h1>

              <div className="flex items-center text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span className="break-words">{event.location || "Locație indisponibilă"}</span>
              </div>

              <div className="prose max-w-none mb-6 sm:mb-8">
                <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">
                  {event.description || "Descriere indisponibilă"}
                </p>
              </div>

              {/* Secțiunea cu informații despre organizator și partener */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                {/* Organizator */}
                {(event.organizerName || event.organizerIsAdmin) && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Organizator:</h3>
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      {event.organizerIsAdmin ? (
                        <button 
                          onClick={handleOrganizerClick}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          Administratorul Platformei - Vezi mai multe detalii
                        </button>
                      ) : (
                        <span>{event.organizerName || "Organizator"}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Partener */}
                {(event.partnerName || event.partnerDescription) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Partener:</h3>
                    <div className="flex items-start">
                      <div className="bg-purple-100 p-2 rounded-full mr-3 mt-1">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{event.partnerName || "Partener"}</div>
                        {event.partnerDescription && (
                          <p className="text-sm text-gray-600 mt-1">{event.partnerDescription}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {successMessage && (
                <div className="mb-4 p-3 sm:p-4 bg-green-100 text-green-700 rounded-md text-sm sm:text-base">
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

              <div className="border-t border-gray-200 pt-4 sm:pt-6 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium">Capacitate:</span> {event.capacity || "Necunoscut"} participanți
                    </p>
                    {event.registeredUsers && (
                      <p className="text-gray-600 text-sm sm:text-base mt-1">
                        <span className="font-medium">Înscriși:</span> {event.registeredUsers.length} participanți
                      </p>
                    )}
                  </div>

                  <div className="w-full sm:w-auto">
                    {isUserRegistered() ? (
                      <button
                        onClick={handleCancelRegistration}
                        className="w-full sm:w-auto py-2 px-4 sm:px-6 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base"
                      >
                        Anulează înscrierea
                      </button>
                    ) : isEventPast(event.date) ? (
                      <div className="w-full sm:w-auto py-2 px-4 sm:px-6 bg-gray-400 text-white rounded-md cursor-not-allowed text-center text-sm sm:text-base">
                        Eveniment încheiat
                      </div>
                    ) : (
                      <button
                        onClick={handleRegisterClick}
                        className="w-full sm:w-auto py-2 px-4 sm:px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                      >
                        Înscrie-te la eveniment
                      </button>
                    )}
                  </div>
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
