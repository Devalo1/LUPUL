import React from "react";
import { Link } from "react-router-dom";

const ANPCConsumerInfo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Informații pentru Consumatori ANPC
            </h1>
            <p className="text-lg text-gray-600">
              Măsuri de informare a consumatorilor cu privire la soluționarea
              alternativă a litigiilor
            </p>
          </div>

          <div className="space-y-8">
            {/* Soluționarea Alternativă a Litigiilor */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Soluționarea Alternativă a Litigiilor (SAL)
              </h2>
              <div className="prose prose-lg text-gray-700">
                <p className="mb-4">
                  Conform legislației în vigoare, în cazul apariției unei
                  dispute între consumator și comerciant, consumatorul poate
                  recurge la mecanismele de soluționare alternativă a litigiilor
                  (SAL).
                </p>
                <p className="mb-4">
                  Soluționarea alternativă a litigiilor reprezintă o modalitate
                  rapidă, eficientă și mai puțin costisitoare de rezolvare a
                  disputelor între consumatori și comercianți, fără a fi
                  necesară adresarea în instanță.
                </p>
              </div>
            </section>

            {/* Platforma ODR */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Platforma ODR - Soluționarea Online a Litigiilor
              </h2>
              <div className="prose prose-lg text-gray-700">
                <p className="mb-4">
                  Pentru contractele încheiate online, consumatorii pot accesa
                  platforma europeană de soluționare online a litigiilor (ODR -
                  Online Dispute Resolution).
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-semibold">
                    Platforma ODR este disponibilă la adresa:
                  </p>
                  <a
                    href="https://ec.europa.eu/consumers/odr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </div>
              </div>
            </section>

            {/* Entitățile de SAL din România */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Entitățile de SAL Autorizate din România
              </h2>
              <div className="prose prose-lg text-gray-700">
                <p className="mb-4">
                  În România, următoarele entități sunt autorizate să desfășoare
                  activități de soluționare alternativă a litigiilor:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Centrul de Soluționare Alternativă a Litigiilor din cadrul
                      ANPC
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Adresa:</strong> Str. Apolodor nr. 17, sector 5,
                      București
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Telefon:</strong> 021.9551 sau 021.3194975
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Email:</strong> office@anpc.ro
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Website:</strong>
                      <a
                        href="https://anpc.ro/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline ml-1"
                      >
                        anpc.ro
                      </a>
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Centrul de Mediere și Arbitraj al CCIR
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Adresa:</strong> Bd. Octavian Goga nr. 2, sector
                      3, București
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Telefon:</strong> 021.3199610
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Email:</strong> arbitraj@ccir.ro
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Website:</strong>
                      <a
                        href="https://ccir.ro/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline ml-1"
                      >
                        ccir.ro
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Cum funcționează SAL */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Cum Funcționează SAL
              </h2>
              <div className="prose prose-lg text-gray-700">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-4">
                    Procesul SAL:
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-green-800">
                    <li>
                      Consumatorul depune o cerere de soluționare alternativă a
                      litigiului
                    </li>
                    <li>Entitatea SAL verifică admisibilitatea cererii</li>
                    <li>
                      Se încearcă obținerea acordului comerciantului pentru
                      participarea la procedură
                    </li>
                    <li>
                      Se desfășoară procedura de soluționare (mediere,
                      conciliere sau arbitraj)
                    </li>
                    <li>Se comunică soluția propusă părților</li>
                  </ol>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    Important:
                  </h3>
                  <p className="text-yellow-800 text-sm">
                    Procedura SAL este gratuită pentru consumatori și are o
                    durată maximă de 90 de zile de la depunerea cererii
                    complete.
                  </p>
                </div>
              </div>
            </section>

            {/* Drepturile consumatorilor */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Drepturile Consumatorilor
              </h2>
              <div className="prose prose-lg text-gray-700">
                <p className="mb-4">
                  Consumatorii au următoarele drepturi în cadrul procesului de
                  SAL:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Dreptul de a fi informat despre procedura SAL</li>
                  <li>Dreptul de a fi asistat de un avocat sau consultant</li>
                  <li>Dreptul de a retrage cererea în orice moment</li>
                  <li>Dreptul de a refuza soluția propusă</li>
                  <li>Dreptul de a se adresa ulterior în instanță</li>
                </ul>
              </div>
            </section>

            {/* Contact și Informații */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact și Informații Suplimentare
              </h2>
              <div className="prose prose-lg text-gray-700">
                <p className="mb-4">
                  Pentru informații suplimentare despre drepturile
                  consumatorilor și procedurile SAL, vă recomandăm să
                  consultați:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      ANPC - Autoritatea Națională pentru Protecția
                      Consumatorilor
                    </h3>
                    <p className="text-sm text-blue-800">
                      <a
                        href="https://anpc.ro/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        anpc.ro
                      </a>
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Platforma Europeană ODR
                    </h3>
                    <p className="text-sm text-blue-800">
                      <a
                        href="https://ec.europa.eu/consumers/odr/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        ec.europa.eu/consumers/odr/
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Navigation back */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ANPCConsumerInfo;
