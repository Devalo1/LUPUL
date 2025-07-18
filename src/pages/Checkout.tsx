import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts";

// Import test function for debugging
import "../utils/testNetopia.js";
import "../utils/netopiaDebug.js";

const FUNCTION_URL = "https://sendorderemail-gcqoxopcwq-uc.a.run.app";
const isDevelopment = window.location.hostname === "localhost";

const Checkout: React.FC = () => {
  const { items, total, clearCart, shippingCost, finalTotal } = useCart();
  const { currentUser } = useAuth(); // Ensure currentUser is defined in AuthContextType
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    paymentMethod: "cash",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
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

  // Test function for Netopia
  const testNetopiaConnection = async () => {
    setTestResult("Testing...");
    try {
      const testData = {
        orderId: "TEST-" + Date.now(),
        amount: 500,
        currency: "RON",
        description: "Test payment",
        customerInfo: {
          firstName: "Test",
          lastName: "User",
          email: "test@test.com",
          phone: "0712345678",
          address: "Test Address",
          city: "Bucuresti",
          county: "Bucuresti",
          postalCode: "010000",
        },
        posSignature: "2ZOW-PJ5X-HYYC-IENE-APZO",
        live: false,
      };

      console.log("🧪 Testing Netopia with data:", testData);

      // Verifică că JSON-ul poate fi serializat corect
      const jsonString = JSON.stringify(testData);
      console.log("📝 JSON string length:", jsonString.length);
      console.log("📝 JSON string preview:", jsonString.substring(0, 50));

      const response = await fetch("/.netlify/functions/netopia-initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: jsonString,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers));

      const responseText = await response.text();
      console.log("Response text:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = { error: "Failed to parse JSON", rawResponse: responseText };
      }

      console.log("Response result:", result);

      if (result.success) {
        setTestResult(`✅ Success: ${result.paymentUrl}`);
      } else {
        setTestResult(`❌ Failed: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error("Test error:", error);
      setTestResult(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
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

      if (isDevelopment) {
        return await simulateEmailSending();
      }

      const url = FUNCTION_URL;

      console.log(`Trimitere comandă către: ${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Eroare răspuns server:", errorText);
        throw new Error(`Eroare server: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Eroare în submitOrderWithFetch:", err);
      throw err;
    }
  };

  const submitOrderWithFirebase = async () => {
    try {
      const orderData = {
        ...formData,
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

      if (isDevelopment) {
        // În dezvoltare, tot apelăm funcția reală pentru a testa emailurile
        console.log("🔧 Modul dezvoltare: Testez trimiterea emailului real...");
      }

      // Generăm un număr de comandă unic
      const orderNumber = `LP${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Folosim funcția Netlify pentru trimiterea emailurilor
      const response = await fetch("/.netlify/functions/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderData,
          orderNumber: orderNumber,
          totalAmount: orderData.totalAmount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Eroare HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Emailuri trimise cu succes:", result);
      return result;
    } catch (err) {
      console.error("Eroare în submitOrderWithFirebase:", err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      console.log("Inițierea trimiterii comenzii:", { ...formData, items });

      // Dacă utilizatorul a ales plata cu cardul, redirectăm către Netopia
      if (formData.paymentMethod === "card") {
        console.log("Plată cu cardul selectată, inițializăm Netopia...");

        // Salvăm datele comenzii în localStorage pentru după plată
        const orderData = {
          orderNumber: `LC-${Date.now()}`,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          totalAmount: finalTotal,
          items: items,
          paymentMethod: "card",
          date: new Date().toISOString(),
        };

        localStorage.setItem("pendingOrder", JSON.stringify(orderData));

        try {
          // Importăm serviciul Netopia configurat
          const { netopiaService } = await import(
            "../services/netopiaPayments"
          );

          // Verificăm că finalTotal este definit
          if (!finalTotal || finalTotal <= 0) {
            throw new Error("Suma totală nu este validă");
          }

          // Creăm obiectul de plată folosind serviciul
          const paymentFormData = {
            ...formData,
            firstName: formData.name.split(" ")[0],
            lastName:
              formData.name.split(" ").slice(1).join(" ") ||
              formData.name.split(" ")[0],
            address: formData.address,
            city: "Bucuresti", // Oraș fără caractere speciale
            county: "Bucuresti", // Județ fără caractere speciale
            postalCode: "010000", // Poți adăuga un câmp pentru cod poștal
          };

          const paymentData = netopiaService.createPaymentData(
            paymentFormData,
            finalTotal,
            `Comandă ${orderData.orderNumber} - ${items.length} produse`
          );

          const paymentUrl = await netopiaService.initiatePayment(paymentData);

          // Redirectăm către pagina de plată Netopia
          window.location.href = paymentUrl;
          return;
        } catch (netopiaError) {
          console.error("Eroare la inițializarea Netopia:", netopiaError);
          setError(
            "Nu am putut inițializa plata cu cardul. Te rugăm să încerci din nou sau să alegi plata ramburs."
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Pentru plata ramburs, continuăm cu logica existentă
      let result;

      if (isDevelopment) {
        console.log("Mediu de dezvoltare detectat, folosim metoda simulată...");
        result = await submitOrderWithFirebase();
        console.log(
          "⚡ Comandă simulată procesată cu succes în mediul de dezvoltare!"
        );
        console.log("👇 Verifică simularea email-ului în consolă");
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
            totalAmount: finalTotal,
            items: items.length,
            date: new Date().toISOString(),
          })
        );
      }

      clearCart();
      navigate("/checkout-success", {
        state: {
          orderNumber,
          customerName: formData.name,
          customerEmail: formData.email,
          totalAmount: finalTotal,
          items: items.length,
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
            className="bg-white rounded-lg shadow-md p-8"
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
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
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
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
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
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
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
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
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
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
              >
                <option value="cash">Ramburs la livrare</option>
                <option value="card">Card bancar (Netopia Payments)</option>
              </select>

              {formData.paymentMethod === "card" && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Plată securizată cu cardul</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    Vei fi redirecționat către platforma securizată Netopia
                    Payments pentru a finaliza plata cu cardul bancar. Acceptăm
                    Visa, Mastercard și alte carduri bancare emise în România și
                    UE.
                  </p>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Metode de plată acceptate:
                </p>
                <img
                  src="/images/payment-methods.png"
                  alt="Metode de plată acceptate"
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            {/* Test button for development */}
            {isDevelopment && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={testNetopiaConnection}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors font-medium mb-2"
                >
                  🧪 Test Netopia Connection
                </button>
                {testResult && (
                  <div className="p-2 bg-gray-100 rounded border text-sm font-mono">
                    {testResult}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white py-3 px-4 rounded-md transition-colors font-semibold`}
            >
              {isSubmitting ? "Se procesează..." : "Trimite comanda"}
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
