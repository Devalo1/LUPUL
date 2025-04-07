import React from 'react';
import Navbar from './Navbar';
import '../../styles/Header.css';
import { useLocation } from 'react-router-dom';

// Header este acum doar un wrapper pentru Navbar
const Header: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <header id="header-container" className={isHomePage ? 'bg-transparent' : ''}>
      <Navbar onToggleSideNav={() => {}} />
    </header>
  );
};

export default Header;