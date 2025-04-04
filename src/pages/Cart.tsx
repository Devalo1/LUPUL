import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/helpers';
import Button from '../components/common/Button';

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
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
        <h1 className="text-3xl font-bold text-center mb-10">Coșul meu</h1>
        
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-500 mb-6">Coșul tău este gol</div>
            <Link to="/shop">
              <Button variant="primary">
                Înapoi la cumpărături
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 flex flex-col sm:flex-row items-center"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-6">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-grow ml-0 sm:ml-4 mt-4 sm:mt-0">
                        <h3 className="text-lg font-medium text-gray-800">
                          <Link to={`/products/${item.id}`} className="hover:text-blue-600">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-blue-600 font-medium">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      
                      {/* Quantity */}
                      <div className="flex items-center mt-4 sm:mt-0">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          disabled={item.quantity <= 1}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="mx-2 text-center w-8">{item.quantity}</span>
                        
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="font-medium text-right ml-6">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      
                      {/* Remove Button */}
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <button 
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    Golește coșul
                  </button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Sumar comandă</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800 font-medium">{formatCurrency(getTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport</span>
                    <span className="text-gray-800 font-medium">Calculat la checkout</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(getTotal())}</span>
                  </div>
                </div>
                
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Finalizează comanda
                </Button>
                
                <div className="mt-6 text-center">
                  <Link 
                    to="/shop" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Continuă cumpărăturile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
