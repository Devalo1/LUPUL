import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContextUtils';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
            <span>Lupul și Corbul</span>
          </Link>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="nav-link">Acasă</Link>
            <Link to="/despre-noi" className="nav-link">Despre Noi</Link>
            <Link to="/servicii" className="nav-link">Servicii</Link>
            <Link to="/produse" className="nav-link">Produse</Link>
            <Link to="/comunitate" className="nav-link">Comunitate</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <span>{currentUser.displayName || 'Utilizator'}</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Autentificare
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"} />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" className="block py-2 px-3 text-blue-600 hover:bg-blue-50 rounded">Acasă</Link>
            <Link to="/despre-noi" className="block py-2 px-3 hover:bg-blue-50 rounded">Despre Noi</Link>
            <Link to="/servicii" className="block py-2 px-3 hover:bg-blue-50 rounded">Servicii</Link>
            <Link to="/produse" className="block py-2 px-3 hover:bg-blue-50 rounded">Produse</Link>
            <Link to="/comunitate" className="block py-2 px-3 hover:bg-blue-50 rounded">Comunitate</Link>
            <Link to="/contact" className="block py-2 px-3 hover:bg-blue-50 rounded">Contact</Link>
            
            {!currentUser && (
              <Link to="/login" className="block py-2 px-3 mt-4 text-center bg-blue-600 text-white rounded">
                Autentificare
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
