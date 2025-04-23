import { useState } from "react";
import { collection, addDoc, doc, getDoc, query, where, getDocs, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, auth, functions } from "../firebase"; // Importul corect al Firebase

// Create the ParticipantInfo interface here since it doesn't exist in the types file
interface ParticipantInfo {
  name: string;
  email: string;
  phone: string;
  additionalInfo?: string;
}

export const useEventParticipation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerForEvent = async (eventId: string, participantInfo: ParticipantInfo) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Trebuie să fii autentificat pentru a te înscrie la evenimente");
      }
      
      // Check if event exists
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (!eventSnap.exists()) {
        throw new Error("Evenimentul nu a fost găsit");
      }
      
      // Get event details for email notification
      const eventData = eventSnap.data();
      
      // Check if user is already registered
      const registrationsRef = collection(db, "eventRegistrations");
      const q = query(
        registrationsRef,
        where("eventId", "==", eventId),
        where("userId", "==", user.uid)
      );
      
      const existingRegistrations = await getDocs(q);
      if (!existingRegistrations.empty) {
        throw new Error("Ești deja înscris la acest eveniment");
      }
      
      // Create registration record
      const registrationData = {
        eventId,
        eventTitle: eventData.title,
        userId: user.uid,
        userEmail: user.email,
        name: participantInfo.name,
        email: participantInfo.email,
        phone: participantInfo.phone,
        additionalInfo: participantInfo.additionalInfo || "",
        createdAt: serverTimestamp(),
        status: "pending"
      };
      
      // Add registration to Firestore
      const docRef = await addDoc(collection(db, "eventRegistrations"), registrationData);
      
      // Update the event document to include this user in registeredUsers array
      await updateDoc(eventRef, {
        registeredUsers: arrayUnion(user.uid)
      });
      
      // Send notification email to admin
      try {
        const sendAdminNotification = httpsCallable(functions, "sendEventRegistrationEmail");
        await sendAdminNotification({
          registrationId: docRef.id,
          eventId,
          eventTitle: eventData.title,
          participantName: participantInfo.name,
          participantEmail: participantInfo.email,
          participantPhone: participantInfo.phone,
          additionalInfo: participantInfo.additionalInfo || "",
        });
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
        // We don't throw here as the registration itself was successful
      }
      
      setLoading(false);
      return docRef.id;
    } catch (err) {
      console.error("Error registering for event:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("A apărut o eroare la înscrierea la eveniment");
      }
      setLoading(false);
      throw err; // Re-throw to handle in the component
    }
  };

  return {
    registerForEvent,
    loading,
    error
  };
};

export default useEventParticipation;
