import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts";
import logger from "../utils/logger";
import "../styles/AuthPages.css";

// Create component-specific logger
const loginLogger = logger.createLogger("LoginPage");

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

  // Check if there's a stored email in localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Te rugăm să completezi atât email-ul cât și parola.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Handle "Remember me" feature
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
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

  // Animation for form submission
  const [animateButton, setAnimateButton] = useState(false);
  const startAnimation = () => {
    setAnimateButton(true);
    setTimeout(() => setAnimateButton(false), 300);
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${loading ? "pulse" : ""}`}>
        <h1 className="auth-title">Autentificare</h1>
        
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <form className="auth-form" onSubmit={(e) => { handleLogin(e); startAnimation(); }}>
          <div className="form-group">
            <label htmlFor="email">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Email</span>
            </label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="Introduceți adresa de email"
                className="input-with-icon"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Parolă</span>
            </label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Introduceți parola"
                className="input-with-icon"
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me">Ține-mă minte</label>
            </div>
            <div className="forgot-password">
              <Link to="/forgot-password">Am uitat parola</Link>
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`auth-button primary ${animateButton ? "animate-click" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle className="spinner-path" cx="12" cy="12" r="10" fill="none" strokeWidth="4"></circle>
                </svg>
                Se procesează...
              </>
            ) : (
              "Autentificare"
            )}
          </button>
          
          <div className="divider">
            <span>sau</span>
          </div>
          
          <button 
            onClick={handleGoogleLogin} 
            className="google-button"
            disabled={loading}
            type="button"
          >
            <svg viewBox="0 0 24 24">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path fill="#4285F4" d="M21.35,11.1H12v3.73h5.51c-0.26,1.36-1.05,2.53-2.22,3.3v2.77h3.6c2.11-1.95,3.33-4.81,3.33-8.23 C22.22,12.01,21.89,11.52,21.35,11.1z"/>
                <path fill="#34A853" d="M12,22c3.04,0,5.59-1.01,7.44-2.73l-3.6-2.77c-1,0.67-2.28,1.06-3.84,1.06c-2.95,0-5.45-1.99-6.35-4.66 h-3.7v2.86C4.01,19.43,7.79,22,12,22z"/>
                <path fill="#FBBC05" d="M5.65,13.23C5.39,12.54,5.24,11.79,5.24,11c0-0.79,0.15-1.54,0.41-2.23v-2.86H2.3 C1.51,7.51,1.07,9.21,1.07,11c0,1.79,0.44,3.49,1.23,5.09L5.65,13.23z"/>
                <path fill="#EA4335" d="M12,4.57c1.66,0,3.14,0.57,4.3,1.69L19.13,3.5C17.13,1.67,14.7,0.57,12,0.57 C7.79,0.57,4.01,3.14,1.95,6.81l3.7,2.86C6.55,6.56,9.05,4.57,12,4.57z"/>
              </g>
            </svg>
            <span>Autentificare cu Google</span>
          </button>
        </form>
        
        <div className="auth-links">
          <div className="register-link">
            Nu aveți cont? <Link to="/register">Înregistrare</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
