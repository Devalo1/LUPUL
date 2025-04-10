import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/SideNavigation.css';

const SideNavigation: React.FC = () => {
  const { isSideNavOpen, closeSideNav } = useNavigation();
  const { isAuthenticated, logout } = useAuth();

  // Dezactivează scroll-ul când meniul este deschis
  useEffect(() => {
    if (isSideNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSideNavOpen]);

  // Previne propagarea click-urilor din meniu către overlay
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Overlay-ul care apare când meniul este deschis */}
      {isSideNavOpen && (
        <div className="side-nav-overlay" onClick={closeSideNav}></div>
      )}
      
      {/* Meniul lateral */}
      <div 
        className={`side-navigation ${isSideNavOpen ? 'open' : ''}`}
        onClick={handleMenuClick}
      >
        <div className="side-nav-header">
          <h2>Navigare</h2>
          <button className="close-btn" onClick={closeSideNav}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
            </svg>
          </button>
        </div>
        
        <nav className="side-nav-links">
          {/* Link-uri principale */}
          <Link to="/" onClick={closeSideNav} className="nav-item">
            <span className="nav-icon">🏠</span>
            <span>Acasă</span>
          </Link>
          
          <Link to="/products" onClick={closeSideNav} className="nav-item">
            <span className="nav-icon">🛒</span>
            <span>Produse</span>
          </Link>
          
          <Link to="/events" onClick={closeSideNav} className="nav-item">
            <span className="nav-icon">📅</span>
            <span>Evenimente</span>
          </Link>
          
          <Link to="/about" onClick={closeSideNav} className="nav-item">
            <span className="nav-icon">ℹ️</span>
            <span>Despre Noi</span>
          </Link>
          
          <Link to="/ong" onClick={closeSideNav} className="nav-item">
            <span className="nav-icon">🤝</span>
            <span>ONG</span>
          </Link>

          <Link to="/cart" onClick={closeSideNav} className="nav-item">
            <span className="nav-icon">🛍️</span>
            <span>Coș de cumpărături</span>
          </Link>
          
          {/* Secțiunea pentru utilizatori autentificați */}
          {isAuthenticated && (
            <>
              <div className="nav-divider"></div>
              
              <Link to="/dashboard" onClick={closeSideNav} className="nav-item">
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </Link>
              
              <Link to="/user-home" onClick={closeSideNav} className="nav-item">
                <span className="nav-icon">👤</span>
                <span>Contul Meu</span>
              </Link>
              
              <button
                onClick={() => {
                  logout();
                  closeSideNav();
                }}
                className="nav-item logout-button"
              >
                <span className="nav-icon">🚪</span>
                <span>Deconectare</span>
              </button>
            </>
          )}
          
          {/* Secțiunea pentru utilizatori neautentificați */}
          {!isAuthenticated && (
            <>
              <div className="nav-divider"></div>
              
              <Link to="/login" onClick={closeSideNav} className="nav-item">
                <span className="nav-icon">🔑</span>
                <span>Autentificare</span>
              </Link>
              
              <Link to="/register" onClick={closeSideNav} className="nav-item">
                <span className="nav-icon">📝</span>
                <span>Înregistrare</span>
              </Link>
            </>
          )}
        </nav>
        
        <div className="side-nav-footer">
          <p>Lupul și Corbul © {new Date().getFullYear()}</p>
        </div>
      </div>
    </>
  );
};

export default SideNavigation;
