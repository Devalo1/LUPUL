import React from "react";

const PrivacyPolicy: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Politica de Confidențialitate</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">Ultima actualizare: {new Date().toLocaleDateString("ro-RO")}</p>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Introducere</h2>
          <p className="mb-4 text-gray-700">
            SC. HIFTIBOX SRL („noi", „nouă", „al nostru") operează site-ul web lupulsicorbul.com 
            (denumit în continuare „Serviciul"). Această pagină vă informează despre politicile noastre 
            privind colectarea, utilizarea și divulgarea datelor personale atunci când utilizați Serviciul 
            nostru și opțiunile pe care le aveți asociate acestor date.
          </p>
          <p className="mb-4 text-gray-700">
            Utilizăm datele dumneavoastră pentru a furniza și îmbunătăți Serviciul. Prin utilizarea 
            Serviciului, sunteți de acord cu colectarea și utilizarea informațiilor în conformitate cu 
            această politică.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Date Colectate și Utilizare</h2>
          <p className="mb-4 text-gray-700">
            Colectăm mai multe tipuri de informații în diverse scopuri pentru a vă furniza și 
            îmbunătăți Serviciul nostru.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2 text-gray-800">Date Personale</h3>
          <p className="mb-4 text-gray-700">
            În timpul utilizării Serviciului nostru, este posibil să vă solicităm să ne furnizați 
            anumite informații de identificare personală care pot fi utilizate pentru a vă contacta 
            sau identifica („Date Personale"). Informațiile de identificare personală pot include, 
            dar nu se limitează la:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Adresa de email</li>
            <li>Numele și prenumele</li>
            <li>Numărul de telefon</li>
            <li>Adresa, localitatea, codul poștal, orașul</li>
            <li>Cookie-uri și date de utilizare</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Utilizarea Datelor Google</h2>
          <p className="mb-4 text-gray-700">
            Aplicația noastră Lupul și Corbul accesează, utilizează, stochează și partajează date 
            Google în conformitate cu Politica de confidențialitate Google și cu cerințele de utilizare limitată.
            În special, aderăm la următoarele principii:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Utilizarea datelor utilizatorilor Google este limitată la funcționalitățile necesare pentru aplicația noastră.</li>
            <li>Nu vom vinde datele utilizatorilor Google.</li>
            <li>Nu folosim sau transferăm datele utilizatorilor Google pentru publicitate personalizată.</li>
            <li>Nu înglobăm falsuri sau declarații înșelătoare despre identitatea noastră.</li>
            <li>Păstrăm transparența cu privire la colectarea și utilizarea datelor, și respectăm practicile adecvate de securitate și confidențialitate.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Date de Utilizare</h2>
          <p className="mb-4 text-gray-700">
            De asemenea, putem colecta informații despre modul în care este accesat și utilizat Serviciul 
            („Date de Utilizare"). Aceste Date de Utilizare pot include informații precum adresa de 
            protocol Internet a computerului dumneavoastră (de exemplu, adresa IP), tipul browserului, 
            versiunea browserului, paginile Serviciului nostru pe care le vizitați, ora și data vizitei 
            dumneavoastră, timpul petrecut pe acele pagini, identificatori unici de dispozitive și alte 
            date de diagnosticare.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Cookie-uri</h2>
          <p className="mb-4 text-gray-700">
            Folosim cookie-uri și tehnologii de urmărire similare pentru a urmări activitatea pe 
            Serviciul nostru și pentru a păstra anumite informații.
          </p>
          <p className="mb-4 text-gray-700">
            Cookie-urile sunt fișiere cu o cantitate mică de date care pot include un identificator 
            unic anonim. Cookie-urile sunt trimise browserului dumneavoastră de pe un site web și 
            stocate pe dispozitivul dumneavoastră. Tehnologiile de urmărire utilizate sunt, de asemenea, 
            beacons, etichete și scripturi pentru a colecta și urmări informații și pentru a îmbunătăți 
            și analiza Serviciul nostru.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Securitatea Datelor</h2>
          <p className="mb-4 text-gray-700">
            Securitatea datelor dumneavoastră este importantă pentru noi, dar rețineți că nicio metodă 
            de transmitere prin Internet sau metodă de stocare electronică nu este 100% sigură. Deși ne 
            străduim să folosim mijloace comercial acceptabile pentru a vă proteja Datele Personale, nu 
            putem garanta securitatea absolută a acestora.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Drepturile Dumneavoastră</h2>
          <p className="mb-4 text-gray-700">
            Dacă sunteți rezident în Uniunea Europeană, aveți anumite drepturi privind protecția datelor. 
            Dorim să luăm măsuri rezonabile pentru a vă permite să corectați, modificați, ștergeți sau 
            limitați utilizarea Datelor dumneavoastră Personale.
          </p>
          <p className="mb-4 text-gray-700">
            Vă rugăm să ne contactați la lupulsicorbul@gmail.com dacă doriți să aflați ce Date Personale 
            deținem despre dumneavoastră și dacă doriți să fie eliminate din sistemele noastre.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Modificări ale Politicii de Confidențialitate</h2>
          <p className="mb-4 text-gray-700">
            Putem actualiza Politica noastră de Confidențialitate din când în când. Vă vom notifica despre 
            orice modificări prin postarea noii Politici de Confidențialitate pe această pagină.
          </p>
          <p className="mb-4 text-gray-700">
            Vă recomandăm să revizuiți periodic această Politică de Confidențialitate pentru eventuale 
            modificări. Modificările aduse acestei Politici de Confidențialitate sunt eficiente atunci 
            când sunt postate pe această pagină.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Contactați-ne</h2>
          <p className="mb-4 text-gray-700">
            Dacă aveți întrebări despre această Politică de Confidențialitate, vă rugăm să ne contactați:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Prin email: lupulsicorbul@gmail.com</li>
            <li>Prin telefon: 0734 931 703</li>
            <li>Prin poștă: Str. 9 MAI Petrosani Hunedoara</li>
          </ul>
        </section>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>&copy; {currentYear} Lupul și Corbul. Toate drepturile rezervate.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;