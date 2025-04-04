import React, { useEffect } from 'react';
import { logger } from '../utils/debug';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  useEffect(() => {
    logger.info('Home component mounted');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">Lupul și Corbul</h1>
        <p className="text-xl text-gray-700 max-w-2xl">
          Empatie, Conexiune, Echilibru - pentru o viață mai bună.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Terapie</h2>
          <p className="text-gray-600 mb-4">Descoperă serviciile noastre terapeutice personalizate pentru nevoile tale.</p>
          <Link to="/servicii" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Află mai multe
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">Comunitate</h2>
          <p className="text-gray-600 mb-4">Alătură-te comunității noastre pentru sprijin, creștere și conexiuni autentice.</p>
          <Link to="/comunitate" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
            Participă
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-purple-600 mb-4">Resurse</h2>
          <p className="text-gray-600 mb-4">Acces la cărți, articole și materiale pentru dezvoltarea personală.</p>
          <Link to="/produse" className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
            Explorează
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;