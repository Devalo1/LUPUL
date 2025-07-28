import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNavigation } from "../../hooks/useNavigation";
import { useAuth } from "../../contexts/AuthContext";
import {
  isUserAdmin,
  isUserAccountant,
  MAIN_ADMIN_EMAIL,
} from "../../utils/userRoles";
import "../../styles/SideNavigation.css";

const SideNavigation: React.FC = () => {
  const { isSideNavOpen, closeSideNav } = useNavigation();
  const { user, loading, logout, isAdmin: contextIsAdmin } = useAuth();
  const [isShopExpanded, setIsShopExpanded] = useState(false);
  const [isAdminExpanded, setIsAdminExpanded] = useState(false); // State pentru meniul admin
  const [isAdmin, setIsAdmin] = useState(false); // Add state to track admin status
  const [isAccountant, setIsAccountant] = useState(false); // Add state to track accountant status
  const navigate = useNavigate();
  // Check admin status when user changes
  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        // Directly set admin status for specific admin email
        if (user.email === MAIN_ADMIN_EMAIL) {
          console.log(
            "SideNav: Admin status set for primary admin email:",
            user.email
          );
          setIsAdmin(true); // Set isAdmin state to true
          return;
        }

        // Otherwise check through the admin verification function
        const adminStatus = await isUserAdmin(user.email);
        setIsAdmin(adminStatus); // Properly update isAdmin state
      } else {
        setIsAdmin(false);
      }
    };

    const checkAccountant = async () => {
      if (user?.email) {
        // Check if user has accountant role
        const accountantStatus = await isUserAccountant(user.email);
        setIsAccountant(accountantStatus);
      }
    };

    if (user) {
      checkAdmin();
      checkAccountant();
    } else {
      setIsAdmin(false);
      setIsAccountant(false);
    }
  }, [user]);

  // Watch for changes in the auth context admin status
  useEffect(() => {
    if (contextIsAdmin !== undefined && user?.email) {
      setIsAdmin(contextIsAdmin);
    }
  }, [contextIsAdmin, user?.email]);

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
          <button
            className="close-btn"
            onClick={closeSideNav}
            title="Închide meniul"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="currentColor"
              />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
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

          <Link to="/services" onClick={closeSideNav} className="nav-item">
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

          <Link to="/contact" onClick={closeSideNav} className="nav-item">
            <span className="nav-icon">📞</span>
            <span>Contact</span>
          </Link>

          {/* Secțiunea pentru utilizatori autentificați */}
          {user && (
            <>
              <div className="nav-divider"></div>
              <Link to="/dashboard" onClick={closeSideNav} className="nav-item">
                <span className="nav-icon">👤</span>
                <span>Contul Meu</span>
              </Link>
              {/* Sectiunea Embleme */}
              <Link
                to="/emblems/mint"
                onClick={closeSideNav}
                className="nav-item"
              >
                <span className="nav-icon">👑</span>
                <span>Embleme</span>
              </Link>
              <Link
                to="/emblems/marketplace"
                onClick={closeSideNav}
                className="nav-item"
              >
                <span className="nav-icon">💎</span>
                <span>Marketplace</span>
              </Link>
              {/* Admin panel section with detailed submenu */}
              {isAdmin && (
                <div className="nav-dropdown">
                  <button
                    className="nav-item flex justify-between w-full admin-link"
                    onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                  >
                    <div className="flex items-center">
                      <span className="nav-icon">⚙️</span>
                      <span>Admin Panel</span>
                    </div>
                    <svg
                      className={`w-5 h-5 ml-1 transition-transform ${isAdminExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isAdminExpanded && (
                    <div className="nav-submenu">
                      {/* ...existing admin menu items... */}
                      <Link
                        to="/admin"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">📊</span>
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/add-product"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">📦</span>
                        <span>Adaugă Produs</span>
                      </Link>
                      <Link
                        to="/admin/categories"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">🏷️</span>
                        <span>Categorii</span>
                      </Link>
                      <Link
                        to="/admin/inventory"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">📋</span>
                        <span>Stocuri</span>
                      </Link>
                      <Link
                        to="/admin/add-event"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">🌟</span>
                        <span>Adaugă Eveniment</span>
                      </Link>
                      <Link
                        to="/admin/appointments"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">📆</span>
                        <span>Programări</span>
                      </Link>
                      <Link
                        to="/admin/users"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">👥</span>
                        <span>Utilizatori</span>
                      </Link>
                      <Link
                        to="/admin/orders"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">📝</span>
                        <span>Comenzi</span>
                      </Link>
                      <Link
                        to="/admin/articles"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">📄</span>
                        <span>Articole</span>
                      </Link>
                      <Link
                        to="/admin/settings"
                        onClick={closeSideNav}
                        className="nav-subitem"
                      >
                        <span className="nav-subitem-icon">🔧</span>
                        <span>Setări</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}{" "}
              {/* Accounting panel section for accountants only */}
              {isAccountant && (
                <Link
                  to="/accounting"
                  onClick={closeSideNav}
                  className="nav-item"
                >
                  <span className="nav-icon">📊</span>
                  <span>Contabilitate</span>
                </Link>
              )}
              <button onClick={handleLogout} className="nav-item logout-button">
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
