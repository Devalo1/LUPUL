import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts";
import { useNavigation } from "../../hooks/useNavigation";
import { 
  FaUser, 
  FaShoppingCart, 
  FaUserCog, 
  FaChartLine, 
  FaStore, 
  FaToolbox, 
  FaCalendarAlt, 
  FaInfoCircle,
  FaHandHoldingHeart,
  FaBriefcase
} from "react-icons/fa";
import { isUserAdmin, isUserAccountant, isUserSpecialist, MAIN_ADMIN_EMAIL } from "../../utils/userRoles";
import "../../styles/Navbar.css";

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleSideNav } = useNavigation();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [isSpecialist, setIsSpecialist] = useState(false);

  // Check admin, accountant, and specialist status when user changes
  useEffect(() => {
    const checkRoles = async () => {
      if (user?.uid) {
        // Check for admin role
        if (user.email === MAIN_ADMIN_EMAIL) {
          console.log("Navbar: Admin status set for primary admin email:", user.email);
          setIsAdmin(true);
        } else {
          const adminStatus = await isUserAdmin(user.uid);
          setIsAdmin(adminStatus);
        }
        
        // Check for accountant role
        const accountantStatus = await isUserAccountant(user.uid);
        console.log("Navbar: Accountant status checked:", accountantStatus);
        setIsAccountant(accountantStatus);
        
        // Check for specialist role
        const specialistStatus = await isUserSpecialist(user.uid);
        console.log("Navbar: Specialist status checked:", specialistStatus);
        setIsSpecialist(specialistStatus);
      } else {
        setIsAdmin(false);
        setIsAccountant(false);
        setIsSpecialist(false);
      }
    };

    if (user) {
      checkRoles();
    }
  }, [user]);

  // Handle navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Load cart count from localStorage or session
  useEffect(() => {
    const loadCartCount = () => {
      try {
        const cart = localStorage.getItem("cart");
        if (cart) {
          const parsedCart = JSON.parse(cart);
          setCartCount(parsedCart.length || 0);
        }
      } catch (error) {
        console.error("Error loading cart data:", error);
      }
    };

    loadCartCount();
    // Add event listener for cart updates if you have one
    window.addEventListener("cartUpdated", loadCartCount);
    
    return () => {
      window.removeEventListener("cartUpdated", loadCartCount);
    };
  }, []);

  return (
    <nav className={`nav-container fixed w-full top-0 z-50 py-3 px-4 md:px-8 ${scrolled ? "scrolled bg-gray-900 shadow-xl" : "bg-transparent"}`}>
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        {/* Left Column: Logo and mobile menu button */}
        <div className="flex items-center">
          {/* Menu button for mobile - hidden on medium and larger screens */}
          <button 
            onClick={toggleSideNav} 
            className="menu-button text-white p-1 mr-3 focus:outline-none md:hidden" 
            aria-label="Menu"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          
          {/* Logo */}
          <Link to="/" className="logo flex items-center">
            <img 
              src="/images/LC.png" 
              alt="Lupul și Corbul" 
              className="h-10 md:h-12 mr-2 transition-all"
            />
            <span className="text-lg md:text-xl font-bold text-white">Lupul și Corbul</span>
          </Link>
        </div>
        
        {/* Center Column: Desktop Navigation Links - hidden on small screens */}
        <div className="hidden md:flex items-center justify-center flex-grow mx-4">
          <div className="flex items-center space-x-6">
            <Link to="/magazin" className="nav-link text-white hover:text-amber-300 transition-colors py-2 flex flex-col items-center" title="Magazin">
              <FaStore className="text-xl" />
              <span className="text-xs mt-1">Magazin</span>
            </Link>
            <Link to="/servicii" className="nav-link text-white hover:text-amber-300 transition-colors py-2 flex flex-col items-center" title="Servicii">
              <FaToolbox className="text-xl" />
              <span className="text-xs mt-1">Servicii</span>
            </Link>
            <Link to="/events" className="nav-link text-white hover:text-amber-300 transition-colors py-2 flex flex-col items-center" title="Evenimente">
              <FaCalendarAlt className="text-xl" />
              <span className="text-xs mt-1">Evenimente</span>
            </Link>
            <Link to="/about" className="nav-link text-white hover:text-amber-300 transition-colors py-2 flex flex-col items-center" title="Despre Noi">
              <FaInfoCircle className="text-xl" />
              <span className="text-xs mt-1">Despre Noi</span>
            </Link>
            <Link to="/ong" className="nav-link text-white hover:text-amber-300 transition-colors py-2 flex flex-col items-center" title="ONG">
              <FaHandHoldingHeart className="text-xl" />
              <span className="text-xs mt-1">ONG</span>
            </Link>
            
            {/* Admin Panel link - visible for admin users */}
            {isAdmin && (
              <Link to="/admin" className="nav-link text-white hover:text-amber-300 transition-colors py-2 flex flex-col items-center" title="Admin">
                <FaUserCog className="text-xl" />
                <span className="text-xs mt-1">Admin</span>
              </Link>
            )}
            
            {/* Specialist Panel link - visible for specialist users */}
            {isSpecialist && (
              <Link to="/specialist" className="nav-link text-white hover:text-amber-300 transition-colors py-2 flex flex-col items-center" title="Specialist">
                <FaBriefcase className="text-xl" />
                <span className="text-xs mt-1">Specialist</span>
              </Link>
            )}
            
            {/* Accountant Panel link - visible for accountant users who are not admins */}
            {isAccountant && !isAdmin && (
              <Link to="/accountant/panel" className="nav-link text-white hover:text-amber-300 transition-colors py-2 flex flex-col items-center" title="Contabilitate">
                <FaChartLine className="text-xl" />
                <span className="text-xs mt-1">Contabilitate</span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Right Column: Cart and User Account */}
        <div className="flex items-center space-x-4">
          {/* Cart Link with count indicator */}
          <Link to="/cart" className="nav-link relative flex flex-col items-center" title="Coș de cumpărături">
            <FaShoppingCart className="text-white text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-xs mt-1 text-white">Coș</span>
          </Link>
          
          {/* User account button */}
          {user ? (
            <button 
              onClick={() => navigate("/dashboard")}
              className="nav-link flex flex-col items-center"
              title="Contul meu"
            >
              <FaUser className="text-white text-xl" />
              <span className="text-xs mt-1 text-white">Cont</span>
            </button>
          ) : (
            <button 
              onClick={() => navigate("/login")}
              className="login-button flex flex-col items-center px-3 py-2 rounded-md bg-amber-600 hover:bg-amber-700 transition-colors"
            >
              <FaUser className="text-white text-xl" />
              <span className="text-xs mt-1 text-white">Autentificare</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
