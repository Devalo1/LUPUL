/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // Încarcă coșul din localStorage la inițializare
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Eroare la parsarea coșului din localStorage:', error);
      }
    }
  }, []);

  // Salvează coșul în localStorage la fiecare actualizare
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    
    // Actualizează numărul total de articole
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setTotalItems(count);
  }, [items]);

  // Adaugă un articol în coș
  const addItem = (newItem: CartItem) => {
    console.log('Adăugăm în coș:', newItem);
    setItems(prevItems => {
      // Verificăm dacă articolul există deja în coș
      const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex !== -1) {
        // Dacă articolul există, actualizăm cantitatea
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Dacă articolul nu există, îl adăugăm în coș
        return [...prevItems, newItem];
      }
    });
  };

  // Elimină un articol din coș
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Actualizează cantitatea unui articol
  const updateQuantity = (id: string, quantity: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Golește coșul
  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook pentru a folosi contextul coșului
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
