import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16 md:pt-20">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Lupul și Corbul</h3>
              <p>Empatie, Conexiune, Echilibru</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Link-uri Rapide</h3>
              <ul className="space-y-2">
                <li><a href="/despre-noi" className="hover:text-blue-400 transition-colors">Despre Noi</a></li>
                <li><a href="/servicii" className="hover:text-blue-400 transition-colors">Servicii</a></li>
                <li><a href="/produse" className="hover:text-blue-400 transition-colors">Produse</a></li>
                <li><a href="/contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p>Email: contact@lupulsicorbul.ro</p>
              <p>Telefon: +40 123 456 789</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>&copy; {new Date().getFullYear()} Lupul și Corbul. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
