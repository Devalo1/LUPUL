import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavigation from '../components/navigation/SideNavigation';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleProductsClick = () => {
    navigate('/products');
  };

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  return (
    <div className="home-page">
      {/* Background image */}
      <div className="background-image"></div>

      <div className="content-overlay">
        <div className="hero-content">
          <h1>Lupul și Corbul</h1>
          <h2>Empatie, Conexiune, Echilibru</h2>
          <div className="action-buttons">
            <div className="login-buttons">
              <button 
                onClick={handleLoginClick} 
                className="login-button primary flex items-center justify-center"
              >
                LOG-IN
              </button>
              <button 
                onClick={handleRegisterClick} 
                className="login-button secondary"
              >
                Creare Cont
              </button>
            </div>
            
            <button onClick={toggleSideNav} className="services-button">
              Despre Serviciile Noastre
            </button>

            <button onClick={handleProductsClick} className="services-button">
              Vezi Produsele Noastre
            </button>
          </div>
          
          {/* Romanian Brand Banner */}
          <div className="romanian-brand-banner">
            <span 
              className="blue-text" 
              style={{ 
                fontWeight: 700, 
                textShadow: '1px 1px 3px rgba(0,0,0,0.4)', 
                letterSpacing: '0.5px',
                fontSize: '1.1em'
              }}
            >UN </span>
            <span 
              className="yellow-text" 
              style={{ 
                fontWeight: 700, 
                textShadow: '1px 1px 3px rgba(0,0,0,0.4)', 
                letterSpacing: '0.5px',
                fontSize: '1.1em'
              }}
            >BRAND ROMÂNESC </span>
            <span 
              className="red-text" 
              style={{ 
                fontWeight: 700, 
                textShadow: '1px 1px 3px rgba(0,0,0,0.4)', 
                letterSpacing: '0.5px',
                fontSize: '1.1em'
              }}
            >PENTRU ROMÂNI</span>
          </div>
        </div>
      </div>

      <SideNavigation isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />

      {/* Footer */}
      <footer className="homepage-footer">
        <p>Lupul și Corbul © 2025. Toate drepturile rezervate.</p>
      </footer>
    </div>
  );
};

export default HomePage;
