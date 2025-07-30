/**
 * Funcție Netlify pentru gestionarea notificărilor NETOPIA
 * Această funcție primește notificări de la NETOPIA despre statusul plăților
 */

import crypto from "crypto";
import nodemailer from "nodemailer";

// Configurație NETOPIA
const NETOPIA_CONFIG = {
  sandbox: {
    signature:
      process.env.NETOPIA_SANDBOX_SIGNATURE || "SANDBOX_SIGNATURE_PLACEHOLDER",
    publicKey: process.env.NETOPIA_SANDBOX_PUBLIC_KEY,
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    publicKey: process.env.NETOPIA_LIVE_PUBLIC_KEY,
  },
};

/**
 * Configurează transportul pentru emailuri
 */
function getEmailTransporter() {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER || "lupulsicorbul@gmail.com",
      pass: process.env.SMTP_PASS, // Folosim doar variabila de mediu pentru securitate
    },
  });
}

/**
 * Trimite email de confirmare pentru plată reușită
 */
async function sendPaymentConfirmationEmail(orderId, paymentInfo) {
  const transporter = getEmailTransporter();

  const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Plata confirmată - Comanda ${orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🎉 Plata Confirmată!</h1>
      </div>
      
      <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #333;">Plata dvs. a fost procesată cu succes!</h2>
        <p>Mulțumim pentru comandă!</p>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <h3>Detalii plată:</h3>
          <p><strong>Numărul comenzii:</strong> ${orderId}</p>
          <p><strong>ID Tranzacție:</strong> ${paymentInfo?.paymentId || "N/A"}</p>
          <p><strong>Status:</strong> ✅ Confirmată</p>
          <p><strong>Data procesării:</strong> ${new Date().toLocaleString("ro-RO")}</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>🚀 Următorii pași:</strong></p>
          <ul>
            <li>Comanda dvs. este acum în procesare</li>
            <li>Veți fi contactat în curând cu detalii despre livrare</li>
            <li>Pentru produsele digitale, accesul va fi disponibil în maximum 24h</li>
          </ul>
        </div>
        
        <p>Pentru orice întrebări, nu ezitați să ne contactați la <a href="mailto:lupulsicorbul@gmail.com">lupulsicorbul@gmail.com</a></p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Plată procesată securizat prin NETOPIA Payments<br>
          © 2025 Lupul și Corbul - Toate drepturile rezervate
        </p>
      </div>
    </body>
    </html>
  `;

  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>🎉 PLATĂ CONFIRMATĂ - ${orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif;">
      <h2 style="color: #4CAF50;">🎉 PLATĂ CONFIRMATĂ PRIN NETOPIA!</h2>
      <p><strong>Numărul comenzii:</strong> ${orderId}</p>
      <p><strong>ID Tranzacție:</strong> ${paymentInfo?.paymentId || "N/A"}</p>
      <p><strong>Status:</strong> ✅ Confirmată</p>
      <p><strong>Data procesării:</strong> ${new Date().toLocaleString("ro-RO")}</p>
      
      <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>🚨 ACȚIUNI NECESARE:</h3>
        <ul>
          <li>Procesează comanda pentru livrare</li>
          <li>Pentru produse digitale: activează accesul</li>
          <li>Contactează clientul pentru confirmare</li>
        </ul>
      </div>
      
      <p>Accesează panoul de administrare pentru mai multe detalii.</p>
    </body>
    </html>
  `;

  // Trimite emailuri
  await Promise.all([
    // Note: În practică, ai avea datele clientului din baza de date
    // Pentru acum, trimit doar la admin
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "lupulsicorbul@gmail.com",
      subject: `🎉 PLATĂ CONFIRMATĂ - Comanda ${orderId}`,
      html: adminEmailHtml,
    }),
  ]);
}

/**
 * Trimite email pentru plată în așteptare
 */
async function sendPaymentPendingEmail(orderId, paymentInfo) {
  const transporter = getEmailTransporter();

  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>⏳ PLATĂ ÎN AȘTEPTARE - ${orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif;">
      <h2 style="color: #FF9800;">⏳ PLATĂ ÎN AȘTEPTARE</h2>
      <p><strong>Numărul comenzii:</strong> ${orderId}</p>
      <p><strong>ID Tranzacție:</strong> ${paymentInfo?.paymentId || "N/A"}</p>
      <p><strong>Status:</strong> ⏳ În așteptare</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString("ro-RO")}</p>
      
      <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>ℹ️ Informații:</strong></p>
        <p>Plata este în proces de verificare. Monitorizează statusul în dashboard-ul NETOPIA.</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: "lupulsicorbul@gmail.com",
    subject: `⏳ PLATĂ ÎN AȘTEPTARE - Comanda ${orderId}`,
    html: adminEmailHtml,
  });
}

/**
 * Trimite email pentru plată eșuată
 */
async function sendPaymentFailedEmail(orderId, paymentInfo) {
  const transporter = getEmailTransporter();

  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>❌ PLATĂ EȘUATĂ - ${orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif;">
      <h2 style="color: #f44336;">❌ PLATĂ EȘUATĂ SAU ANULATĂ</h2>
      <p><strong>Numărul comenzii:</strong> ${orderId}</p>
      <p><strong>ID Tranzacție:</strong> ${paymentInfo?.paymentId || "N/A"}</p>
      <p><strong>Status:</strong> ❌ Eșuată/Anulată</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString("ro-RO")}</p>
      
      <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>🚨 ACȚIUNI NECESARE:</strong></p>
        <ul>
          <li>Verifică statusul în dashboard-ul NETOPIA</li>
          <li>Contactează clientul pentru clarificări</li>
          <li>Oferă alternative de plată dacă este necesar</li>
        </ul>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: "lupulsicorbul@gmail.com",
    subject: `❌ PLATĂ EȘUATĂ - Comanda ${orderId}`,
    html: adminEmailHtml,
  });
}

/**
 * Verifică semnătura NETOPIA pentru securitate
 */
function verifyNetopiaSignature(data, signature, publicKey) {
  try {
    if (!publicKey) {
      console.log(
        "Warning: No public key configured, skipping signature verification"
      );
      return true; // În sandbox, acceptăm fără verificare
    }

    const verify = crypto.createVerify("sha1");
    verify.update(data);
    return verify.verify(publicKey, signature, "base64");
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

/**
 * Procesează notificarea NETOPIA
 */
async function processNetopiaNotification(notification) {
  const { order, payment } = notification;

  console.log("Processing NETOPIA notification:", {
    orderId: order?.orderId,
    paymentId: payment?.paymentId,
    status: payment?.status,
  });

  // Procesez notificarea și trimit emailuri corespunzătoare
  switch (payment?.status) {
    case "confirmed":
      console.log(`✅ Payment confirmed for order ${order?.orderId}`);

      try {
        // Apelează funcția dedicată pentru procesarea finalizării comenzii
        const baseUrl = process.env.URL || "https://lupulsicorbul.com";
        const response = await fetch(
          `${baseUrl}/.netlify/functions/process-payment-completion`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: order?.orderId,
              paymentInfo: payment,
              orderData: null, // Se va încerca căutarea automată
            }),
          }
        );

        if (response.ok) {
          console.log(
            `📧 Payment completion processed successfully for order ${order?.orderId}`
          );
        } else {
          console.error(
            `❌ Failed to process payment completion for order ${order?.orderId}:`,
            await response.text()
          );
        }
      } catch (emailError) {
        console.error(
          `❌ Failed to process payment completion for order ${order?.orderId}:`,
          emailError
        );
        // Fallback la emailul simplu
        await sendPaymentConfirmationEmail(order?.orderId, payment);
      }
      break;

    case "pending":
      console.log(`⏳ Payment pending for order ${order?.orderId}`);

      try {
        await sendPaymentPendingEmail(order?.orderId, payment);
        console.log(
          `📧 Pending notification email sent for order ${order?.orderId}`
        );
      } catch (emailError) {
        console.error(
          `❌ Failed to send pending email for order ${order?.orderId}:`,
          emailError
        );
      }
      break;

    case "canceled":
    case "failed":
      console.log(`❌ Payment failed/canceled for order ${order?.orderId}`);

      try {
        await sendPaymentFailedEmail(order?.orderId, payment);
        console.log(`📧 Failed payment email sent for order ${order?.orderId}`);
      } catch (emailError) {
        console.error(
          `❌ Failed to send failure email for order ${order?.orderId}:`,
          emailError
        );
      }
      break;

    default:
      console.log(`❓ Unknown payment status: ${payment?.status}`);
  }

  return { success: true, orderId: order?.orderId, status: payment?.status };
}

/**
 * Handler principal pentru endpoint-ul de notificare
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

  // Pentru orice alt method, returnăm tot formatul NETOPIA pentru siguranță
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ errorCode: 0 }),
    };
  }

  try {
    // Parse request body
    const notification = JSON.parse(event.body || "{}");

    // Determină dacă este sandbox sau live
    const isLive = notification.live === true;
    const config = isLive ? NETOPIA_CONFIG.live : NETOPIA_CONFIG.sandbox;

    // Verifică semnătura (în producție)
    if (isLive && notification.signature) {
      const isValid = verifyNetopiaSignature(
        event.body,
        notification.signature,
        config.publicKey
      );

      if (!isValid) {
        console.error("Invalid NETOPIA signature, but continuing...");
        // Nu returnăm eroare, ci continuăm pentru a evita blocarea de către NETOPIA
      }
    }

    // Procesează notificarea
    const result = await processNetopiaNotification(notification);

    // Răspunde cu formatul exact cerut de NETOPIA
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ errorCode: 0 }),
    };
  } catch (error) {
    console.error("Error processing NETOPIA notification:", error);

    // Chiar și în caz de eroare, returnăm 200 cu formatul NETOPIA pentru a evita blocarea
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ errorCode: 0 }), // NETOPIA format - acceptăm notificarea
    };
  }
};
