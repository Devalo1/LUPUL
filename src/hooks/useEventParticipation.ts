import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

interface UseEventParticipationProps {
  eventId: string;
  userId: string;
  userName: string;
}

export const useEventParticipation = ({ eventId, userId, userName }: UseEventParticipationProps) => {
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkParticipation = async () => {
      console.log("------- START: Verificare participare -------");
      console.log(`Verificăm participarea pentru: eventId=${eventId}, userId=${userId}, userName=${userName}`);
      try {
        const eventDoc = doc(db, "events", eventId);
        console.log(`Accesăm documentul evenimentului din Firestore: events/${eventId}`);
        
        const eventSnapshot = await getDoc(eventDoc);
        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          console.log("Date eveniment:", eventData);
          
          const participants = eventData.participants || [];
          console.log(`Evenimentul are ${participants.length} participanți:`, participants);
          
          const isUserParticipating = participants.some((p: { userId: string }) => p.userId === userId);
          console.log(`Utilizatorul ${userId} ${isUserParticipating ? "participă" : "nu participă"} la acest eveniment`);
          setIsParticipating(isUserParticipating);
        } else {
          console.warn(`Atenție! Evenimentul cu ID=${eventId} nu există în baza de date!`);
        }
      } catch (err) {
        console.error("Eroare la verificarea participării:", err);
        if (err instanceof Error) {
          console.error(`Mesaj de eroare: ${err.message}`);
          console.error(`Stack trace: ${err.stack}`);
          setError(`A apărut o eroare la verificarea participării: ${err.message}`);
        } else {
          console.error("Eroare necunoscută la verificarea participării");
          setError("A apărut o eroare necunoscută la verificarea participării.");
        }
      } finally {
        console.log("------- END: Verificare participare -------");
      }
    };

    checkParticipation();
  }, [eventId, userId, userName]);

  const participate = async () => {
    console.log("------- START: Înscriere la eveniment -------");
    console.log(`Încercăm înscrierea la eveniment: eventId=${eventId}, userId=${userId}, userName=${userName}`);
    
    // Verificare dacă utilizatorul este autentificat
    if (!userId) {
      console.error("Eroare: Utilizatorul nu este autentificat");
      setError("Trebuie să fii autentificat pentru a participa la evenimente");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const eventDoc = doc(db, "events", eventId);
      console.log(`Accesăm documentul evenimentului din Firestore: events/${eventId}`);
      
      const eventSnapshot = await getDoc(eventDoc);
      if (!eventSnapshot.exists()) {
        console.error(`Eroare: Evenimentul cu ID=${eventId} nu există în baza de date!`);
        setError("Evenimentul nu există.");
        return;
      }
      
      const eventData = eventSnapshot.data();
      console.log("Date eveniment înainte de înscriere:", eventData);
      
      if (!eventData || !Array.isArray(eventData.participants)) {
        console.error("Eroare: Câmpul participanți este invalid în document:", eventData);
        setError("Câmpul participanți este invalid.");
        return;
      }
      
      console.log(`Adăugăm utilizatorul ${userName} (${userId}) la lista de participanți...`);
      const participantData = { userId, name: userName, joinedAt: Timestamp.now() };
      console.log("Date participant care vor fi adăugate:", participantData);
      
      await updateDoc(eventDoc, {
        participants: arrayUnion(participantData),
      });
      
      console.log(`Succes! Utilizatorul ${userName} a fost înscris la evenimentul ${eventId}`);
      setIsParticipating(true);
    } catch (err) {
      console.error("Eroare la înscrierea la eveniment:", err);
      if (err instanceof Error) {
        console.error(`Mesaj de eroare: ${err.message}`);
        console.error(`Stack trace: ${err.stack}`);
        setError(`A apărut o eroare la înscriere: ${err.message}`);
      } else {
        console.error("Eroare necunoscută la înscrierea la eveniment");
        setError("A apărut o eroare necunoscută la înscriere.");
      }
    } finally {
      setLoading(false);
      console.log("------- END: Înscriere la eveniment -------");
    }
  };

  const cancelParticipation = async () => {
    console.log("------- START: Anulare participare la eveniment -------");
    console.log(`Încercăm anularea participării la eveniment: eventId=${eventId}, userId=${userId}, userName=${userName}`);
    
    // Verificare dacă utilizatorul este autentificat
    if (!userId) {
      console.error("Eroare: Utilizatorul nu este autentificat");
      setError("Trebuie să fii autentificat pentru a anula participarea");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const eventDoc = doc(db, "events", eventId);
      console.log(`Accesăm documentul evenimentului din Firestore: events/${eventId}`);
      
      const eventSnapshot = await getDoc(eventDoc);
      if (!eventSnapshot.exists()) {
        console.error(`Eroare: Evenimentul cu ID=${eventId} nu există în baza de date!`);
        setError("Evenimentul nu există.");
        return;
      }
      
      const eventData = eventSnapshot.data();
      console.log("Date eveniment înainte de anularea participării:", eventData);
      
      if (!eventData || !Array.isArray(eventData.participants)) {
        console.error("Eroare: Câmpul participanți este invalid în document:", eventData);
        setError("Câmpul participanți este invalid.");
        return;
      }
      
      console.log(`Eliminăm utilizatorul ${userName} (${userId}) din lista de participanți...`);
      const participantData = { userId, name: userName };
      console.log("Date participant care vor fi eliminate:", participantData);
      
      await updateDoc(eventDoc, {
        participants: arrayRemove(participantData),
      });
      
      console.log(`Succes! Participarea utilizatorului ${userName} la evenimentul ${eventId} a fost anulată`);
      setIsParticipating(false);
    } catch (err) {
      console.error("Eroare la anularea participării la eveniment:", err);
      if (err instanceof Error) {
        console.error(`Mesaj de eroare: ${err.message}`);
        console.error(`Stack trace: ${err.stack}`);
        setError(`A apărut o eroare la anularea participării: ${err.message}`);
      } else {
        console.error("Eroare necunoscută la anularea participării");
        setError("A apărut o eroare necunoscută la anularea participării.");
      }
    } finally {
      setLoading(false);
      console.log("------- END: Anulare participare la eveniment -------");
    }
  };

  return { isParticipating, participate, cancelParticipation, loading, error };
};
