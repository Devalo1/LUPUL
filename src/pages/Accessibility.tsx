import React from "react";

const Accessibility: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Accesibilitate</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Angajamentul Nostru
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Ne angajăm să facem site-ul nostru accesibil tuturor utilizatorilor,
            indiferent de abilitățile sau tehnologiile pe care le folosesc.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Standardele de Accesibilitate
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Site-ul nostru este dezvoltat în conformitate cu:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>WCAG 2.1 Nivel AA</li>
            <li>Standardele web semantice</li>
            <li>Navigare prin tastatură</li>
            <li>Suport pentru screen readers</li>
            <li>Contrast adecvat pentru culori</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Funcții de Accesibilitate
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Navigare prin tastatură
              </h3>
              <p className="text-gray-600">
                Toate funcțiile site-ului sunt accesibile folosind doar
                tastatura.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Text alternativ
              </h3>
              <p className="text-gray-600">
                Toate imaginile includ descrieri alternative pentru screen
                readers.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Structură semantică
              </h3>
              <p className="text-gray-600">
                Conținutul este structurat logic cu headings și landmarks
                corecte.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Raportarea Problemelor
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Dacă întâmpinați dificultăți în utilizarea site-ului sau aveți
            sugestii pentru îmbunătățirea accesibilității, vă rugăm să ne
            contactați.
          </p>
        </section>

        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 font-medium">HIFITBOX SRL</p>
            <p className="text-gray-600">
              Email: accessibility@lupulsicorbul.ro
            </p>
            <p className="text-gray-600">Telefon: +40 XXX XXX XXX</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Accessibility;
