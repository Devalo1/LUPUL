import React, { ReactNode } from 'react';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={!!currentUser} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
