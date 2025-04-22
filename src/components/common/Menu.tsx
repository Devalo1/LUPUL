import React, { useState } from "react";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" 
         onClick={onClose}>
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center bg-white rounded-full text-black font-bold text-xl z-10"
        >
          ×
        </button>
        <div className="bg-white rounded-lg overflow-hidden">
          <img 
            src="/images/1.png" 
            alt="Meniul complet Lupul Sătul" 
            className="w-full h-auto"
            style={{ maxHeight: "90vh", objectFit: "contain" }}
          />
        </div>
      </div>
    </div>
  );
};

export const Menu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <button 
        onClick={openMenu}
        className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-300"
      >
        Vezi meniul complet
      </button>

      <MenuModal isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
};

export default Menu;