import React from 'react';
import Layout from '../components/Layout';

const Contact: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Contact</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="mb-4">
            Pentru orice întrebări sau informații suplimentare, ne puteți contacta folosind detaliile de mai jos.
          </p>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Informații de contact:</h2>
            <p>Email: contact@lupulsicorbul.ro</p>
            <p>Telefon: +40 123 456 789</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
