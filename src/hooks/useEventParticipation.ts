import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

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
      try {
        const eventDoc = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventDoc);
        if (eventSnapshot.exists()) {
          const participants = eventSnapshot.data().participants || [];
          setIsParticipating(participants.some((p: { userId: string }) => p.userId === userId));
        }
      } catch (err) {
        console.error('Error checking participation:', err);
        setError('A apărut o eroare la verificarea participării.');
      }
    };

    checkParticipation();
  }, [eventId, userId]);

  const participate = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventDoc = doc(db, 'events', eventId);
      await updateDoc(eventDoc, {
        participants: arrayUnion({ userId, name: userName, joinedAt: Timestamp.now() }),
      });
      setIsParticipating(true);
    } catch (err) {
      console.error('Error participating in event:', err);
      setError('A apărut o eroare la înscriere.');
    } finally {
      setLoading(false);
    }
  };

  const cancelParticipation = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventDoc = doc(db, 'events', eventId);
      await updateDoc(eventDoc, {
        participants: arrayRemove({ userId, name: userName }),
      });
      setIsParticipating(false);
    } catch (err) {
      console.error('Error canceling participation:', err);
      setError('A apărut o eroare la anularea participării.');
    } finally {
      setLoading(false);
    }
  };

  return { isParticipating, participate, cancelParticipation, loading, error };
};
