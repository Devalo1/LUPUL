import React from "react";

const Ong: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 ong-section">
      <h1 className="text-3xl font-bold mb-6 text-center">Făuritorii de destin</h1>
      <p className="text-center text-lg mb-10">Un nou început pentru viitorul copiilor</p>
      
      <div className="max-w-3xl mx-auto">
        <img 
          src="/images/AdobeStock_217770381.jpeg" 
          alt="Făuritorii de destin" 
          className="w-full h-auto rounded-lg shadow-lg mb-6"
        />
        
        <p className="mb-6 text-lg">
          Asociația „Făuritorii de Destin" este o inițiativă nouă, născută din dorința de a oferi un viitor mai bun copiilor 
          din medii defavorizate. Suntem la început de drum, dar cu viziune clară și determinare puternică.
          Prin implicarea ta și formularul 230, putem transforma speranța în realitate pentru acești copii.
          Alătură-te nouă în această călătorie de a construi fundația unui viitor mai bun pentru ei!
        </p>

        <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-500 mb-8">
          <h2 className="text-2xl font-bold mb-4">Viziunea noastră</h2>
          <p className="mb-4">
            Ne propunem să creăm un spațiu sigur și primitor pentru copiii din medii vulnerabile, unde să primească 
            suport educațional, emoțional și material. Credem cu tărie că fiecare copil merită șansa de a-și dezvolta 
            potențialul, indiferent de circumstanțele în care s-a născut.
          </p>
          <p>
            În primii ani, ne concentrăm pe stabilirea infrastructurii, crearea programelor educaționale de bază și 
            formarea unei comunități de sprijin pentru copiii care au nevoie cel mai mult de ajutorul nostru.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-blue-700">Cum te poți implica</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Donează prin formularul 230 - redirecționează 3.5% din impozitul pe venit</li>
              <li>Donații directe prin transfer bancar sau online</li>
              <li>Voluntariat - avem nevoie de ajutor în organizare și implementare</li>
              <li>Sponsorizări din partea companiilor</li>
              <li>Sprijin în promovarea cauzei noastre</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-green-700">Impactul contribuției tale</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Renovarea și amenajarea spațiilor pentru activități educaționale</li>
              <li>Achiziționarea de materiale didactice și echipamente</li>
              <li>Dezvoltarea programelor educaționale și recreative</li>
              <li>Consiliere și suport psihologic pentru copii</li>
              <li>Crearea unui mediu stimulativ pentru dezvoltarea personală</li>
            </ul>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Obiectivele noastre pentru 2025-2026</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-blue-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.166 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Centru educațional</h3>
                <p className="text-gray-700 mb-4">Amenajarea unui spațiu dedicat activităților educaționale pentru 20 de copii, cu infrastructura și materialele necesare.</p>
                <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">În planificare</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-green-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Program After-School</h3>
                <p className="text-gray-700 mb-4">Dezvoltarea unui program de activități după școală, cu sprijin la teme și activități recreative pentru dezvoltarea abilităților sociale.</p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Prima etapă</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-purple-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Consiliere și suport</h3>
                <p className="text-gray-700 mb-4">Formarea unei echipe de specialiști pentru oferirea de consiliere psihologică și suport personalizat pentru copii și familiile lor.</p>
                <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">În planificare</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Țintele noastre pentru primul an</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <span className="block text-3xl font-bold text-blue-700 mb-1">20</span>
              <span className="text-sm text-gray-600">Copii sprijiniți</span>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <span className="block text-3xl font-bold text-green-700 mb-1">1</span>
              <span className="text-sm text-gray-600">Centru amenajat</span>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <span className="block text-3xl font-bold text-purple-700 mb-1">10</span>
              <span className="text-sm text-gray-600">Voluntari activi</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <span className="block text-3xl font-bold text-amber-700 mb-1">3</span>
              <span className="text-sm text-gray-600">Programe educaționale</span>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Donează prin formularul 230</h2>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="mb-4">
              Cea mai simplă modalitate de a ne susține este prin redirecționarea a 3.5% din impozitul pe venit, 
              fără niciun cost suplimentar pentru tine. Completează formularul 230 cu datele noastre:
            </p>
            <div className="bg-white p-4 rounded border mb-4">
              <p className="font-semibold">Asociația "Făuritorii de Destin"</p>
              <p>Cod Fiscal: RO12345678</p>
              <p>Cont IBAN: RO98BTRL12345678901234567</p>
            </div>
            <div className="flex justify-center">
              <a 
                href="/docs/formular-230.pdf" 
                className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Descarcă formularul 230
              </a>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Adresă:</h3>
              <p>Strada 9 Mai, Petroșani</p>
              <h3 className="font-semibold mt-4 mb-2">Telefon:</h3>
              <p>0734 931 703</p>
              <h3 className="font-semibold mt-4 mb-2">Email:</h3>
              <p>lupulsicorbul@gmail.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Program vizite:</h3>
              <p>Luni - Vineri: 10:00 - 18:00</p>
              <p>Sâmbătă: 10:00 - 14:00</p>
              <p>Duminică: Închis</p>
              
              <h3 className="font-semibold mt-4 mb-2">Rețele sociale:</h3>
              <div className="flex space-x-4">
                <a href="https://facebook.com/fauritoridedestin" className="text-blue-600 hover:text-blue-800">Facebook</a>
                <a href="https://instagram.com/fauritoridedestin" className="text-pink-600 hover:text-pink-800">Instagram</a>
                <a href="https://youtube.com/fauritoridedestin" className="text-red-600 hover:text-red-800">YouTube</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Căutăm parteneri</h2>
          <p className="mb-6">
            Suntem în căutare de organizații și companii care doresc să se alăture misiunii noastre. Dacă împărtășești valorile noastre 
            și dorești să contribui la transformarea vieților acestor copii, te invităm să devii partenerul nostru în această călătorie.
          </p>
          <div className="text-center">
            <a href="/contact" className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              Devino partener
            </a>
          </div>
        </div>

        <div className="text-center">
          <button className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
            Donează acum
          </button>
          <p className="mt-4 text-sm text-gray-600">
            Fiecare contribuție, oricât de mică, poate face o diferență enormă în startul acestui proiect.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Ong;
