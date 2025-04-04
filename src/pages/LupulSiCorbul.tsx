import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';

const LupulSiCorbul: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Lupul și Corbul</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Proiect editorial dedicat dezvoltării personale și explorării psihologiei umane prin literatură.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src="https://placehold.co/600x400" 
            alt="Lupul și Corbul" 
            className="rounded-lg shadow-md w-full h-auto"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4">Despre proiect</h2>
          <p className="text-gray-600 mb-4">
            Lupul și Corbul este un proiect editorial ambițios care explorează adâncurile psihologiei umane prin prisma literaturii. 
            Inspirat de fabula clasică, acest proiect aduce împreună înțelepciunea tradițională și știința modernă pentru a oferi 
            cititorilor instrumente valoroase pentru dezvoltare personală.
          </p>
          <p className="text-gray-600 mb-6">
            Prin cărți, articole și resurse educaționale, dorim să oferim cititorilor noștri perspectiva unică a "Lupului" - 
            simbolul instinctului și autenticității - și înțelepciunea "Corbului" - reprezentând contemplația și perspectiva.
          </p>
          <Button>Explorează publicațiile</Button>
        </motion.div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Publicații recente</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(item => (
            <motion.div 
              key={item}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={`https://placehold.co/400x260?text=Carte+${item}`} 
                alt={`Carte ${item}`} 
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Titlu publicație {item}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  O scurtă descriere a acestei publicații și a temelor pe care le abordează.
                </p>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                  Citește mai mult →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline">Vezi toate publicațiile</Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Ateliere și evenimente</h2>
          <p className="text-gray-600 mb-4">
            Pe lângă publicațiile noastre, organizăm periodic ateliere și evenimente dedicate dezvoltării personale și 
            explorării literare. Acestea oferă participanților oportunitatea de a aprofunda conceptele prezentate în cărțile 
            și articolele noastre, într-un cadru interactiv și stimulativ.
          </p>
          <p className="text-gray-600 mb-6">
            Atelierele noastre sunt conduse de profesioniști cu experiență în psihologie, literatură și dezvoltare personală, 
            oferind o experiență de învățare bogată și transformativă.
          </p>
          <Button>Vezi evenimentele viitoare</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(item => (
            <img 
              key={item}
              src={`https://placehold.co/300x300?text=Eveniment+${item}`}
              alt={`Eveniment ${item}`} 
              className="rounded-lg shadow-sm"
            />
          ))}
        </div>
      </div>
      
      <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Abonează-te la newsletter</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Primește noutăți despre publicațiile, evenimentele și proiectele noastre, direct în inbox-ul tău.
        </p>
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Adresa ta de email"
            className="px-4 py-2 rounded-md flex-grow text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <Button variant="secondary">Abonează-te</Button>
        </div>
      </div>
    </div>
  );
};

export default LupulSiCorbul;
