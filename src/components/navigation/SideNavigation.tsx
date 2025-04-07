import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/SideNavigation.css';

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ isOpen, onClose }) => {
  // Adăugăm un efect pentru a dezactiva scroll-ul corpului când meniul este deschis
  useEffect(() => {
    if (isOpen) {
      // Dezactivăm scroll-ul când meniul este deschis
      document.body.style.overflow = 'hidden';
    } else {
      // Reactivăm scroll-ul când meniul este închis
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup funcția când componenta se demontează
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Prevenim propagarea evenimentelor de la menu la overlay
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Overlay to capture clicks outside the menu */}
      {isOpen && <div className="side-nav-overlay" onClick={onClose}></div>}
      
      <div 
        className={`side-navigation ${isOpen ? 'open' : ''}`}
        onClick={handleMenuClick}
      >
        <div className="side-nav-header">
          <h2>Paginile Principale</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
            </svg>
          </button>
        </div>
        
        <nav className="side-nav-links">
          <Link to="/about" onClick={onClose} className="nav-item">
            <span className="nav-icon">ℹ️</span>
            <span>Despre Noi</span>
          </Link>
          <Link to="/products" onClick={onClose} className="nav-item">
            <span className="nav-icon">🛒</span>
            <span>Produse</span>
          </Link>
          <Link to="/ong" onClick={onClose} className="nav-item">
            <span className="nav-icon">🤝</span>
            <span>ONG</span>
          </Link>
          <Link to="/events" onClick={onClose} className="nav-item">
            <span className="nav-icon">📅</span>
            <span>Evenimente</span>
          </Link>
        </nav>
        
        <div className="side-nav-footer">
          <p>Lupul și Corbul © {new Date().getFullYear()}</p>
        </div>
      </div>
    </>
  );
};

export default SideNavigation;
