import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getItemCount } = useCart();
  const { currentUser, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className={`fixed w-full z-30 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-12 w-12 relative flex-shrink-0">
            <img 
              src="/images/LC.png" 
              alt="Lupul și Corbul" 
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/images/fallback-logo.png';
                console.error('Error loading logo image');
              }}
            />
          </div>
          <span className={`font-bold text-xl ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
            Lupul și Corbul
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="nav-link">Acasă</Link>
          <Link to="/terapie" className="nav-link">Terapie</Link>
          <Link to="/ong" className="nav-link">ONG</Link>
          <Link to="/lupul-si-corbul" className="nav-link">Lupul și Corbul</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          {currentUser ? (
            <div className="relative group">
              <button className="flex items-center space-x-2">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email[0].toUpperCase()}
                  </div>
                )}
                <span className={isScrolled ? 'text-gray-800' : 'text-white'}>
                  {currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Cont'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isScrolled ? 'text-gray-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md overflow-hidden z-10 invisible group-hover:visible transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                        {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{currentUser.displayName || 'Utilizator'}</p>
                      <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profilul meu
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Comenzile mele
                  </Link>
                  <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button 
                    onClick={handleSignOut} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded flex items-center text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Deconectare
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className={`flex items-center space-x-1 ${isScrolled ? 'text-blue-600' : 'text-white'} hover:text-blue-400`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Login</span>
            </Link>
          )}
          
          <Link to="/cart" className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {getItemCount()}
              </span>
            )}
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen 
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-3">
              {currentUser && (
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{currentUser.displayName || 'Utilizator'}</p>
                    <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col space-y-3">
                <Link to="/" className="py-2">Acasă</Link>
                <Link to="/terapie" className="py-2">Terapie</Link>
                <Link to="/ong" className="py-2">ONG</Link>
                <Link to="/lupul-si-corbul" className="py-2">Lupul și Corbul</Link>
                <Link to="/shop" className="py-2">Shop</Link>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  {currentUser ? (
                    <>
                      <p className="text-sm text-gray-500">Conectat ca {currentUser.email}</p>
                      <Link to="/admin" className="block py-2">Admin</Link>
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left py-2"
                      >
                        Deconectare
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="py-2">Login</Link>
                  )}
                  <Link to="/cart" className="flex items-center py-2">
                    <span>Coș</span>
                    {getItemCount() > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {getItemCount()}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;