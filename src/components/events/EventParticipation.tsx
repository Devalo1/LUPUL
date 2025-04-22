import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { db } from "../../firebase"; // Import only the Firestore database instance
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";
import logger from "../../utils/logger";

// Create a component-specific logger instance
const eventLogger = logger.createLogger("EventParticipation");

interface EventParticipationProps {
  eventId: string;
}

interface ParticipantInfo {
  age: string;
  expectations: string;
}

const EventParticipation: React.FC<EventParticipationProps> = ({ eventId }) => {
  const { currentUser } = useAuth(); // Using our extracted hook
  const userUid = currentUser?.uid || "";
  const userName = currentUser?.displayName || "Anonymous";
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo>({
    age: "",
    expectations: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setParticipantInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if user is already participating
  useEffect(() => {
    const checkParticipation = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const eventDoc = doc(db, "events", eventId);
        const eventSnapshot = await getDoc(eventDoc);
        
        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          const participants = eventData.participants || [];
          setIsParticipating(participants.some((p: { userId: string }) => p.userId === userUid));
        }
      } catch (err) {
        eventLogger.error("Error checking participation:", err);
        setError("Could not verify participation status");
      } finally {
        setLoading(false);
      }
    };

    checkParticipation();
  }, [currentUser, eventId, userUid]);

  // Handle participation
  const handleParticipate = async () => {
    if (!currentUser) {
      setError("Trebuie să fii autentificat pentru a participa la acest eveniment");
      return;
    }

    if (!participantInfo.age || !participantInfo.expectations) {
      setError("Te rugăm să completezi toate câmpurile obligatorii");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const eventDoc = doc(db, "events", eventId);
      const eventSnapshot = await getDoc(eventDoc);
      
      if (!eventSnapshot.exists()) {
        throw new Error("Evenimentul nu a fost găsit");
      }
      
      const eventData = eventSnapshot.data();
      const eventTitle = eventData.title || "Eveniment necunoscut";
      
      // Add the participant to the event
      await updateDoc(eventDoc, {
        participants: arrayUnion({
          userId: userUid,
          name: userName,
          joinedAt: Timestamp.now(),
          age: participantInfo.age,
          expectations: participantInfo.expectations
        })
      });
      
      // Calculate remaining seats
      const currentParticipants = (eventData.participants || []).length + 1;
      const totalCapacity = eventData.capacity || 100;
      const remainingSeats = Math.max(0, totalCapacity - currentParticipants);
      
      // Send participant details email
      try {
        eventLogger.info("Sending participant details email", {
          eventTitle,
          participant: {
            fullName: userName || currentUser.displayName || "Participant",
            email: currentUser.email,
            age: participantInfo.age,
            expectations: participantInfo.expectations
          },
          remainingSeats
        });
        
        // Apelează direct URL-ul funcției Firebase în loc de funcția callable
        const response = await fetch("https://us-central1-lupulcorbul.cloudfunctions.net/sendParticipantDetailsEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventTitle,
            participant: {
              fullName: userName || currentUser.displayName || "Participant",
              email: currentUser.email,
              age: participantInfo.age,
              expectations: participantInfo.expectations
            },
            remainingSeats
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          eventLogger.error("Error response from server:", errorText);
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        eventLogger.info("Participant details email sent successfully:", result);
      } catch (emailError) {
        eventLogger.error("Error sending participant details email:", emailError);
        // Continue execution even if email fails
      }
      
      setIsParticipating(true);
      setSuccess("Te-ai înscris cu succes la acest eveniment!");
    } catch (err) {
      eventLogger.error("Error participating in event:", err);
      setError("A apărut o eroare la înscrierea în eveniment");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel participation
  const handleCancelParticipation = async () => {
    if (!currentUser) {
      setError("Trebuie să fii autentificat pentru a anula participarea.");
      return;
    }

    // Confirm before canceling
    if (!window.confirm("Ești sigur că vrei să anulezi participarea la acest eveniment?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if user is properly authenticated
      if (!userUid) {
        throw new Error("Sesiune de autentificare invalidă");
      }

      eventLogger.info("Attempting to cancel participation for user:", userUid);
      const eventDoc = doc(db, "events", eventId);
      
      // First, get the participant object to remove
      const eventSnapshot = await getDoc(eventDoc);
      
      if (eventSnapshot.exists()) {
        const eventData = eventSnapshot.data();
        const participants = eventData.participants || [];
        eventLogger.debug("Current participants:", participants.length);
        
        try {
          // First attempt: Try removing from registeredUsers array (simpler)
          if (eventData.registeredUsers && eventData.registeredUsers.includes(userUid)) {
            eventLogger.info("Removing user from registeredUsers array");
            await updateDoc(eventDoc, {
              registeredUsers: arrayRemove(userUid)
            });
            setIsParticipating(false);
            setSuccess("Înscrierea ta a fost anulată cu succes");
            return; // Exit early if successful
          }
          
          // Second attempt: Try to find and remove participant object
          eventLogger.debug("Looking for participant object to remove");
          let participantToRemove = participants.find((p: { userId: string }) => p.userId === userUid);
          
          if (participantToRemove) {
            eventLogger.info("Found participant to remove, using arrayRemove");
            await updateDoc(eventDoc, {
              participants: arrayRemove(participantToRemove)
            });
            setIsParticipating(false);
            setSuccess("Participarea ta a fost anulată cu succes");
          } else {
            // Try a different approach - replace the entire array
            eventLogger.debug("Participant not found with direct match, trying array replacement");
            const updatedParticipants = participants.filter((p: { userId: string }) => p.userId !== userUid);
            
            if (updatedParticipants.length < participants.length) {
              // Only update if we actually filtered something out
              await updateDoc(eventDoc, {
                participants: updatedParticipants
              });
              setIsParticipating(false);
              setSuccess("Participarea ta a fost anulată cu succes");
            } else {
              throw new Error("Nu am putut găsi înregistrarea ta în eveniment");
            }
          }
        } catch (updateErr) {
          eventLogger.error("Error during Firestore update:", updateErr);
          
          if (updateErr && typeof updateErr === "object" && "code" in updateErr && 
              (updateErr as { code?: string }).code === "permission-denied") {
            throw new Error("Nu ai permisiunea necesară pentru această operație");
          } else {
            throw updateErr; // Re-throw for outer catch
          }
        }
      } else {
        setError("Evenimentul nu a fost găsit în baza de date");
      }
    } catch (err) {
      eventLogger.error("Error canceling participation:", err);
      
      // Handle specific firebase errors
      if (err && typeof err === "object" && "code" in err && 
          (err as { code?: string }).code === "permission-denied") {
        setError("Nu ai permisiunea să anulezi această participare. Te rugăm să contactezi administratorul.");
      } else if (err instanceof Error && err.message && err.message.includes("permissions")) {
        setError("Problemă de permisiuni. Te rugăm să te reautentifici și să încerci din nou.");
      } else {
        setError("A apărut o eroare la anularea înscrierii. Te rugăm să încerci din nou.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle adding comment
  const handleAddComment = async () => {
    if (!currentUser || !comment.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const eventDoc = doc(db, "events", eventId);
      
      await updateDoc(eventDoc, {
        comments: arrayUnion({
          userId: userUid,
          name: userName,
          text: comment,
          createdAt: Timestamp.now()
        })
      });
      
      setComment("");
      setShowCommentForm(false);
      setSuccess("Comentariul tău a fost adăugat");
    } catch (err) {
      eventLogger.error("Error adding comment:", err);
      setError("A apărut o eroare la adăugarea comentariului");
    } finally {
      setLoading(false);
    }
  };

  // Not logged in
  if (!currentUser) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Participă la acest eveniment</h3>
        <p className="text-gray-600 mb-3">
          Autentifică-te pentru a te înscrie, a lăsa comentarii și a face check‑in la evenimente.
        </p>
        <a href="/login" className="inline-block py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          Autentificare
        </a>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {isParticipating ? (
        <>
          <div className="mb-4">
            <h3 className="font-medium mb-2">Ești înscris la acest eveniment</h3>
            <p className="text-gray-600">Vei primi detalii și actualizări prin email</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="secondary" 
              onClick={handleCancelParticipation}
              disabled={loading}
            >
              {loading ? "Se procesează..." : "Anulează participarea"}
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setShowCommentForm(!showCommentForm)}
            >
              {showCommentForm ? "Ascunde" : "Adaugă comentariu"}
            </Button>
          </div>
          
          {showCommentForm && (
            <div className="mt-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Scrie un comentariu..."
                rows={4}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleAddComment}
                  disabled={loading || !comment.trim()}
                  className="mt-2"
                >
                  {loading ? "Se trimite..." : "Trimite"}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h3 className="font-medium mb-2">Participă la acest eveniment</h3>
          <p className="text-gray-600 mb-3">Înscrie-te pentru a participa și a primi actualizări</p>
          
          {/* Form for participant info */}
          <div className="mb-4">
            <label htmlFor="age" className="block text-gray-700 font-medium mb-2">
              Vârsta participantului *
            </label>
            <input
              type="text"
              id="age"
              name="age"
              value={participantInfo.age}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduceți vârsta"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="expectations" className="block text-gray-700 font-medium mb-2">
              Ce așteptări ai de la această experiență? *
            </label>
            <textarea
              id="expectations"
              name="expectations"
              value={participantInfo.expectations}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrieți așteptările dumneavoastră..."
            />
          </div>

          <Button
            variant="primary"
            onClick={handleParticipate}
            disabled={loading}
          >
            {loading ? "Se procesează..." : "Mă înscriu"}
          </Button>
        </>
      )}
    </div>
  );
};

export default EventParticipation;
