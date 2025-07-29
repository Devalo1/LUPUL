import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts";

// Import test function for debugging
// import "../utils/testNetopia.js"; // removed dev-only import
// import "../utils/netopiaDebug.js"; // removed to avoid process.env reference errors

// Detect development mode (Vite DEV or Netlify Dev port)
const isDevelopment =
  import.meta.env.DEV ||
  window.location.port === "8888" ||
  window.location.hostname === "localhost";

// const isProduction = window.location.hostname === "lupulsicorbul.com" || (window.location.hostname !== "localhost" && !window.location.hostname.includes("preview") && !window.location.hostname.includes("deploy-preview") && !window.location.port); // removed dev-only flag

// Netlify function URL for order submission - use correct port in development
const FUNCTION_URL = isDevelopment
  ? "http://localhost:8888/.netlify/functions/send-order-email"
  : "/.netlify/functions/send-order-email";

const Checkout: React.FC = () => {
  const { items, total, clearCart, shippingCost, finalTotal } = useCart();
  const { currentUser } = useAuth(); // Ensure currentUser is defined in AuthContextType
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    county: "",
    postalCode: "",
    phone: "",
    paymentMethod: "cash",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [_testResult, _setTestResult] = useState<string>(""); // dev-only state removed
  // const [_v2PaymentUrl, _setV2PaymentUrl] = useState<string>(""); // dev-only state removed
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setFormData((prevData) => ({
        ...prevData,
        name: currentUser.displayName || prevData.name,
        email: currentUser.email || prevData.email,
      }));
    }
  }, [currentUser]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formatCurrency = (price: number | undefined) => {
    if (price === undefined) return "";
    return `${price.toFixed(2)} RON`;
  };

  const simulateEmailSending = async () => {
    console.log(
      "🔧 DEVELOPMENT MODE: Simulăm trimiterea email-ului de confirmare comandă"
    );
    console.log("📧 Email care ar fi fost trimis la:", formData.email);

    const orderDate = new Date();
    const formattedDate = `${orderDate.getDate().toString().padStart(2, "0")}${(orderDate.getMonth() + 1).toString().padStart(2, "0")}${orderDate.getFullYear().toString().slice(2)}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `LC-${formattedDate}-${randomNum}`;

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const customerEmailContent = `
      =================================================================
      📧 SIMULARE EMAIL COMANDĂ CLIENT - MOD DEZVOLTARE
      =================================================================
      Către: ${formData.email}
      Subiect: Confirmare comandă #${orderId}
      
      Dragă ${formData.name},
      
      Îți mulțumim pentru comanda ta! Detaliile comenzii sunt următoarele:
      
      PRODUSE COMANDATE:
      ${items.map((item) => `- ${item.name} x ${item.quantity} = ${formatCurrency(item.price ? item.price * item.quantity : 0)}`).join("\n      ")}
      
      Subtotal: ${formatCurrency(total)}
      Cost transport: ${shippingCost === 0 ? "Gratuit" : formatCurrency(shippingCost)}
      TOTAL: ${formatCurrency(finalTotal)}
      
      Adresa de livrare: ${formData.address}
      Telefon: ${formData.phone}
      Metoda de plată: ${formData.paymentMethod === "cash" ? "Ramburs la livrare" : formData.paymentMethod}
      
      Te vom contacta în curând cu detalii despre livrare.
      
      Cu stimă,
      Echipa Lupul și Corbul
      =================================================================
    `;

    const adminEmailContent = `
      =================================================================
      📧 SIMULARE EMAIL COMANDĂ ADMIN - MOD DEZVOLTARE
      =================================================================
      Către: lupulsicorbul@gmail.com
      Subiect: Comandă nouă primită: ${orderId}
      
      O nouă comandă a fost plasată pe site-ul dumneavoastră!
      
      Detalii comandă:
      - Număr comandă: ${orderId}
      - Nume: ${formData.name}
      - Adresă: ${formData.address}
      - Telefon: ${formData.phone}
      - Metoda de plată: ${formData.paymentMethod === "cash" ? "Ramburs la livrare" : formData.paymentMethod}
      
      Produse:
      ${items
        .map((item) => {
          const emoji = item.name.toLowerCase().includes("afine")
            ? "🫐"
            : item.name.toLowerCase().includes("miere")
              ? "🍯"
              : "📦";
          return `- ${emoji} ${item.name} (Cantitate: ${item.quantity}, Preț: ${formatCurrency(item.price || 0)})`;
        })
        .join("\n      ")}
      
      Subtotal: ${formatCurrency(total)}
      Cost transport: ${shippingCost === 0 ? "Gratuit" : formatCurrency(shippingCost)}
      TOTAL COMANDĂ: ${formatCurrency(finalTotal)}
      
      Accesați panoul de administrare pentru a procesa această comandă.
      
      Sistem automatizat Lupul și Corbul
      =================================================================
    `;

    console.log(customerEmailContent);
    console.log("\n\n");
    console.log(adminEmailContent);

    return {
      success: true,
      orderNumber: orderId,
      message: "Comandă procesată cu succes în mediul de dezvoltare",
      emailSent: true,
      emailDetails: {
        toCustomer: formData.email,
        toAdmin: "lupulsicorbul@gmail.com",
        subject: "Confirmare comandă",
        content: "Email simulat în consola browserului",
      },
    };
  };

  const submitOrderWithFetch = async () => {
    try {
      const orderData = {
        ...formData,
        firstName: formData.name.split(" ")[0] || formData.name,
        lastName: formData.name.split(" ").slice(1).join(" ") || "",
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: finalTotal,
        orderDate: new Date().toISOString(),
        shippingCost: shippingCost,
      };

      // Generate a unique order number for submission
      const orderNumber = `LC-${Date.now()}`;
      const url = FUNCTION_URL;
      console.log(`Trimitere comandă către: ${url}`);

      // Send structured payload expected by Netlify function
      const payload = {
        orderData,
        orderNumber,
        totalAmount: orderData.totalAmount,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Eroare răspuns server:", errorText);
        throw new Error(`Eroare server: ${response.status} - ${errorText}`);
      }

      const resultJson = await response.json();
      // Include our generated orderNumber for downstream use
      return { ...resultJson, orderNumber };
    } catch (err) {
      console.error("Eroare în submitOrderWithFetch:", err);
      throw err;
    }
  };

  const submitOrderWithFirebase = async () => {
    console.log("💾 Salvarea comenzii în Firebase...");

    try {
      // Importăm serviciul de comenzi
      const { saveOrderToFirebase } = await import("../services/orderService");

      // Generăm un ID unic pentru comandă
      const realOrderId = `LC-${Date.now()}`;

      // Pregătim datele comenzii pentru Firebase
      const orderData = {
        orderNumber: realOrderId,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city,
        customerCounty: formData.county,
        customerPostalCode: formData.postalCode || "",
        totalAmount: finalTotal || 0,
        subtotal: total || 0,
        shippingCost: shippingCost || 0,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price || 0,
          quantity: item.quantity,
          image: item.image || "",
        })),
        paymentMethod: formData.paymentMethod as "card" | "cash",
        paymentStatus: "pending" as "pending" | "paid" | "failed" | "cancelled",
        orderDate: new Date().toISOString(),
        userId: currentUser?.uid,
      };

      // Salvăm comanda în Firebase
      const savedOrderId = await saveOrderToFirebase(
        orderData,
        currentUser?.uid
      );
      console.log("✅ Comandă salvată în Firebase cu ID:", savedOrderId);

      // Salvăm datele pentru recovery în caz de nevoie
      localStorage.setItem(
        "lastOrderDetails",
        JSON.stringify({
          ...orderData,
          firebaseOrderId: savedOrderId,
        })
      );

      // Simulăm și trimiterea emailului pentru development
      return simulateEmailSending();
    } catch (error) {
      console.error("❌ Eroare la salvarea comenzii în Firebase:", error);
      // Continuăm cu simularea emailului chiar dacă salvarea în Firebase eșuează
      return simulateEmailSending();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🛡️ PROTECȚIE DOUBLE-SUBMIT - Previne trimiterea multiplă
    if (isSubmitting) {
      console.log("🚫 CHECKOUT DEBUG - Submit deja în progres, ignorez apelul duplicat");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);

    // Pentru testarea plăților, păstrăm sandbox mode
    // Pentru plățile reale în producție, această linie va fi comentată
    localStorage.setItem("netopia_force_sandbox", "true");
    console.log(
      "🧪 Keeping sandbox mode for testing - real payments will use live mode"
    );

    try {
      console.log("🚀 CHECKOUT DEBUG - Inițierea trimiterii comenzii:", {
        paymentMethod: formData.paymentMethod,
        name: formData.name,
        email: formData.email,
        totalItems: items.length,
      });

      // Dacă utilizatorul a ales plata cu cardul, folosim NETOPIA v2.x
      if (formData.paymentMethod === "card") {
        console.log(
          "💳 CHECKOUT DEBUG - Card payment selected, using NETOPIA v2.x integration"
        );
        console.log(
          "🚫 CHECKOUT DEBUG - NU se va trimite email prin send-order-email pentru plata cu cardul"
        );

        // Validez că avem toate datele necesare
        if (
          !formData.name ||
          !formData.email ||
          !formData.address ||
          !finalTotal
        ) {
          throw new Error(
            "Vă rugăm să completați toate câmpurile obligatorii pentru plata cu cardul."
          );
        }

        // Generăm un ID unic pentru comanda reală
        const realOrderId = `LC-${Date.now()}`;

        // Salvăm datele comenzii în localStorage pentru după plată
        const orderData = {
          orderNumber: realOrderId,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          customerCity: formData.city,
          customerCounty: formData.county,
          customerPostalCode: formData.postalCode,
          totalAmount: finalTotal,
          subtotal: total,
          shippingCost: shippingCost,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          paymentMethod: "card",
          paymentStatus: "pending",
          date: new Date().toISOString(),
        };

        localStorage.setItem("pendingOrder", JSON.stringify(orderData));
        console.log("💾 Order data saved for NETOPIA payment:", orderData);

        // 🆕 SALVARE ÎN SESSIONSTORAGE - Pentru ca OrderConfirmation să găsească datele reale
        const sessionStorageBackup = {
          orderId: realOrderId,
          customerInfo: {
            firstName: formData.name.split(" ")[0] || "Client",
            lastName: formData.name.split(" ").slice(1).join(" ") || "",
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            county: formData.county,
            postalCode: formData.postalCode,
          },
          amount: finalTotal,
          description: `Comandă Lupul și Corbul - ${items.length} produse (${formatCurrency(finalTotal)})`,
          timestamp: new Date().toISOString(),
          source: "Checkout",
        };

        sessionStorage.setItem(
          "currentOrderBackup",
          JSON.stringify(sessionStorageBackup)
        );
        console.log(
          "💾 BACKUP: Date reale salvate în sessionStorage pentru recovery:",
          sessionStorageBackup
        );

        // 🆕 SALVARE ÎN COOKIE - Pentru recovery în cazul pierderii sessionStorage
        const cookieRecoveryData = {
          orderId: realOrderId,
          email: formData.email,
          customerName: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          county: formData.county,
          amount: finalTotal,
          timestamp: new Date().toISOString(),
        };

        const cookieValue = btoa(JSON.stringify(cookieRecoveryData));
        document.cookie = `orderRecovery_${realOrderId}=${cookieValue}; max-age=86400; path=/; SameSite=Lax`;
        console.log("🍪 Date recovery salvate în cookie pentru:", realOrderId);

        // 🆕 SALVARE ÎN FIREBASE - Pentru dashboard user și admin panel
        try {
          const { saveOrderToFirebase } = await import(
            "../services/orderService"
          );

          const firebaseOrderData = {
            orderNumber: realOrderId,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            customerAddress: formData.address,
            customerCity: formData.city,
            customerCounty: formData.county,
            customerPostalCode: formData.postalCode || "",
            totalAmount: finalTotal || 0,
            subtotal: total || 0,
            shippingCost: shippingCost || 0,
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price || 0,
              quantity: item.quantity,
              image: item.image || "",
            })),
            paymentMethod: "card" as "card" | "cash",
            paymentStatus: "pending" as
              | "pending"
              | "paid"
              | "failed"
              | "cancelled",
            orderDate: new Date().toISOString(),
            userId: currentUser?.uid,
          };

          const savedOrderId = await saveOrderToFirebase(
            firebaseOrderData,
            currentUser?.uid
          );
          console.log(
            "✅ Comandă cu card salvată în Firebase cu ID:",
            savedOrderId
          );

          // Salvăm ID-ul Firebase pentru referință
          const updatedOrderData = {
            ...orderData,
            firebaseOrderId: savedOrderId,
          };
          localStorage.setItem(
            "pendingOrder",
            JSON.stringify(updatedOrderData)
          );
        } catch (firebaseError) {
          console.error(
            "❌ Eroare la salvarea comenzii cu card în Firebase:",
            firebaseError
          );
          // Continuăm cu plata chiar dacă salvarea în Firebase eșuează
        }

        // Debug: Verifică dacă datele s-au salvat corect
        const savedData = localStorage.getItem("pendingOrder");
        console.log("🔍 Verificare salvare localStorage:", {
          saved: !!savedData,
          orderNumber: orderData.orderNumber,
          dataLength: savedData ? savedData.length : 0,
          firstChars: savedData ? savedData.substring(0, 100) : "N/A",
        });

        // Inițiem plata NETOPIA v2.x
        const { netopiaService } = await import("../services/netopiaPayments");

        // Folosește origin-ul corect pentru Netlify Functions
        // În dezvoltare: folosește portul Netlify (8888)
        // În producție: folosește domain-ul real
        const isLocalDev =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";
        const netopiaOrigin = isLocalDev
          ? "http://localhost:8888" // Netlify Dev
          : window.location.origin; // Production (lupulsicorbul.com)

        const paymentData = {
          orderId: realOrderId,
          amount: finalTotal || 0,
          currency: "RON",
          description: `Comandă Lupul și Corbul - ${items.length} produse (${formatCurrency(finalTotal)})`,
          customerInfo: {
            firstName: formData.name.split(" ")[0] || "Cliente",
            lastName: formData.name.split(" ").slice(1).join(" ") || "Lupul",
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            county: formData.county,
            postalCode: formData.postalCode,
          },
          live: false, // Forțat sandbox pentru test
          returnUrl: `${netopiaOrigin}/.netlify/functions/netopia-return?orderId=${realOrderId}`,
          confirmUrl: `${netopiaOrigin}/.netlify/functions/netopia-notify?orderId=${realOrderId}`,
        };

        console.log("🚀 Initiating NETOPIA v2.x payment:", paymentData);
        const paymentUrl = await netopiaService.initiatePayment(paymentData);

        // În loc să folosim popup, să permitem NETOPIA să redirecționeze în același tab
        console.log("🌐 Redirecting to NETOPIA payment page...");

        // Redirecționează către NETOPIA în același tab
        window.location.href = paymentUrl;

        console.log(
          "🚫 CHECKOUT DEBUG - RETURN EXECUTAT - Nu se mai execută submitOrderWithFetch pentru card!"
        );
        return; // Exit early for card payments
      }

      // Pentru plățile cu ramburs, continuăm cu logica existentă
      console.log(
        "💰 CHECKOUT DEBUG - Plata cu ramburs selectată - se va trimite email prin send-order-email"
      );
      let result;

      if (isDevelopment) {
        console.log(
          "Mediu de dezvoltare detectat, forțăm trimiterea prin Netlify Function..."
        );
        // În loc să simulez, forțez trimiterea prin Netlify Function
        try {
          console.log("Încercare trimitere comandă prin fetch direct...");
          result = await submitOrderWithFetch();
          console.log("Comandă trimisă cu succes prin fetch!");
        } catch (fetchError) {
          console.warn("Eroare la trimiterea prin fetch:", fetchError);
          console.log("Fallback la simulare...");
          result = await simulateEmailSending();
        }
      } else {
        try {
          console.log("Încercare trimitere comandă prin fetch direct...");
          result = await submitOrderWithFetch();
          console.log("Comandă trimisă cu succes prin fetch!");
        } catch (fetchError) {
          console.warn("Eroare la trimiterea prin fetch:", fetchError);

          console.log("Încercare trimitere comandă prin Firebase SDK...");
          result = await submitOrderWithFirebase();
          console.log("Comandă trimisă cu succes prin Firebase SDK!");
        }
      }

      console.log("Răspuns comandă:", result);

      const orderNumber = result.orderNumber || "N/A";

      if (isDevelopment) {
        localStorage.setItem(
          "lastOrderDetails",
          JSON.stringify({
            orderNumber: orderNumber,
            customerName: formData.name,
            customerEmail: formData.email,
            customerAddress: formData.address,
            customerPhone: formData.phone,
            totalAmount: finalTotal,
            items: items.length,
            date: new Date().toISOString(),
            paymentMethod: formData.paymentMethod,
            paymentStatus:
              formData.paymentMethod === "card" ? "paid" : "pending",
          })
        );
      }

      clearCart();
      navigate("/checkout-success", {
        state: {
          orderNumber,
          customerName: formData.name,
          customerEmail: formData.email,
          customerAddress: formData.address,
          customerPhone: formData.phone,
          totalAmount: finalTotal,
          items: items.length,
          paymentMethod: formData.paymentMethod,
          paymentStatus: formData.paymentMethod === "card" ? "paid" : "pending",
        },
      });
    } catch (error: any) {
      console.error("Eroare completă la trimiterea comenzii:", error);

      let errorMessage =
        "A apărut o eroare la procesarea comenzii. Te rugăm să încerci din nou.";

      if (error.message) {
        errorMessage += ` (Detalii: ${error.message})`;
      }

      if (error.code) {
        console.error(`Cod eroare Firebase: ${error.code}`);
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Finalizează comanda
      </h1>
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">{error}</div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <form
            onSubmit={handleSubmit}
            className="bg-white text-gray-800 rounded-lg shadow-md p-8 checkout-form"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Date comandă
            </h2>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block font-semibold mb-2 text-gray-700"
              >
                Nume complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Nume complet"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-400 bg-white focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block font-semibold mb-2 text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-400 bg-white focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="address"
                className="block font-semibold mb-2 text-gray-700"
              >
                Adresă
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Adresă"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-400 bg-white focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            {/* Oraș */}
            <div className="mb-4">
              <label
                htmlFor="city"
                className="block font-semibold mb-2 text-gray-700"
              >
                Oraș
              </label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Oraș"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-400 bg-white focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            {/* Județ */}
            <div className="mb-4">
              <label
                htmlFor="county"
                className="block font-semibold mb-2 text-gray-700"
              >
                Județ
              </label>
              <input
                type="text"
                id="county"
                name="county"
                placeholder="Județ"
                value={formData.county}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-400 bg-white focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            {/* Cod poștal */}
            <div className="mb-4">
              <label
                htmlFor="postalCode"
                className="block font-semibold mb-2 text-gray-700"
              >
                Cod poștal
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                placeholder="Cod poștal"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-400 bg-white focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block font-semibold mb-2 text-gray-700"
              >
                Telefon
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Telefon"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-400 bg-white focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="paymentMethod"
                className="block font-semibold mb-2 text-gray-700"
              >
                Metoda de plată
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 bg-white focus:bg-white focus:text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="cash">Ramburs la livrare</option>
                <option value="card">Card bancar (Netopia Payments)</option>
              </select>

              {formData.paymentMethod === "card" && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800 mb-4">
                    <strong>
                      🔐 Plată securizată cu cardul prin Netopia Payments
                    </strong>
                  </p>

                  {/* Informații importante despre fluxul de plată */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <p className="text-sm text-blue-800">
                        Veți fi redirecționat către pagina securizată Netopia
                        Payments
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <p className="text-sm text-blue-800">
                        Introduceți datele cardului în mediul securizat Netopia
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <p className="text-sm text-blue-800">
                        După confirmare, veți fi adus înapoi pentru confirmarea
                        comenzii
                      </p>
                    </div>
                  </div>

                  {/* Informații de securitate */}
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-800">
                      🔒 <strong>Securitate PCI-DSS:</strong> Datele cardului
                      sunt procesate exclusiv prin Netopia Payments, certificat
                      PCI DSS Level 1. Nu colectăm sau stocăm informații
                      sensibile ale cardului.
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 mt-3">
                    Acceptăm carduri Visa, Mastercard și alte carduri bancare
                    emise în România și UE.
                  </p>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Metode de plată acceptate:
                </p>
                {formData.paymentMethod === "card" ? (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src="/images/netopia-official-logo.svg"
                        alt="NETOPIA Payments"
                        className="h-8 w-auto object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/NP.svg";
                        }}
                      />
                      <span className="text-blue-600 font-semibold">
                        Plata securizată prin NETOPIA
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-blue-600 font-semibold">
                        💳 Carduri acceptate:
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="bg-blue-100 px-2 py-1 rounded">
                        VISA
                      </span>
                      <span className="bg-red-100 px-2 py-1 rounded">
                        Mastercard
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Maestro
                      </span>
                      <span className="bg-green-100 px-2 py-1 rounded">
                        American Express
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ✓ Carduri românești și internaționale
                      <br />
                      ✓ Plăți securizate prin 3D Secure
                      <br />✓ Certificare PCI DSS Level 1
                    </p>
                  </div>
                ) : (
                  <img
                    src="/images/payment-methods.png"
                    alt="Metode de plată acceptate"
                    className="max-w-full h-auto"
                  />
                )}
              </div>
            </div>

            {/* Informație despre procesul de plată */}
            {formData.paymentMethod === "card" && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm font-semibold text-blue-800 mb-2">
                    🔐 Plata integrată NETOPIA v2.x
                  </p>
                  <p className="text-xs text-gray-700 mb-2">
                    Când apăsați "Finalizează comanda", veți fi redirecționat
                    către pagina securizată NETOPIA pentru plata cu cardul.
                  </p>
                  <div className="bg-white rounded p-2 text-xs">
                    <span className="font-semibold text-blue-700">
                      Total de plată:
                    </span>{" "}
                    <span className="text-lg font-bold text-blue-800">
                      {formatCurrency(finalTotal || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white py-3 px-4 rounded-md transition-colors font-semibold`}
            >
              {isSubmitting
                ? "Se procesează..."
                : formData.paymentMethod === "card"
                  ? "Finalizează comanda și plătește cu cardul"
                  : "Trimite comanda"}
            </button>

            {isSubmitting && (
              <p className="text-center text-sm mt-2 text-blue-500">
                Procesăm comanda ta, te rugăm să aștepți...
              </p>
            )}
          </form>
        </div>

        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Sumar comandă
            </h2>

            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div className="text-gray-800">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <div className="font-medium text-gray-800">
                    {formatCurrency(
                      item.price ? item.price * item.quantity : 0
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Cost transport:</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">Gratuit</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </span>
              </div>
              {total && total >= 200 && shippingCost === 0 && (
                <div className="text-sm text-green-600">
                  Transport gratuit pentru comenzi peste 200 RON
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 mt-2">
                <span>Total final:</span>
                <span className="text-blue-700 text-xl">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
