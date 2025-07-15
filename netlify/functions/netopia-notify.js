/**
 * Funcție Netlify pentru gestionarea notificărilor NETOPIA
 * Această funcție primește notificări de la NETOPIA despre statusul plăților
 */

const crypto = require("crypto");

// Configurație NETOPIA
const NETOPIA_CONFIG = {
  sandbox: {
    signature: "2ZOW-PJ5X-HYYC-IENE-APZO",
    publicKey: process.env.NETOPIA_SANDBOX_PUBLIC_KEY,
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE,
    publicKey: process.env.NETOPIA_LIVE_PUBLIC_KEY,
  },
};

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

  // Aici ar trebui să updatezi statusul comenzii în baza de date
  // Pentru moment, logăm informațiile

  switch (payment?.status) {
    case "confirmed":
      console.log(`Payment confirmed for order ${order?.orderId}`);
      // Activează produsul digital, trimite email de confirmare, etc.
      break;

    case "pending":
      console.log(`Payment pending for order ${order?.orderId}`);
      break;

    case "canceled":
    case "failed":
      console.log(`Payment failed/canceled for order ${order?.orderId}`);
      break;

    default:
      console.log(`Unknown payment status: ${payment?.status}`);
  }

  return { success: true, orderId: order?.orderId, status: payment?.status };
}

/**
 * Handler principal pentru endpoint-ul de notificare
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
        console.error("Invalid NETOPIA signature");
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "Invalid signature" }),
        };
      }
    }

    // Procesează notificarea
    const result = await processNetopiaNotification(notification);

    // Răspunde cu success pentru NETOPIA
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Notification processed successfully",
        data: result,
      }),
    };
  } catch (error) {
    console.error("Error processing NETOPIA notification:", error);

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
