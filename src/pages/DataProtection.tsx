import React from "react";

const DataProtection: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Protecția Datelor
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Introducere</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Această pagină vă informează despre măsurile tehnice și
            organizaționale pe care le luăm pentru a proteja datele
            dumneavoastră personale.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Măsuri de Securitate
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Criptarea datelor în tranzit și în repaus</li>
            <li>Acces restrictionat bazat pe roluri</li>
            <li>Monitorizarea continuă a sistemelor</li>
            <li>Backup-uri regulate și securizate</li>
            <li>Autentificare cu doi factori</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Drepturile Dumneavoastră
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            În conformitate cu GDPR, aveți următoarele drepturi privind datele
            personale:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Dreptul de acces la datele personale</li>
            <li>Dreptul de rectificare</li>
            <li>Dreptul la ștergerea datelor</li>
            <li>Dreptul la portabilitate</li>
            <li>Dreptul la opoziție</li>
          </ul>
        </section>

        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Pentru exercitarea drepturilor sau întrebări despre protecția
            datelor:
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 font-medium">HIFITBOX SRL</p>
            <p className="text-gray-600">Email: dpo@lupulsicorbul.ro</p>
            <p className="text-gray-600">Telefon: +40 XXX XXX XXX</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DataProtection;
