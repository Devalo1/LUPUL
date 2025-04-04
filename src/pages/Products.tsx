import React from 'react';
import Layout from '../components/Layout';

const Products: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Produse</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="mb-4">
            Pagina de produse este în dezvoltare. În curând veți putea vedea aici toate produsele disponibile.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
