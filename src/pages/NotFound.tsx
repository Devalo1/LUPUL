import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Pagină negăsită</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Ne pare rău, pagina pe care o cauți nu a putut fi găsită.
        </p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
