import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth"; // Ensure correct path
import { useEventParticipation } from "../../hooks/useEventParticipation";
import { Participant as _Participant } from "../../types/events"; // Changed from ParticipantInfo to Participant

// Create a compatible interface that matches what the component expects
interface ParticipantInfo {
  name: string;
  email: string;
  phone: string;
  additionalInfo?: string;
}

interface EventParticipationProps {
  eventId: string;
  onRegistrationComplete?: () => void;
}

const EventParticipation: React.FC<EventParticipationProps> = ({ 
  eventId, 
  onRegistrationComplete 
}) => {
  const { user } = useAuth();
  const { registerForEvent, loading, error } = useEventParticipation();
  const [formData, setFormData] = useState<ParticipantInfo>({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    additionalInfo: ""
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ParticipantInfo) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      setFormError("Completează toate câmpurile obligatorii");
      return;
    }
    
    try {
      await registerForEvent(eventId, formData);
      // Show success message
      alert("Mulțumim pentru înscriere! Vei primi un email de confirmare.");
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (err) {
      console.error("Registration error in component:", err);
      if (err instanceof Error) {
        setFormError(err.message);
      } else if (error) {
        setFormError(error);
      } else {
        setFormError("A apărut o eroare la înscrierea la eveniment");
      }
    }
  };

  return (
    <div className="event-participation-form">
      <h3>Înscrie-te la acest eveniment</h3>
      
      {!user && (
        <div className="alert alert-warning">
          Trebuie să fii autentificat pentru a te înscrie la evenimente. 
          <a href="/login" className="ml-2">Autentifică-te</a>
        </div>
      )}
      
      {formError && (
        <div className="alert alert-danger">{formError}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nume complet *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            required
            disabled={loading || !user}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            required
            disabled={loading || !user}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Telefon *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control"
            required
            disabled={loading || !user}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="additionalInfo">Informații suplimentare</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            className="form-control"
            disabled={loading || !user}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !user}
        >
          {loading ? "Se procesează..." : "Înscrie-te"}
        </button>
      </form>
    </div>
  );
};

export default EventParticipation;
