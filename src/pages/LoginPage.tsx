import React, { useState } from 'react';
// Update import path
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPages.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    console.log('Încercare de autentificare cu:', email);

    try {
      await login(email, password);
      console.log('Autentificare reușită!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Eroare detaliată la autentificare:', error);
      
      let message = `Eroare la autentificare: ${error.code || 'necunoscută'}`;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Email sau parolă incorectă.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Formatul email-ului este invalid.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Prea multe încercări eșuate. Încercați mai târziu.";
      }
      
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    console.log('Încercare de autentificare cu Google');

    try {
      await loginWithGoogle();
      console.log('Autentificare Google reușită!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Eroare detaliată la autentificare cu Google:', error);
      setErrorMessage(`Autentificarea cu Google a eșuat: ${error.code || error.message || 'Eroare necunoscută'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Autentificare</h2>
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? "Se procesează..." : "Autentificare"}
          </button>
        </form>
        
        <div className="divider">
          <span>sau</span>
        </div>
        
        <button 
          onClick={handleGoogleLogin} 
          className="google-button"
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" fill="#4285F4"></path>
            </g>
          </svg>
          <span>Autentificare cu Google</span>
        </button>
        
        <div className="auth-links">
          <Link to="/register">Nu ai cont? Înregistrează-te</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
