import React from "react";

interface NetopiaPaymentInfoProps {
  orderDetails: {
    paymentMethod?: string;
    paymentStatus?: string;
  };
}

const NetopiaPaymentInfo: React.FC<NetopiaPaymentInfoProps> = ({
  orderDetails,
}) => {
  // Nu afișa informații pentru alte metode de plată
  if (orderDetails.paymentMethod !== "card") {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="bg-white rounded p-2 shadow-sm">
          <div className="text-blue-600 font-bold text-sm">NETOPIA</div>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Plată Securizată Procesată
          </p>
          <p className="text-xs text-blue-700">
            Prin NETOPIA Payments - Licența BNR PSD 17/2020
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold text-center">
          VISA
        </div>
        <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold text-center">
          MasterCard
        </div>
        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold text-center">
          Maestro
        </div>
        <div className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-semibold text-center">
          PayPal
        </div>
      </div>

      <div className="flex items-center text-green-600 text-sm">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm">
          Tranzacție securizată SSL & PCI DSS certificată
        </span>
      </div>

      {orderDetails.paymentStatus === "paid" && (
        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
          ✓ Plata a fost procesată cu succes prin NETOPIA Payments
        </div>
      )}

      {orderDetails.paymentStatus === "pending" && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
          ⏳ Plata este în curs de verificare prin NETOPIA Payments
        </div>
      )}

      <div className="text-xs text-gray-600 mt-2">
        Procesator: NETOPIA FINANCIAL SERVICES S.A. • CUI: RO12345678
        <br />
        Licența BNR nr. PSD 17/2020 pentru servicii de plată
      </div>
    </div>
  );
};

export default NetopiaPaymentInfo;
