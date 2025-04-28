import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // Correct import
import { useNavigation } from "../../hooks/useNavigation"; // Correct import
import "../../styles/Header.css";
import { isUserAdmin, isUserSpecialist, MAIN_ADMIN_EMAIL } from "../../utils/userRoles";
import { useCart } from "../../contexts/CartContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth(); // Removed unused loading
  const { toggleSideNav } = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // State to track admin status
  const [isSpecialist, setIsSpecialist] = useState(false); // State to track specialist status
  const { totalItems } = useCart();
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const shopMenuRef = useRef<HTMLDivElement>(null);

  // Function to navigate to the appropriate home page based on authentication status
  const navigateToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      // Navighează către UserHome când utilizatorul este autentificat
      navigate("/user-home");
    } else {
      navigate("/");
    }
  };
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        // Directly set admin status for specific admin email
        if (user.email === MAIN_ADMIN_EMAIL) {
          console.log("Admin status set for primary admin email:", user.email);
          setIsAdmin(true); // Set the isAdmin state to true here
          return;
        }
        
        // Otherwise check through the admin verification function
        const isAdmin = await isUserAdmin(user.uid);
        setIsAdmin(isAdmin); // Update isAdmin state based on the result
      }
    };

    const checkSpecialist = async () => {
      if (user?.uid) {
        // Verificăm dacă utilizatorul are rol de specialist
        const specialistStatus = await isUserSpecialist(user.uid);
        console.log("Specialist status checked in Navbar:", specialistStatus);
        setIsSpecialist(specialistStatus);
      }
    };

    if (user) {
      checkAdmin();
      checkSpecialist(); // Verificăm și rolul de specialist
    } else {
      setIsAdmin(false);
      setIsSpecialist(false);
    }
  }, [user]);

  useEffect(() => {
    // Închide meniul când se face click în afara lui
    const handleClickOutside = (event: MouseEvent) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target as Node)) {
        setShopMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("A apărut o eroare la deconectare. Vă rugăm încercați din nou.");
    }
  };

  const navigateToCategory = (category: string) => {
    navigate(`/magazin?category=${category}`);
    setShopMenuOpen(false);
  };

  return (
    <header
      className={`header-container ${scrolled ? "scrolled" : ""} ${
        isHomePage && !scrolled ? "bg-transparent" : ""
      }`}
      style={{
        backgroundColor: isHomePage && !scrolled ? "transparent" : undefined,
        zIndex: 999,
      }}
    >
      {/* Elemente decorative românești */}
      <div className="romanian-motif left"></div>
      <div className="romanian-motif right"></div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-50">
        {/* Mobile navigation - trei coloane cu lățimi egale */}
        <div className="md:hidden grid grid-cols-3 items-center h-16 w-full">
          {/* Coloana stânga - meniu hamburger */}
          <div className="flex justify-start">
            <button
              className="menu-button text-white focus:outline-none z-50 p-3 rounded-md"
              onClick={toggleSideNav}
              aria-label="Deschide meniul"
              style={{ 
                backgroundColor: "rgba(0,0,0,0.3)",
                minWidth: "44px",
                minHeight: "44px",
                WebkitTapHighlightColor: "transparent"
              }}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Coloana centrală - logo */}
          <div className="flex justify-center">
            <a href="#" onClick={navigateToHome} className="flex items-center justify-center">
              <img className="h-12 w-auto" src="/images/LC.png" alt="Lupul și Corbul" />
            </a>
          </div>
          
          {/* Coloana dreapta - coș */}
          <div className="flex justify-end">
            <Link to="/cart" className="text-white relative p-2" style={{ 
              minWidth: "44px", 
              minHeight: "44px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              WebkitTapHighlightColor: "transparent" 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex justify-between items-center h-16">
          {/* Logo la stânga pe desktop */}
          <a href="#" onClick={navigateToHome} className="flex items-center logo">
            <img className="h-12 w-auto" src="/images/LC.png" alt="Lupul și Corbul" />
            <span className="ml-2 text-xl font-bold text-white">Lupul și Corbul</span>
          </a>

          {/* Meniul desktop */}
          <div className="flex items-center justify-center space-x-1 lg:space-x-4">
            <a href="#" onClick={navigateToHome} className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
              Acasă
            </a>
            
            {/* Dropdown Magazin */}
            <div className="relative" ref={shopMenuRef}>
              <button 
                onClick={() => setShopMenuOpen(!shopMenuOpen)}
                className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300 flex items-center"
              >
                Magazin
                <svg 
                  className={`ml-1 h-4 w-4 transition-transform ${shopMenuOpen ? "rotate-180" : ""}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {shopMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                     style={{ backgroundColor: "rgba(60, 60, 60, 0.95)" }}>
                  <div className="py-1">
                    <button
                      onClick={() => navigate("/magazin")}
                      className="text-white block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      Toate produsele
                    </button>
                    <button
                      onClick={() => navigateToCategory("traditionale")}
                      className="text-white block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      Produse tradiționale
                    </button>
                    <button
                      onClick={() => navigateToCategory("suplimente")}
                      className="text-white block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      Suplimente
                    </button>
                    <button
                      onClick={() => navigateToCategory("diverse")}
                      className="text-white block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      Diverse
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/events" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
              Evenimente
            </Link>
            <Link to="/about" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
              Despre Noi
            </Link>
            <Link to="/cart" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300 relative">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
                Admin Panel
              </Link>
            )}
            {isSpecialist && (
              <Link to="/specialist" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
                Panou Specialist
              </Link>
            )}
            <button 
              onClick={toggleSideNav} 
              className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300"
            >
              Servicii
            </button>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
                  Contul Meu
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="auth-button text-white hover:text-gray-200 px-4 py-2 rounded-md transition duration-300"
                >
                  Deconectare
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="auth-button text-white hover:text-white px-4 py-2 rounded-md transition duration-300 shadow-md"
              >
                Autentificare
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
