import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartTable from '../components/CartTable';

const Cart: React.FC = () => {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatCurrency = (price: number) => `${price.toFixed(2)} RON`;

  const handleCheckout = () => {
    if (items.length > 0) {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="content-card mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-8">Coșul de cumpărături</h1>
        <div className="p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-600 mb-6">Coșul tău de cumpărături este gol.</p>
          <Link to="/products" className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Explorează produsele noastre
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <h1 className="text-3xl font-bold py-6 text-center border-b">Coșul de cumpărături</h1>
      <CartTable items={items} formatCurrency={formatCurrency} />
      <div className="p-6 bg-gray-50 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
          <button 
            onClick={clearCart}
            className="mb-4 md:mb-0 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Golește coșul
          </button>
          <div className="text-right">
            <div className="mb-2">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-xl ml-2">{formatCurrency(total)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Finalizează comanda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
