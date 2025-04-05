import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Header.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logOut, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debugging: Verificăm dacă Navbar este montat
  useEffect(() => {
    console.log('Navbar mounted');
    console.log('Navbar: currentUser:', currentUser);
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/'); // Redirecționează utilizatorul la pagina principală după deconectare
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('A apărut o eroare la deconectare. Vă rugăm încercați din nou.');
    }
  };

  return (
    <div id="navbar-container">
      <header
        id="header-container"
        className={`header-container ${scrolled ? 'scrolled' : ''}`}
        style={{ backgroundColor: '#2A9D8F' }} // Albastru verzui plăcut
      >
        <nav id="navbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            {/* Hamburger button for small screens */}
            <button
              id="hamburger-button"
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img className="h-12 w-auto" src="/images/LC.png" alt="Lupul și Corbul" />
              <span className="ml-2 text-xl font-bold text-white hidden md:block">Lupul și Corbul</span>
            </Link>

            {/* Navigation links for larger screens */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-white hover:text-gray-200">
                Acasă
              </Link>
              <Link to="/shop" className="text-white hover:text-gray-200">
                Produse
              </Link>
              <Link to="/events" className="text-white hover:text-gray-200">
                Evenimente
              </Link>
              <Link to="/about" className="text-white hover:text-gray-200">
                ONG
              </Link>
              {currentUser ? (
                <>
                  <Link to="/dashboard" className="text-white hover:text-gray-200 font-medium">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-gray-200 font-medium"
                  >
                    Deconectare
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-white hover:text-gray-200">
                  Autentificare
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar menu for small screens */}
          <div
            className={`fixed top-0 left-0 h-full bg-gray-800 text-white transform ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out z-50`}
          >
            <button
              className="absolute top-4 right-4 text-white focus:outline-none"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col items-start p-6 space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Acasă
              </Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)}>
                Produse
              </Link>
              <Link to="/events" onClick={() => setIsMenuOpen(false)}>
                Evenimente
              </Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>
                ONG
              </Link>
              {currentUser ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Deconectare
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  Autentificare
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
