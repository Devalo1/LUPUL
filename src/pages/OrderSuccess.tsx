import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/common/Button";

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
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Comandă finalizată cu succes!</h1>
          
          <p className="text-gray-600 mb-6">
            Mulțumim pentru comanda ta! Am trimis un email de confirmare la adresa asociată contului tău.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-gray-600">Număr comandă:</p>
            <p className="text-xl font-bold text-gray-800">{orderNumber}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
            <Button 
              as={Link}
              to="/account"
              variant="outline"
            >
              Vezi comenzile mele
            </Button>
            
            <Button 
              as={Link}
              to="/shop"
              variant="primary"
            >
              Continuă cumpărăturile
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
