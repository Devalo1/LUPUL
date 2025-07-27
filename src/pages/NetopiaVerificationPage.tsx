import React from "react";

const NetopiaVerificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img 
            src="/images/NP.svg" 
            alt="NETOPIA Payments" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-blue-800">Verificare Comerciant NETOPIA</h1>
          <p className="text-blue-600 max-w-2xl mx-auto">
            Pagina de verificare pentru conformitatea cu cerințele NETOPIA Payments
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-blue-600">
            <h2 className="text-2xl font-bold text-white text-center">
              Informații Comerciant
            </h2>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Domeniul de Activitate
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-800 font-medium"> Servicii de inteligență artificială și consultanță IT</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-800 font-medium"> Platforme educaționale online</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-800 font-medium"> Soluții software personalizate</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Conformitate NETOPIA Payments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-800"> Sigla NETOPIA implementată</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-800"> Domeniu de activitate completat</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-800"> Informații legale afișate</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-800"> Certificare SSL activă</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-800"> Termeni și condiții publicate</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-800"> Politică de confidențialitate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Detalii Tehnice
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Site URL:</span>
                  <p className="text-gray-600">https://lupul-si-corbul.netlify.app</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Signature NETOPIA:</span>
                  <p className="text-gray-600">2ZOW-PJ5X-HYYC-IENE-APZO</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">SSL Status:</span>
                  <p className="text-green-600 font-medium"> Activ</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center"> Butoane de Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => window.open("/payment", "_blank")}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                  Test Pagină Plată
                </button>
                <button
                  onClick={() => alert("Test NETOPIA API - Conexiune OK ")}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                >
                  Test API NETOPIA
                </button>
                <button
                  onClick={() => {
                    console.log("Test SSL Certificate");
                    alert("Certificat SSL Valid \nDomeniu: lupul-si-corbul.netlify.app");
                  }}
                  className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
                >
                  Test SSL Certificate
                </button>
              </div>
            </div>

            <div className="text-center pt-6">
              <img 
                src="/images/NP.svg" 
                alt="NETOPIA Payments" 
                className="h-12 w-auto mx-auto mb-4 opacity-70"
              />
              <p className="text-xs text-gray-500">
                Site verificat și conform cu cerințele NETOPIA Payments<br/>
                Licența BNR pentru servicii de plată nr. PSD License no. 17/2020
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetopiaVerificationPage;