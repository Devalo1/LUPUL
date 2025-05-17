import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import CartTable from "../components/CartTable";
import "../styles/PageHeaders.css"; // Actualizat calea de import

const Cart: React.FC = () => {
  const { items, total, clearCart, shippingCost, finalTotal } = useCart();
  const navigate = useNavigate();

  const formatCurrency = (price: number | undefined) => {
    if (price === undefined) return "";
    return `${price.toFixed(2)} RON`;
  };

  const handleCheckout = () => {
    if (items.length > 0) {
      navigate("/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="page-header-container">
          <h1 className="page-header-title">Coșul de cumpărături</h1>
          <div className="content-section bg-white p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xl text-gray-600 mb-4">Coșul tău este gol</p>
            <p className="text-gray-500 mb-6">Adaugă produse în coș pentru a putea finaliza o comandă.</p>
            <Link to="/magazin" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Înapoi la Magazin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Return statement for when items exist in the cart
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="page-header-container">
        <h1 className="page-header-title">Coșul de cumpărături</h1>
        <div className="content-section bg-white p-6">
          <CartTable items={items} formatCurrency={formatCurrency} />
          
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Transport:</span>
              <span className="font-medium">{formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold mb-6">
              <span>Total:</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={clearCart}
                className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
              >
                Golește coșul
              </button>
              <button 
                onClick={handleCheckout}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Finalizează comanda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
