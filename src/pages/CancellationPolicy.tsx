import React from "react";

const CancellationPolicy: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Politica de Anulare Comandă
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            1. Dreptul de Anulare
          </h2>
          <p className="mb-4 text-gray-700">
            Conform legislației române și directivelor europene, aveți dreptul
            să anulați comanda în termen de{" "}
            <strong>14 zile calendaristice</strong> de la primirea produselor,
            fără a fi necesar să specificați motivul.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              <strong>Perioadă de reflexie:</strong> 14 zile pentru anulare
              gratuită
            </p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            2. Anularea Comenzii înainte de Livrare
          </h2>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                📝 Comenzi Noi (în primele 2 ore)
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Anulare gratuită și imediată</li>
                <li>Rambursare integrală în maximum 24 ore</li>
                <li>Puteți anula direct din contul personal</li>
                <li>Nu se percep taxe de anulare</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                📦 Comenzi în Procesare (2-24 ore)
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Anulare posibilă prin contact telefonic</li>
                <li>
                  Rambursare integrală dacă produsele nu au fost expediate
                </li>
                <li>Timp de răspuns: maximum 4 ore în zilele lucrătoare</li>
                <li>Contactați-ne la 0734 931 703</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                🚚 Comenzi Expediate
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Refuzați coletul la livrare (fără a-l deschide)</li>
                <li>Sau returnați produsele conform politicii de retur</li>
                <li>Costurile de transport retur sunt suportate de client</li>
                <li>
                  Taxa de retur: 15-25 RON (în funcție de zona de livrare)
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            3. Anularea Produselor Digitale (Embleme)
          </h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800">
              <strong>Atenție:</strong> Produsele digitale au reguli speciale de
              anulare
            </p>
          </div>

          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <strong>Înainte de activare:</strong> Anulare gratuită în primele
              24 ore
            </li>
            <li>
              <strong>După activare:</strong> Nu se poate anula (conform art. 16
              lit. m din OUG 34/2014)
            </li>
            <li>
              <strong>Emblemele nefolosite:</strong> Rambursare parțială (80%)
              în primele 7 zile
            </li>
            <li>
              <strong>Probleme tehnice:</strong> Înlocuire gratuită sau
              rambursare integrală
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            4. Anularea Serviciilor și Programărilor
          </h2>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                🧠 Servicii de Terapie
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>
                  <strong>Cu 48 ore înainte:</strong> Anulare gratuită
                </li>
                <li>
                  <strong>24-48 ore înainte:</strong> Taxa de anulare 30%
                </li>
                <li>
                  <strong>Sub 24 ore:</strong> Taxa de anulare 50%
                </li>
                <li>
                  <strong>Fără notificare:</strong> Taxa integrală
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                🎪 Evenimente și Workshop-uri
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>
                  <strong>Cu 7 zile înainte:</strong> Rambursare integrală
                </li>
                <li>
                  <strong>3-7 zile înainte:</strong> Rambursare 80%
                </li>
                <li>
                  <strong>1-3 zile înainte:</strong> Rambursare 50%
                </li>
                <li>
                  <strong>În ziua evenimentului:</strong> Fără rambursare
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            5. Procedura de Anulare
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Pasul 1: Solicitarea Anulării
            </h3>
            <ul className="list-disc pl-6 text-blue-700">
              <li>Prin contul personal pe site (cel mai rapid)</li>
              <li>Email la: lupulsicorbul@gmail.com</li>
              <li>Telefonic la: 0734 931 703</li>
              <li>Specificați numărul comenzii și motivul anulării</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Pasul 2: Confirmarea Anulării
            </h3>
            <ul className="list-disc pl-6 text-blue-700">
              <li>Veți primi confirmarea în maximum 24 ore</li>
              <li>Email cu detaliile procesului de rambursare</li>
              <li>
                Instrucțiuni pentru returnarea produselor (dacă este cazul)
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Pasul 3: Rambursarea
            </h3>
            <ul className="list-disc pl-6 text-blue-700">
              <li>Prin aceeași metodă de plată folosită la cumpărare</li>
              <li>Timp de procesare: 3-10 zile lucrătoare</li>
              <li>Notificare prin email când rambursarea este inițiată</li>
            </ul>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            6. Excepții de la Dreptul de Anulare
          </h2>
          <p className="mb-4 text-gray-700">
            Conform art. 16 din OUG 34/2014, următoarele produse nu pot fi
            anulate:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Produse personalizate sau modificate la cererea clientului</li>
            <li>
              Servicii deja prestate integral (sesiuni de terapie finalizate)
            </li>
            <li>Produse digitale activate și utilizate</li>
            <li>Produse deteriorate din vina clientului</li>
            <li>Evenimente la care ați participat deja</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            7. Cazuri Speciale
          </h2>

          <div className="space-y-4">
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h3 className="font-semibold text-orange-800 mb-2">
                🏥 Motive Medicale
              </h3>
              <p className="text-orange-700">
                În caz de probleme medicale dovedite cu certificate, oferim
                flexibilitate suplimentară și posibilitatea reprogramării fără
                taxe.
              </p>
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="font-semibold text-red-800 mb-2">
                ⚠️ Situații de Urgență
              </h3>
              <p className="text-red-700">
                Pentru situații de urgență (deces în familie, calamități),
                analizăm fiecare caz individual și oferim soluții personalizate.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            8. Metodele de Rambursare
          </h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <strong>Plată cu cardul:</strong> Rambursare pe card în 3-10 zile
              lucrătoare
            </li>
            <li>
              <strong>Ramburs:</strong> Nu se aplică taxe de anulare
              suplimentare
            </li>
            <li>
              <strong>Transfer bancar:</strong> Rambursare prin transfer în 2-5
              zile
            </li>
            <li>
              <strong>Voucher:</strong> Opțional, cu valabilitate 12 luni și
              bonus 10%
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            9. Soluționarea Disputelor
          </h2>
          <p className="mb-4 text-gray-700">În caz de neînțelegeri:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Încercăm să rezolvăm amiabil în primă fază</li>
            <li>Puteți apela la ANPC pentru mediere</li>
            <li>
              Platforma SOL (solutionarea-online-litigii.ec.europa.eu) pentru UE
            </li>
            <li>Instanțele de judecată competente din România</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            10. Contact pentru Anulări
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="mb-2 text-red-800">
              <strong>Pentru anularea comenzii dumneavoastră:</strong>
            </p>
            <ul className="list-disc pl-6 text-red-700">
              <li>Email urgent: lupulsicorbul@gmail.com</li>
              <li>Telefon: 0734 931 703</li>
              <li>Program: Luni-Vineri, 9:00-17:00; Sâmbătă 10:00-14:00</li>
              <li>Cont personal: Secțiunea "Comenzile mele"</li>
            </ul>
            <p className="mt-2 text-red-700 text-sm">
              <strong>Notă:</strong> Cu cât contactați mai repede, cu atât sunt
              mai multe opțiuni de anulare gratuită.
            </p>
          </div>
        </section>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>&copy; {currentYear} Lupul și Corbul. Toate drepturile rezervate.</p>
      </div>
    </div>
  );
};

export default CancellationPolicy;
