import React from "react";

/**
 * Componentă pentru afișarea informațiilor de securitate NETOPIA
 * Conform art. 4.3.6 din contractul NETOPIA - afișarea obligatorie a mărcii și emblemelor
 *
 * Această componentă trebuie afișată pe toate paginile unde se procesează plăți
 * pentru a respecta cerințele contractuale cu NETOPIA FINANCIAL SERVICES S.A.
 */
interface NetopiaSecurityInfoProps {
  variant?: "default" | "compact" | "detailed";
  showPaymentMethods?: boolean;
  className?: string;
}

const NetopiaSecurityInfo: React.FC<NetopiaSecurityInfoProps> = ({
  variant = "default",
  showPaymentMethods = true,
  className = "",
}) => {
  if (variant === "compact") {
    return (
      <div
        className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded p-2 shadow-sm">
              <img
                src="/images/netopia-official-logo.svg"
                alt="NETOPIA"
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/NP.svg";
                }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Plăți Securizate
              </p>
              <p className="text-xs text-blue-700">
                Procesate prin NETOPIA Payments
              </p>
            </div>
          </div>
          <div className="flex items-center text-green-600">
            <svg
              className="w-5 h-5 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">Securizat</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 ${className}`}
      >
        <div className="text-center mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md inline-block mb-4">
            <img
              src="/images/netopia-official-logo.svg"
              alt="NETOPIA"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/NP.svg";
              }}
            />
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            Plăți 100% Securizate
          </h3>
          <p className="text-blue-800 font-medium">
            Procesate prin NETOPIA Payments - Platforma licențiată și
            certificată
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-blue-900 text-sm">
                Certificare PCI DSS
              </span>
            </div>
            <p className="text-xs text-blue-700">
              Standard internațional pentru securitatea datelor de plată
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-blue-900 text-sm">
                3D Secure
              </span>
            </div>
            <p className="text-xs text-blue-700">
              Protecție bancară suplimentară pentru toate tranzacțiile
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-blue-900 text-sm">
                Antifraudă
              </span>
            </div>
            <p className="text-xs text-blue-700">
              Monitorizare în timp real și prevenire fraudă
            </p>
          </div>
        </div>

        {showPaymentMethods && (
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-blue-900 text-sm mb-3 text-center">
              Metode de plată acceptate
            </h4>
            <div className="flex justify-center items-center space-x-4">
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">
                VISA
              </div>
              <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">
                MasterCard
              </div>
              <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold">
                Maestro
              </div>
              <div className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold">
                PayPal
              </div>
            </div>
            <p className="text-xs text-blue-600 text-center mt-2">
              Toate cardurile sunt acceptate fără restricții de sumă
            </p>
          </div>
        )}

        <div className="text-center mt-4">
          <a
            href="https://www.netopia-payments.com/security/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Verifică detaliile de securitate NETOPIA
          </a>
        </div>
      </div>
    );
  }

  // Variant default
  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-5 ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <img
            src="/images/netopia-official-logo.svg"
            alt="NETOPIA"
            className="h-6 w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/NP.svg";
            }}
          />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-2">
            Plăți Procesate prin NETOPIA Payments
          </h4>
          <p className="text-sm text-blue-800 mb-3">
            Toate tranzacțiile sunt securizate prin certificare PCI DSS și
            protecție bancară 3D Secure. Datele dumneavoastră sunt protejate
            conform standardelor internaționale.
          </p>

          {showPaymentMethods && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-white border border-blue-200 px-2 py-1 rounded text-xs font-medium text-blue-800">
                VISA
              </span>
              <span className="bg-white border border-blue-200 px-2 py-1 rounded text-xs font-medium text-blue-800">
                MasterCard
              </span>
              <span className="bg-white border border-blue-200 px-2 py-1 rounded text-xs font-medium text-blue-800">
                Maestro
              </span>
              <span className="bg-white border border-blue-200 px-2 py-1 rounded text-xs font-medium text-blue-800">
                PayPal
              </span>
            </div>
          )}

          <div className="flex items-center text-green-600 text-sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Conexiune securizată SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetopiaSecurityInfo;
