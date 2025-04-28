import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import EventForm from "./EventForm";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  capacity: number;
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
  registeredUsers?: string[];
}

const EventsManager: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Funcție pentru a obține lista de evenimente
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const eventsQuery = query(
          collection(db, "events"),
          orderBy("date", "desc")
        );
        
        const snapshot = await getDocs(eventsQuery);
        const eventsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        
        setEvents(eventsList);
      } catch (err) {
        console.error("Eroare la încărcarea evenimentelor:", err);
        setError("A apărut o eroare la încărcarea evenimentelor. Vă rugăm să încercați din nou.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [refreshKey]);

  // Funcție pentru a trata ștergerea unui eveniment
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Ești sigur că dorești să ștergi acest eveniment?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      await deleteDoc(doc(db, "events", eventId));
      
      // Actualizăm lista de evenimente
      setRefreshKey(prev => prev + 1);
      
      console.log("Eveniment șters cu succes:", eventId);
    } catch (err) {
      console.error("Eroare la ștergerea evenimentului:", err);
      setError("A apărut o eroare la ștergerea evenimentului. Vă rugăm să încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru formatarea datei
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("ro-RO", options);
  };

  // Refreshăm lista după adăugare/editare
  const handleEventAdded = () => {
    setShowAddForm(false);
    setEditingEventId(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestionare Evenimente</h2>
        
        <button
          onClick={() => setShowAddForm(prev => !prev)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showAddForm ? "Anulează" : "Adaugă Eveniment Nou"}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {showAddForm && (
        <div className="mb-8">
          <EventForm 
            onEventAdded={handleEventAdded} 
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
      
      {editingEventId && (
        <div className="mb-8">
          <EventForm 
            editEventId={editingEventId} 
            onEventAdded={handleEventAdded} 
            onCancel={() => setEditingEventId(null)}
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        {loading && !showAddForm && !editingEventId ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nu există evenimente. Adaugă primul eveniment folosind butonul de mai sus.
          </div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Titlu</th>
                <th className="py-3 px-4 text-left">Data</th>
                <th className="py-3 px-4 text-left">Locație</th>
                <th className="py-3 px-4 text-left">Imagine</th>
                <th className="py-3 px-4 text-left">Capacitate</th>
                <th className="py-3 px-4 text-left">Înscriși</th>
                <th className="py-3 px-4 text-left">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {event.title}
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(event.date)}
                    {event.time && <span className="text-gray-500 ml-2">{event.time}</span>}
                  </td>
                  <td className="py-3 px-4">
                    {event.location}
                  </td>
                  <td className="py-3 px-4">
                    {event.imageUrl ? (
                      <div className="relative h-12 w-20">
                        <img
                          src={event.imageUrl.startsWith("/") ? event.imageUrl : `/images/${event.imageUrl.split("/").pop()}`}
                          alt={event.title}
                          className="h-full w-full object-cover rounded"
                          onError={(e) => {
                            // Redirecționăm către imaginea de backup dacă cea originală nu se încarcă
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "/images/BussinesLider.jpg") {
                              target.src = "/images/BussinesLider.jpg";
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-gray-500">Fără imagine</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {event.capacity || "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {event.registeredUsers?.length || 0}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingEventId(event.id);
                          setShowAddForm(false);
                          window.scrollTo(0, 0);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editează
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Șterge
                      </button>
                      <a
                        href={`/events/${event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        Vizualizează
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EventsManager;