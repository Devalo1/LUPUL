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

      // Important: We'll use a transaction to ensure all operations succeed or fail together
      try {
        // Step 1: Update the event document first to add user to registeredUsers array
        await updateDoc(eventRef, {
          registeredUsers: arrayUnion(user.uid)
        });
        
        // Step 2: Create registration record
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
        
        // Add registration to Firestore - this would fail if security rules are incorrect
        const docRef = await addDoc(collection(db, "eventRegistrations"), registrationData);
        
        // Step 3: Send email notification
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
      } catch (transactionError) {
        console.error("Error in registration transaction:", transactionError);
        // If we get here, something failed during the transaction
        
        // Try to roll back the user from registeredUsers if that operation succeeded
        try {
          // Get the current list of registered users
          const updatedEventSnap = await getDoc(eventRef);
          if (updatedEventSnap.exists()) {
            const updatedData = updatedEventSnap.data();
            const registeredUsers = updatedData.registeredUsers || [];
            
            // If the user was added, remove them
            if (registeredUsers.includes(user.uid)) {
              const newRegisteredUsers = registeredUsers.filter((uid: string) => uid !== user.uid);
              await updateDoc(eventRef, { registeredUsers: newRegisteredUsers });
            }
          }
        } catch (rollbackError) {
          console.error("Failed to roll back registration:", rollbackError);
          // Continue to throw the original error
        }
        
        // Re-throw the original error
        throw transactionError;
      }
    } catch (err) {
      console.error("Error registering for event:", err);
      
      // Provide more specific error messages based on error types
      if (err instanceof Error) {
        // Check for Firebase permission errors
        if (err.message.includes("permission") || err.message.includes("denied") || 
            err.message.includes("insufficient")) {
          setError("Nu ai permisiuni suficiente pentru înscriere. Te rugăm să încerci din nou sau să contactezi administratorul.");
        } else {
          setError(err.message);
        }
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
