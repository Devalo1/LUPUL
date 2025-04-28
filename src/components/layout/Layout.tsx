import React, { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  skipHeader?: boolean;
  skipFooter?: boolean;
  isAdmin?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  skipHeader = false, 
  skipFooter = false,
  isAdmin = false
}) => {
  const location = useLocation();
  
  // Check if we're on an admin route - admin routes are handled by AdminLayout
  const _isAdminRoute = location.pathname.startsWith("/admin");
  
  return (
    <div className="min-h-screen flex flex-col">
      {!skipHeader && <Header />}
      
      {/* 
        Remove AdminNavigation completely from this Layout
        It should ONLY be rendered by the AdminLayout component
      */}
      
      <main className={`flex-grow ${isAdmin ? "pt-4" : ""}`}>
        {children}
      </main>
      
      {!skipFooter && <Footer />}
    </div>
  );
};

export default Layout;
