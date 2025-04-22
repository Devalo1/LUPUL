import React, { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AdminNavigation from "../AdminNavigation";

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
  return (
    <div className="min-h-screen flex flex-col">
      {!skipHeader && <Header />}
      
      {isAdmin && <AdminNavigation />}
      
      <main className={`flex-grow ${isAdmin ? "pt-4" : ""}`}>
        {children}
      </main>
      
      {!skipFooter && <Footer />}
    </div>
  );
};

export default Layout;
