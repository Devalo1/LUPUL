import React from "react";

const CookiePolicyNew: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Politica de Cookie-uri</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}
        </p>
        
        {/* Introducere */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ce sunt cookie-urile?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Cookie-urile sunt fișiere mici de text care sunt stocate pe dispozitivul dumneavoastră 
            (computer, tabletă sau telefon mobil) atunci când vizitați un site web. Acestea sunt 
            utilizate pe scară largă pentru a face ca site-urile web să funcționeze mai eficient, 
            precum și pentru a furniza informații proprietarilor site-ului.
          </p>
        </section>

        {/* Test content */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Cookie Policy</h2>
          <p className="text-gray-600">
            Aceasta este o versiune de test a paginii de politică cookie-uri.
          </p>
        </section>

      </div>
    </div>
  );
};

export default CookiePolicyNew;
