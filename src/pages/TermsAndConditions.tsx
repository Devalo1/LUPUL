import React from "react";

const TermsAndConditions: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Termeni și Condiții
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            1. Informații Generale
          </h2>
          <p className="mb-4 text-gray-700">
            Prezentii Termeni și Condiții reglementează utilizarea site-ului web
            lupulsicorbul.com operat de SC. HIFTIBOX SRL, cu sediul în Str. 9
            MAI, Petroșani, Hunedoara, România.
          </p>
          <p className="mb-4 text-gray-700">
            Prin accesarea și utilizarea acestui site web, acceptați în
            totalitate acești termeni și condiții. Dacă nu sunteți de acord cu
            oricare dintre acești termeni, vă rugăm să nu utilizați acest site.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            2. Servicii și Produse
          </h2>
          <p className="mb-4 text-gray-700">
            "Lupul și Corbul" oferă următoarele servicii și produse:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Servicii de terapie psihologică și fizică</li>
            <li>Embleme digitale exclusive și colecționabile</li>
            <li>Evenimente private și workshop-uri pentru comunitate</li>
            <li>Produse naturale și de wellness</li>
            <li>Consultanță și support pentru dezvoltare personală</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            3. Prețuri și Plăți
          </h2>
          <p className="mb-4 text-gray-700">
            Toate prețurile afișate pe site sunt în lei românești (RON) și
            includ TVA unde este aplicabil.
          </p>
          <p className="mb-4 text-gray-700">Metodele de plată acceptate:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Ramburs la livrare</li>
            <li>Card bancar online (prin Netopia)</li>
            <li>Transfer bancar</li>
          </ul>
          <p className="mb-4 text-gray-700">
            Ne rezervăm dreptul de a modifica prețurile fără notificare
            prealabilă, însă orice comandă confirmată va fi onorată la prețul
            afișat în momentul plasării comenzii.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            4. Comenzi și Confirmări
          </h2>
          <p className="mb-4 text-gray-700">
            Plasarea unei comenzi pe site constituie o ofertă de cumpărare.
            Toate comenzile sunt supuse acceptării noastre.
          </p>
          <p className="mb-4 text-gray-700">
            Veți primi un email de confirmare după plasarea comenzii.
            Confirmarea comenzii nu garantează disponibilitatea produselor
            comandate.
          </p>
          <p className="mb-4 text-gray-700">
            Ne rezervăm dreptul de a refuza sau anula orice comandă din
            următoarele motive:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Produsul nu este disponibil</li>
            <li>Erori în descrierea produsului sau preț</li>
            <li>Suspiciuni de fraudă</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            5. Embleme Digitale și NFT
          </h2>
          <p className="mb-4 text-gray-700">
            Emblemele digitale sunt produse digitale unice și colecționabile cu
            următoarele caracteristici:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Sunt non-transferabile și legate de contul utilizatorului</li>
            <li>Oferă acces la evenimente exclusive și beneficii speciale</li>
            <li>Pot evolua în timp în funcție de activitatea utilizatorului</li>
            <li>Nu garantăm valoarea de revânzare sau schimb</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            6. Evenimente și Servicii
          </h2>
          <p className="mb-4 text-gray-700">
            Pentru serviciile de terapie și evenimente:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Programările se fac prin sistem online sau telefonic</li>
            <li>Anulările trebuie făcute cu minimum 24 ore înainte</li>
            <li>Serviciile sunt furnizate de specialiști autorizați</li>
            <li>
              Confidențialitatea este garantată conform standardelor
              profesionale
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            7. Proprietate Intelectuală
          </h2>
          <p className="mb-4 text-gray-700">
            Tot conținutul prezent pe acest site (texte, imagini, logo-uri,
            grafice) este proprietatea SC. HIFTIBOX SRL și este protejat de
            legile drepturilor de autor.
          </p>
          <p className="mb-4 text-gray-700">
            Este interzisă reproducerea, distribuirea sau utilizarea în alte
            scopuri a conținutului fără acordul scris al proprietarului.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            8. Limitarea Răspunderii
          </h2>
          <p className="mb-4 text-gray-700">
            SC. HIFTIBOX SRL nu își asumă răspunderea pentru:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Întreruperi temporare ale serviciului</li>
            <li>
              Pierderi datorate utilizării incorecte a produselor sau
              serviciilor
            </li>
            <li>Daune indirecte sau consecințiale</li>
            <li>Probleme tehnice independente de voința noastră</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            9. Protecția Datelor
          </h2>
          <p className="mb-4 text-gray-700">
            Colectarea și prelucrarea datelor personale se face în conformitate
            cu Regulamentul General privind Protecția Datelor (GDPR) și Politica
            noastră de Confidențialitate.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            10. Modificări ale Termenilor
          </h2>
          <p className="mb-4 text-gray-700">
            Ne rezervăm dreptul de a modifica acești termeni și condiții în
            orice moment. Modificările vor fi publicate pe această pagină și vor
            intra în vigoare imediat.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            11. Legislația Aplicabilă
          </h2>
          <p className="mb-4 text-gray-700">
            Acești termeni și condiții sunt guvernați de legislația română.
            Orice dispută va fi soluționată de instanțele competente din
            România.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            12. Contact
          </h2>
          <p className="mb-4 text-gray-700">
            Pentru întrebări legate de acești termeni și condiții, ne puteți
            contacta:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Email: lupulsicorbul@gmail.com</li>
            <li>Telefon: 0734 931 703</li>
            <li>Adresă: Str. 9 MAI, Petroșani, Hunedoara, România</li>
          </ul>
        </section>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>&copy; {currentYear} Lupul și Corbul. Toate drepturile rezervate.</p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
