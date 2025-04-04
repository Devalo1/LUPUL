import React from 'react';
import Layout from '../components/layout/Layout';

const AboutUs: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Despre Noi</h1>
        <p className="mb-4">Conținutul paginii despre noi...</p>
      </div>
    </Layout>
  );
};

export default AboutUs;
