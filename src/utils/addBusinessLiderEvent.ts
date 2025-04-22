import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Script pentru adăugarea evenimentului Business Lider în Firestore
 * Poți rula acest script o singură dată pentru a adăuga evenimentul în baza de date
 */
export const addBusinessLiderEvent = async () => {
  try {
    const eventsRef = collection(db, "events");
    
    const eventData = {
      title: "Business Lider – Tineri din Valea Jiului",
      description: "Un eveniment dedicat tinerilor sub 30 de ani din Valea Jiului care visează să-și deschidă propria afacere.\nVino să cunoști oameni ca tine – ambițioși, curajoși și gata să construiască viitorul economic al regiunii. Îți oferim inspirație, conexiuni și resurse reale pentru a-ți porni drumul în antreprenoriat.",
      date: "2023-12-15", // Poți actualiza cu data reală
      time: "14:00 - 18:00", // Poți actualiza cu ora reală
      location: "Centrul de Afaceri, Petroșani, Valea Jiului",
      imageUrl: "/images/BussinesLider.jpg", // Calea către imaginea din folder-ul public
      capacity: 100, // Capacitatea evenimentului
      registeredUsers: [], // Inițial nu există utilizatori înregistrați
      category: "business", // Categoria evenimentului
      createdAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(eventsRef, eventData);
    console.log("Eveniment adăugat cu ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Eroare la adăugarea evenimentului: ", error);
    throw error;
  }
};
