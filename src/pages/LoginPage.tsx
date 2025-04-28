import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts";
import logger from "../utils/logger";

// Create component-specific logger
const loginLogger = logger.createLogger("LoginPage");

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Always use dashboard as the default redirection path
  const from = "/dashboard";
  
  // Debug path state in location
  loginLogger.debug("Login Page - location.state:", location.state);
  
  // Verifică dacă utilizatorul este deja autentificat
  useEffect(() => {
    if (user) {
      loginLogger.debug("Utilizator deja autentificat, redirecționare către:", from);
      
      // Force redirect to dashboard
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Te rugăm să completezi atât email-ul cât și parola.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      loginLogger.debug("Încercare de autentificare cu:", email);
      // Store dashboard as redirect path explicitly
      sessionStorage.setItem("afterLoginRedirect", from);
      
      // Acum putem folosi funcția login din context
      const result = await login(email, password);
      
      if (!result || !result.success) {
        throw new Error(result?.error?.toString() || "Autentificare eșuată");
      }
      
      // În caz de succes, redirecționăm utilizatorul
      loginLogger.debug("Autentificare reușită, redirecționare către:", from);
      navigate(from, { replace: true });
      
    } catch (err) {
      loginLogger.error("Eroare detaliată la autentificare:", err);
      
      // Gestionarea mesajelor de eroare prietenoase
      let errorMessage = "A apărut o eroare la autentificare. Vă rugăm să încercați din nou.";
      
      if (typeof err === "object" && err !== null) {
        const error = err as { code?: string; message?: string };
        if (error.code === "auth/wrong-password") {
          errorMessage = "Parolă incorectă. Vă rugăm să încercați din nou.";
        } else if (error.code === "auth/user-not-found") {
          errorMessage = "Nu există niciun cont asociat cu acest email.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "Adresa de email nu este validă.";
        } else if (error.code === "auth/too-many-requests") {
          errorMessage = "Prea multe încercări eșuate. Vă rugăm să încercați mai târziu.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      loginLogger.debug("Încercare de autentificare cu Google, redirectPath:", from);
      
      // Explicitly set dashboard as redirect path in session storage
      sessionStorage.setItem("afterLoginRedirect", from);
      sessionStorage.setItem("googleAuthOriginalPath", from);
      
      // Pasăm explicit path-ul pentru redirecționare după autentificare
      const result = await loginWithGoogle(from);
      
      if (result && !result.success) {
        throw new Error(result.error?.toString() || "Autentificare eșuată");
      }
      
      // Pentru debugging - va fi vizibil doar până la redirecționare
      loginLogger.debug("Google login initiated, will redirect after authentication");
      
    } catch (err) {
      loginLogger.error("Eroare la autentificarea cu Google:", err);
      setError("A apărut o eroare la autentificarea cu Google.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1>Autentificare</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Parolă</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Se autentifică..." : "Autentificare"}
          </button>
        </form>
        
        <div className="login-alternatives">
          <button 
            onClick={handleGoogleLogin} 
            className="btn btn-outline-secondary btn-block"
            disabled={loading}
            type="button"
          >
            <i className="fab fa-google"></i> Autentificare cu Google
          </button>
          
          <div className="text-center mt-3">
            <Link to="/forgot-password">Am uitat parola</Link>
          </div>
          
          <div className="text-center mt-2">
            Nu aveți cont? <Link to="/register">Înregistrare</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
