import React from "react";

const GDPRPolicy: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Politica GDPR - Protecția Datelor Personale
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>
              Regulamentul General privind Protecția Datelor (GDPR)
            </strong>{" "}
            vă garantează drepturi clare privind datele dumneavoastră personale.
            Această politică explică cum colectăm, utilizăm și protejăm
            informațiile dumneavoastră.
          </p>
        </div>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            1. Operatorul de Date Personale
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="mb-2">
              <strong>Nume:</strong> SC. HIFTIBOX SRL
            </p>
            <p className="mb-2">
              <strong>Adresa:</strong> Str. 9 MAI, Petroșani, Hunedoara, România
            </p>
            <p className="mb-2">
              <strong>Email:</strong> lupulsicorbul@gmail.com
            </p>
            <p className="mb-2">
              <strong>Telefon:</strong> 0734 931 703
            </p>
            <p>
              <strong>DPO (Data Protection Officer):</strong>{" "}
              lupulsicorbul@gmail.com
            </p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            2. Datele Personale Colectate
          </h2>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                📝 Date de Identificare
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Nume și prenume</li>
                <li>Adresa de email</li>
                <li>Numărul de telefon</li>
                <li>Adresa de livrare</li>
                <li>Data nașterii (pentru anumite servicii)</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                💳 Date de Plată
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Informații de facturare</li>
                <li>Istoricul comenzilor</li>
                <li>Preferințe de plată</li>
                <li>
                  <strong>Notă:</strong> Nu păstrăm date complete ale cardului
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                🔍 Date de Utilizare
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Adresa IP și locația geografică</li>
                <li>Informații despre browser și dispozitiv</li>
                <li>Paginile vizitate și timpul petrecut</li>
                <li>Interacțiunile cu site-ul</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                🧠 Date Terapeutice (Opțional)
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Informații despre starea de sănătate mentală</li>
                <li>Istoricul sesiunilor de terapie</li>
                <li>Note și observații terapeutice</li>
                <li>
                  <strong>Confidențialitate maximă garantată</strong>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            3. Scopurile Prelucrării Datelor
          </h2>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <p className="font-semibold text-green-800">
                  Furnizarea Serviciilor
                </p>
                <p className="text-green-700 text-sm">
                  Procesarea comenzilor, livrarea produselor, furnizarea
                  serviciilor de terapie
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 text-xl">💬</span>
              <div>
                <p className="font-semibold text-blue-800">
                  Comunicarea cu Clienții
                </p>
                <p className="text-blue-700 text-sm">
                  Răspunsuri la întrebări, confirmări comenzi, notificări
                  importante
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-600 text-xl">🎯</span>
              <div>
                <p className="font-semibold text-purple-800">
                  Personalizarea Experiențeiă
                </p>
                <p className="text-purple-700 text-sm">
                  Recomandări personalizate, embleme adaptate, conținut relevant
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-600 text-xl">📊</span>
              <div>
                <p className="font-semibold text-orange-800">
                  Analize și Îmbunătățiri
                </p>
                <p className="text-orange-700 text-sm">
                  Îmbunătățirea serviciilor, analize statistice anonimizate
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <span className="text-red-600 text-xl">⚖️</span>
              <div>
                <p className="font-semibold text-red-800">Obligații Legale</p>
                <p className="text-red-700 text-sm">
                  Respectarea legislației fiscale, contabile și de protecție a
                  datelor
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            4. Drepturile Dumneavoastră GDPR
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-2">
                🔍 Dreptul de Acces
              </h3>
              <p className="text-blue-700 text-sm">
                Să știți ce date păstrăm despre dumneavoastră și cum le folosim
              </p>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-green-800 mb-2">
                ✏️ Dreptul de Rectificare
              </h3>
              <p className="text-green-700 text-sm">
                Să corectați datele incorecte sau incomplete
              </p>
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="font-semibold text-red-800 mb-2">
                🗑️ Dreptul la Ștergere
              </h3>
              <p className="text-red-700 text-sm">
                Să solicitați ștergerea datelor personale
              </p>
            </div>

            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <h3 className="font-semibold text-yellow-800 mb-2">
                ⏸️ Dreptul la Restricționare
              </h3>
              <p className="text-yellow-700 text-sm">
                Să limitați procesarea datelor în anumite situații
              </p>
            </div>

            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h3 className="font-semibold text-purple-800 mb-2">
                📤 Dreptul la Portabilitate
              </h3>
              <p className="text-purple-700 text-sm">
                Să primiți datele într-un format structurat
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-2">
                🚫 Dreptul la Opoziție
              </h3>
              <p className="text-gray-700 text-sm">
                Să vă opuneți anumitor tipuri de prelucrare
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            5. Bazele Legale de Prelucrare
          </h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <strong>Consimțământul:</strong> Pentru newsletter și marketing
              personalizat
            </li>
            <li>
              <strong>Contractul:</strong> Pentru procesarea comenzilor și
              furnizarea serviciilor
            </li>
            <li>
              <strong>Interesul legitim:</strong> Pentru îmbunătățirea
              serviciilor și securitate
            </li>
            <li>
              <strong>Obligația legală:</strong> Pentru respectarea legislației
              fiscale
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            6. Împărtășirea Datelor cu Terțe Părți
          </h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800">
              <strong>Principiu:</strong> Nu vindem datele personale unor terțe
              părți. Partajăm date doar în situații specifice:
            </p>
          </div>

          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <strong>Furnizorii de servicii:</strong> Curierii pentru livrare,
              procesatorii de plăți
            </li>
            <li>
              <strong>Servicii cloud:</strong> Firebase/Google Cloud pentru
              hosting securizat
            </li>
            <li>
              <strong>Analize:</strong> Google Analytics (date anonimizate)
            </li>
            <li>
              <strong>Obligații legale:</strong> Autorități competente când
              legea o impune
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            7. Securitatea Datelor
          </h2>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-600 text-xl">🔒</span>
              <p className="text-green-800">
                <strong>Criptarea SSL/TLS</strong> pentru toate transmisiile de
                date
              </p>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 text-xl">🔐</span>
              <p className="text-blue-800">
                <strong>Autentificare multi-factor</strong> pentru conturile
                administrative
              </p>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-600 text-xl">💾</span>
              <p className="text-purple-800">
                <strong>Backup-uri criptate</strong> în multiple locații sigure
              </p>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-600 text-xl">👥</span>
              <p className="text-orange-800">
                <strong>Acces restricționat</strong> doar pentru personalul
                autorizat
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            8. Perioada de Păstrare a Datelor
          </h2>

          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="font-semibold text-gray-800">
                👤 Date de cont activ:{" "}
                <span className="text-green-600">
                  Cât timp contul este activ
                </span>
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="font-semibold text-gray-800">
                🛒 Comenzi și facturi:{" "}
                <span className="text-blue-600">
                  10 ani (legislația fiscală)
                </span>
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="font-semibold text-gray-800">
                🧠 Date terapeutice:{" "}
                <span className="text-purple-600">
                  5 ani sau conform reglementărilor profesionale
                </span>
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="font-semibold text-gray-800">
                📊 Analize anonimizate:{" "}
                <span className="text-orange-600">
                  Nelimitat (fără identificare personală)
                </span>
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="font-semibold text-gray-800">
                🗑️ Cont inactiv:{" "}
                <span className="text-red-600">
                  Ștergere după 3 ani de inactivitate
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            9. Transferuri Internaționale
          </h2>
          <p className="mb-4 text-gray-700">
            Datele sunt procesate în principal în UE. Pentru serviciile cloud
            (Firebase/Google), datele pot fi transferate în SUA prin mecanisme
            de protecție adecvate (Google este certificat pentru Privacy Shield
            și utilizează clauze contractuale standard).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            10. Cookie-uri și Tehnologii Similare
          </h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <strong>Cookie-uri esențiale:</strong> Necesare pentru
              funcționarea site-ului
            </li>
            <li>
              <strong>Cookie-uri de analiză:</strong> Google Analytics (cu
              anonimizare IP)
            </li>
            <li>
              <strong>Cookie-uri de preferințe:</strong> Setările și limba
              utilizatorului
            </li>
            <li>
              <strong>Gestionarea cookie-urilor:</strong> Prin setările
              browserului
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            11. Minorii și Protecția Datelor
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 mb-2">
              <strong>Vârsta minimă:</strong> 16 ani pentru consimțământ
              independent
            </p>
            <ul className="list-disc pl-6 text-red-700">
              <li>Sub 16 ani: necesită consimțământul părinților/tutorilor</li>
              <li>Verificări suplimentare pentru serviciile de terapie</li>
              <li>Protecție specială pentru datele minorilor</li>
            </ul>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            12. Cum să vă Exercitați Drepturile
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">
              Pentru a vă exercita drepturile GDPR:
            </h3>
            <ul className="list-disc pl-6 text-blue-700 space-y-1">
              <li>
                <strong>Email:</strong> lupulsicorbul@gmail.com cu subiectul
                "Solicitare GDPR"
              </li>
              <li>
                <strong>Formular online:</strong> Secțiunea "Protecția datelor"
                din contul personal
              </li>
              <li>
                <strong>Poștă:</strong> Str. 9 MAI, Petroșani, Hunedoara (cu
                confirmare de primire)
              </li>
              <li>
                <strong>Telefon:</strong> 0734 931 703 (Luni-Vineri, 9:00-17:00)
              </li>
            </ul>
            <p className="mt-3 text-blue-800 text-sm">
              <strong>Timp de răspuns:</strong> Maximum 30 zile de la primirea
              solicitării
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            13. Reclamații și Autoritatea de Supraveghere
          </h2>
          <p className="mb-4 text-gray-700">
            Dacă considerați că drepturile dumneavoastră GDPR au fost încălcate,
            puteți depune o plângere la:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="font-semibold text-gray-800">
              Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
              Caracter Personal (ANSPDCP)
            </p>
            <ul className="list-none text-gray-700 mt-2">
              <li>📧 anspdcp@dataprotection.ro</li>
              <li>📞 +40.318.059.211</li>
              <li>📍 B-dul Magheru 28-30, Sector 1, București</li>
              <li>🌐 dataprotection.ro</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>&copy; {currentYear} Lupul și Corbul. Toate drepturile rezervate.</p>
        <p className="mt-2">
          Această politică este în conformitate cu GDPR (Regulamentul UE
          2016/679)
        </p>
      </div>
    </div>
  );
};

export default GDPRPolicy;
