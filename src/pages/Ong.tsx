import React from 'react';

const Ong: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 ong-section">
      <h1 className="text-3xl font-bold mb-6 text-center">Făuritorii de destin</h1>
      <p className="text-center text-lg mb-10">Acel destin pe care îl merită fiecare copil</p>
      
      <div className="max-w-3xl mx-auto">
        <img 
          src="/images/AdobeStock_217770381.jpeg" 
          alt="Făuritorii de destin" 
          className="w-full h-auto rounded-lg shadow-lg mb-6"
        />
        
        <p className="mb-4">
          La Casa de Copii „Făuritorii de Destin" transformăm visele în realitate, deschizând porțile unui viitor luminos. 
          Prin formularul 230, implicarea ta nu doar că aduce speranță și schimbare, ci îți oferă și avantaje fiscale, 
          transformând fiecare donație într-o investiție în viața lor. Hai să clădim împreună un drum de curaj, 
          inspirație și posibilități infinite!
        </p>
      </div>
    </div>
  );
};

export default Ong;
