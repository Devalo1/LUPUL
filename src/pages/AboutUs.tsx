import React from 'react';
import Layout from '../components/Layout';

const AboutUs: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Despre Noi</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="mb-4">
            Bine ați venit la pagina Despre Noi a Lupul și Corbul. Această pagină este în construcție.
          </p>
          <p>
            Vă mulțumim pentru răbdare și vă invităm să reveniți în curând pentru informații complete.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
