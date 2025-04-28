/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import logger from "../utils/logger";

// Create component-specific logger
const cartLogger = logger.createLogger("CartContext");

export interface CartItem {
  id: string;
  name: string;
  price: number | undefined;
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
  total: number | undefined;
  shippingCost: number;
  finalTotal: number | undefined;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cart state
  const [items, setItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage - moved to lazy initializer
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      cartLogger.error("Eroare la parsarea coșului din localStorage:", error);
      return [];
    }
  });
  
  // Base shipping cost
  const [baseShippingCost] = useState(15); // Cost transport fix de 15 RON
  
  // Memoize derived values to prevent unnecessary recalculations
  const totalItems = useMemo(() => 
    items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );
  
  const total = useMemo(() => {
    if (items.length === 0) return undefined;
    
    return items.reduce((acc, item) => {
      const itemPrice = item.price !== undefined ? item.price * item.quantity : 0;
      return acc + itemPrice;
    }, 0);
  }, [items]);
  
  const shippingCost = useMemo(() => {
    if (total === undefined) return baseShippingCost;
    // Transport gratuit pentru comenzi peste 200 RON
    return total >= 200 ? 0 : baseShippingCost;
  }, [total, baseShippingCost]);
  
  const finalTotal = useMemo(() => {
    if (total === undefined) return undefined;
    return total + shippingCost;
  }, [total, shippingCost]);
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);
  
  // Memoize cart functions to prevent unnecessary recreation
  const addItem = useCallback((newItem: CartItem) => {
    setItems(prevItems => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, newItem];
      }
    });
  }, []);
  
  const removeItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);
  
  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, []);
  
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    total,
    shippingCost,
    finalTotal
  }), [
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    total,
    shippingCost,
    finalTotal
  ]);
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Hook pentru a folosi contextul coșului
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Add default export for the context
export default CartContext;
