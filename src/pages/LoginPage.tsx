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
    
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Te rugăm să completezi toate câmpurile.");
      setLoading(false);
      return;
    }
    
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
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
          type="button"
        >
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
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
