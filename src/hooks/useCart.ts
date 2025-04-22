import { useContext } from "react";
import CartContext from "../contexts/CartContext";

/**
 * Custom hook for accessing shopping cart functionality
 * @returns Cart context with state and methods to manipulate the cart
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
