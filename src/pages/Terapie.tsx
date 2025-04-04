import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TherapyService } from '../types';
import Button from '../components/common/Button';
import { useCart } from '../context/CartContext';
import TestimonialSlider from '../components/testimonials/TestimonialSlider';
import { therapyTestimonials } from '../data/testimonials';

const Terapie: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { addItem } = useCart();
  
  const therapyServices: TherapyService[] = [
    {
      id: '1',
      title: 'Terapie Cognitivă Comportamentală',
      description: 'Terapia cognitivă comportamentală (TCC) este o formă de psihoterapie care se concentrează pe identificarea și schimbarea gândurilor, emoțiilor și comportamentelor negative sau inexacte.',
      imageUrl: 'https://placehold.co/600x400',
      duration: '8-12 ședințe',
      price: 180
    },
    {
      id: '2',
      title: 'Terapie de Expunere',
      description: 'Terapia de expunere este o tehnică utilizată în psihoterapie pentru a ajuta persoanele să facă față anxietății prin expunerea controlată la frica sau situația temută.',
      imageUrl: 'https://placehold.co/600x400',
      duration: '6-10 ședințe',
      price: 200
    },
    {
      id: '3',
      title: 'Terapie de Acceptare și Angajament',
      description: 'Terapia de acceptare și angajament (ACT) este o formă de terapie comportamentală care folosește strategii de acceptare și mindfulness pentru a dezvolta flexibilitatea psihologică.',
      imageUrl: 'https://placehold.co/600x400',
      duration: '10-15 ședințe',
      price: 190
    },
    {
      id: '4',
      title: 'Terapie prin Artă',
      description: 'Terapia prin artă folosește activități creative pentru a ajuta la procesarea emoțiilor și experienței personale într-un mod non-verbal și liber.',
      imageUrl: 'https://placehold.co/600x400',
      duration: 'Sesiuni personalizate',
      price: 150
    },
    {
      id: '5',
      title: 'Terapie de Familie',
      description: 'Terapia de familie abordează probleme specifice care afectează sănătatea mentală și funcționarea familiei ca întreg prin îmbunătățirea comunicării și dinamicii familiale.',
      imageUrl: 'https://placehold.co/600x400',
      duration: '10-12 ședințe',
      price: 240
    },
    {
      id: '6',
      title: 'Mindfulness și Meditație',
      description: 'Practica mindfulness și tehnicile de meditație pentru dezvoltarea atenției, reducerea stresului și îmbunătățirea calității vieții.',
      imageUrl: 'https://placehold.co/600x400',
      duration: '6-8 ședințe',
      price: 160
    },
  ];
  
  const handleAddToCart = (service: TherapyService) => {
    addItem({
      id: service.id,
      name: service.title,
      price: service.price,
      image: service.imageUrl
    });
  };

  const handleServiceClick = (id: string) => {
    setSelectedService(id === selectedService ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">Servicii de Terapie</h1>
      <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
        Oferim o varietate de abordări terapeutice adaptate nevoilor dumneavoastră. Fiecare metodă 
        este administrată de terapeuți profesioniști, cu experiență în domeniul lor de practică.
      </p>
      
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-6">Ce spun clienții noștri</h2>
        <TestimonialSlider testimonials={therapyTestimonials} className="max-w-2xl mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {therapyServices.map((service) => (
          <motion.div
            key={service.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
              selectedService === service.id ? 'ring-2 ring-blue-500' : ''
            }`}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={service.imageUrl} 
              alt={service.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>Durată: {service.duration}</span>
                <span className="font-semibold">{service.price} RON / ședință</span>
              </div>
              
              {selectedService === service.id ? (
                <div className="mt-4">
                  <p className="text-gray-700 mb-4">{service.description}</p>
                  <div className="flex flex-col md:flex-row gap-2 mt-4">
                    <Button 
                      onClick={() => handleAddToCart(service)}
                      className="w-full md:w-auto"
                    >
                      Adaugă în coș
                    </Button>
                    <Button 
                      onClick={() => handleServiceClick(service.id)}
                      variant="outline"
                      className="w-full md:w-auto"
                    >
                      Închide detalii
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => handleServiceClick(service.id)}
                  variant="outline"
                  className="w-full mt-3"
                >
                  Află mai multe
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-16 bg-blue-50 rounded-lg p-6 md:p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">Programează o ședință</h2>
        <p className="text-gray-700 mb-6 text-center">
          Pentru a programa o ședință sau pentru mai multe informații despre serviciile noastre,
          vă rugăm să ne contactați prin formularul de contact sau direct la numărul de telefon.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Button className="w-full md:w-auto">Formular de contact</Button>
          <Button variant="outline" className="w-full md:w-auto">Vezi întrebări frecvente</Button>
        </div>
      </div>
    </div>
  );
};

export default Terapie;
