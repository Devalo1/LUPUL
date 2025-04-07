import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase'; // Import only the Firestore database instance
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

interface EventParticipationProps {
  eventId: string;
}

const EventParticipation: React.FC<EventParticipationProps> = ({ eventId }) => {
  const { currentUser } = useAuth(); // Ensure currentUser is typed correctly
  const userUid = currentUser?.uid || '';
  const userName = currentUser?.displayName || 'Anonymous';
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Check if user is already participating
  useEffect(() => {
    const checkParticipation = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const eventDoc = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventDoc);
        
        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          const participants = eventData.participants || [];
          setIsParticipating(participants.some((p: { userId: string }) => p.userId === userUid));
        }
      } catch (err) {
        console.error('Error checking participation:', err);
        setError('Could not verify participation status');
      } finally {
        setLoading(false);
      }
    };

    checkParticipation();
  }, [currentUser, eventId, userUid]);

  // Handle participation
  const handleParticipate = async () => {
    if (!currentUser) {
      setError('Trebuie să fii autentificat pentru a participa la acest eveniment');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const eventDoc = doc(db, 'events', eventId);
      
      await updateDoc(eventDoc, {
        participants: arrayUnion({
          userId: userUid,
          name: userName,
          joinedAt: Timestamp.now()
        })
      });
      
      setIsParticipating(true);
      setSuccess('Te-ai înscris cu succes la acest eveniment!');
    } catch (err) {
      console.error('Error participating in event:', err);
      setError('A apărut o eroare la înscrierea în eveniment');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel participation
  const handleCancelParticipation = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const eventDoc = doc(db, 'events', eventId);
      const eventSnapshot = await getDoc(eventDoc);
      
      if (eventSnapshot.exists()) {
        const eventData = eventSnapshot.data();
        const updatedParticipants = (eventData.participants || [])
          .filter((p: { userId: string }) => p.userId !== userUid);
        
        await updateDoc(eventDoc, {
          participants: updatedParticipants
        });
        
        setIsParticipating(false);
        setSuccess('Participarea ta a fost anulată');
      }
    } catch (err) {
      console.error('Error canceling participation:', err);
      setError('A apărut o eroare la anularea participării');
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
      const eventDoc = doc(db, 'events', eventId);
      
      await updateDoc(eventDoc, {
        comments: arrayUnion({
          userId: userUid,
          name: userName,
          text: comment,
          createdAt: Timestamp.now()
        })
      });
      
      setComment('');
      setShowCommentForm(false);
      setSuccess('Comentariul tău a fost adăugat');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('A apărut o eroare la adăugarea comentariului');
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
        <Button variant="primary" to="/login">
          Autentificare
        </Button>
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
              {loading ? 'Se procesează...' : 'Anulează participarea'}
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setShowCommentForm(!showCommentForm)}
            >
              {showCommentForm ? 'Ascunde' : 'Adaugă comentariu'}
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
                  {loading ? 'Se trimite...' : 'Trimite'}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h3 className="font-medium mb-2">Participă la acest eveniment</h3>
          <p className="text-gray-600 mb-3">Înscrie-te pentru a participa și a primi actualizări</p>
          <Button
            variant="primary"
            onClick={handleParticipate}
            disabled={loading}
          >
            {loading ? 'Se procesează...' : 'Mă înscriu'}
          </Button>
        </>
      )}
    </div>
  );
};

export default EventParticipation;
