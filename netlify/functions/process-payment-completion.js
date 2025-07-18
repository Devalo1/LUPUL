/**
 * Funcție Netlify pentru procesarea finalizării plății
 * Această funcție se apelează când o plată Netopia este confirmată
 * și trimite emailurile corespunzătoare către client și admin
 */

const nodemailer = require("nodemailer");

/**
 * Configurează transportul pentru emailuri
 */
function getEmailTransporter() {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Caută datele comenzii din diferite surse
 */
async function findOrderData(orderId) {
  // În implementarea reală, ai căuta în baza de date
  // Pentru acum, returnez date de test
  return {
    orderNumber: orderId,
    customerEmail: null, // Va fi setat din localStorage în frontend
    customerName: "Client Netopia",
    totalAmount: "N/A",
    items: [],
    date: new Date().toISOString(),
    paymentMethod: "card",
  };
}

/**
 * Trimite email de confirmare pentru plată completă
 */
async function sendOrderCompletionEmails(orderData, paymentInfo) {
  const transporter = getEmailTransporter();

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
exports.handler = async (event, context) => {
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
    const finalOrderData = orderData || (await findOrderData(orderId));

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
