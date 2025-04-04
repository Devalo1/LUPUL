import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';

const About: React.FC = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Despre Noi</h1>
          <p className="text-lg text-gray-700 mb-8">
            Lupul și Corbul este un spațiu dedicat sănătății mintale, echilibrului emoțional și bunăstării personale. 
            Misiunea noastră este să oferim instrumente și resurse pentru dezvoltarea personală și gestionarea stresului în viața de zi cu zi.
          </p>
        </div>
        
        {/* Our Story */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">Povestea Noastră</h2>
              <p className="text-gray-700 mb-4">
                Totul a început dintr-o pasiune personală pentru înțelegerea comportamentului uman și dorința de a face terapia mai accesibilă pentru toți.
              </p>
              <p className="text-gray-700 mb-4">
                De-a lungul anilor, am construit o comunitate de specialiști și practicieni dedicați care împărtășesc aceeași viziune: aceea de a crea un spațiu sigur 
                pentru explorare personală și vindecarea emoțională.
              </p>
              <p className="text-gray-700">
                Numele "Lupul și Corbul" reprezintă dualitatea naturii umane - instinct și rațiune, emoție și gândire, forță și înțelepciune - toate aspecte 
                esențiale pentru o viață echilibrată și împlinită.
              </p>
            </div>
            <div className="h-64 md:h-auto bg-gray-200">
              <img 
                src="https://placehold.co/800x600" 
                alt="Povestea Lupul și Corbul" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Valorile Noastre</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Empatie</h3>
              <p className="text-gray-600">
                Cultivăm înțelegerea profundă a experienței umane și capacitatea de a rezona cu emoțiile și nevoile fiecărei persoane.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Conexiune</h3>
              <p className="text-gray-600">
                Credem în puterea relațiilor autentice și a comunității ca fundament pentru vindecare, creștere personală și transformare.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Echilibru</h3>
              <p className="text-gray-600">
                Promovăm armonizarea diferitelor aspecte ale vieții pentru o stare de bine durabilă: minte, corp, spirit, relații și scop.
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Team */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Echipa Noastră</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://placehold.co/400x400" 
                alt="Ana Popescu" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Ana Popescu</h3>
                <p className="text-blue-600 mb-4">Fondator & Psihoterapeut</p>
                <p className="text-gray-600 mb-4">
                  Psihoterapeut cu peste 10 ani de experiență în terapie cognitivă comportamentală și mindfulness.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://placehold.co/400x400" 
                alt="Mihai Ionescu" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Mihai Ionescu</h3>
                <p className="text-blue-600 mb-4">Co-fondator & Instructor Yoga</p>
                <p className="text-gray-600 mb-4">
                  Profesor de yoga și meditație, specializat în tehnici de reducere a stresului și relaxare profundă.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://placehold.co/400x400" 
                alt="Elena Dumitrescu" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Elena Dumitrescu</h3>
                <p className="text-blue-600 mb-4">Coach & Specialist Nutriție</p>
                <p className="text-gray-600 mb-4">
                  Coach de viață și specialistă în nutriție funcțională, dedicată abordării holistice a sănătății.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Alătură-te comunității noastre</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Fie că ești în căutarea unui sprijin profesionist sau dorești să faci parte din echipa noastră, suntem aici pentru tine.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="white">Programează o consultație</Button>
            <Button variant="outline">Contactează-ne</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;