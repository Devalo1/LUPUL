import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import '../../styles/Header.css';
import { isUserAdmin } from '../../utils/userRoles';
import { useCart } from '../../contexts/CartContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const { toggleSideNav } = useNavigation(); // Folosim hook-ul useNavigation
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser?.email) {
        const admin = await isUserAdmin(currentUser.email);
        setIsAdmin(admin);
      }
    };

    if (currentUser) {
      checkAdmin();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('A apărut o eroare la deconectare. Vă rugăm încercați din nou.');
    }
  };

  return (
    <header
      className={`header-container ${scrolled ? 'scrolled' : ''} ${
        isHomePage && !scrolled ? 'bg-transparent' : ''
      }`}
      style={{
        backgroundColor: isHomePage && !scrolled ? 'transparent' : undefined,
        zIndex: 2,
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
              className="menu-button text-white focus:outline-none z-50"
              onClick={toggleSideNav}
              aria-label="Deschide meniul"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Coloana centrală - logo */}
          <div className="flex justify-center">
            <Link to="/" className="flex items-center justify-center">
              <img className="h-12 w-auto" src="/images/LC.png" alt="Lupul și Corbul" />
            </Link>
          </div>
          
          {/* Coloana dreapta - coș */}
          <div className="flex justify-end">
            <Link to="/cart" className="text-white relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
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
          <Link to="/" className="flex items-center logo">
            <img className="h-12 w-auto" src="/images/LC.png" alt="Lupul și Corbul" />
            <span className="ml-2 text-xl font-bold text-white">Lupul și Corbul</span>
          </Link>

          {/* Meniul desktop */}
          <div className="flex items-center justify-center space-x-1 lg:space-x-4">
            <Link to="/" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
              Acasă
            </Link>
            <Link to="/products" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
              Produse
            </Link>
            <Link to="/events" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
              Evenimente
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
            {isAuthenticated && isAdmin && (
              <Link to="/admin" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
                Admin Panel
              </Link>
            )}
            <button 
              onClick={toggleSideNav} 
              className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300"
            >
              Servicii
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link text-white hover:text-gray-200 px-3 py-2 rounded-md transition duration-300">
                  Dashboard
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
