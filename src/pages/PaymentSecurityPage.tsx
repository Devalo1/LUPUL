import React from "react";
import NetopiaSecurityInfo from "../components/payment/NetopiaSecurityInfo";
import {
  NETOPIA_CONFIG,
  COMPANY_NAME,
  MERCHANT_CUI,
} from "../config/netopia.config";

/**
 * Pagină de informații despre plăți și securitate
 * Conform cerințelor contractuale NETOPIA pentru transparența procesării plăților
 */
const PaymentSecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Informații despre Plăți și Securitate
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Toate tranzacțiile sunt procesate prin sistemul securizat NETOPIA
            Payments, în conformitate cu standardele internaționale de
            securitate și protecție a datelor.
          </p>
        </div>

        {/* Componenta principală NETOPIA */}
        <div className="mb-8">
          <NetopiaSecurityInfo variant="detailed" showPaymentMethods={true} />
        </div>

        {/* Informații despre merchant */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informații Merchant
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Datele Companiei
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Denumire:</strong> {COMPANY_NAME}
                </p>
                <p>
                  <strong>CUI:</strong> {MERCHANT_CUI}
                </p>
                <p>
                  <strong>Nr. Reg. Com:</strong>{" "}
                  {NETOPIA_CONFIG.MERCHANT_INFO.registrationNumber}
                </p>
                <p>
                  <strong>Adresă:</strong>{" "}
                  {NETOPIA_CONFIG.MERCHANT_INFO.address}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Contact și Suport
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Email:</strong>{" "}
                  {NETOPIA_CONFIG.MERCHANT_INFO.contactEmail}
                </p>
                <p>
                  <strong>Telefon:</strong> 0734 931 703
                </p>
                <p>
                  <strong>Program:</strong> Luni - Vineri, 09:00 - 17:00
                </p>
                <p>
                  <strong>Răspuns:</strong> Maxim 24 ore
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Procesarea plăților */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Procesarea Plăților
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Cum funcționează
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Selectați produsele dorite și adăugați-le în coș</li>
                <li>Completați datele de livrare și facturare</li>
                <li>Alegeți metoda de plată preferată</li>
                <li>Veți fi redirecționat securizat către NETOPIA Payments</li>
                <li>Confirmați plata folosind datele cardului sau PayPal</li>
                <li>Primiți confirmarea prin email și SMS</li>
                <li>Produsele sunt procesate pentru livrare</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Metode de plată acceptate
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {NETOPIA_CONFIG.TECHNICAL_CONFIG.ACCEPTED_PAYMENT_METHODS.map(
                  (method, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"
                    >
                      <span className="text-sm font-medium text-blue-900">
                        {method}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Valute acceptate
              </h3>
              <div className="flex space-x-4">
                {NETOPIA_CONFIG.TECHNICAL_CONFIG.SUPPORTED_CURRENCIES.map(
                  (currency, index) => (
                    <span
                      key={index}
                      className="bg-green-50 border border-green-200 rounded px-3 py-1 text-sm font-medium text-green-900"
                    >
                      {currency}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Securitate și conformitate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Securitate și Conformitate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Certificări de Securitate
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Certificare PCI DSS Level 1
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Conformitate GDPR
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    SSL/TLS Encryption
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    3D Secure Authentication
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Protecție Antifraudă
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Monitorizare în timp real
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Analiza comportamentală
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Verificare IP și geolocație
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Machine Learning Detection
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Politici și termeni */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Politici și Termeni de Utilizare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Termeni de plată
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Plata se procesează imediat la confirmare</li>
                <li>• Decontarea în 1-3 zile lucrătoare</li>
                <li>• Confirmarea prin email și SMS</li>
                <li>• Posibilitate de rambursare conform legii</li>
                <li>• Suport tehnic 24/7 pentru probleme de plată</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Protecția datelor
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Datele cardului nu sunt stocate de noi</li>
                <li>• Procesare conform GDPR</li>
                <li>• Criptare end-to-end</li>
                <li>• Acces restricționat la informații sensibile</li>
                <li>• Backup securizat și monitorizat</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Notă importantă:</strong> Toate tranzacțiile sunt
              procesate de NETOPIA Payments, un procesator de plăți licențiat și
              reglementat. Datele dumneavoastră financiare sunt protejate
              conform celor mai înalte standarde de securitate din industrie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSecurityPage;
