import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';

interface OrderSuccessState {
  orderNumber: number;
  total: number;
}

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const state = location.state as OrderSuccessState;
  
  // If navigated directly without state, use a default order number
  const orderNumber = state?.orderNumber || Math.floor(100000 + Math.random() * 900000);
  
  return (
    <div className="bg-gray-50 py-16 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Comanda a fost plasată cu succes!</h1>
          
          <p className="text-gray-600 mb-6">
            Mulțumim pentru comanda ta. Am trimis un email de confirmare la adresa de email furnizată.
          </p>
          
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <p className="text-sm text-gray-500">Număr comandă</p>
            <p className="text-lg font-semibold">{orderNumber}</p>
          </div>
          
          <p className="text-gray-600 mb-8">
            Poți urmări statusul comenzii tale în pagina{' '}
            <Link to="/profile" className="text-blue-600 hover:underline">Comenzile mele</Link>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/shop'}
              className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Continuă cumpărăturile
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/profile'}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Vezi comenzile mele
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
