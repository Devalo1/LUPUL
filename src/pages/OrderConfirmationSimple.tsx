import React from "react";
import { useNavigate } from "react-router-dom";

const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();

  const orderDetails = {
    orderNumber: `LP${Date.now().toString().slice(-6)}`,
    amount: "50.00",
    date: new Date().toLocaleDateString("ro-RO"),
    time: new Date().toLocaleTimeString("ro-RO"),
    product: "Emblemă Digitală Lupul și Corbul",
    transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header de succes */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            Plată Procesată cu Succes! 🎉
          </h1>
          <p className="text-green-700 text-lg max-w-2xl mx-auto">
            Mulțumim pentru comandă! Plata dvs. a fost procesată cu succes prin
            NETOPIA Payments.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Detalii comandă */}
          <div className="px-8 py-6 bg-green-600">
            <h2 className="text-2xl font-bold text-white text-center">
              Detalii Comandă
            </h2>
          </div>

          <div className="p-8">
            {/* Numărul comenzii și status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Numărul Comenzii
                  </h3>
                  <p className="text-2xl font-bold text-green-900">
                    {orderDetails.orderNumber}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Status Plată
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-lg font-semibold text-green-700">
                      Confirmată
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalii tranzacție */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Data și Ora</h4>
                  <p className="text-gray-600">
                    {orderDetails.date} la {orderDetails.time}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">
                    Produs Comandat
                  </h4>
                  <p className="text-gray-600">{orderDetails.product}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Suma Plătită</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {orderDetails.amount} RON
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">ID Tranzacție</h4>
                  <p className="text-gray-600 font-mono">
                    {orderDetails.transactionId}
                  </p>
                </div>
              </div>
            </div>

            {/* Informații despre livrare */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                📦 Informații Livrare Produs Digital
              </h3>
              <div className="space-y-3 text-blue-700">
                <p>
                  ✅ Produsul digital va fi disponibil în contul dvs. în maximum
                  24 de ore
                </p>
                <p>
                  📧 Veți primi un email de confirmare cu instrucțiunile de
                  acces
                </p>
                <p>
                  🎯 Puteți accesa produsul din secțiunea "Emblemele Mele" din
                  dashboard
                </p>
                <p>🔒 Accesul este permanent și securizat</p>
              </div>
            </div>

            {/* Butoane de acțiune */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🏠 Către Dashboard
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                🛍️ Continuă Cumpărăturile
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                🏠 Acasă
              </button>
            </div>
          </div>

          {/* Footer cu informații legale */}
          <div className="px-8 py-6 bg-gray-50 border-t">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => navigate("/anpc-consumer-info")}
                  className="hover:text-blue-600 underline"
                >
                  Info ANPC
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/cancellation-policy")}
                  className="hover:text-blue-600 underline"
                >
                  Drept de Renunțare
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="hover:text-blue-600 underline"
                >
                  Contact Support
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Plată procesată prin NETOPIA Payments • Licența BNR nr. PSD
                17/2020
                <br />
                HIFITBOX SRL • CUI: RO41039008 • Nr. Înreg: J17/926/2019
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
