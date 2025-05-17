import React, { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  skipHeader?: boolean;
  skipFooter?: boolean;
  _isAdmin?: boolean; // Renamed to _isAdmin to indicate it's not used
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  skipHeader = false, 
  skipFooter = false,
  _isAdmin = false // Prefix with underscore to indicate it's not used
}) => {
  const location = useLocation();
  
  // Check if we're on an admin route - admin routes are handled by AdminLayout
  const _isAdminRoute = location.pathname.startsWith("/admin");
  
  return (
    <div className="min-h-screen flex flex-col">      {!skipHeader && <Header />}
        {/* 
        Remove AdminNavigation completely from this Layout
        It should ONLY be rendered by the AdminLayout component
      */}
        {/* Increased padding to ensure content is safely below the navbar for all pages */}
      <main className="flex-grow pt-28"> 
        {children}
      </main>
      
      {!skipFooter && <Footer />}
    </div>
  );
};

export default Layout;
