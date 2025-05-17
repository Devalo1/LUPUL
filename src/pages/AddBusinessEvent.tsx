import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

const AddBusinessEvent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  const addBusinessLiderEvent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const eventsRef = collection(db, "events");
      
      const eventData = {
        title: "Business Lider – Tineri din Valea Jiului",
        description: "Un eveniment dedicat tinerilor sub 30 de ani din Valea Jiului care visează să-și deschidă propria afacere.\nVino să cunoști oameni ca tine – ambițioși, curajoși și gata să construiască viitorul economic al regiunii. Îți oferim inspirație, conexiuni și resurse reale pentru a-ți porni drumul în antreprenoriat.",
        date: "2023-12-15",
        time: "14:00 - 18:00",
        location: "Centrul de Afaceri, Petroșani, Valea Jiului",
        imageUrl: "/images/BussinesLider.jpg",
        capacity: 100,
        registeredUsers: [],
        category: "business",
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(eventsRef, eventData);
      setEventId(docRef.id);
      setSuccess(true);
      console.log("Eveniment adăugat cu ID: ", docRef.id);
    } catch (err: any) {
      console.error("Eroare la adăugarea evenimentului: ", err);
      setError(err.message || "A apărut o eroare la adăugarea evenimentului");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Adaugă Eveniment Business Lider</h1>
      
      {!success ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="mb-4">
            Acest buton va adăuga evenimentul "Business Lider – Tineri din Valea Jiului" în baza de date.
          </p>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Detalii eveniment:</h2>
            <p><strong>Titlu:</strong> Business Lider – Tineri din Valea Jiului</p>
            <p className="mt-2 whitespace-pre-line">
              <strong>Descriere:</strong> Un eveniment dedicat tinerilor sub 30 de ani din Valea Jiului care visează să-și deschidă propria afacere.
              Vino să cunoști oameni ca tine – ambițioși, curajoși și gata să construiască viitorul economic al regiunii. Îți oferim inspirație, conexiuni și resurse reale pentru a-ți porni drumul în antreprenoriat.
            </p>
            <p className="mt-2"><strong>Data:</strong> 15 decembrie 2023</p>
            <p><strong>Ora:</strong> 14:00 - 18:00</p>
            <p><strong>Locația:</strong> Centrul de Afaceri, Petroșani, Valea Jiului</p>
            <p><strong>Capacitate:</strong> 100 persoane</p>
          </div>
          
          <button
            onClick={addBusinessLiderEvent}
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Se procesează..." : "Adaugă Evenimentul"}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
            Evenimentul a fost adăugat cu succes! ID: {eventId}
          </div>
          
          <p className="mb-4">
            Acum poți vizualiza evenimentul în lista de evenimente.
          </p>
          
          <div className="flex space-x-4">
            <Link 
              to="/events" 
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Vezi toate evenimentele
            </Link>
            
            {eventId && (
              <Link 
                to={`/events/${eventId}`} 
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Vezi acest eveniment
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBusinessEvent;
