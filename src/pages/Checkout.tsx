import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { logger } from '../utils/debug';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Checkout: React.FC = () => {
  const cart = useCart();
  const { items, getTotal, clearCart } = cart;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Log checkout attempt
      logger.info('Checkout initiated', { 
        data: { 
          items: items.length,
          total: getTotal() 
        } 
      });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Order successful
      setOrderComplete(true);
      clearCart();
      
      // After showing success message, redirect to confirmation
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 2000);
      
    } catch (error) {
      logger.error('Checkout error', error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 mt-20"><LoadingSpinner text="Procesăm comanda..." /></div>;
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto p-4 mt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">Comandă finalizată cu succes!</h1>
          <p className="mt-2">Vă mulțumim pentru achiziție!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-20">
      <h1 className="text-2xl font-bold mb-6">Finalizare comandă</h1>
      
      {items.length === 0 ? (
        <div className="text-center p-8">
          <p>Nu aveți produse în coș.</p>
          <button 
            onClick={() => navigate('/shop')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Înapoi la magazin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Form fields would go here */}
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded font-medium"
            >
              Finalizează comanda
            </button>
          </form>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Sumar comandă</h2>
            {/* Order summary would go here */}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{getTotal().toFixed(2)} RON</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
