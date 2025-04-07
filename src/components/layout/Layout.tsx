import React, { ReactNode, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SideNavigation from '../navigation/SideNavigation'; // Corectez importul
import '../../styles/Layout.css'; // Import noile stiluri

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onToggleSideNav={toggleSideNav} />
      <SideNavigation isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      
      <main className="flex-grow bg-gray-50">
        <div className="main-container">
          <div className="page-content">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;