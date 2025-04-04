import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import useAuth from '../contexts/AuthContext'; // Updated import from context to contexts

const Layout: React.FC = () => {
  const { currentUser, loading } = useAuth(); // Acum cunoaștem dacă utilizatorul este logat

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={!!currentUser} /> {/* Navbar se adaptează în funcție de starea de autentificare */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
