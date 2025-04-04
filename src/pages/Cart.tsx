import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { formatCurrency, calculateDiscountedPrice } from '../utils/helpers';
import Button from '../components/common/Button';

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };
  
  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };
  
  const handleClearCart = () => {
    if (window.confirm('Ești sigur că vrei să ștergi toate produsele din coș?')) {
      clearCart();
    }
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Coșul tău</h1>
        
        {items.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            <h2 className="text-xl font-semibold mb-4">Coșul tău este gol</h2>
            <p className="text-gray-600 mb-6">
              Se pare că nu ai adăugat încă niciun produs în coș.
            </p>
            <Link
              to="/shop"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              Continuă cumpărăturile
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <motion.div
                className="bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Produse ({items.length})</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Golește coșul
                  </button>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const discountedPrice = item.product.discount
                      ? calculateDiscountedPrice(item.product.price, item.product.discount)
                      : item.product.price;
                    
                    return (
                      <div key={item.product.id} className="py-6 flex flex-col sm:flex-row">
                        <div className="sm:w-24 sm:h-24 flex-shrink-0 mr-0 sm:mr-4 mb-4 sm:mb-0">
                          <Link to={`/product/${item.product.id}`}>
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </Link>
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link
                                to={`/product/${item.product.id}`}
                                className="text-lg font-medium hover:text-blue-600"
                              >
                                {item.product.name}
                              </Link>
                              
                              {item.product.discount && (
                                <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                                  -{item.product.discount}%
                                </span>
                              )}
                              
                              <div className="text-sm text-gray-500 mt-1 mb-4">
                                Categorie: {item.product.category === 'books' 
                                  ? 'Cărți' 
                                  : item.product.category === 'wellness' 
                                    ? 'Wellness' 
                                    : 'Cursuri'}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {item.product.discount ? (
                                <div>
                                  <span className="font-bold">
                                    {formatCurrency(discountedPrice)}
                                  </span>
                                  <span className="text-sm text-gray-500 line-through ml-2">
                                    {formatCurrency(item.product.price)}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold">
                                  {formatCurrency(item.product.price)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                              >
                                -
                              </button>
                              <span className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                              >
                                +
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveItem(item.product.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Elimină
                            </button>
                          </div>
                          
                          <div className="mt-2 text-right font-medium">
                            Total: {formatCurrency(discountedPrice * item.quantity)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
            
            <div className="md:col-span-1">
              <motion.div
                className="bg-white rounded-lg shadow-md p-6 sticky top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold mb-6">Sumar comandă</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport</span>
                    <span>Gratuit</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(getCartTotal())}</span>
                  </div>
                </div>
                
                <Button onClick={handleCheckout} className="w-full">
                  Finalizează comanda
                </Button>
                
                <div className="mt-4 text-center">
                  <Link to="/shop" className="text-blue-600 hover:text-blue-800 text-sm">
                    Continuă cumpărăturile
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
