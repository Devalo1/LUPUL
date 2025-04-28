import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNavigation } from "../../hooks/useNavigation";
import { useAuth } from "../../contexts/AuthContext";
import { isUserAdmin, MAIN_ADMIN_EMAIL } from "../../utils/userRoles";
import "../../styles/SideNavigation.css";

const SideNavigation: React.FC = () => {
  const { isSideNavOpen, closeSideNav } = useNavigation();
  const { user, loading, logout } = useAuth();
  const [isShopExpanded, setIsShopExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Add state to track admin status
  const navigate = useNavigate();

  // Check admin status when user changes
  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        // Directly set admin status for specific admin email
        if (user.email === MAIN_ADMIN_EMAIL) {
          console.log("SideNav: Admin status set for primary admin email:", user.email);
          setIsAdmin(true); // Set isAdmin state to true
          return;
        }
        
        // Otherwise check through the admin verification function
        const adminStatus = await isUserAdmin(user.email);
        setIsAdmin(adminStatus); // Properly update isAdmin state
      }
    };

    if (user) {
      checkAdmin();
    }
  }, [user]);

  // Dezactivează scroll-ul când meniul este deschis
  useEffect(() => {
    if (isSideNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSideNavOpen]);

  // Previne propagarea click-urilor din meniu către overlay
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Navigare către o categorie
  const navigateToCategory = (category: string) => {
    if (category === "toate") {
      navigate("/magazin");
    } else {
      navigate(`/magazin?category=${category}`);
    }
    closeSideNav();
  };

  // Handler for logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      closeSideNav();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Navigare către pagina principală în funcție de starea autentificării
  const handleHomeNavigation = () => {
    if (user) {
      navigate("/user-home");
    } else {
      navigate("/");
    }
    closeSideNav();
  };

  return (
    <>
      {/* Overlay-ul care apare când meniul este deschis */}
      {isSideNavOpen && (
        <div className="side-nav-overlay" onClick={closeSideNav}></div>
      )}
      
      {/* Meniul lateral */}
      <div 
        className={`side-navigation ${isSideNavOpen ? "open" : ""}`}
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
          <button onClick={handleHomeNavigation} className="nav-item">
            <span className="nav-icon">🏠</span>
            <span>Acasă</span>
          </button>
          
          {/* Magazin cu submeniu */}
          <div className="nav-dropdown">
            <button 
              className="nav-item flex justify-between w-full"
              onClick={() => setIsShopExpanded(!isShopExpanded)}
            >
              <div className="flex items-center">
                <span className="nav-icon">🛒</span>
                <span>Magazin</span>
              </div>
              <svg 
                className={`w-5 h-5 ml-1 transition-transform ${isShopExpanded ? "rotate-180" : ""}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isShopExpanded && (
              <div className="nav-submenu">
                <button 
                  onClick={() => navigateToCategory("toate")}
                  className="nav-subitem"
                >
                  <span className="nav-subitem-icon">🔍</span>
                  <span>Toate produsele</span>
                </button>
                <button 
                  onClick={() => navigateToCategory("traditionale")}
                  className="nav-subitem"
                >
                  <span className="nav-subitem-icon">🍯</span>
                  <span>Produse tradiționale</span>
                </button>
                <button 
                  onClick={() => navigateToCategory("suplimente")}
                  className="nav-subitem"
                >
                  <span className="nav-subitem-icon">💊</span>
                  <span>Suplimente</span>
                </button>
                <button 
                  onClick={() => navigateToCategory("diverse")}
                  className="nav-subitem"
                >
                  <span className="nav-subitem-icon">🎁</span>
                  <span>Diverse</span>
                </button>
              </div>
            )}
          </div>
          
          <Link to="/servicii" onClick={closeSideNav} className="nav-item">
            <span className="nav-icon">⚕️</span>
            <span>Servicii</span>
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
          {user && (
            <>
              <div className="nav-divider"></div>
              
              <Link to="/dashboard" onClick={closeSideNav} className="nav-item">
                <span className="nav-icon">👤</span>
                <span>Contul Meu</span>
              </Link>
              
              {/* Simplified Admin Panel link - redirect to main admin page */}
              {isAdmin && (
                <Link to="/admin" onClick={closeSideNav} className="nav-item admin-link">
                  <span className="nav-icon">⚙️</span>
                  <span>Panou Administrativ</span>
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="nav-item logout-button"
              >
                <span className="nav-icon">🚪</span>
                <span>Deconectare</span>
              </button>
            </>
          )}
          
          {/* Secțiunea pentru utilizatori neautentificați */}
          {!loading && !user && (
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
