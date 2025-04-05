import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer'; // Importăm Footer
import { useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="app-container relative flex flex-col min-h-screen">
      <Navbar />
      {/* Afișăm textul doar pe pagina principală */}
      {location.pathname === '/' && (
        <div className="absolute top-20 left-0 w-full text-center pointer-events-none">
          <h2
            className="text-xl font-bold opacity-17"
            style={{ fontSize: '3.5rem', lineHeight: '1', color: '#002B7F' }}
          >
            <span style={{ color: '#002B7F' }}>Un brand </span>
            <span style={{ color: '#FCD116' }}>Românesc </span>
            <span style={{ color: '#CE1126' }}>pentru Români</span>
          </h2>
        </div>
      )}
      <main className="flex-grow">{children}</main>
      <Footer /> {/* Adăugăm Footer la final */}
    </div>
  );
};

export default Layout;