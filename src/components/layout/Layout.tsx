import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-container flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Lupul și Corbul</h3>
              <p className="text-gray-300">Empatie, Conexiune, Echilibru.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <p className="text-gray-300">Email: contact@lupulsicorbul.ro</p>
              <p className="text-gray-300">Telefon: +40 712 345 678</p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Program</h3>
              <p className="text-gray-300">Luni - Vineri: 9:00 - 18:00</p>
              <p className="text-gray-300">Sâmbătă: 10:00 - 14:00</p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">© {new Date().getFullYear()} Lupul și Corbul. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;