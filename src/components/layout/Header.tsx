import React from 'react';
import Navbar from './Navbar';
import '../../styles/Header.css';

// Header este acum doar un wrapper pentru Navbar
const Header: React.FC = () => {
  return (
    <header id="header-container">
      <Navbar />
    </header>
  );
};

export default Header;