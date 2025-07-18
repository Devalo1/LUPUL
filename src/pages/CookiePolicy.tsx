import React from "react";

const CookiePolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Politica de Cookie-uri
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}
        </p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            1. Ce sunt cookie-urile?
          </h2>
          <p className="text-gray-600 mb-4">
            Cookie-urile sunt fișiere text de mici dimensiuni stocate pe
            dispozitivul dumneavoastră atunci când vizitați un site web. Ele
            ajută site-urile să funcționeze eficient și să ofere informații
            proprietarilor site-ului.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            2. Cum folosim cookie-urile?
          </h2>
          <p className="text-gray-600 mb-4">Folosim cookie-uri pentru a:</p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Asigura funcționalitatea site-ului (cookie-uri esențiale).</li>
            <li>
              Analiza traficul și performanța site-ului (cookie-uri de
              performanță).
            </li>
            <li>
              Personaliza experiența utilizatorului (cookie-uri de
              funcționalitate).
            </li>
            <li>
              Furniza conținut publicitar relevant (cookie-uri de publicitate).
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            3. Tipuri de cookie-uri
          </h2>
          <p className="text-gray-600 mb-2">
            <strong>Cookie-uri esențiale:</strong> necesare pentru funcționare.
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Cookie-uri de performanță:</strong> colectează date despre
            trafic.
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Cookie-uri de funcționalitate:</strong> rețin preferințe ale
            utilizatorului.
          </p>
          <p className="text-gray-600">
            <strong>Cookie-uri de publicitate:</strong> urmăresc interese pentru
            reclame.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            4. Gestionarea cookie-urilor
          </h2>
          <p className="text-gray-600 mb-4">
            Puteți controla și șterge cookie-urile prin setările browserului.
            Rețineți că dezactivarea unor cookie-uri poate afecta
            funcționalitatea site-ului.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            5. Cookie-uri terțe
          </h2>
          <p className="text-gray-600">
            Unele cookie-uri pot fi plasate de terți, precum instrumente de
            analiză (Google Analytics) sau rețele de socializare.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            6. Contact
          </h2>
          <p className="text-gray-600">
            Pentru orice întrebări privind această politică, ne puteți contacta
            la:{" "}
            <a href="mailto:lupulsicorbul@gmail.com" className="text-blue-600">
              lupulsicorbul@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;
