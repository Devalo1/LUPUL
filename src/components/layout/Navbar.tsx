import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNavigation } from "../../hooks/useNavigation";
import "../../styles/Header.css";
import { isUserAccountant, isUserAdmin } from "../../utils/userRoles";
import { useCart } from "../../contexts/CartContext";
import {
  Home,
  Store,
  ShoppingCart,
  CalendarHeart,
  UsersRound,
  FileText,
  UserCircle2,
  LogOut,
  BriefcaseBusiness,
  Settings,
} from "lucide-react";

const Navbar: React.FC = () => {
  const { user, logout, isAdmin: contextIsAdmin } = useAuth();
  const { toggleSideNav } = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
    const checkAccountant = async () => {
      if (user?.email) {
        // Verificăm dacă utilizatorul are rol de contabil
        const accountantStatus = await isUserAccountant(user.email);
        setIsAccountant(accountantStatus);

        // Verificăm dacă utilizatorul are rol de admin
        const adminStatus = await isUserAdmin(user.email);
        setIsAdmin(adminStatus);
      }
    };

    if (user) {
      checkAccountant(); // Verificăm și rolul de contabil și admin
    } else {
      setIsAccountant(false);
      setIsAdmin(false);
    }
  }, [user]);

  // Watch for changes in the auth context admin status
  useEffect(() => {
    if (contextIsAdmin !== undefined && user?.email) {
      setIsAdmin(contextIsAdmin);
    }
  }, [contextIsAdmin, user?.email]);

  useEffect(() => {
    // Închide meniul când se face click în afara lui
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shopMenuRef.current &&
        !shopMenuRef.current.contains(event.target as Node)
      ) {
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
      } custom-header-bg`}
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
              className="menu-button text-white focus:outline-none z-50 p-2 rounded-md menu-btn-bg"
              onClick={toggleSideNav}
              aria-label="Deschide meniul"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Coloana centrală - logo */}
          <div className="flex justify-center">
            <a
              href="#"
              onClick={navigateToHome}
              className="flex items-center justify-center"
            >
              <img
                className="h-12 w-auto"
                src="/images/LC.png"
                alt="Lupul și Corbul"
              />
            </a>
          </div>

          {/* Coloana dreapta - coș */}
          <div className="flex justify-end">
            <Link
              to="/cart"
              className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold animate-nav-pop relative cart-align"
              title="Coș de cumpărături"
            >
              <ShoppingCart className="w-9 h-9 mb-1 text-blue-200 cart-icon" />
              {/* doar icon, fără text */}
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex justify-between items-center h-16">
          {/* Logo la stânga pe desktop */}
          <a
            href="#"
            onClick={navigateToHome}
            className="flex items-center logo"
          >
            <img
              className="h-12 w-auto"
              src="/images/LC.png"
              alt="Lupul și Corbul"
            />
            <span className="ml-2 text-xl font-bold text-white">
              Lupul și Corbul
            </span>
          </a>

          {/* Meniul desktop */}
          <div className="flex items-center justify-center space-x-1 lg:space-x-4 animate-fade-in">
            {" "}
            <a
              href="#"
              onClick={navigateToHome}
              className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold shadow-md animate-nav-pop nav-text"
              title="Acasă"
            >
              <Home className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
              {/* doar icon, fără text */}
            </a>
            <div className="relative group" ref={shopMenuRef}>
              {" "}
              <button
                onClick={() => setShopMenuOpen(!shopMenuOpen)}
                className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold animate-nav-pop nav-text"
                title="Magazin"
              >
                <Store className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
                {/* doar icon, fără text */}
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${shopMenuOpen ? "rotate-180" : ""}`}
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
              {shopMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 origin-top-left bg-gradient-to-br from-blue-700 via-blue-500 to-blue-300 text-white divide-y divide-blue-200 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-dropdown-fade">
                  <div className="py-1">
                    <button
                      onClick={() => navigate("/magazin")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-600 rounded transition-all duration-200"
                    >
                      Toate produsele
                    </button>
                    <button
                      onClick={() => navigateToCategory("traditionale")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-600 rounded transition-all duration-200"
                    >
                      Produse tradiționale
                    </button>
                    <button
                      onClick={() => navigateToCategory("suplimente")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-600 rounded transition-all duration-200"
                    >
                      Suplimente
                    </button>
                    <button
                      onClick={() => navigateToCategory("diverse")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-600 rounded transition-all duration-200"
                    >
                      Diverse
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link
              to="/cart"
              className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold animate-nav-pop relative cart-align"
              title="Coș de cumpărături"
            >
              <ShoppingCart className="w-9 h-9 mb-1 text-blue-200 cart-icon" />
              {/* doar icon, fără text */}
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>
            <Link
              to="/events"
              className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold animate-nav-pop nav-text"
              title="Evenimente"
            >
              <CalendarHeart className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
              {/* doar icon, fără text */}
            </Link>{" "}
            <Link
              to="/about"
              className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold animate-nav-pop nav-text"
              title="Despre Noi"
            >
              <UsersRound className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
              {/* doar icon, fără text */}
            </Link>{" "}
            {isAccountant && (
              <Link
                to="/accounting"
                className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold animate-nav-pop nav-text"
                title="Contabilitate"
              >
                <FileText className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
                {/* doar icon, fără text */}
              </Link>
            )}{" "}
            {isAdmin && (
              <Link
                to="/admin"
                className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold animate-nav-pop nav-text"
                title="Panou Admin"
              >
                <Settings className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
                {/* doar icon, fără text */}
              </Link>
            )}{" "}
            <button
              onClick={toggleSideNav}
              className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold animate-nav-pop nav-text"
              title="Servicii"
            >
              <BriefcaseBusiness className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
              {/* doar icon, fără text */}
            </button>
            {user ? (
              <>
                {" "}
                <Link
                  to="/dashboard"
                  className="nav-link flex flex-col items-center gap-1 text-white hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-300 font-semibold animate-nav-pop nav-text"
                  title="Contul Meu"
                >
                  <UserCircle2 className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
                  {/* doar icon, fără text */}
                </Link>
                <button
                  onClick={handleLogout}
                  className="auth-button flex flex-col items-center gap-1 bg-gradient-to-r from-red-500 to-red-700 text-white hover:scale-105 px-2 py-1 rounded-md transition-all duration-300 shadow-lg animate-nav-pop nav-text"
                  title="Deconectare"
                >
                  <LogOut className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
                  {/* doar icon, fără text */}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="auth-button flex flex-col items-center gap-1 bg-gradient-to-r from-green-500 to-green-700 text-white hover:scale-105 px-2 py-1 rounded-md transition-all duration-300 shadow-lg animate-nav-pop nav-text"
                title="Autentificare"
              >
                <UserCircle2 className="w-9 h-9 mb-1 text-blue-200 nav-icon" />
                {/* doar icon, fără text */}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
