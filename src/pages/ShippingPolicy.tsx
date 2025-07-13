import React from "react";

const ShippingPolicy: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Politica de Livrare
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            1. Zonele de Livrare
          </h2>
          <p className="mb-4 text-gray-700">Livrăm în următoarele zone:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <strong>România:</strong> În toate localitățile (urban și rural)
            </li>
            <li>
              <strong>Zona Hunedoara - Petroșani:</strong> Livrare prioritară în
              24-48 ore
            </li>
            <li>
              <strong>Orașe mari:</strong> București, Cluj, Timișoara, Iași,
              Constanța - 2-3 zile lucrătoare
            </li>
            <li>
              <strong>Alte localități:</strong> 3-5 zile lucrătoare
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            2. Costuri de Livrare
          </h2>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-semibold">
              🚚 Transport GRATUIT pentru comenzi peste 200 RON
            </p>
          </div>

          <p className="mb-4 text-gray-700">Pentru comenzi sub 200 RON:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <strong>Zona Hunedoara:</strong> 15 RON
            </li>
            <li>
              <strong>Orașe mari:</strong> 20 RON
            </li>
            <li>
              <strong>Localități rurale:</strong> 25 RON
            </li>
            <li>
              <strong>Livrare expresă (24h):</strong> +15 RON suplimentar
            </li>
          </ul>

          <p className="mb-4 text-gray-700">
            <strong>Produse digitale (Embleme):</strong> Livrare instantanee în
            cont - GRATUITĂ
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            3. Modalități de Livrare
          </h2>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                📦 Livrare Standard prin Curier
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Colaborăm cu FAN Courier și DPD</li>
                <li>Livrare la adresa specificată</li>
                <li>Program: Luni-Vineri, 9:00-18:00</li>
                <li>Confirmare telefonică înainte de livrare</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                🏪 Ridicare din Puncte de Ridicare
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Easybox și FAN Box disponibile</li>
                <li>Cost: 10 RON (indiferent de valoarea comenzii)</li>
                <li>Notificare SMS la sosirea coletului</li>
                <li>Păstrare 5 zile lucrătoare</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                🏢 Ridicare Personală
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Adresa: Str. 9 MAI, Petroșani, Hunedoara</li>
                <li>Program: Luni-Vineri, 10:00-17:00</li>
                <li>Sâmbătă: 10:00-14:00 (doar cu programare)</li>
                <li>GRATUIT - fără costuri de transport</li>
                <li>Necesară programare prealabilă la 0734 931 703</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            4. Timpul de Procesare
          </h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <strong>Produse în stoc:</strong> Procesare în 24 ore lucrătoare
            </li>
            <li>
              <strong>Produse la comandă:</strong> 3-7 zile lucrătoare
            </li>
            <li>
              <strong>Embleme digitale:</strong> Livrare instantanée în cont
            </li>
            <li>
              <strong>Comenzi weekend:</strong> Procesare începând de luni
            </li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Notă:</strong> În perioada sărbătorilor (Crăciun, Paște,
              etc.) timpii de livrare se pot prelungi cu 1-2 zile suplimentare.
            </p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            5. Urmărirea Comenzii
          </h2>
          <p className="mb-4 text-gray-700">
            Puteți urmări statusul comenzii prin:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Contul personal de pe site (secțiunea "Comenzile mele")</li>
            <li>Email-ul de confirmare cu numărul AWB</li>
            <li>Site-urile oficiale ale curierilor (FAN Courier, DPD)</li>
            <li>Telefonic la 0734 931 703</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            6. Livrarea Produselor Digitale
          </h2>
          <p className="mb-4 text-gray-700">
            Pentru emblemele digitale și produsele virtuale:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Livrare instantanée în contul personal</li>
            <li>Notificare prin email și în aplicație</li>
            <li>Acces permanent din dashboard-ul personal</li>
            <li>Backup automat în cloud</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            7. Probleme la Livrare
          </h2>
          <p className="mb-4 text-gray-700">În caz de probleme cu livrarea:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <strong>Produse deteriorate:</strong> Refuzați coletul și
              contactați-ne imediat
            </li>
            <li>
              <strong>Produse lipsă:</strong> Verificați conținutul și raportați
              în 24 ore
            </li>
            <li>
              <strong>Adresa incorectă:</strong> Taxa suplimentară de
              reexpediere: 20 RON
            </li>
            <li>
              <strong>Destinatar absent:</strong> 3 încercări de livrare, apoi
              retur la expeditor
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            8. Livrări Internaționale
          </h2>
          <p className="mb-4 text-gray-700">
            Momentan nu oferim livrări internaționale pentru produse fizice.
          </p>
          <p className="mb-4 text-gray-700">
            <strong>Produsele digitale</strong> sunt disponibile în toate țările
            din UE.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            9. Forță Majoră
          </h2>
          <p className="mb-4 text-gray-700">
            În situații de forță majoră (calamități naturale, pandemii, greve),
            timpii de livrare se pot prelungi. Veți fi notificați despre orice
            întârzieri.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            10. Contact pentru Livrări
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="mb-2 text-blue-800">
              <strong>
                Pentru întrebări despre livrarea comenzii dumneavoastră:
              </strong>
            </p>
            <ul className="list-disc pl-6 text-blue-700">
              <li>Email: lupulsicorbul@gmail.com</li>
              <li>Telefon: 0734 931 703</li>
              <li>Program: Luni-Vineri, 9:00-17:00</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>&copy; {currentYear} Lupul și Corbul. Toate drepturile rezervate.</p>
      </div>
    </div>
  );
};

export default ShippingPolicy;
