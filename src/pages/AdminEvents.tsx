import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  capacity?: number;
  registrationRequired?: boolean;
  registeredUsers?: string[];
  imageUrl?: string;
  createdAt: any;
}

interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userEmail: string;
  name: string;
  email: string;
  phone: string;
  additionalInfo?: string;
  createdAt: any;
  status: string;
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<{[eventId: string]: EventRegistration[]}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setEvents([]);
      } else {
        const eventsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event));
        
        setEvents(eventsList);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("A apărut o eroare la încărcarea evenimentelor.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationsForEvent = async (eventId: string) => {
    try {
      // Verificăm mai întâi dacă am încărcat deja înregistrările pentru acest eveniment
      if (registrations[eventId]) {
        return;
      }

      console.log("Încercare de a încărca înregistrările pentru evenimentul:", eventId);
      
      // Set pentru a ține evidența utilizatorilor unici pentru a preveni duplicatele
      const uniqueUserIds = new Set<string>();
      
      // Încărcăm înregistrările din colecția eventRegistrations
      const registrationsRef = collection(db, "eventRegistrations");
      const q = query(registrationsRef, where("eventId", "==", eventId));
      
      console.log("Query pentru eventRegistrations creat:", q);
      
      const snapshot = await getDocs(q);
      const registrationsList: EventRegistration[] = [];
      
      console.log("Rezultate obținute din eventRegistrations:", snapshot.size, "înregistrări");
      
      // Adăugăm mai întâi înregistrările din colecția eventRegistrations
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!uniqueUserIds.has(data.userId)) {
          uniqueUserIds.add(data.userId);
          registrationsList.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : new Date()
          } as EventRegistration);
        }
      });
      
      // Dacă nu avem suficiente înregistrări din eventRegistrations, verificăm și registeredUsers
      const eventDoc = events.find(e => e.id === eventId);
      if (eventDoc && eventDoc.registeredUsers && eventDoc.registeredUsers.length > 0) {
        for (const userId of eventDoc.registeredUsers) {
          // Verificăm dacă utilizatorul nu este deja în listă
          if (!uniqueUserIds.has(userId)) {
            uniqueUserIds.add(userId);
            
            // Încercăm să obținem informații despre utilizator
            const usersRef = collection(db, "users");
            const userQuery = query(usersRef, where("uid", "==", userId));
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              registrationsList.push({
                id: userSnapshot.docs[0].id,
                eventId: eventId,
                eventTitle: eventDoc.title,
                userId: userId,
                userEmail: userData.email || "",
                name: userData.displayName || "Utilizator necunoscut",
                email: userData.email || "",
                phone: userData.phone || "",
                additionalInfo: "",
                createdAt: new Date(),
                status: "converted"
              });
            } else {
              // În cazul în care nu găsim utilizatorul, adăugăm o înregistrare minimală
              registrationsList.push({
                id: userId,
                eventId: eventId,
                eventTitle: eventDoc.title,
                userId: userId,
                userEmail: "",
                name: "Utilizator necunoscut",
                email: "",
                phone: "",
                additionalInfo: "",
                createdAt: new Date(),
                status: "unknown"
              });
            }
          }
        }
      }
      
      console.log("Lista finală de înregistrări procesată:", registrationsList.length, "elemente unice");
      setRegistrations(prev => ({...prev, [eventId]: registrationsList}));
        
    } catch (err) {
      console.error("Error fetching registrations:", err);
      alert("Nu s-au putut încărca înregistrările pentru acest eveniment.");
    }
  };

  const handleAddEvent = () => {
    navigate("/admin/add-event");
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/admin/events/edit/${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Sunteți sigur că doriți să ștergeți acest eveniment?")) {
      try {
        await deleteDoc(doc(db, "events", eventId));
        setEvents(events.filter(event => event.id !== eventId));
        alert("Evenimentul a fost șters cu succes!");
      } catch (err) {
        console.error("Error deleting event:", err);
        alert("A apărut o eroare la ștergerea evenimentului.");
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data necunoscută";
    
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      return new Date(dateString).toLocaleDateString("ro-RO", options);
    } catch (e) {
      return dateString;
    }
  };

  const toggleExpandEvent = async (eventId: string) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
      await fetchRegistrationsForEvent(eventId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestionare Evenimente</h1>
          <button
            onClick={handleAddEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Adaugă eveniment nou
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Nu există evenimente. Adăugați unul nou pentru a începe.</p>
              </div>
            ) : (
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Eveniment</th>
                    <th className="py-3 px-4 text-left">Data</th>
                    <th className="py-3 px-4 text-left">Locație</th>
                    <th className="py-3 px-4 text-left">Participanți</th>
                    <th className="py-3 px-4 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <React.Fragment key={event.id}>
                      <tr className={`hover:bg-gray-50 ${expandedEvent === event.id ? "bg-blue-50" : ""}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {event.imageUrl ? (
                              <img 
                                src={event.imageUrl} 
                                alt={event.title}
                                className="w-12 h-12 rounded object-cover mr-3" 
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-3">
                                <span className="text-gray-500 text-xs">No img</span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {event.description?.substring(0, 80)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                          {event.time && (
                            <div className="text-sm text-gray-500">{event.time}</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900">{event.location || "Nespecificat"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <button 
                            onClick={() => toggleExpandEvent(event.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {event.registeredUsers?.length || 0} / {event.capacity || "∞"}
                            {expandedEvent === event.id ? " ▲" : " ▼"}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditEvent(event.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editează
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-900 ml-3"
                          >
                            Șterge
                          </button>
                        </td>
                      </tr>
                      
                      {expandedEvent === event.id && (
                        <tr>
                          <td colSpan={5} className="bg-gray-50 px-4 py-4">
                            <div className="border rounded-md p-4">
                              <h3 className="font-medium text-lg mb-4">Lista de participanți</h3>
                              
                              {!registrations[event.id] ? (
                                <div className="flex justify-center items-center h-16">
                                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                              ) : registrations[event.id].length === 0 ? (
                                <p className="text-gray-500 italic">Niciun participant înregistrat pentru acest eveniment.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full bg-white border">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="py-2 px-3 text-left">Nume</th>
                                        <th className="py-2 px-3 text-left">Email</th>
                                        <th className="py-2 px-3 text-left">Telefon</th>
                                        <th className="py-2 px-3 text-left">Informații adiționale</th>
                                        <th className="py-2 px-3 text-left">Data înregistrării</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {registrations[event.id].map((reg) => (
                                        <tr key={reg.id} className="border-t">
                                          <td className="py-2 px-3">{reg.name}</td>
                                          <td className="py-2 px-3">{reg.email}</td>
                                          <td className="py-2 px-3">{reg.phone}</td>
                                          <td className="py-2 px-3">{reg.additionalInfo || "-"}</td>
                                          <td className="py-2 px-3">
                                            {reg.createdAt ? new Date(reg.createdAt).toLocaleString("ro-RO") : "-"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;