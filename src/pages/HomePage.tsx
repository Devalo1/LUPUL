import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SideNavigation from '../components/navigation/SideNavigation';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  return (
    <div className="home-page">
      <div className="background-image"></div>
      <div className="content-overlay">
        <div className="hero-content">
          <h1>Lupul și Corbul</h1>
          <h2>Empatie, Conexiune, Echilibru</h2>
          
          <div className="action-buttons">
            <div className="login-buttons">
              <Link to="/login" className="login-button primary">
                Autentificare
              </Link>
              <Link to="/register" className="login-button secondary">
                Creare Cont
              </Link>
            </div>
            
            <button onClick={toggleSideNav} className="services-button">
              Despre Serviciile Noastre
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <SideNavigation isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
    </div>
  );
};

export default HomePage;
