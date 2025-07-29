import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * Pagina de simulare pentru plăți NETOPIA Sandbox
 * Simulează procesul de plată pentru testing
 */
const PaymentSimulation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [paymentStatus, setPaymentStatus] = useState<
    "processing" | "success" | "failed"
  >("processing");

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency") || "RON";
  const isTest = searchParams.get("test") === "1";

  useEffect(() => {
    if (!orderId || !amount) {
      navigate("/");
      return;
    }

    // Simulează procesarea plății
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Simulează o plată reușită în 90% din cazuri
          const success = Math.random() > 0.1;
          setPaymentStatus(success ? "success" : "failed");

          // Redirecționează după rezultat
          setTimeout(() => {
            if (success) {
              navigate(`/order-confirmation?orderId=${orderId}&status=success`);
            } else {
              navigate(`/order-confirmation?orderId=${orderId}&status=failed`);
            }
          }, 2000);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, amount, navigate]);

  const handleCancel = () => {
    navigate(`/order-confirmation?orderId=${orderId}&status=cancelled`);
  };

  const handleRetry = () => {
    setCountdown(5);
    setPaymentStatus("processing");
  };

  const formatAmount = (amount: string) => {
    const amountNum = parseInt(amount) / 100;
    return amountNum.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {paymentStatus === "processing" && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              )}
              {paymentStatus === "success" && (
                <svg
                  className="w-8 h-8 text-green-600"
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
              )}
              {paymentStatus === "failed" && (
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {paymentStatus === "processing" && "🔄 Procesăm plata..."}
              {paymentStatus === "success" && "✅ Plată reușită!"}
              {paymentStatus === "failed" && "❌ Plată eșuată"}
            </h1>

            {isTest && (
              <span className="inline-block bg-orange-200 text-orange-900 text-sm font-bold px-4 py-2 rounded-full border-2 border-orange-300">
                🧪 SIMULARE TEST
              </span>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Comandă:</span>
                <span className="font-bold text-gray-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Sumă:</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatAmount(amount || "0")} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Metoda:</span>
                <span className="font-bold text-blue-600">Card bancar</span>
              </div>
            </div>
          </div>

          {/* Status Content */}
          {paymentStatus === "processing" && (
            <div className="mb-6">
              <p className="text-gray-800 font-medium mb-4">
                Vă rugăm să așteptați procesarea plății...
              </p>
              <div className="text-4xl font-bold text-blue-600 mb-2 bg-blue-50 py-3 px-4 rounded-lg">
                {countdown}
              </div>
              <p className="text-base text-gray-700 font-medium">
                Redirecționare automată în {countdown} secunde
              </p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="mb-6">
              <p className="text-green-700 font-bold text-lg mb-4">
                Plata a fost procesată cu succes!
              </p>
              <p className="text-base text-gray-700 font-medium">
                Veți fi redirecționat automat...
              </p>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="mb-6">
              <p className="text-red-700 font-bold text-lg mb-4">
                Plata nu a putut fi procesată.
              </p>
              <p className="text-base text-gray-700 font-medium mb-4">
                Vă rugăm să încercați din nou sau să contactați suportul.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Încearcă din nou
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Anulează comanda
                </button>
              </div>
            </div>
          )}

          {/* Actions pentru processing */}
          {paymentStatus === "processing" && (
            <button
              onClick={handleCancel}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
            >
              Anulează plata
            </button>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Aceasta este o simulare pentru mediul de dezvoltare.
              <br />
              În producție, veți fi redirecționat către NETOPIA Payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSimulation;
