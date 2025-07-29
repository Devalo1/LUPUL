import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useEffect, useState, useRef } from "react";
import "../styles/OrderConfirmation.css";

const OrderConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // State pentru a preveni trimiterea multiplă - cu persistență
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentForOrder, setEmailSentForOrder] = useState<string>("");
  
  // Referință pentru a preveni double execution din React StrictMode
  const emailSentRef = useRef<Set<string>>(new Set());

  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");

  // Funcție pentru trimiterea emailului de confirmare
  const sendOrderConfirmationEmail = async (orderData: any) => {
    // Protecție EXTRA împotriva double execution din React StrictMode
    if (emailSentRef.current.has(orderData.orderNumber)) {
      console.log("🚫 BLOCAT: Email deja trimis pentru comanda:", orderData.orderNumber, "(useRef protection)");
      return;
    }

    // Previne trimiterea multiplă pentru aceeași comandă
    if (emailSending || emailSentForOrder === orderData.orderNumber) {
      console.log(
        "⚠️ Email deja trimis sau în curs de trimitere pentru comanda:",
        orderData.orderNumber,
        "SKIP!"
      );
      return;
    }

    // Marchează imediat ca fiind în progres în ambele mecanisme
    emailSentRef.current.add(orderData.orderNumber);
    setEmailSending(true);
    setEmailSentForOrder(orderData.orderNumber);
    
    console.log(
      "🔄 Trimit email de confirmare pentru comanda:",
      orderData.orderNumber
    );

    // Verifică dacă sunt date reale ale utilizatorului
    const isRealUserData = orderData.isRealUserData || false;
    console.log("📧 Date reale utilizator:", isRealUserData);

    try {
      // Detectare origine pentru Netlify Functions
      const origin =
        window.location.hostname === "localhost"
          ? "http://localhost:8888"
          : window.location.origin;
      const emailEndpoint = `${origin}/.netlify/functions/send-order-email`;

      console.log("📧 Email endpoint:", emailEndpoint);

      // Verifică dacă avem email client REAL
      const hasRealCustomerEmail =
        isRealUserData &&
        orderData.customerEmail &&
        orderData.customerEmail !== "N/A" &&
        !orderData.customerEmail.includes("example.com");

      console.log(
        "📧 Are email client REAL:",
        hasRealCustomerEmail,
        "->",
        orderData.customerEmail
      );

      const response = await fetch(emailEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderData: {
            email: hasRealCustomerEmail
              ? orderData.customerEmail
              : "lupulsicorbul@gmail.com", // Fallback către admin dacă nu e real
            customerName: orderData.customerName,
            firstName:
              orderData.customerName?.split(" ")[0] ||
              orderData.firstName ||
              "Client",
            lastName:
              orderData.customerName?.split(" ").slice(1).join(" ") ||
              orderData.lastName ||
              "",
            phone: orderData.customerPhone,
            address: orderData.customerAddress,
            city: orderData.customerCity,
            county: orderData.customerCounty,
            totalAmount: orderData.totalAmount,
            items: orderData.items || [],
            paymentMethod: hasRealCustomerEmail
              ? "Card bancar (NETOPIA Payments)"
              : `Card bancar (NETOPIA Payments) - ${!isRealUserData ? "⚠️ DATE SIMULATE" : "⚠️ EMAIL LIPSĂ"}`,
            date: orderData.date,
            isBackupNotification: !hasRealCustomerEmail, // Flag pentru a marca emailurile de backup
          },
          orderNumber: orderData.orderNumber,
          totalAmount: orderData.totalAmount,
        }),
      });

      if (response.ok) {
        console.log(
          hasRealCustomerEmail
            ? "✅ Email de confirmare trimis către CLIENT REAL"
            : "✅ Email de backup trimis către ADMIN (date incomplete/simulate)"
        );
        setIsEmailSent(true);
        // emailSentForOrder este deja setat mai sus
      } else {
        console.error(
          "❌ Eroare la trimiterea emailului:",
          response.statusText
        );
        // Permite retry în caz de eroare
        emailSentRef.current.delete(orderData.orderNumber);
        setEmailSentForOrder("");
      }
    } catch (error) {
      console.error("❌ Eroare la trimiterea emailului:", error);
      // Permite retry în caz de eroare
      emailSentRef.current.delete(orderData.orderNumber);
      setEmailSentForOrder("");
    } finally {
      setEmailSending(false); // Resetează flag-ul de trimitere
    }
  };

  useEffect(() => {
    // Protecție împotriva re-executării în React StrictMode
    let isCancelled = false;
    
    const processOrder = async () => {
      // DEBUGGING URGENT - Forțăm afișarea în console
      console.log("🔍 OrderConfirmation mounted cu parametri:", {
        orderId,
        status,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
      console.error("🚨 URGENT DEBUG - OrderConfirmation component loaded!");
      console.warn("⚠️ Order ID from URL:", orderId);

      // Forțează o alertă pentru debugging (doar pe localhost)
      if (window.location.hostname === "localhost") {
        console.log("🚨 LOCALHOST DETECTED - Adding visible debugging");
        // Adaugă un element vizibil pentru debugging
        const debugDiv = document.createElement("div");
        debugDiv.id = "debug-order-confirmation";
        debugDiv.style.cssText =
          "position: fixed; top: 0; left: 0; background: red; color: white; padding: 10px; z-index: 9999; font-size: 14px; max-width: 400px;";
        debugDiv.innerHTML = `🚨 DEBUG: OrderConfirmation loaded!<br/>OrderID: ${orderId}<br/>Time: ${new Date().toLocaleTimeString()}`;
        document.body.appendChild(debugDiv);

        // Elimină după 10 secunde (mai mult timp pentru debugging)
        setTimeout(() => {
          const elem = document.getElementById("debug-order-confirmation");
          if (elem) elem.remove();
        }, 10000);
      }

      // Debug: Afișează tot localStorage-ul la start
      console.log(
        "📋 DEBUGGING localStorage complet la momentul",
        new Date().toISOString()
      );
      console.log("📋 localStorage.length:", localStorage.length);
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          console.log(
            `  - "${key}": ${value ? value.substring(0, 200) + "..." : "null"}`
          );
        }
      }

      // BACKUP MECHANISM - Verifică și sessionStorage
      console.log("📋 DEBUGGING sessionStorage complet:");
      console.log("📋 sessionStorage.length:", sessionStorage.length);
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          console.log(
            `  - "${key}": ${value ? value.substring(0, 200) + "..." : "null"}`
          );
        }
      }

      if (!orderId) {
        setError("Nu a fost găsit ID-ul comenzii în URL");
        setIsLoading(false);
        return;
      }

      let foundOrderData = null;

      // 🚨 DEBUGGING URGENT - Forțează afișarea în console
      console.error(
        "🚨🚨🚨 URGENT DEBUG - OrderConfirmation START pentru OrderID:",
        orderId
      );
      console.error(
        "🚨🚨🚨 URGENT DEBUG - Timestamp:",
        new Date().toISOString()
      );

      // Verifică IMEDIAT sessionStorage
      const sessionCheck = sessionStorage.getItem("currentOrderBackup");
      console.error(
        "🚨🚨🚨 URGENT DEBUG - sessionStorage check:",
        sessionCheck ? "GĂSIT" : "LIPSĂ"
      );
      if (sessionCheck) {
        try {
          const parsedData = JSON.parse(sessionCheck);
          console.error(
            "🚨🚨🚨 URGENT DEBUG - sessionStorage OrderID:",
            parsedData.orderId
          );
          console.error(
            "🚨🚨🚨 URGENT DEBUG - Match cu OrderID requested:",
            parsedData.orderId === orderId
          );
        } catch (e) {
          console.error(
            "🚨🚨🚨 URGENT DEBUG - Eroare parsing sessionStorage:",
            e
          );
        }
      }

      // 🆕 PASUL 0: RESTAURARE DATE DIN COOKIE dacă sessionStorage este gol
      console.log("🔍 PASUL 0: Verificare și restaurare din cookie...");
      const sessionCheck2 = sessionStorage.getItem("currentOrderBackup");
      if (!sessionCheck2 && orderId) {
        console.log(
          "⚠️ SessionStorage gol, încerc restaurarea din cookie pentru:",
          orderId
        );

        try {
          // Caută cookie pentru această comandă
          const cookieName = `orderRecovery_${orderId}`;
          const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith(cookieName + "="))
            ?.split("=")[1];

          if (cookieValue) {
            const recoveryData = JSON.parse(
              atob(decodeURIComponent(cookieValue))
            );
            console.log("🍪 Date găsite în cookie pentru:", orderId);
            console.log("📧 Email client din cookie:", recoveryData.email);

            // Formatează datele pentru sessionStorage
            const restoredSessionData = {
              orderId: orderId,
              customerInfo: {
                firstName: recoveryData.customerName?.split(" ")[0] || "Client",
                lastName:
                  recoveryData.customerName?.split(" ").slice(1).join(" ") ||
                  "Recuperat",
                email: recoveryData.email,
                phone: recoveryData.phone,
                address: recoveryData.address,
                city: recoveryData.city,
                county: recoveryData.county,
              },
              amount: parseFloat(recoveryData.amount),
              description: `Comandă Lupul și Corbul - Recuperat din cookie`,
              timestamp: recoveryData.timestamp,
              source: "CookieRecovery",
            };

            // RESTAUREAZĂ sessionStorage cu datele reale
            sessionStorage.setItem(
              "currentOrderBackup",
              JSON.stringify(restoredSessionData)
            );
            console.log(
              "✅ SessionStorage restaurat din cookie cu date reale!",
              restoredSessionData.customerInfo.email
            );

            // Șterge cookie-ul după folosire
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          } else {
            console.log("⚠️ Nu există cookie de recovery pentru:", orderId);
          }
        } catch (cookieError) {
          console.error("❌ Eroare la restaurarea din cookie:", cookieError);
        }
      }

      // 1. 🔧 PRIORITATE MAXIMĂ - Verifică sessionStorage backup (date reale utilizator)
      console.log(
        "🔍 PASUL 1: Verificare sessionStorage backup (date reale)..."
      );
      console.log("🔍 DEBUG: sessionStorage.length =", sessionStorage.length);

      // Debug: Afișează toate cheiurile din sessionStorage
      console.log("🔍 DEBUG: Chei în sessionStorage:");
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          console.log(`  - ${key}: ${value?.substring(0, 100)}...`);
        }
      }

      const backupDataStr = sessionStorage.getItem("currentOrderBackup");
      console.log("🔍 DEBUG: currentOrderBackup exists =", !!backupDataStr);
      console.log("🔍 DEBUG: Căutam orderID =", orderId);

      if (backupDataStr) {
        try {
          const backupData = JSON.parse(backupDataStr);
          console.log("📦 Date backup găsite în sessionStorage:", backupData);
          console.log("🔍 DEBUG: backupData.orderId =", backupData.orderId);
          console.log("🔍 DEBUG: orderId din URL =", orderId);
          console.log(
            "🔍 DEBUG: Se potrivesc? =",
            backupData.orderId === orderId
          );

          // Verifică dacă OrderID se potrivește
          if (backupData.orderId === orderId) {
            // Adaptează formatul pentru compatibilitate (DATELE REALE ALE USERULUI)
            foundOrderData = {
              orderNumber: backupData.orderId,
              customerName: `${backupData.customerInfo.firstName} ${backupData.customerInfo.lastName}`,
              customerEmail: backupData.customerInfo.email, // EMAIL REAL AL CLIENTULUI
              customerPhone: backupData.customerInfo.phone,
              customerAddress: backupData.customerInfo.address,
              customerCity: backupData.customerInfo.city,
              customerCounty: backupData.customerInfo.county,
              totalAmount: backupData.amount,
              paymentMethod: "Card bancar (NETOPIA Payments)",
              date: backupData.timestamp || new Date().toISOString(),
              items: [
                {
                  name: backupData.description,
                  price: backupData.amount,
                  quantity: 1,
                },
              ],
              isRealUserData: true, // Flag pentru a indica că sunt date reale
            };

            console.log(
              "✅ DATE REALE ale utilizatorului recuperate din sessionStorage!"
            );
            console.log("📧 Email REAL client:", foundOrderData.customerEmail);
            console.log("👤 Nume REAL:", foundOrderData.customerName);
          } else {
            console.log("⚠️ OrderID din sessionStorage nu se potrivește:", {
              stored: backupData.orderId,
              requested: orderId,
            });
          }
        } catch (error) {
          console.error(
            "❌ Eroare la parsarea backup-ului din sessionStorage:",
            error
          );
        }
      } else {
        console.log("⚠️ Nu există currentOrderBackup în sessionStorage");
      }

      // 2. Caută în localStorage (format nou - pendingOrders plural) - doar dacă nu s-au găsit în sessionStorage
      if (!foundOrderData) {
        console.log("🔍 PASUL 2: Verificare localStorage (format nou)...");
        const pendingOrdersStr = localStorage.getItem("pendingOrders");
        if (pendingOrdersStr) {
          try {
            const pendingOrders = JSON.parse(pendingOrdersStr);
            foundOrderData = pendingOrders[orderId];
            if (foundOrderData) {
              console.log(
                "📦 Comanda găsită în localStorage (format nou):",
                foundOrderData
              );
              // Șterge comanda din pending orders
              delete pendingOrders[orderId];
              localStorage.setItem(
                "pendingOrders",
                JSON.stringify(pendingOrders)
              );
            }
          } catch (error) {
            console.error("❌ Eroare la parsarea pendingOrders:", error);
          }
        }
      }

      // 3. Caută în localStorage (format vechi - pendingOrder singular)
      if (!foundOrderData) {
        console.log("🔍 PASUL 3: Verificare localStorage (format vechi)...");
        const pendingOrderStr = localStorage.getItem("pendingOrder");
        if (pendingOrderStr) {
          try {
            const pendingOrder = JSON.parse(pendingOrderStr);
            console.log("🔍 Parsed pendingOrder:", pendingOrder);
            console.log(
              "🔍 Comparing orderNumber:",
              pendingOrder.orderNumber,
              "vs orderId:",
              orderId
            );

            // Verifică dacă orderNumber-ul se potrivește
            if (pendingOrder.orderNumber === orderId) {
              foundOrderData = pendingOrder;
              console.log(
                "📦 Comanda găsită în localStorage (format vechi):",
                foundOrderData
              );
              localStorage.removeItem("pendingOrder");
            } else {
              console.log("❌ OrderNumber nu se potrivește:", {
                stored: pendingOrder.orderNumber,
                requested: orderId,
                matches: pendingOrder.orderNumber === orderId,
              });
            }
          } catch (error) {
            console.error("❌ Eroare la parsarea pendingOrder:", error);
          }
        } else {
          console.log("⚠️ Nu există pendingOrder în localStorage");
        }
      }

      // 4. 🆕 RECOVERY API - DOAR CA ULTIMĂ OPȚIUNE și doar dacă NU există date în sessionStorage
      if (!foundOrderData) {
        console.log(
          "🔄 PASUL 4: NU am găsit date reale - încerc recovery API ca ultimă opțiune..."
        );

        // ⚠️ ATENȚIE: API-ul recovery poate returna date simulate!
        // Prioritizează ÎNTOTDEAUNA sessionStorage-ul
        try {
          const response = await fetch(
            `/.netlify/functions/get-order-details?orderId=${orderId}`
          );
          if (response.ok) {
            const recoveryResult = await response.json();
            if (recoveryResult.success && recoveryResult.orderData) {
              console.warn(
                "⚠️ FOLOSIND DATE DIN API RECOVERY (pot fi simulate):",
                recoveryResult.orderData
              );
              foundOrderData = recoveryResult.orderData;
              // Marchează că datele pot fi simulate
              foundOrderData.isRealUserData = false;
              foundOrderData.dataSource = "api-recovery";
            } else {
              console.warn("⚠️ Recovery API nu a returnat date valide");
            }
          } else {
            console.warn("⚠️ Recovery API request failed");
          }
        } catch (recoveryError) {
          console.warn("⚠️ Recovery API error:", recoveryError);
        }
      }

      // Dacă nu am găsit date nicăieri, creează o comandă de fallback pentru notificare admin
      if (!foundOrderData) {
        console.error(
          "❌ TOATE metodele de recuperare au eșuat pentru:",
          orderId
        );
        foundOrderData = {
          orderNumber: orderId,
          customerName: "Date lipsă",
          customerEmail: "N/A",
          customerPhone: "N/A",
          customerAddress: "N/A",
          customerCity: "N/A",
          customerCounty: "N/A",
          totalAmount: "N/A",
          paymentMethod:
            "Card bancar (NETOPIA Payments) - ⚠️ DATE LIPSĂ COMPLET",
          date: new Date().toISOString(),
          items: [],
          isRealUserData: false,
        };
      }

      // Setează datele și trimite emailul DOAR dacă nu a fost deja trimis
      if (isCancelled) return; // Prevent execution if component unmounted
      
      setOrderData(foundOrderData);

      // Verifică dacă emailul a fost deja trimis pentru această comandă
      if (emailSentForOrder !== foundOrderData.orderNumber && !emailSending && !emailSentRef.current.has(foundOrderData.orderNumber)) {
        await sendOrderConfirmationEmail(foundOrderData);
      } else {
        console.log(
          "🔄 Email deja trimis sau în curs de trimitere pentru comanda:",
          foundOrderData.orderNumber
        );
        setIsEmailSent(true); // Marchează ca trimis dacă a fost deja procesat
      }

      if (isCancelled) return; // Prevent state update if component unmounted
      setIsLoading(false);
    };

    processOrder();

    // Cleanup function pentru a preveni memory leaks
    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  // Funcție pentru a gestiona click-ul pe butonul "Înapoi la magazin"
  const handleBackToShop = () => {
    clearCart();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-content">
          <div className="loading-animation">
            <div className="spinner"></div>
            <h2>Se procesează comanda...</h2>
            <p>Vă rugăm să așteptați</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-content error">
          <div className="error-icon">❌</div>
          <h2>Eroare la procesarea comenzii</h2>
          <p>{error}</p>
          <button onClick={handleBackToShop} className="back-to-shop-btn">
            Înapoi la Magazin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        <div className="success-icon">✅</div>
        <h1>Plata a fost procesată cu succes!</h1>
        <div className="order-details">
          <h2>Detalii comandă:</h2>
          {orderData && (
            <>
              <p>
                <strong>Numărul comenzii:</strong> {orderData.orderNumber}
              </p>
              <p>
                <strong>Nume:</strong> {orderData.customerName}
              </p>
              <p>
                <strong>Email:</strong> {orderData.customerEmail}
              </p>
              <p>
                <strong>Telefon:</strong> {orderData.customerPhone}
              </p>
              <p>
                <strong>Adresa:</strong> {orderData.customerAddress},{" "}
                {orderData.customerCity}, {orderData.customerCounty}
              </p>
              <p>
                <strong>Total:</strong> {orderData.totalAmount} RON
              </p>
              <p>
                <strong>Metoda de plată:</strong> {orderData.paymentMethod}
              </p>
            </>
          )}
        </div>

        <div className="email-status">
          {isEmailSent ? (
            <p className="email-success">
              ✅ Emailul de confirmare a fost trimis!
            </p>
          ) : (
            <p className="email-pending">
              📧 Se trimite emailul de confirmare...
            </p>
          )}
        </div>

        <button onClick={handleBackToShop} className="back-to-shop-btn">
          Înapoi la Magazin
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
