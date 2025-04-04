import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900 pt-16 pb-32 overflow-hidden">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative text-center sm:text-left pt-12 sm:pt-16 lg:pt-20">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Lupul și Corbul</span>
                <span className="block text-blue-500">Empatie. Conexiune. Echilibru.</span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl max-w-2xl mx-auto sm:mx-0">
                Oferim servicii terapeutice, produse pentru bunăstare și proiecte comunitare care vă ajută să vă reconectați cu natura, cu ceilalți și cu voi înșivă.
              </p>
              <div className="mt-8 sm:mt-10">
                {currentUser ? (
                  <Link to="/products" className="inline-block bg-blue-600 py-3 px-8 border border-transparent rounded-md text-white font-medium hover:bg-blue-700">
                    Explorează produsele
                  </Link>
                ) : (
                  <div className="space-x-4">
                    <Link to="/login" className="inline-block bg-blue-600 py-3 px-8 border border-transparent rounded-md text-white font-medium hover:bg-blue-700">
                      Autentificare
                    </Link>
                    <Link to="/products" className="inline-block bg-white py-3 px-8 border border-transparent rounded-md text-blue-600 font-medium hover:bg-gray-100">
                      Produse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Serviciile Noastre</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-4xl">
              Soluții pentru o viață echilibrată
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Descoperiți serviciile noastre create pentru a vă ajuta să găsiți echilibrul între minte, corp și spirit.
            </p>
          </div>

          <div className="mt-16 lg:mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Terapie și Consiliere</h3>
                <p className="mt-2 text-gray-600">Sesiuni personalizate pentru a vă ajuta să navigați prin provocările emoționale și să cultivați reziliența psihologică.</p>
              </div>

              {/* Service 2 */}
              <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Produse naturale</h3>
                <p className="mt-2 text-gray-600">Preparate artizanale din plante medicinale recoltate responsabil, create pentru a susține sănătatea și starea de bine.</p>
              </div>

              {/* Service 3 */}
              <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Ateliere și Experiențe</h3>
                <p className="mt-2 text-gray-600">Evenimente comunitare și ateliere creative pentru a cultiva conexiuni autentice și a învăța în comunitate.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Pregătit să începi călătoria?</span>
            <span className="block text-blue-100">Descoperă produsele și serviciile noastre.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/products" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                Produse
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/contact" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800">
                Contactează-ne
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
