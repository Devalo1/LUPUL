import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  skipHeader?: boolean;
  skipFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  skipHeader = false, 
  skipFooter = false 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {!skipHeader && <Navbar />}
      
      <main className="flex-grow">
        {children}
      </main>
      
      {!skipFooter && <Footer />}
    </div>
  );
};

export default Layout;
