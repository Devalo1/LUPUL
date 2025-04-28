import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { handleUnknownError } from "../utils/errorTypes";
import logger from "../utils/logger";

const componentLogger = logger.createLogger("ForgotPassword");

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Vă rugăm introduceți adresa de email");
      return;
    }

    try {
      setMessage(null);
      setError(null);
      setLoading(true);
      await resetPassword(email);
      setMessage("Verificați email-ul pentru instrucțiuni de resetare a parolei");
      setEmail(""); // Clear the input field after successful submission
    } catch (err) {
      const error = handleUnknownError(err);
      if (error.code === "auth/user-not-found") {
        setError("Nu există cont cu această adresă de email");
      } else {
        setError("A apărut o eroare la trimiterea emailului de resetare");
      }
      componentLogger.error("Eroare la resetarea parolei:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Recuperare parolă</h2>
      
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Introduceți adresa de email"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "Se procesează..." : "Resetează parola"}
        </button>
      </form>

      <div className="links-container">
        <Link to="/login">Înapoi la autentificare</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;