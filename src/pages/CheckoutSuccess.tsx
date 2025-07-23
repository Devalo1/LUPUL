import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaCheckCircle,
  FaEnvelope,
  FaBoxOpen,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa";
import { checkAndNotifyOrderCompletion } from "../utils/orderCompletionNotifier";
import { netopiaStatusService } from "../services/netopiaStatusService";

interface LocationState {
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount?: number;
  items?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

interface OrderDetails extends LocationState {
  date?: string;
}

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [showEmailSimulation, setShowEmailSimulation] = useState(false);

  // Încercăm să obținem datele comenzii, fie din state, fie din localStorage
  useEffect(() => {
    if (state && state.orderNumber) {
      // Avem detalii în state-ul de navigare
      setOrderDetails(state);
    } else {
      // Verificăm dacă utilizatorul revine de la plata Netopia
      const urlParams = new URLSearchParams(location.search);
      const netopiaOrderId = urlParams.get("orderId");
      const paymentStatus = urlParams.get("status");

      if (netopiaOrderId) {
        console.log(
          "Utilizator revine de la Netopia cu orderID:",
          netopiaOrderId
        );

        // Încercăm să găsim comanda în localStorage
        const pendingOrder = localStorage.getItem("pendingOrder");
        if (pendingOrder) {
          try {
            const orderData = JSON.parse(pendingOrder);
            if (orderData.orderNumber === netopiaOrderId) {
              console.log(
                "Comandă găsită în localStorage pentru Netopia:",
                orderData
              );

              // Adăugăm statusul plății
              const orderWithPaymentStatus = {
                ...orderData,
                // Map Netopia return status to our paid/failed
                paymentStatus:
                  paymentStatus === "confirmed" || paymentStatus === "success"
                    ? "paid"
                    : "failed",
                paymentMethod: orderData.paymentMethod || "card",
              };

              setOrderDetails(orderWithPaymentStatus);

              // Curățăm localStorage
              localStorage.removeItem("pendingOrder");

              // Salvăm comanda finalizată
              localStorage.setItem(
                "lastOrderDetails",
                JSON.stringify(orderWithPaymentStatus)
              );

              // Trimitem notificarea de finalizare dacă plata este confirmată
              if (netopiaOrderId && paymentStatus) {
                checkAndNotifyOrderCompletion(
                  netopiaOrderId,
                  paymentStatus,
                  orderWithPaymentStatus
                );
              }

              return;
            }
          } catch (e) {
            console.error("Eroare la parsarea comenzii din localStorage:", e);
          }
        }

        // Dacă nu găsim comanda în localStorage, creăm una basic cu datele de la Netopia
        setOrderDetails({
          orderNumber: netopiaOrderId,
          paymentStatus:
            paymentStatus === "confirmed" || paymentStatus === "success"
              ? "paid"
              : "failed",
          paymentMethod: "card",
          date: new Date().toISOString(),
        });

        return;
      }

      // Verificăm dacă există detalii salvate în localStorage
      const savedOrderDetails = localStorage.getItem("lastOrderDetails");
      if (savedOrderDetails) {
        try {
          const parsedDetails = JSON.parse(savedOrderDetails);
          setOrderDetails(parsedDetails);
          console.log(
            "Detalii comandă restaurate din localStorage:",
            parsedDetails
          );
        } catch (e) {
          console.error(
            "Eroare la parsarea detaliilor comenzii din localStorage:",
            e
          );
          // Generăm un număr aleatoriu de comandă ca fallback
          setOrderDetails({
            orderNumber: `ORDER-${Math.floor(Math.random() * 10000)}`,
            date: new Date().toISOString(),
          });
        }
      } else {
        // Nu există date salvate, generăm un număr aleatoriu
        console.log(
          "Pagina de confirmare comenzi accesată direct, fără state sau localStorage."
        );
        setOrderDetails({
          orderNumber: `ORDER-${Math.floor(Math.random() * 10000)}`,
          date: new Date().toISOString(),
        });
      }
    }
  }, [state, location.search]);

  // Poll payment status for card payments
  useEffect(() => {
    if (
      orderDetails?.paymentMethod === "card" &&
      orderDetails.paymentStatus === "pending"
    ) {
      netopiaStatusService
        .pollPaymentStatus(orderDetails.orderNumber!) // assume orderNumber defined
        .then((resp) => {
          setOrderDetails(
            (prev) => prev && { ...prev, paymentStatus: resp.status }
          );
        })
        .catch((err) => {
          console.error("Eroare la verificarea statusului plății:", err);
          setOrderDetails(
            (prev) => prev && { ...prev, paymentStatus: "failed" }
          );
        });
    }
  }, [orderDetails]);

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Se încarcă detaliile comenzii...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle card payment pending and failure statuses
  if (orderDetails.paymentMethod === "card") {
    if (orderDetails.paymentStatus === "pending") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">
              Se verifică plata. Vă rugăm așteptați...
            </p>
          </div>
        </div>
      );
    }
    if (orderDetails.paymentStatus === "failed") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border border-red-300">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Plata nu a fost finalizată cu succes
            </h2>
            <p className="text-gray-700 mb-6">
              Ne pare rău, dar plata cu cardul a eșuat sau a fost anulată.
            </p>
            <button
              onClick={() => (window.location.href = "/checkout")}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Încearcă din nou
            </button>
          </div>
        </div>
      );
    }
  }

  // Format date and time
  const formattedDate = orderDetails.date
    ? new Date(orderDetails.date).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  // Afișăm secțiunea de dezvoltare doar în mediul de dezvoltare (nu în preview)
  const isDevelopment =
    window.location.hostname === "localhost" && window.location.port !== "5174"; // Nu afișa în preview mode

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border border-blue-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <FaCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Comanda a fost finalizată cu succes!
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <div className="space-y-3">
              <div>
                <p className="text-gray-700 mb-1 font-medium">
                  Numărul comenzii:
                </p>
                <p className="text-xl font-semibold text-blue-800">
                  {orderDetails.orderNumber}
                </p>
              </div>

              {orderDetails.customerName && (
                <div className="pt-2 border-t border-blue-100">
                  <p className="text-gray-700 mb-1 font-medium">Client:</p>
                  <p className="text-gray-800">{orderDetails.customerName}</p>
                </div>
              )}

              {orderDetails.customerEmail && (
                <div className="pt-2 border-t border-blue-100">
                  <p className="text-gray-700 mb-1 font-medium">Email:</p>
                  <p className="text-gray-800">{orderDetails.customerEmail}</p>
                </div>
              )}

              {orderDetails.totalAmount !== undefined && (
                <div className="pt-2 border-t border-blue-100">
                  <p className="text-gray-700 mb-1 font-medium">Suma totală:</p>
                  <p className="text-xl font-semibold text-blue-800">
                    {orderDetails.totalAmount.toFixed(2)} RON
                  </p>
                </div>
              )}

              {orderDetails.items !== undefined && (
                <div className="pt-2 border-t border-blue-100">
                  <p className="text-gray-700 mb-1 font-medium">
                    Număr produse:
                  </p>
                  <p className="text-gray-800">{orderDetails.items}</p>
                </div>
              )}

              {orderDetails.paymentMethod && (
                <div className="pt-2 border-t border-blue-100">
                  <p className="text-gray-700 mb-1 font-medium">
                    Metoda de plată:
                  </p>
                  <p className="text-gray-800">
                    {orderDetails.paymentMethod === "card"
                      ? "Card bancar (Netopia Payments)"
                      : orderDetails.paymentMethod === "cash"
                        ? "Ramburs la livrare"
                        : orderDetails.paymentMethod}
                  </p>
                  {orderDetails.paymentStatus &&
                    orderDetails.paymentMethod === "card" && (
                      <p
                        className={`text-sm mt-1 ${orderDetails.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}
                      >
                        {orderDetails.paymentStatus === "paid"
                          ? "✓ Plata a fost procesată cu succes"
                          : "⏳ Plata este în curs de verificare"}
                      </p>
                    )}
                </div>
              )}

              <div className="pt-2 border-t border-blue-100">
                <p className="text-gray-700 mb-1 font-medium">Data comenzii:</p>
                <p className="text-gray-800">{formattedDate}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-2">Îți mulțumim pentru cumpărături!</p>

          {isDevelopment && (
            <div className="mt-2 mb-5">
              <button
                onClick={() => setShowEmailSimulation(!showEmailSimulation)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 inline-flex items-center"
              >
                <FaEnvelope className="mr-2" />
                {showEmailSimulation
                  ? "Ascunde simulare email"
                  : "Arată simulare email"}
              </button>

              {showEmailSimulation && (
                <div className="mt-4 bg-gray-100 p-4 rounded text-left">
                  <h3 className="font-bold mb-2 text-gray-700">
                    Simulare Email (Mediu Dezvoltare)
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    În mediul de producție, un email real ar fi fost trimis la
                    adresa{" "}
                    <span className="font-medium">
                      {orderDetails.customerEmail || "client@example.com"}
                    </span>
                  </p>
                  <p className="text-sm text-blue-600 mb-2">
                    Verifică consola browserului pentru a vedea conținutul
                    complet al email-ului simulat.
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Notă:</strong> Un email pentru administrator a fost
                    simulat și trimis la{" "}
                    <span className="font-medium">lupulsicorbul@gmail.com</span>{" "}
                    cu toate detaliile comenzii.
                  </p>

                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 flex items-start">
                    <FaInfoCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      <strong>Informație:</strong> Aceste simulări sunt vizibile
                      doar în mediul de dezvoltare. În mediul de producție (pe
                      site-ul live), sistemul va trimite automat email-uri reale
                      către client și către administrator, fără această
                      interfață de simulare.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Link
              to="/products"
              className="py-3 px-4 text-center font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              <FaBoxOpen className="mr-2" /> Continuă cumpărăturile
            </Link>

            <Link
              to="/user-home"
              className="py-3 px-4 text-center font-medium text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 flex items-center justify-center"
            >
              <FaUser className="mr-2" /> Înapoi la pagina contului meu
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 text-center">
            Dacă ai întrebări despre comanda ta, ne poți contacta la
            <a
              href="mailto:lupulsicorbul@gmail.com"
              className="text-blue-600 hover:underline"
            >
              {" "}
              lupulsicorbul@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
