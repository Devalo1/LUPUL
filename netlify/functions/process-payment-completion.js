/**
 * Funcție Netlify pentru procesarea finalizării plății
 * Această funcție se apelează când o plată Netopia este confirmată
 * și trimite emailurile corespunzătoare către client și admin
 */

import nodemailer from "nodemailer";

// Firebase will be imported and initialized only when needed to avoid blocking in development
let firebaseInitialized = false;
let firestore = null;

// Firebase configuration
async function initializeFirebase() {
  if (!firebaseInitialized) {
    try {
      console.log("🔥 Initializing Firebase...");
      const { initializeApp } = await import("firebase/app");
      const { getFirestore } = await import("firebase/firestore");

      const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
        measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
      };

      console.log("🔧 Firebase Config Debug:", {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        hasApiKey: !!firebaseConfig.apiKey,
        hasAppId: !!firebaseConfig.appId,
        timestamp: new Date().toISOString()
      });

      // Use unique app name to avoid caching issues
      const appName = `emblem-app-${Date.now()}`;
      const app = initializeApp(firebaseConfig, appName);
      firestore = getFirestore(app);
      firebaseInitialized = true;
      console.log("✅ Firebase initialized successfully");
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
      throw error;
    }
  }
  return firestore;
}

/**
 * Procesează emblemele din comenzi și le salvează în colecția emblems
 */
async function processEmblemItems(orderData, orderId) {
  try {
    console.log("🔮 Checking for emblem items in order:", orderId);
    console.log("🔮 OrderData structure:", JSON.stringify(orderData, null, 2));

    if (!orderData.items || !Array.isArray(orderData.items)) {
      console.log("❌ No items found in order data");
      return;
    }

    // Check if we're in development mode to avoid Firebase connection issues
    const isDevelopment =
      process.env.NODE_ENV !== "production" ||
      !process.env.VITE_FIREBASE_API_KEY;
    if (isDevelopment) {
      console.log(
        "🔧 DEVELOPMENT MODE: Will attempt Firebase connection but handle timeouts gracefully"
      );
    }

    // Găsește produsele care sunt embleme (id începe cu "emblem_")
    const emblemItems = orderData.items.filter(
      (item) => item.id && item.id.startsWith("emblem_")
    );

    if (emblemItems.length === 0) {
      console.log("ℹ️ No emblem items found in order");
      return;
    }

    console.log("🔮 Found emblem items:", emblemItems.length);
    console.log("🔮 Emblem items:", JSON.stringify(emblemItems, null, 2));

    // Pentru fiecare emblemă, creează intrarea în colecția emblems
    for (const emblemItem of emblemItems) {
      const emblemType = emblemItem.id.replace("emblem_", ""); // ex: "emblem_protection" -> "protection"

      const emblemData = {
        userId: orderData.userId || "unknown", // Trebuie să ai userId în orderData
        type: emblemType,
        name: emblemItem.name || `Emblemă ${emblemType}`,
        status: "active",
        createdAt: new Date().toISOString(), // Will be replaced with serverTimestamp in Firebase
        orderId: orderId,
        mintedDate: new Date().toISOString(), // Will be replaced with serverTimestamp in Firebase
        rarity: getEmblemRarity(emblemType), // Funcție helper pentru raritate
        attributes: getEmblemAttributes(emblemType), // Funcție helper pentru atribute
      };

      console.log("🔮 Creating emblem:", emblemData);

      try {
        // Initialize Firebase only when needed
        const firestoreInstance = await initializeFirebase();
        const { collection, addDoc, serverTimestamp } = await import(
          "firebase/firestore"
        );

        // Salvează emblema în Firebase
        const emblemRef = await addDoc(
          collection(firestoreInstance, "emblems"),
          {
            ...emblemData,
            createdAt: serverTimestamp(),
            mintedDate: serverTimestamp(),
          }
        );
        console.log("✅ Emblem created with ID:", emblemRef.id);

        // Actualizează stocul pentru acea emblemă
        await updateEmblemStock(emblemType);
      } catch (firebaseError) {
        console.error("❌ Firebase error creating emblem:", firebaseError);
        if (isDevelopment) {
          console.log("🔧 DEVELOPMENT: Continuing despite Firebase error");
        } else {
          throw firebaseError; // Re-throw in production
        }
      }
    }

    console.log("✅ All emblems processed successfully");
  } catch (error) {
    console.error("❌ Error processing emblem items:", error);
    // Nu oprește procesul de plată pentru o eroare la embleme
  }
}

/**
 * Helper pentru raritatea emblemelor
 */
function getEmblemRarity(emblemType) {
  const rarities = {
    lupul_intelept: "legendary",
    corbul_mistic: "epic",
    gardianul_wellness: "rare",
    cautatorul_lumina: "common"
  };
  return rarities[emblemType] || "common";
}

/**
 * Helper pentru atributele emblemelor
 */
function getEmblemAttributes(emblemType) {
  const attributes = {
    lupul_intelept: { wisdom: 95, leadership: 90 },
    corbul_mistic: { mysticism: 90, knowledge: 85 },
    gardianul_wellness: { healing: 85, balance: 80 },
    cautatorul_lumina: { discovery: 75, potential: 70 }
  };
  return attributes[emblemType] || { power: 50 };
}

/**
 * Actualizează stocul pentru un tip de emblemă
 */
async function updateEmblemStock(emblemType) {
  try {
    // Această funcție ar trebui să decrementeze stocul în colecția emblem_stocks
    // Pentru moment doar logăm
    console.log(`📦 Should update stock for emblem type: ${emblemType}`);
    console.log(`📦 DEVELOPMENT: Skipping Firebase stock update`);
  } catch (error) {
    console.error("❌ Error updating emblem stock:", error);
  }
}

/**
 * Configurează transportul pentru emailuri
 */
function getEmailTransporter() {
  // În dezvoltare locală cu credențiale placeholder, nu trimite emailuri reale
  const isDevelopment =
    process.env.SMTP_USER === "your_email@gmail.com" ||
    process.env.SMTP_PASS === "your_app_password_here" ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS;

  if (isDevelopment) {
    console.log(
      "📧 Development mode: Email sending disabled (no valid SMTP credentials)"
    );
    return null; // Returnează null pentru a indica că nu trimitem emailuri
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER || "lupulsicorbul@gmail.com",
      pass: process.env.SMTP_PASS, // Folosim doar variabila de mediu pentru securitate
    },
  });
}

/**
 * Caută datele comenzii din diferite surse și actualizează statusul în Firebase
 */
async function findOrderData(orderId, event) {
  console.log("🔍 Căutare date comandă pentru:", orderId);

  // Încearcă să recupereze datele din cookie (salvate de Checkout.tsx)
  let orderData = {
    orderNumber: orderId,
    customerEmail: null,
    customerName: "Client Netopia",
    customerPhone: "Telefon nedefinit",
    customerAddress: "Adresă nedefinită",
    customerCity: "Oraș nedefinit",
    customerCounty: "Județ nedefinit",
    customerPostalCode: "",
    totalAmount: 0,
    items: [],
    date: new Date().toISOString(),
    paymentMethod: "card",
    userId: null, // Va fi completat din cookie sau Firebase
  };

  // Încearcă să recupereze datele din cookie
  if (event && event.headers && event.headers.cookie) {
    try {
      const cookies = event.headers.cookie;
      const cookieMatch = cookies.match(
        new RegExp(`orderRecovery_${orderId}=([^;]+)`)
      );

      if (cookieMatch) {
        // Decodează cookie-ul (folosind funcția Unicode-safe din Checkout.tsx)
        const encodedCookieValue = decodeURIComponent(cookieMatch[1]);

        // Decodează base64 Unicode-safe pentru Node.js
        const unicodeBase64Decode = (str) => {
          try {
            const decoded = Buffer.from(str, "base64").toString("utf8");
            return JSON.parse(decoded);
          } catch (e) {
            console.warn("Fallback la decodare simplă base64:", e);
            try {
              const decoded = Buffer.from(str, "base64").toString("binary");
              return JSON.parse(decoded);
            } catch (e2) {
              console.error("Eroare completă la decodarea base64:", e2);
              return null;
            }
          }
        };

        const recoveryData = unicodeBase64Decode(encodedCookieValue);

        if (recoveryData) {
          console.log("🍪 Date recuperate din cookie pentru:", orderId);
          console.log("📧 Email client recuperat:", recoveryData.email);

          // Mapează datele din cookie în formatul așteptat
          orderData = {
            orderNumber: orderId,
            customerEmail: recoveryData.email,
            customerName: recoveryData.customerName,
            customerPhone: recoveryData.phone,
            customerAddress: recoveryData.address,
            customerCity: recoveryData.city,
            customerCounty: recoveryData.county,
            customerPostalCode: recoveryData.postalCode || "",
            totalAmount: parseFloat(recoveryData.amount) || 0,
            items: [
              {
                name: "Comandă plătită prin card",
                price: parseFloat(recoveryData.amount) || 0,
                quantity: 1,
                description: "Plată procesată prin NETOPIA",
              },
            ],
            date: recoveryData.timestamp || new Date().toISOString(),
            paymentMethod: "card",
          };

          console.log("✅ Date comandă recuperate cu succes din cookie");
        } else {
          console.log(
            "❌ Nu s-au putut decoda datele din cookie pentru:",
            orderId
          );
        }
      } else {
        console.log("⚠️ Nu s-au găsit date cookie pentru:", orderId);
      }
    } catch (cookieError) {
      console.error("❌ Eroare la decodarea cookie:", cookieError);
    }
  }

  // 🆕 Actualizează statusul comenzii în Firebase după confirmarea plății
  try {
    console.log("🔄 Actualizez statusul comenzii în Firebase pentru:", orderId);

    // Folosim o abordare simplă pentru actualizarea statusului
    // În producție, această funcționalitate ar trebui să fie în același handler
    console.log("✅ Status comandă marcat pentru actualizare:", {
      orderId: orderId,
      status: "confirmed",
      notes: "Plată confirmată prin NETOPIA Payments",
      timestamp: new Date().toISOString(),
    });

    // TODO: Adaugă integrarea directă cu Firebase Admin SDK aici
    // Pentru moment, log-ul va fi suficient pentru tracking
  } catch (error) {
    console.error(
      "❌ Eroare la marcarea statusului pentru actualizare:",
      error
    );
  }

  return orderData;
}

/**
 * Trimite email de confirmare pentru plată completă
 */
async function sendOrderCompletionEmails(orderData, paymentInfo) {
  const transporter = getEmailTransporter();

  // Dacă nu avem transporter valid (dezvoltare locală), simulează trimiterea
  if (!transporter) {
    console.log("📧 Simulating email sending in development mode:", {
      orderNumber: orderData.orderNumber,
      customerEmail: orderData.customerEmail,
      paymentInfo,
    });

    return {
      customerEmailSent: true, // Simulat
      adminEmailSent: true, // Simulat
      customerEmailId: "dev-simulation-customer",
      adminEmailId: "dev-simulation-admin",
    };
  }

  // Email pentru admin (întotdeauna trimis)
  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>🎉 COMANDĂ FINALIZATĂ - ${orderData.orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🎉 COMANDĂ FINALIZATĂ!</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: #4CAF50;">Plată Netopia confirmată!</h2>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>📋 Detalii comandă:</h3>
          <p><strong>Numărul comenzii:</strong> ${orderData.orderNumber}</p>
          <p><strong>Client:</strong> ${orderData.customerName || "N/A"}</p>
          <p><strong>Email client:</strong> ${orderData.customerEmail || "N/A"}</p>
          <p><strong>Total:</strong> ${orderData.totalAmount || "N/A"}</p>
          <p><strong>Data comenzii:</strong> ${new Date(orderData.date).toLocaleString("ro-RO")}</p>
        </div>
        
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>💳 Detalii plată Netopia:</h3>
          <p><strong>ID Tranzacție:</strong> ${paymentInfo?.paymentId || "N/A"}</p>
          <p><strong>Status:</strong> ✅ Confirmată</p>
          <p><strong>Data procesării:</strong> ${new Date().toLocaleString("ro-RO")}</p>
        </div>
        
        <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
          <h3>🚨 ACȚIUNI URGENTE:</h3>
          <ul>
            <li><strong>Procesează comanda pentru livrare/activare</strong></li>
            <li><strong>Contactează clientul în maximum 2 ore</strong></li>
            <li><strong>Pentru produse digitale: activează accesul imediat</strong></li>
            <li><strong>Verifică inventarul pentru produse fizice</strong></li>
          </ul>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="https://dashboard.netopia-payments.com" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            📊 Vezi în Dashboard Netopia
          </a>
        </p>
      </div>
    </body>
    </html>
  `;

  // Email pentru client (dacă avem email-ul)
  let customerEmailResult = null;
  if (orderData.customerEmail) {
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>🎉 Comanda confirmată - ${orderData.orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Comanda Confirmată!</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Plata dvs. a fost procesată cu succes!</h2>
          <p>Bună ${orderData.customerName || "Dragă client"},</p>
          <p>Vă confirmăm că plata pentru comanda dvs. a fost procesată cu succes prin NETOPIA Payments.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3>📋 Detalii comandă:</h3>
            <p><strong>Numărul comenzii:</strong> ${orderData.orderNumber}</p>
            <p><strong>Total plătit:</strong> ${orderData.totalAmount || "N/A"}</p>
            <p><strong>Data:</strong> ${new Date(orderData.date).toLocaleString("ro-RO")}</p>
            <p><strong>Metoda de plată:</strong> Card bancar (NETOPIA Payments)</p>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>🚀 Următorii pași:</h3>
            <ul>
              <li>Comanda dvs. este acum în procesare</li>
              <li>Veți fi contactat în curând cu detalii despre livrare</li>
              <li>Pentru produsele digitale, accesul va fi disponibil în maximum 24h</li>
              <li>Veți primi un email separat cu instrucțiunile de livrare</li>
            </ul>
          </div>
          
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>💡 Informații utile:</strong></p>
            <p>• Păstrați numărul comenzii pentru referințe viitoare</p>
            <p>• Pentru întrebări: <a href="mailto:lupulsicorbul@gmail.com">lupulsicorbul@gmail.com</a></p>
            <p>• Timpul de livrare: 3-5 zile lucrătoare pentru produse fizice</p>
          </div>
          
          <p style="text-align: center; margin-top: 30px;">
            <strong>Mulțumim că ați ales Lupul și Corbul!</strong>
          </p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            Plată procesată securizat prin NETOPIA Payments • Licența BNR nr. PSD 17/2020<br>
            © 2025 Lupul și Corbul - Toate drepturile rezervate
          </p>
        </div>
      </body>
      </html>
    `;

    customerEmailResult = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: orderData.customerEmail,
      subject: `🎉 Comanda confirmată - ${orderData.orderNumber} - Lupul și Corbul`,
      html: customerEmailHtml,
    });
  }

  // Email pentru admin
  const adminEmailResult = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: "lupulsicorbul@gmail.com",
    subject: `🎉 COMANDĂ FINALIZATĂ - ${orderData.orderNumber} - NETOPIA CONFIRMATĂ`,
    html: adminEmailHtml,
  });

  return {
    customerEmailSent: !!customerEmailResult,
    adminEmailSent: !!adminEmailResult,
    customerEmailId: customerEmailResult?.messageId,
    adminEmailId: adminEmailResult?.messageId,
  };
}

/**
 * Handler principal
 */
export const handler = async (event, context) => {
  // Headers CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Răspunde la preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Acceptă doar POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { orderId, paymentInfo, orderData } = JSON.parse(event.body || "{}");

    if (!orderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Order ID is required" }),
      };
    }

    console.log("Processing payment completion for order:", orderId);

    // Găsește sau folosește datele comenzii furnizate
    const finalOrderData = orderData || (await findOrderData(orderId, event));

    // Verifică dacă suntem în modul dezvoltare
    const isDevelopment =
      !process.env.SMTP_PASS ||
      process.env.SMTP_PASS === "test-development-mode";

    if (isDevelopment) {
      console.log(
        "🔧 DEVELOPMENT MODE: Simulez trimiterea emailurilor de finalizare"
      );
      console.log(
        "📧 Ar fi trimis email către:",
        finalOrderData.customerEmail || "client necunoscut"
      );
      console.log("📧 Ar fi trimis email admin către: lupulsicorbul@gmail.com");

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Emailuri de finalizare simulate (development mode)",
          development: true,
          orderId: orderId,
        }),
      };
    }

    // Procesează emblemele din comandă (dacă există)
    await processEmblemItems(finalOrderData, orderId);

    // Trimite emailurile de finalizare
    const emailResults = await sendOrderCompletionEmails(
      finalOrderData,
      paymentInfo
    );

    console.log("✅ Payment completion emails sent:", emailResults);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Payment completion emails sent successfully",
        orderId: orderId,
        emailResults: emailResults,
      }),
    };
  } catch (error) {
    console.error("Error processing payment completion:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
