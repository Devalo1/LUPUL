import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LocationState {
  orderNumber?: string;
}

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const orderNumber = state?.orderNumber || 'N/A';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border border-blue-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Comanda a fost finalizată cu succes!</h1>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700 mb-1">Numărul comenzii tale:</p>
            <p className="text-xl font-semibold text-blue-800">{orderNumber}</p>
          </div>
          
          <p className="text-gray-600 mb-8">
            Îți mulțumim pentru cumpărături. Vei primi un e-mail cu detaliile comenzii.
          </p>
        </div>
        
        <Link 
          to="/products" 
          className="block w-full py-3 px-4 text-center font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors duration-200 transform hover:scale-105"
        >
          Înapoi la produse
        </Link>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 text-center">
            Dacă ai întrebări despre comanda ta, ne poți contacta la 
            <a href="mailto:contact@lupulcorbul.ro" className="text-blue-600 hover:underline"> contact@lupulcorbul.ro</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
