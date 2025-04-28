import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { functions } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "../contexts";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setFormData(prevData => ({
        ...prevData,
        name: currentUser.displayName || prevData.name,
        email: currentUser.email || prevData.email
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formatCurrency = (price: number | undefined) => {
    if (price === undefined) return "";
    return `${price.toFixed(2)} RON`;
  };

  const simulateEmailSending = async () => {
    console.log("🔧 DEVELOPMENT MODE: Simulăm trimiterea email-ului de confirmare comandă");
    console.log("📧 Email care ar fi fost trimis la:", formData.email);
    
    const orderDate = new Date();
    const formattedDate = `${orderDate.getDate().toString().padStart(2, "0")}${(orderDate.getMonth() + 1).toString().padStart(2, "0")}${orderDate.getFullYear().toString().slice(2)}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `LC-${formattedDate}-${randomNum}`;
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const customerEmailContent = `
      =================================================================
      📧 SIMULARE EMAIL COMANDĂ CLIENT - MOD DEZVOLTARE
      =================================================================
      Către: ${formData.email}
      Subiect: Confirmare comandă #${orderId}
      
      Dragă ${formData.name},
      
      Îți mulțumim pentru comanda ta! Detaliile comenzii sunt următoarele:
      
      PRODUSE COMANDATE:
      ${items.map(item => `- ${item.name} x ${item.quantity} = ${formatCurrency(item.price ? item.price * item.quantity : 0)}`).join("\n      ")}
      
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
      ${items.map(item => {
        const emoji = item.name.toLowerCase().includes("afine") ? "🫐" : 
                     item.name.toLowerCase().includes("miere") ? "🍯" : 
                     "📦";
        return `- ${emoji} ${item.name} (Cantitate: ${item.quantity}, Preț: ${formatCurrency(item.price || 0)})`;
      }).join("\n      ")}
      
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
        content: "Email simulat în consola browserului"
      }
    };
  };

  const submitOrderWithFetch = async () => {
    try {
      const orderData = {
        ...formData,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: finalTotal,
        orderDate: new Date().toISOString(),
        shippingCost: shippingCost
      };

      if (isDevelopment) {
        return await simulateEmailSending();
      }

      const url = FUNCTION_URL;
      
      console.log(`Trimitere comandă către: ${url}`);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: finalTotal,
        orderDate: new Date().toISOString(),
        shippingCost: shippingCost
      };

      if (isDevelopment) {
        return await simulateEmailSending();
      }

      const sendOrderEmail = httpsCallable(functions, "sendOrderEmail");
      const result = await sendOrderEmail(orderData);
      return result.data as any;
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
      
      let result;
      
      if (isDevelopment) {
        console.log("Mediu de dezvoltare detectat, folosim metoda simulată...");
        result = await submitOrderWithFirebase();
        console.log("⚡ Comandă simulată procesată cu succes în mediul de dezvoltare!");
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
        localStorage.setItem("lastOrderDetails", JSON.stringify({
          orderNumber: orderNumber,
          customerName: formData.name,
          customerEmail: formData.email,
          totalAmount: finalTotal,
          items: items.length,
          date: new Date().toISOString()
        }));
      }
      
      clearCart();
      navigate("/checkout-success", { 
        state: { 
          orderNumber,
          customerName: formData.name,
          customerEmail: formData.email,
          totalAmount: finalTotal,
          items: items.length,
        } 
      });
    } catch (error: any) {
      console.error("Eroare completă la trimiterea comenzii:", error);
      
      let errorMessage = "A apărut o eroare la procesarea comenzii. Te rugăm să încerci din nou.";
      
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
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Finalizează comanda</h1>
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Date comandă</h2>
            <div className="mb-4">
              <label htmlFor="name" className="block font-semibold mb-2 text-gray-700">Nume complet</label>
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
              <label htmlFor="email" className="block font-semibold mb-2 text-gray-700">Email</label>
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
              <label htmlFor="address" className="block font-semibold mb-2 text-gray-700">Adresă</label>
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
              <label htmlFor="phone" className="block font-semibold mb-2 text-gray-700">Telefon</label>
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
              <label htmlFor="paymentMethod" className="block font-semibold mb-2 text-gray-700">Metoda de plată</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800"
              >
                <option value="cash">Ramburs</option>
              </select>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Metode de plată acceptate:</p>
                <img 
                  src="/images/payment-methods.png" 
                  alt="Metode de plată acceptate" 
                  className="max-w-full h-auto" 
                />
              </div>
            </div>
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
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Sumar comandă</h2>
            
            <div className="divide-y divide-gray-200">
              {items.map(item => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div className="text-gray-800">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <div className="font-medium text-gray-800">
                    {formatCurrency(item.price ? item.price * item.quantity : 0)}
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
                  {shippingCost === 0 
                    ? <span className="text-green-600 font-medium">Gratuit</span> 
                    : formatCurrency(shippingCost)}
                </span>
              </div>
              {total && total >= 200 && shippingCost === 0 && (
                <div className="text-sm text-green-600">Transport gratuit pentru comenzi peste 200 RON</div>
              )}
              <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 mt-2">
                <span>Total final:</span>
                <span className="text-blue-700 text-xl">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
