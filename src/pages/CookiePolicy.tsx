import React from "react";

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">
          Politica de Cookie-uri
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <p className="text-sm text-gray-500 mb-6 text-center">
            Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
              1. Ce sunt cookie-urile?
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Cookie-urile sunt fișiere text de mici dimensiuni stocate pe
              dispozitivul dumneavoastră atunci când vizitați un site web. Ele
              ajută site-urile să funcționeze eficient și să ofere informații
              proprietarilor site-ului. Cookie-urile nu pot fi folosite pentru a
              rula programe sau a livra viruși pe computer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
              2. Cum folosim cookie-urile?
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Site-ul nostru folosește cookie-uri pentru a îmbunătăți experiența
              utilizatorului și pentru a furniza servicii personalizate. Folosim
              cookie-uri pentru:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2 pl-4">
              <li>Asigura funcționalitatea site-ului (cookie-uri esențiale)</li>
              <li>
                Analiza traficul și performanța site-ului (cookie-uri de
                performanță)
              </li>
              <li>
                Personaliza experiența utilizatorului (cookie-uri de
                funcționalitate)
              </li>
              <li>
                Furniza conținut publicitar relevant (cookie-uri de publicitate)
              </li>
              <li>Reține preferințele și setările utilizatorului</li>
              <li>Asigura securitatea și protecția împotriva fraudelor</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
              3. Tipuri de cookie-uri utilizate
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  🔒 Cookie-uri esențiale
                </h3>
                <p className="text-gray-700">
                  Necesare pentru funcționarea de bază a site-ului. Nu pot fi
                  dezactivate fără a afecta funcționalitatea site-ului. Includ
                  cookie-uri pentru autentificare, securitate și preferințe de
                  bază.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  📊 Cookie-uri de performanță
                </h3>
                <p className="text-gray-700">
                  Colectează informații despre modul în care vizitatorii
                  folosesc site-ul. Aceste date ne ajută să îmbunătățim
                  performanța și experiența utilizatorului. Toate datele sunt
                  anonimizate.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  ⚙️ Cookie-uri de funcționalitate
                </h3>
                <p className="text-gray-700">
                  Permit site-ului să rețină alegerile făcute de utilizator
                  (nume de utilizator, limba, regiunea) și să ofere funcții
                  îmbunătățite și personalizate.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  🎯 Cookie-uri de publicitate
                </h3>
                <p className="text-gray-700">
                  Folosite pentru a livra reclame mai relevante pentru
                  utilizator și interesele sale. Pot fi folosite pentru a măsura
                  eficacitatea campaniilor publicitare.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
              4. Gestionarea cookie-urilor
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Aveți control complet asupra cookie-urilor. Puteți controla și
              șterge cookie-urile prin setările browserului. Instrucțiuni pentru
              browserele populare:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🌐 Chrome</h4>
                <p className="text-sm text-gray-600">
                  Setări → Confidențialitate și securitate → Cookie-uri și alte
                  date ale site-ului
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🦊 Firefox</h4>
                <p className="text-sm text-gray-600">
                  Setări → Confidențialitate și securitate → Cookie-uri și date
                  ale site-ului
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🧭 Safari</h4>
                <p className="text-sm text-gray-600">
                  Preferințe → Confidențialitate → Gestionează datele site-ului
                  web
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🌊 Edge</h4>
                <p className="text-sm text-gray-600">
                  Setări → Cookie-uri și permisiuni ale site-ului
                </p>
              </div>
            </div>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-gray-700">
                <strong>Atenție:</strong> Dezactivarea cookie-urilor esențiale
                poate afecta funcționalitatea site-ului și poate împiedica
                accesul la anumite funcții.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
              5. Cookie-uri terțe
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Site-ul nostru poate include cookie-uri plasate de terți pentru:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 pl-4">
              <li>
                <strong>Google Analytics:</strong> Pentru analiza traficului și
                performanței
              </li>
              <li>
                <strong>Firebase:</strong> Pentru autentificare și baza de date
              </li>
              <li>
                <strong>Rețele sociale:</strong> Pentru funcționalități de
                partajare
              </li>
              <li>
                <strong>Procesatori de plăți:</strong> Pentru tranzacții sigure
              </li>
            </ul>
            <p className="text-gray-700">
              Aceste servicii terțe au propriile politici de confidențialitate
              și cookie-uri, pe care vă recomandăm să le consultați.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
              6. Durata cookie-urilor
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600">📅</span>
                <div>
                  <strong className="text-gray-800">
                    Cookie-uri de sesiune:
                  </strong>
                  <span className="text-gray-700">
                    {" "}
                    Se șterg automat când închideți browserul
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600">🔄</span>
                <div>
                  <strong className="text-gray-800">
                    Cookie-uri persistente:
                  </strong>
                  <span className="text-gray-700">
                    {" "}
                    Rămân pe dispozitiv pentru o perioadă determinată (max. 24
                    luni)
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
              7. Actualizări ale politicii
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Această politică poate fi actualizată periodic pentru a reflecta
              modificările în practicile noastre sau în legislație. Vă
              recomandăm să verificați această pagină regulat pentru ultimele
              informații.
            </p>
          </section>

          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📞 Contact și întrebări
            </h2>
            <p className="text-gray-700 mb-4">
              Pentru orice întrebări privind această politică de cookie-uri sau
              pentru a vă exercita drepturile, ne puteți contacta:
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:lupulsicorbul@gmail.com"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  lupulsicorbul@gmail.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Adresă:</strong> România
              </p>
              <p className="text-gray-700">
                <strong>Program răspuns:</strong> Luni - Vineri, 9:00 - 17:00
              </p>
            </div>
          </section>
        </div>

        {/* Buton înapoi */}
        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
          >
            ← Înapoi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
