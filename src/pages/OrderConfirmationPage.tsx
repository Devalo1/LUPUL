import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { netopiaService } from "../services/netopiaPayments";
import { checkAndNotifyOrderCompletion } from "../utils/orderCompletionNotifier";

interface OrderDetails {
  orderNumber: string;
  amount: string;
  date: string;
  time: string;
  product: string;
  transactionId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentStatus: "processing" | "confirmed" | "failed" | "pending";
}

const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Verifică dacă avem parametri de return de la Netopia
        const netopiaOrderId =
          searchParams.get("orderId") || searchParams.get("order_id");
        const paymentStatus = searchParams.get("status");

        console.log("🔍 Processing payment return:", {
          netopiaOrderId,
          paymentStatus,
        });

        // Încearcă să obții datele comenzii din localStorage
        const pendingOrderData =
          localStorage.getItem("currentOrder") ||
          localStorage.getItem("pendingOrder");
        let orderData = null;

        if (pendingOrderData) {
          try {
            orderData = JSON.parse(pendingOrderData);
            console.log("📦 Found pending order data:", orderData);
          } catch (e) {
            console.warn("❌ Failed to parse pending order:", e);
          }
        }

        // Dacă avem un ID de comandă de la Netopia, verifică statusul
        if (netopiaOrderId) {
          console.log("🔍 Checking payment status for order:", netopiaOrderId);

          try {
            const paymentStatusResult =
              await netopiaService.checkPaymentStatus(netopiaOrderId);
            console.log("💳 Payment status result:", paymentStatusResult);

            // Determină statusul final
            let finalStatus: "processing" | "confirmed" | "failed" | "pending" =
              "processing";

            if (
              paymentStatusResult?.status === "confirmed" ||
              paymentStatusResult?.status === "success" ||
              paymentStatus === "success"
            ) {
              finalStatus = "confirmed";

              // Trimite notificarea de finalizare comandă
              console.log(
                "🎉 Payment confirmed, sending completion notification..."
              );
              await checkAndNotifyOrderCompletion(
                netopiaOrderId,
                "confirmed",
                orderData
              );
            } else if (
              paymentStatusResult?.status === "failed" ||
              paymentStatus === "failed"
            ) {
              finalStatus = "failed";
            } else if (
              paymentStatusResult?.status === "pending" ||
              paymentStatus === "pending"
            ) {
              finalStatus = "pending";
            }

            // Generează numele produselor din coș
            const productNames =
              orderData?.items?.length > 0
                ? orderData.items.map((item: any) => item.name).join(", ")
                : "Produs necunoscut";

            const productDisplay =
              orderData?.items?.length === 1
                ? productNames
                : orderData?.items?.length > 1
                  ? `${orderData.items.length} produse: ${productNames}`
                  : "Emblemă Digitală Lupul și Corbul";

            // Creează detaliile comenzii
            const details: OrderDetails = {
              orderNumber: orderData?.orderNumber || netopiaOrderId,
              amount: orderData?.totalAmount?.toString() || "N/A",
              date: new Date().toLocaleDateString("ro-RO"),
              time: new Date().toLocaleTimeString("ro-RO"),
              product: productDisplay,
              transactionId: netopiaOrderId,
              customerName: orderData?.customerName,
              customerEmail: orderData?.customerEmail,
              customerPhone: orderData?.customerPhone,
              customerAddress: orderData?.customerAddress,
              paymentStatus: finalStatus,
            };

            setOrderDetails(details);

            // Curăță localStorage dacă este confirmată
            if (finalStatus === "confirmed") {
              localStorage.removeItem("currentOrder");
              localStorage.removeItem("pendingOrder");
            }
          } catch (statusError) {
            console.error("❌ Error checking payment status:", statusError);
            setError(
              "Nu am putut verifica statusul plății. Vă rugăm să contactați suportul."
            );
          }
        } else if (orderData) {
          // Dacă nu avem parametri Netopia dar avem date în localStorage

          // Generează numele produselor din coș - același cod ca mai sus
          const productNames =
            orderData?.items?.length > 0
              ? orderData.items.map((item: any) => item.name).join(", ")
              : "Produs necunoscut";

          const productDisplay =
            orderData?.items?.length === 1
              ? productNames
              : orderData?.items?.length > 1
                ? `${orderData.items.length} produse: ${productNames}`
                : "Emblemă Digitală Lupul și Corbul";

          const details: OrderDetails = {
            orderNumber:
              orderData.orderNumber || `LP${Date.now().toString().slice(-6)}`,
            amount: orderData.totalAmount?.toString() || "N/A",
            date: new Date().toLocaleDateString("ro-RO"),
            time: new Date().toLocaleTimeString("ro-RO"),
            product: productDisplay,
            transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            customerAddress: orderData.customerAddress,
            paymentStatus:
              orderData.paymentMethod === "card" ? "processing" : "confirmed",
          };

          setOrderDetails(details);

          // Pentru plata ramburs, trimite imediat notificarea
          if (orderData.paymentMethod !== "card") {
            await checkAndNotifyOrderCompletion(
              details.orderNumber,
              "confirmed",
              orderData
            );
            localStorage.removeItem("currentOrder");
            localStorage.removeItem("pendingOrder");
          }
        } else {
          // Fallback - creează detalii generice
          const details: OrderDetails = {
            orderNumber: `LP${Date.now().toString().slice(-6)}`,
            amount: "50.00",
            date: new Date().toLocaleDateString("ro-RO"),
            time: new Date().toLocaleTimeString("ro-RO"),
            product: "Emblemă Digitală Lupul și Corbul",
            transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            paymentStatus: "confirmed",
          };

          setOrderDetails(details);
        }
      } catch (error) {
        console.error("❌ Error processing payment return:", error);
        setError(
          "A apărut o eroare la procesarea plății. Vă rugăm să contactați suportul."
        );
      } finally {
        setIsProcessing(false);
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  // Loading state
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6 animate-spin">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            Procesăm plata...
          </h2>
          <p className="text-blue-700">
            Vă rugăm să așteptați în timp ce verificăm statusul plății.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-6">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-800 mb-4">
            Eroare la Procesarea Plății
          </h1>
          <p className="text-red-700 text-lg mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/checkout")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Încearcă din Nou
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Contactează Suportul
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No order details found
  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-500 rounded-full mb-6">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Comandă Nu A Fost Găsită
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Nu am putut găsi detaliile comenzii. Poate a expirat sesiunea.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Mergi la Shop
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Acasă
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine colors based on payment status
  const getStatusColors = () => {
    switch (orderDetails.paymentStatus) {
      case "confirmed":
        return {
          bg: "from-green-50 to-emerald-100",
          headerBg: "bg-green-600",
          statusColor: "text-green-700",
          statusBg: "bg-green-500",
          borderColor: "border-green-200",
          cardBg: "bg-green-50",
        };
      case "pending":
        return {
          bg: "from-yellow-50 to-orange-100",
          headerBg: "bg-yellow-600",
          statusColor: "text-yellow-700",
          statusBg: "bg-yellow-500",
          borderColor: "border-yellow-200",
          cardBg: "bg-yellow-50",
        };
      case "failed":
        return {
          bg: "from-red-50 to-pink-100",
          headerBg: "bg-red-600",
          statusColor: "text-red-700",
          statusBg: "bg-red-500",
          borderColor: "border-red-200",
          cardBg: "bg-red-50",
        };
      default:
        return {
          bg: "from-blue-50 to-indigo-100",
          headerBg: "bg-blue-600",
          statusColor: "text-blue-700",
          statusBg: "bg-blue-500",
          borderColor: "border-blue-200",
          cardBg: "bg-blue-50",
        };
    }
  };

  const colors = getStatusColors();
  const getStatusText = () => {
    switch (orderDetails.paymentStatus) {
      case "confirmed":
        return "Confirmată";
      case "pending":
        return "În Așteptare";
      case "failed":
        return "Eșuată";
      default:
        return "În Procesare";
    }
  };

  const getStatusIcon = () => {
    switch (orderDetails.paymentStatus) {
      case "confirmed":
        return (
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
            />
          </svg>
        );
      case "pending":
        return (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "failed":
        return (
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return (
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg} py-8 px-4`}>
      <div className="max-w-3xl mx-auto">
        {/* Header de succes */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 ${colors.statusBg} rounded-full mb-6`}
          >
            {getStatusIcon()}
          </div>
          <h1
            className={`text-3xl font-bold ${orderDetails.paymentStatus === "confirmed" ? "text-green-800" : orderDetails.paymentStatus === "failed" ? "text-red-800" : orderDetails.paymentStatus === "pending" ? "text-yellow-800" : "text-blue-800"} mb-4`}
          >
            {orderDetails.paymentStatus === "confirmed"
              ? "Plată Procesată cu Succes! 🎉"
              : orderDetails.paymentStatus === "failed"
                ? "Plată Eșuată ❌"
                : orderDetails.paymentStatus === "pending"
                  ? "Plată în Așteptare ⏳"
                  : "Plată în Procesare 🔄"}
          </h1>
          <p
            className={`${orderDetails.paymentStatus === "confirmed" ? "text-green-700" : orderDetails.paymentStatus === "failed" ? "text-red-700" : orderDetails.paymentStatus === "pending" ? "text-yellow-700" : "text-blue-700"} text-lg max-w-2xl mx-auto`}
          >
            {orderDetails.paymentStatus === "confirmed"
              ? "Mulțumim pentru comandă! Plata dvs. a fost procesată cu succes prin NETOPIA Payments."
              : orderDetails.paymentStatus === "failed"
                ? "Din păcate, plata nu a putut fi procesată. Vă rugăm să încercați din nou sau să contactați suportul."
                : orderDetails.paymentStatus === "pending"
                  ? "Plata dvs. este în procesare. Vă vom notifica când va fi confirmată."
                  : "Plata dvs. este în procesare. Vă rugăm să așteptați."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Detalii comandă */}
          <div className={`px-8 py-6 ${colors.headerBg}`}>
            <h2 className="text-2xl font-bold text-white text-center">
              Detalii Comandă
            </h2>
          </div>

          <div className="p-8">
            {/* Numărul comenzii și status */}
            <div
              className={`${colors.cardBg} border ${colors.borderColor} rounded-lg p-6 mb-6`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3
                    className={`text-lg font-semibold ${orderDetails.paymentStatus === "confirmed" ? "text-green-800" : orderDetails.paymentStatus === "failed" ? "text-red-800" : orderDetails.paymentStatus === "pending" ? "text-yellow-800" : "text-blue-800"} mb-2`}
                  >
                    Numărul Comenzii
                  </h3>
                  <p
                    className={`text-2xl font-bold ${orderDetails.paymentStatus === "confirmed" ? "text-green-900" : orderDetails.paymentStatus === "failed" ? "text-red-900" : orderDetails.paymentStatus === "pending" ? "text-yellow-900" : "text-blue-900"}`}
                  >
                    {orderDetails.orderNumber}
                  </p>
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${orderDetails.paymentStatus === "confirmed" ? "text-green-800" : orderDetails.paymentStatus === "failed" ? "text-red-800" : orderDetails.paymentStatus === "pending" ? "text-yellow-800" : "text-blue-800"} mb-2`}
                  >
                    Status Plată
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 ${colors.statusBg} rounded-full`}
                    ></div>
                    <span
                      className={`text-lg font-semibold ${colors.statusColor}`}
                    >
                      {getStatusText()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informații client dacă sunt disponibile */}
            {(orderDetails.customerName || orderDetails.customerEmail) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Informații Client
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orderDetails.customerName && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Nume</h4>
                      <p className="text-gray-600">
                        {orderDetails.customerName}
                      </p>
                    </div>
                  )}
                  {orderDetails.customerEmail && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Email</h4>
                      <p className="text-gray-600">
                        {orderDetails.customerEmail}
                      </p>
                    </div>
                  )}
                  {orderDetails.customerPhone && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Telefon</h4>
                      <p className="text-gray-600">
                        {orderDetails.customerPhone}
                      </p>
                    </div>
                  )}
                  {orderDetails.customerAddress && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Adresa</h4>
                      <p className="text-gray-600">
                        {orderDetails.customerAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                  <h4 className="font-semibold text-gray-700">
                    Suma{" "}
                    {orderDetails.paymentStatus === "confirmed"
                      ? "Plătită"
                      : "Comenzii"}
                  </h4>
                  <p
                    className={`text-2xl font-bold ${orderDetails.paymentStatus === "confirmed" ? "text-green-600" : orderDetails.paymentStatus === "failed" ? "text-red-600" : "text-gray-600"}`}
                  >
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

            {/* Informații despre livrare - doar pentru plăți confirmate */}
            {orderDetails.paymentStatus === "confirmed" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  {orderDetails.product.toLowerCase().includes("emblem") ||
                  orderDetails.product.toLowerCase().includes("digital")
                    ? "📦 Informații Livrare Produs Digital"
                    : "🚚 Informații Livrare"}
                </h3>
                <div className="space-y-3 text-blue-700">
                  {orderDetails.product.toLowerCase().includes("emblem") ||
                  orderDetails.product.toLowerCase().includes("digital") ? (
                    <>
                      <p>
                        ✅ Produsul digital va fi disponibil în contul dvs. în
                        maximum 24 de ore
                      </p>
                      <p>
                        📧 Veți primi un email de confirmare cu instrucțiunile
                        de acces
                      </p>
                      <p>
                        🎯 Puteți accesa produsul din secțiunea "Emblemele Mele"
                        din dashboard
                      </p>
                      <p>🔒 Accesul este permanent și securizat</p>
                    </>
                  ) : (
                    <>
                      <p>
                        ✅ Comanda dvs. va fi procesată în maximum 24 de ore
                      </p>
                      <p>
                        📧 Veți primi un email de confirmare cu detaliile
                        livrării
                      </p>
                      <p>
                        🚚 Livrarea se face prin curier în 2-3 zile lucrătoare
                      </p>
                      <p>
                        📞 Vă vom contacta telefonic pentru confirmarea livrării
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Informații pentru plăți în așteptare */}
            {orderDetails.paymentStatus === "pending" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                  ⏳ Plata în Procesare
                </h3>
                <div className="space-y-3 text-yellow-700">
                  <p>🔄 Plata dvs. este în procesare la banca emitentă</p>
                  <p>
                    📧 Veți primi un email de confirmare când plata va fi
                    finalizată
                  </p>
                  <p>⏱️ Procesarea durează de obicei între 1-10 minute</p>
                  <p>📞 Pentru întrebări, contactați suportul nostru</p>
                </div>
              </div>
            )}

            {/* Informații pentru plăți eșuate */}
            {orderDetails.paymentStatus === "failed" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">
                  ❌ Plata Nu A Putut Fi Procesată
                </h3>
                <div className="space-y-3 text-red-700">
                  <p>🔄 Puteți încerca din nou plata cu cardul</p>
                  <p>💰 Alternativ, alegeți plata ramburs la livrare</p>
                  <p>📞 Pentru asistență, contactați suportul nostru</p>
                  <p>🔒 Nu s-au perceput taxe pentru această încercare</p>
                </div>
              </div>
            )}

            {/* Butoane de acțiune */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {orderDetails.paymentStatus === "confirmed" ? (
                <>
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
                </>
              ) : orderDetails.paymentStatus === "failed" ? (
                <>
                  <button
                    onClick={() => navigate("/checkout")}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    🔄 Încearcă din Nou
                  </button>
                  <button
                    onClick={() => navigate("/contact")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    📞 Contactează Suportul
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    🏠 Acasă
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    🔄 Verifică din Nou
                  </button>
                  <button
                    onClick={() => navigate("/contact")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    📞 Contactează Suportul
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    🏠 Acasă
                  </button>
                </>
              )}
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
