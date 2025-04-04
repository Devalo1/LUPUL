import React from 'react';
import { motion } from 'framer-motion';

const ServicesPage: React.FC = () => {
  const services = [
    {
      id: 1,
      title: 'Terapie Individuală',
      description: 'Sesiuni personalizate pentru a te ajuta să depășești provocări, să-ți înțelegi emoțiile și să dezvolți strategii pentru o viață mai echilibrată.',
      icon: '🧠',
      price: 'de la 200 lei / ședință',
      benefits: [
        'Spațiu sigur pentru explorarea emoțiilor',
        'Tehnici adaptate nevoilor individuale',
        'Suport pentru gestionarea anxietății și stresului',
        'Dezvoltarea strategiilor de coping'
      ]
    },
    {
      id: 2,
      title: 'Coaching pentru Dezvoltare Personală',
      description: 'Îndrumare pentru atingerea obiectivelor personale și profesionale, identificarea valorilor și crearea unei vieți aliniate cu acestea.',
      icon: '🌱',
      price: 'de la 250 lei / ședință',
      benefits: [
        'Clarificarea obiectivelor și valorilor personale',
        'Plan de acțiune personalizat',
        'Dezvoltarea încrederii și motivației',
        'Transformarea obstacolelor în oportunități'
      ]
    },
    {
      id: 3,
      title: 'Ateliere de Grup',
      description: 'Experiențe transformatoare în comunitate, unde învățarea se îmbină cu conexiunea autentică și sprijinul reciproc.',
      icon: '👥',
      price: 'de la 150 lei / persoană',
      benefits: [
        'Învățare prin experiență directă',
        'Conexiuni autentice cu persoane similare',
        'Perspective diverse asupra provocărilor comune',
        'Costuri reduse față de sesiunile individuale'
      ]
    },
    {
      id: 4,
      title: 'Retreat-uri și Experiențe Imersive',
      description: 'Programe intensive de câteva zile pentru reconectare cu sinele, natura și comunitatea, departe de rutina cotidiană.',
      icon: '🌿',
      price: 'de la 1200 lei / persoană',
      benefits: [
        'Deconectare completă de la rutină',
        'Experiențe profunde în natură',
        'Practici holistice pentru minte și corp',
        'Comunitate suportivă'
      ]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Serviciile Noastre
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Oferim servicii de calitate pentru a te susține în călătoria ta spre echilibru și autenticitate.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-8">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <p className="text-blue-600 font-semibold mb-4">{service.price}</p>
                
                <h4 className="font-semibold text-gray-900 mb-2">Beneficii:</h4>
                <ul className="space-y-2">
                  {service.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <button className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
                  Programează o sesiune
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
