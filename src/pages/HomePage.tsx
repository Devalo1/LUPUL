import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../context/useAuth'; // Updated import

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  return (
    <div className="home-container">
      <section className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 md:px-8 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: 'url("/images/BACKGROUND.jpeg")' }}
          ></div>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="container mx-auto relative z-10 text-center max-w-3xl">
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Empatie. Conexiune. Echilibru.
            </h1>
            <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
              Descoperă servicii terapeutice și produse pentru bunăstarea ta mentală, emoțională și spirituală. 
              La Lupul și Corbul, te ajutăm să găsești echilibrul și să construiești conexiuni autentice.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              {currentUser ? (
                // Butoane pentru utilizatori autentificați
                <>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-10 py-3 text-lg"
                    onClick={() => navigate('/servicii')}
                  >
                    Serviciile Noastre
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-white border-white hover:bg-white hover:bg-opacity-10 px-10 py-3 text-lg"
                    onClick={() => navigate('/profile')}
                  >
                    Profilul Meu
                  </Button>
                </>
              ) : (
                // Butoane pentru vizitatori neautentificați
                <>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-10 py-3 text-lg"
                    onClick={() => navigate('/servicii')}
                  >
                    Serviciile Noastre
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-white border-white hover:bg-white hover:bg-opacity-10 px-10 py-3 text-lg"
                    onClick={() => navigate('/login')}
                  >
                    LOG-IN
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
