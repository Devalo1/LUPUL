import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilterBar from "../components/events/FilterBar";
import EventModal from "../components/events/EventModal";
import { motion } from "framer-motion";
import { collection, getDocs, query, orderBy, where, Timestamp, doc, getDoc, updateDoc, arrayUnion, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ErrorMessage } from "../components";
import { useAuth } from "../contexts"; // Importăm contextul de autentificare

// Define Event type
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
  category?: string; // Adăugăm câmpul de categorie pentru a separa evenimentele normale de cele ale partenerilor
  specialistId?: string; // ID-ul specialistului pentru evenimentele de tip partener
  specialistName?: string; // Numele specialistului pentru afișare
  currentParticipants?: number; // Pentru evenimentele de tip partener
  organizerIsAdmin?: boolean; // Indicator pentru evenimentele organizate de administrator
}

// Interfața EventUser nu este folosită, o prefixăm cu underscore pentru a evita avertismentul linting
interface _EventUser {
  id: string;
  name: string;
  email: string;
}

// Interfața SpecialSession nu este folosită, o prefixăm cu underscore pentru a evita avertismentul linting
interface _SpecialSession {
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

// Interface pentru formularul de participare
interface ParticipantInfo {
  fullName: string;
  expectations: string;
  age: string;
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
    registeredUsers: [],
    category: "business"
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
    registeredUsers: [],
    category: "terapie"
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
    registeredUsers: [],
    category: "wellbeing"
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
    registeredUsers: ["user1", "user2", "user3"],
    category: "wellbeing"
  }
];

const EventsPage: React.FC = () => {
  const getSavedFilter = (): "all" | "upcoming" | "past" => {
    const saved = localStorage.getItem("eventsFilter");
    return (saved as "all" | "upcoming" | "past") || "all";
  };

  const getSavedCategoryFilter = (): string => {
    const saved = localStorage.getItem("eventsCategoryFilter");
    return saved || "all";
  };

  const { currentUser } = useAuth(); // Obținem utilizatorul curent din contextul de autentificare
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">(getSavedFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>(getSavedCategoryFilter);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [enrollingEventId, setEnrollingEventId] = useState<string | null>(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [participantEvent, setParticipantEvent] = useState<Event | null>(null);

  // Verifică dacă utilizatorul este înregistrat la un eveniment
  const isUserRegistered = (event: Event): boolean => {
    if (!currentUser || !event.registeredUsers) {
      return false;
    }
    return event.registeredUsers.includes(currentUser.uid);
  };

  useEffect(() => {
    localStorage.setItem("eventsFilter", filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem("eventsCategoryFilter", categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent));
    };

    checkIfMobile();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Folosim un timeout pentru a asigura afișarea stării de "loading"
        const timeoutId = setTimeout(() => {}, 500);

        try {
          // Obținem evenimentele normale
          const eventsQuery = query(
            collection(db, "events"),
            orderBy("date", "desc")
          );
          const eventsSnapshot = await getDocs(eventsQuery);
          const eventsData = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            category: doc.data().category || "general",
            organizerIsAdmin: doc.data().organizerIsAdmin !== undefined ? doc.data().organizerIsAdmin : true // Setăm proprietatea organizerIsAdmin ca true implicit pentru toate evenimentele normale
          } as Event));

          // Obținem sesiunile speciale ale specialiștilor
          const specialSessionsQuery = query(
            collection(db, "specialSessions")
          );
          const specialSessionsSnapshot = await getDocs(specialSessionsQuery);
          const specialSessionsData = specialSessionsSnapshot.docs.map(doc => {
            const data = doc.data();
            const sessionDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
            
            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              date: sessionDate.toISOString().split("T")[0], // Formatăm data ca string 'YYYY-MM-DD'
              time: `${data.startTime} - ${data.endTime}`,
              location: data.isOnline ? "Online" : (data.location || "Locație nespecificată"),
              imageUrl: data.imageUrl || "/images/Events.jpeg",
              capacity: data.capacity,
              registeredUsers: [], // Nu avem registeredUsers în același format
              currentParticipants: data.currentParticipants || 0,
              category: "partener", // Marcăm ca fiind de tipul "partener"
              specialistId: data.specialistId,
              specialistName: data.specialistName
            } as Event;
          });

          // Combinăm toate evenimentele
          const allEvents = [...eventsData, ...specialSessionsData];
          
          // Sortăm evenimentele după dată, cele mai recente primele
          allEvents.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });

          // Extragem toate categoriile unice
          const uniqueCategories = Array.from(new Set(allEvents.map(event => event.category || "general")));
          setCategories(uniqueCategories);

          setEvents(allEvents.length > 0 ? allEvents : mockEvents);
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
  }, [enrollmentSuccess]); // Reîncărcăm evenimentele după o înscriere reușită

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

  const isEventPast = (dateStr: string): boolean => {
    try {
      const eventDate = new Date(dateStr);
      eventDate.setHours(23, 59, 59, 999); // Set to end of day
      return eventDate < today;
    } catch (e) {
      return false;
    }
  };

  const upcomingEvents = events.filter((event) => {
    try {
      return !isEventPast(event.date);
    } catch (e) {
      return false;
    }
  });

  const pastEvents = events.filter((event) => {
    try {
      return isEventPast(event.date);
    } catch (e) {
      return false;
    }
  });

  // Aplicăm ambele filtre - timp (past/upcoming) și categorie
  const filteredEvents = events
    .filter(event => {
      // Filtrare după timp
      if (filter === "upcoming") return !isEventPast(event.date);
      if (filter === "past") return isEventPast(event.date);
      return true; // "all" - afișăm toate
    })
    .filter(event => {
      // Filtrare după categorie
      if (categoryFilter === "all") return true;
      return (event.category || "general") === categoryFilter;
    });

  // Funcție pentru a gestiona selecția categoriei
  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
  };

  // Funcție pentru a deschide formularul de participare la un eveniment
  const handleRegisterClick = (event: Event) => {
    if (!currentUser) {
      alert("Trebuie să fii autentificat pentru a te înscrie la acest eveniment.");
      return;
    }

    // Verifică dacă evenimentul este în trecut
    if (isEventPast(event.date)) {
      setEnrollmentError("Nu te poți înscrie la un eveniment care a trecut.");
      return;
    }

    // Verifică dacă este deja înscris
    if (event.category !== "partener" && isUserRegistered(event)) {
      setEnrollmentError("Ești deja înscris la acest eveniment.");
      return;
    }

    // Pentru sesiuni speciale, verifică dacă mai sunt locuri
    if (event.category === "partener" && event.currentParticipants && event.currentParticipants >= event.capacity) {
      setEnrollmentError("Ne pare rău, dar această sesiune a atins numărul maxim de participanți.");
      return;
    }

    // Deschide formularul de participare
    setParticipantEvent(event);
    setShowParticipantForm(true);
  };

  // Funcție pentru a procesa înscrierea utilizatorului
  const handleParticipantInfoSubmit = async (info: ParticipantInfo) => {
    if (!currentUser || !participantEvent) {
      setShowParticipantForm(false);
      return;
    }

    setEnrollingEventId(participantEvent.id);
    setShowParticipantForm(false);
    setEnrollmentError(null);

    try {
      // Pentru evenimentele normale
      if (participantEvent.category !== "partener") {
        // Adăugă utilizatorul la lista de participanți
        const eventDoc = doc(db, "events", participantEvent.id);
        
        // Adaugă utilizatorul la lista de participanți în documentul evenimentului
        await updateDoc(eventDoc, {
          registeredUsers: arrayUnion(currentUser.uid),
        });

        // Obține documentul actualizat cu noul număr de participanți
        const updatedEventSnap = await getDoc(eventDoc);
        const updatedEvent = updatedEventSnap.data();
        const _participantCount = updatedEvent?.registeredUsers?.length || 1;

        // Adaugă înregistrarea în colecția eventRegistrations
        try {
          const eventRegistrationData = {
            eventId: participantEvent.id,
            eventTitle: participantEvent.title,
            userId: currentUser.uid,
            userEmail: currentUser.email || "",
            name: info.fullName,
            email: currentUser.email || "",
            phone: "",  // Nu avem această informație, dar o adăugăm pentru compatibilitate
            additionalInfo: info.expectations,
            createdAt: new Date(),
            status: "confirmed"
          };

          const registrationRef = collection(db, "eventRegistrations");
          await addDoc(registrationRef, eventRegistrationData);
        } catch (registrationError) {
          console.error("Eroare la înregistrare în colecția eventRegistrations:", registrationError);
        }

        setEnrollmentSuccess(`Te-ai înscris cu succes la evenimentul "${participantEvent.title}"!`);
        
        // Actualizăm starea locală a evenimentelor
        setEvents(prevEvents => 
          prevEvents.map(event => {
            if (event.id === participantEvent.id) {
              return {
                ...event,
                registeredUsers: [...(event.registeredUsers || []), currentUser.uid]
              };
            }
            return event;
          })
        );
      } 
      // Pentru sesiunile speciale
      else if (participantEvent.specialistId) {
        // Verificăm dacă mai sunt locuri disponibile
        if (participantEvent.currentParticipants && participantEvent.currentParticipants >= participantEvent.capacity) {
          throw new Error("Ne pare rău, dar această sesiune a atins numărul maxim de participanți.");
        }

        // Verificăm dacă utilizatorul este deja înscris
        const enrollmentsRef = collection(db, "sessionEnrollments");
        const q = query(
          enrollmentsRef,
          where("sessionId", "==", participantEvent.id),
          where("userId", "==", currentUser.uid)
        );

        const existingEnrollment = await getDocs(q);
        if (!existingEnrollment.empty) {
          throw new Error("Sunteți deja înscris la această sesiune.");
        }

        // Obținem mai multe detalii despre utilizator
        let userData = {};
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          userData = userDoc.exists() ? userDoc.data() : {};
        } catch (userError) {
          console.warn("Nu s-au putut prelua detaliile utilizatorului:", userError);
        }

        // Pregătim datele participantului
        const participantData = {
          sessionId: participantEvent.id,
          userId: currentUser.uid,
          userName: info.fullName || currentUser.displayName || (userData as any).displayName || "Participant",
          userEmail: currentUser.email || (userData as any).email,
          userPhone: (userData as any).phone || "",
          profilePicture: currentUser.photoURL || (userData as any).photoURL || "",
          specialistId: participantEvent.specialistId,
          specialistName: participantEvent.specialistName,
          sessionTitle: participantEvent.title,
          sessionDate: Timestamp.fromDate(new Date(participantEvent.date)),
          sessionTime: participantEvent.time,
          status: "confirmed",
          createdAt: Timestamp.now(),
          additionalInfo: info.expectations || "",
          notificationsEnabled: true
        };

        // Adăugăm înregistrarea în baza de date
        const enrollmentRef = await addDoc(collection(db, "sessionEnrollments"), participantData);

        // Actualizăm numărul de participanți în sesiune
        const sessionRef = doc(db, "specialSessions", participantEvent.id);
        try {
          // Obținem lista actuală de participanți
          const sessionDoc = await getDoc(sessionRef);
          if (!sessionDoc.exists()) {
            throw new Error("Sesiunea nu mai există sau a fost ștearsă.");
          }

          const sessionData = sessionDoc.data();
          const participants = sessionData.participants || [];
          const newParticipant = {
            id: enrollmentRef.id,
            userId: currentUser.uid,
            name: participantData.userName,
            email: participantData.userEmail,
            phone: participantData.userPhone,
            profilePicture: participantData.profilePicture,
            enrollmentDate: Timestamp.now(),
            status: "confirmed"
          };

          participants.push(newParticipant);

          // Actualizăm sesiunea
          await updateDoc(sessionRef, {
            currentParticipants: (sessionData.currentParticipants || 0) + 1,
            participants: participants,
            lastUpdated: Timestamp.now()
          });

          // Adăugăm și un eveniment în calendar
          const calendarEvent = {
            title: `Sesiune: ${participantEvent.title}`,
            specialistId: participantEvent.specialistId,
            participantId: currentUser.uid,
            participantName: participantData.userName,
            participantEmail: participantData.userEmail,
            participantPhone: participantData.userPhone,
            date: Timestamp.fromDate(new Date(participantEvent.date)),
            startTime: participantEvent.time.split(" - ")[0],
            endTime: participantEvent.time.split(" - ")[1],
            location: participantEvent.location,
            type: "specialSession",
            sessionId: participantEvent.id,
            enrollmentId: enrollmentRef.id,
            notes: "Sesiune specială cu participanți multipli",
            createdAt: Timestamp.now()
          };

          await addDoc(collection(db, "calendar"), calendarEvent);

          // Actualizăm starea locală a evenimentelor
          setEvents(prevEvents => 
            prevEvents.map(event => {
              if (event.id === participantEvent.id) {
                return {
                  ...event,
                  currentParticipants: (event.currentParticipants || 0) + 1
                };
              }
              return event;
            })
          );

          setEnrollmentSuccess(`Te-ai înscris cu succes la sesiunea "${participantEvent.title}"!`);

        } catch (updateError) {
          console.error("Eroare la actualizarea sesiunii:", updateError);
          // Încercăm o abordare mai simplă dacă actualizarea complexă eșuează
          try {
            await updateDoc(sessionRef, {
              currentParticipants: (participantEvent.currentParticipants || 0) + 1,
              lastUpdated: Timestamp.now()
            });
            setEnrollmentSuccess(`Te-ai înscris cu succes la sesiunea "${participantEvent.title}"!`);
          } catch (simpleUpdateError) {
            console.error("Eroare și la actualizarea simplificată:", simpleUpdateError);
            throw new Error("Nu s-a putut finaliza înscrierea. Te rugăm să încerci din nou.");
          }
        }
      }

      // După 3 secunde, eliminăm mesajul de succes
      setTimeout(() => {
        setEnrollmentSuccess(null);
      }, 3000);

    } catch (err) {
      console.error("Eroare la înscrierea la eveniment:", err);
      if (err instanceof Error) {
        setEnrollmentError(err.message);
      } else {
        setEnrollmentError("A apărut o eroare la înscrierea la eveniment. Te rugăm să încerci din nou.");
      }
    } finally {
      setEnrollingEventId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 pt-6">
      <div className="bg-white dark:bg-gray-800 shadow-md p-4 md:p-6 mb-6">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Evenimente</h1>

          <FilterBar filter={filter} setFilter={setFilter} />

          {/* Filtrare după categorie */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                categoryFilter === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Toate
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  categoryFilter === category 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category === "partener" ? "Parteneri" : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

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

      {/* Afișare mesaje de succes/eroare pentru înscriere */}
      {enrollmentSuccess && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {enrollmentSuccess}
          </div>
        </div>
      )}

      {enrollmentError && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {enrollmentError}
          </div>
        </div>
      )}

      {/* Formular pentru înscrierea la evenimente */}
      {showParticipantForm && participantEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Înscriere la {participantEvent.category === "partener" ? "sesiunea" : "evenimentul"}: {participantEvent.title}
            </h2>
            
            <div className="mb-4 text-gray-600">
              <p>Data: {formatDate(participantEvent.date)}</p>
              <p>Ora: {participantEvent.time}</p>
              <p>Locație: {participantEvent.location}</p>
              {participantEvent.category === "partener" && participantEvent.specialistName && (
                <p className="mt-2 font-medium text-purple-600">Organizator: {participantEvent.specialistName}</p>
              )}
            </div>
            
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const fullName = formData.get("fullName") as string;
              const expectations = formData.get("expectations") as string;
              const age = formData.get("age") as string;
              
              if (!fullName || !expectations || !age) {
                alert("Te rugăm să completezi toate câmpurile obligatorii.");
                return;
              }
              
              handleParticipantInfoSubmit({
                fullName,
                expectations,
                age
              });
            }}>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Nume complet *
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={currentUser?.displayName || ""}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Vârsta *
                </label>
                <input
                  type="number"
                  name="age"
                  min="16"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Ce așteptări aveți de la acest {participantEvent.category === "partener" ? "sesiune" : "eveniment"}? *
                </label>
                <textarea
                  name="expectations"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowParticipantForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Înregistrează-mă
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  {event.category === "partener" && (
                    <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                      Partener: {event.specialistName || "Specialist"}
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
                      {event.category === "partener" ? (
                        <span>
                          {event.currentParticipants}/{event.capacity} participanți
                        </span>
                      ) : event.registeredUsers ? (
                        <span>
                          {event.registeredUsers.length}/{event.capacity} participanți
                        </span>
                      ) : (
                        <span>0/{event.capacity || "?"} participanți</span>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {/* Prima linie - buton de înscriere sau status înscris */}
                      {isEventPast(event.date) ? (
                        <div className="px-4 py-2 rounded-md bg-gray-400 text-white text-xs sm:text-sm cursor-not-allowed text-center">
                          Eveniment încheiat
                        </div>
                      ) : (event.category !== "partener" && isUserRegistered(event)) ? (
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                        >
                          Ești înscris - Click pentru anulare
                        </button>
                      ) : enrollingEventId === event.id ? (
                        <div className="px-4 py-2 rounded-md bg-blue-400 text-white text-xs sm:text-sm flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesare...
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegisterClick(event)}
                          className={`px-4 py-2 rounded-md transition-colors text-xs sm:text-sm 
                            ${event.category === "partener" && event.currentParticipants && event.currentParticipants >= event.capacity
                              ? "bg-red-400 cursor-not-allowed text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                          disabled={event.category === "partener" && event.currentParticipants && event.currentParticipants >= event.capacity}
                        >
                          {event.category === "partener" && event.currentParticipants && event.currentParticipants >= event.capacity
                            ? "Locuri epuizate"
                            : "Înscrie-te acum"}
                        </button>
                      )}
                      
                      {/* A doua linie - butoane pentru detalii eveniment și organizator */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/events/${event.id}`}
                          className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-xs"
                        >
                          Detalii eveniment
                        </Link>
                        
                        {/* Buton pentru detalii organizator - afișat doar dacă avem organizator */}
                        {event.category === "partener" && event.specialistId && (
                          <Link
                            to={`/appointments/specialist/${event.specialistId}`}
                            className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs"
                          >
                            Detalii organizator
                          </Link>
                        )}
                        {event.organizerIsAdmin && (
                          <Link
                            to="/about"
                            className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs border-2 border-green-500"
                          >
                            Detalii organizator
                          </Link>
                        )}
                      </div>
                    </div>
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
          isUserRegistered={isUserRegistered(selectedEvent)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default EventsPage;
