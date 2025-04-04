import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logOut } = useAuth(); // Renamed signOut to logOut
  const { items, getItemsCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      await logOut(); // Folosim funcția logOut în loc de signOut
      navigate('/');
      // Temporarily remove the forced reload to debug sign-out errors
      // window.location.reload();
    } catch (error) {
      console.error('Logout error:', error); // Keep error logging
      alert('A apărut o eroare la deconectare. Vă rugăm încercați din nou.');
    }
  };
  
  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/images/LC.png" alt="Lupul și Corbul" className="h-10 w-auto" />
            <span className="ml-2 text-xl font-bold text-gray-800">Lupul și Corbul</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Acasă
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium">
              Produse
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-blue-600 font-medium">
              Evenimente
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">
              Despre noi
            </Link>
            
            {/* Show these links only if user is logged in */}
            {currentUser && (
              <>
                <Link to="/orders" className="text-gray-700 hover:text-blue-600 font-medium">
                  Comenzile mele
                </Link>
              </>
            )}
            
            {/* Admin link if user is admin */}
            {currentUser && currentUser.isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                Admin
              </Link>
            )}
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {items.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {getItemsCount()}
                </span>
              )}
            </Link>
            
            {/* User Menu or Login Button */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center focus:outline-none"
                  aria-expanded={isMenuOpen}
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || currentUser.email || 'User'} // Ensure alt is always a string
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {currentUser.displayName 
                        ? currentUser.displayName.charAt(0).toUpperCase() 
                        : currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <svg className={`ml-1 w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-xs text-gray-500">
                      Conectat ca<br/>
                      <span className="font-medium text-gray-900 truncate">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </div>
                    <hr className="my-1" />
                    <Link 
                      to="/account" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profilul meu
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Comenzile mele
                    </Link>
                    {currentUser.isAdmin && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Panou de administrare
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Deconectare
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Autentificare
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Acasă
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium">
                Produse
              </Link>
              <Link to="/events" className="text-gray-700 hover:text-blue-600 font-medium">
                Evenimente
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                Despre noi
              </Link>
              
              {currentUser ? (
                <>
                  <Link to="/account" className="text-gray-700 hover:text-blue-600 font-medium">
                    Profilul meu
                  </Link>
                  <Link to="/orders" className="text-gray-700 hover:text-blue-600 font-medium">
                    Comenzile mele
                  </Link>
                  {currentUser.isAdmin && (
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                      Administrare
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="text-left text-red-600 hover:text-red-800 font-medium"
                  >
                    Deconectare
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Autentificare
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;