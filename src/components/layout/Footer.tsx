import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">Lupul și Corbul</h4>
            <p className="text-gray-300 mb-4">Empatie, Conexiune, Echilibru</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Legături Rapide</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Acasă</Link></li>
              <li><Link to="/shop" className="text-gray-300 hover:text-white">Produse</Link></li>
              <li><Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Informații</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white">Despre noi</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white">Termeni și condiții</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white">Politica de confidențialitate</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-300 mb-2">Email: contact@lupul.ro</p>
            <p className="text-gray-300 mb-2">Telefon: +40 712 345 678</p>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg className="h-6 w-6 text-gray-300 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg className="h-6 w-6 text-gray-300 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Secțiunea pentru informații legale și logo-uri obligatorii */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          {/* Logo-uri ANPC, SOL și alte elemente obligatorii */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* ANPC Logo - Structură uniformă */}
            <div className="flex flex-col items-center">
              <a 
                href="https://anpc.ro/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-md mb-2 flex items-center justify-center h-16 w-full"
              >
                <img 
                  src="/images/anpc-logo.png" 
                  alt="ANPC - Autoritatea Națională pentru Protecția Consumatorilor" 
                  className="max-h-12 max-w-full object-contain"
                />
              </a>
              <p className="text-xs text-gray-400 text-center">Autoritatea Națională pentru Protecția Consumatorilor</p>
            </div>

            {/* SOL Platform Logo */}
            <div className="flex flex-col items-center">
              <a 
                href="https://ec.europa.eu/consumers/odr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-md mb-2 flex items-center justify-center h-16 w-full"
              >
                <img 
                  src="/images/sol-logo.png" 
                  alt="SOL - Soluționarea Online a Litigiilor" 
                  className="max-h-12 max-w-full object-contain"
                />
              </a>
              <p className="text-xs text-gray-400 text-center">Soluționarea Online a Litigiilor</p>
            </div>

            {/* InfoCons Logo - Folosim fișierul local */}
            <div className="flex flex-col items-center">
              <a 
                href="https://www.infocons.ro/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-md mb-2 flex items-center justify-center h-16 w-full"
              >
                <img 
                  src="/images/info-cons.png" 
                  alt="InfoCons - Asociația pentru Protecția Consumatorilor" 
                  className="max-h-12 max-w-full object-contain"
                  onError={(e) => {
                    console.error('Eroare la încărcarea logoului InfoCons local');
                    e.currentTarget.src = 'https://www.infocons.ro/wp-content/themes/sydney-child/images/InfoCons-logo.png';
                  }}
                />
              </a>
              <p className="text-xs text-gray-400 text-center">Asociația pentru Protecția Consumatorilor</p>
            </div>

            {/* Metode de plată */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-md mb-2 flex items-center justify-center h-16 w-full">
                <img 
                  src="/images/payment-methods.png" 
                  alt="Metode de plată acceptate" 
                  className="max-h-12 max-w-full object-contain"
                />
              </div>
              <p className="text-xs text-gray-400 text-center">Metode de plată acceptate</p>
            </div>
          </div>

          {/* Informații companie */}
          <div className="text-center text-xs text-gray-400 mb-6">
            <p className="mb-1">Lupul și Corbul SRL | CUI: RO12345678 | Reg. Comerțului: J12/345/2023</p>
            <p>Adresa: Str. Exemplu nr. 123, București, România | Email: contact@lupulcorbul.ro | Tel: +40 712 345 678</p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-4 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Lupul și Corbul. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;