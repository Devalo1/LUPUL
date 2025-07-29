/**
 * Funcție Netlify pentru inițierea plăților NETOPIA
 * Această funcție creează o nouă sesiune de plată și returnează URL-ul NETOPIA
 */

const crypto = require("crypto");

// Configurație NETOPIA
const NETOPIA_CONFIG = {
  sandbox: {
    // Use live signature as fallback for sandbox to avoid SVG redirect issue
    signature:
      process.env.NETOPIA_SANDBOX_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    // Use live endpoint even for sandbox to avoid redirect issues
    endpoint: "https://secure.netopia-payments.com/payment/card/start",
    publicKey:
      process.env.NETOPIA_SANDBOX_PUBLIC_KEY || "2ZOW-PJ5X-HYYC-IENE-APZO",
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.netopia-payments.com/payment/card/start",
    publicKey:
      process.env.NETOPIA_LIVE_PUBLIC_KEY || "2ZOW-PJ5X-HYYC-IENE-APZO",
  },
};

/**
 * Creează payload-ul pentru NETOPIA
 */
function createNetopiaPayload(paymentData, config) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";

  // NETOPIA payload structure - simplified and correct format
  return {
    config: {
      emailTemplate: "lupul-si-corbul",
      notifyUrl: `${baseUrl}/.netlify/functions/netopia-notify`,
      redirectUrl: `${baseUrl}/.netlify/functions/netopia-return`,
      language: "ro",
    },
    payment: {
      options: {
        installments: 1,
        bonus: 0,
      },
      instrument: {
        type: "card",
        account: "",
        expMonth: "",
        expYear: "",
        secretCode: "",
      },
      data: {
        property: "mobilPay_Request_Card",
        action: "sale",
        confirmUrl: `${baseUrl}/.netlify/functions/netopia-notify`,
        returnUrl: `${baseUrl}/.netlify/functions/netopia-return`,
        signature: config.signature,
        orderId: paymentData.orderId,
        amount: paymentData.amount.toString(), // Convert to string as required by NETOPIA
        currency: "RON",
        details: paymentData.description || "Comandă lupulsicorbul.com",
        billing: {
          type: "person",
          firstName: paymentData.customerInfo.firstName || "Test",
          lastName: paymentData.customerInfo.lastName || "Customer",
          email: paymentData.customerInfo.email || "test@lupulsicorbul.com",
          phone: paymentData.customerInfo.phone || "0700000000",
          address: paymentData.customerInfo.address || "Strada Test 1",
          city: paymentData.customerInfo.city || "Bucuresti",
          county: paymentData.customerInfo.county || "Bucuresti",
          postalCode: paymentData.customerInfo.postalCode || "123456",
          country: "Romania",
        },
        shipping: {
          type: "person",
          firstName: paymentData.customerInfo.firstName || "Test",
          lastName: paymentData.customerInfo.lastName || "Customer",
          email: paymentData.customerInfo.email || "test@lupulsicorbul.com",
          phone: paymentData.customerInfo.phone || "0700000000",
          address: paymentData.customerInfo.address || "Strada Test 1",
          city: paymentData.customerInfo.city || "Bucuresti",
          county: paymentData.customerInfo.county || "Bucuresti",
          postalCode: paymentData.customerInfo.postalCode || "123456",
          country: "Romania",
        },
      },
    },
  };
}

/**
 * Trimite request la NETOPIA pentru inițierea plății
 */
async function initiateNetopiaPayment(payload, config) {
  // Sandbox: for all non-live configs or explicit sandbox signatures, render 3DS form locally
  const isSandbox =
    config.live === false ||
    config.signature === "NETOPIA_SANDBOX_TEST_SIGNATURE" ||
    (process.env.NETOPIA_SANDBOX_SIGNATURE &&
      config.signature === process.env.NETOPIA_SANDBOX_SIGNATURE);

  if (isSandbox) {
    const dataBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
    const signature = config.signature;
    const formHtml = `<!doctype html><html><body><form id="netopia3ds" action="${config.endpoint}" method="post" target="_top">\
      <input type="hidden" name="data" value="${dataBase64}"/>\
      <input type="hidden" name="signature" value="${signature}"/>\
    </form>\
    <script>document.getElementById('netopia3ds').submit();</script></body></html>`;

    return {
      success: true,
      paymentUrl: formHtml,
      orderId: payload.payment.data.orderId,
      html: true,
    };
  }

  // LIVE mode: generate HTML form to POST data to NETOPIA with proper signature
  const dataString = JSON.stringify(payload);
  const dataBase64 = Buffer.from(dataString).toString("base64");

  // Create SHA512 hash of the data for NETOPIA signature verification
  const dataHash = crypto.createHash("sha512").update(dataString).digest("hex");
  const signature = config.signature;

  console.log("🔧 NETOPIA LIVE Debug Info:", {
    endpoint: config.endpoint,
    signature: signature,
    dataLength: dataString.length,
    dataHash: dataHash.substring(0, 32) + "...",
    payloadOrderId: payload.payment.data.orderId,
    payloadAmount: payload.payment.data.amount,
  });

  const formHtml = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Redirecționare NETOPIA</title>
  <style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}</style>
</head>
<body>
  <h3>Redirecționare către NETOPIA...</h3>
  <p>Vă rugăm așteptați...</p>
  <form id="netopia3ds" action="${config.endpoint}" method="post" target="_top">
    <input type="hidden" name="data" value="${dataBase64}"/>
    <input type="hidden" name="signature" value="${signature}"/>
  </form>
  <script>
    console.log('NETOPIA Form Data:', {
      endpoint: '${config.endpoint}',
      dataLength: ${dataBase64.length},
      signature: '${signature.substring(0, 10)}...'
    });
    document.getElementById('netopia3ds').submit();
  </script>
</body>
</html>`;

  console.log(
    "🔧 NETOPIA LIVE form HTML preview (first 300 chars):",
    formHtml.substring(0, 300)
  );
  return {
    success: true,
    paymentUrl: formHtml,
    orderId: payload.payment.data.orderId,
    html: true,
  };
}

/**
 * Validează datele de plată
 */
function validatePaymentData(paymentData) {
  const required = ["orderId", "amount", "currency", "description"];

  for (const field of required) {
    if (!paymentData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!paymentData.customerInfo) {
    throw new Error("Missing customer information");
  }

  const customerRequired = ["firstName", "lastName", "email", "phone"];
  for (const field of customerRequired) {
    if (!paymentData.customerInfo[field]) {
      throw new Error(`Missing required customer field: ${field}`);
    }
  }

  if (typeof paymentData.amount !== "number" || paymentData.amount <= 0) {
    throw new Error("Invalid amount");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(paymentData.customerInfo.email)) {
    throw new Error("Invalid email address");
  }

  return true;
}

/**
 * Handler principal pentru endpoint-ul de inițiere
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
    // Parse request body with better error handling
    let paymentData;

    console.log("🔧 RAW REQUEST BODY:", {
      length: event.body?.length || 0,
      type: typeof event.body,
      preview: event.body?.substring(0, 100) || "empty",
      fullBody: event.body || "null",
    });

    try {
      // Support base64-encoded bodies (e.g., local Netlify dev)
      let rawBody = event.body || "";
      if (event.isBase64Encoded) {
        rawBody = Buffer.from(rawBody, "base64").toString("utf-8");
      }
      paymentData = JSON.parse(rawBody || "{}");
    } catch (jsonError) {
      console.error("❌ JSON Parse Error:", {
        error: jsonError.message,
        position: jsonError.message.match(/position (\d+)/)?.[1],
        bodyLength: event.body?.length,
        bodyChar11: event.body?.[11],
        bodySubstring: event.body?.substring(0, 20),
      });

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid JSON in request body",
          details: jsonError.message,
          position: jsonError.message.match(/position (\d+)/)?.[1],
        }),
      };
    }

    console.log("🔧 NETOPIA INITIATE - Request received:", {
      method: event.httpMethod,
      headers: event.headers,
      bodyLength: event.body?.length || 0,
      bodyPreview: event.body?.substring(0, 200) || "empty",
    });

    console.log("🔧 NETOPIA INITIATE - Payment data:", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      live: paymentData.live,
      hasLiveSignature: !!process.env.NETOPIA_LIVE_SIGNATURE,
      environment: process.env.NODE_ENV,
      netlifyContext: context.functionName,
    });

    // Validează datele de plată
    validatePaymentData(paymentData);

    // Determină configurația (sandbox vs live) cu detectare automată în producție
    let isLive = false;

    // IMPORTANT: Respectă explicit live: false pentru teste, indiferent de domeniu
    if (paymentData.live === false) {
      isLive = false;
      console.log(
        "🧪 Test mode explicitly requested (live: false) - using SANDBOX"
      );
    } else if (paymentData.live === true) {
      isLive = true;
      console.log("🚀 Live mode explicitly requested");
    } else {
      // În producție, forțăm modul live pentru domeniile de producție doar dacă nu e test explicit
      if (
        process.env.URL &&
        (process.env.URL.includes("lupulsicorbul.com") ||
          process.env.URL.includes("netlify.app"))
      ) {
        isLive = true;
        console.log("🚀 Production domain detected, forcing LIVE mode");
      }
    }
    const hasCustomSignature =
      paymentData.posSignature &&
      paymentData.posSignature !== "NETOPIA_SANDBOX_TEST_SIGNATURE";

    let config = isLive ? NETOPIA_CONFIG.live : NETOPIA_CONFIG.sandbox;

    console.log("🔧 Configuration selection:", {
      requestedLive: isLive,
      hasCustomSignature,
      customSignature: paymentData.posSignature?.substring(0, 10) + "...",
      hasLiveSignature: !!NETOPIA_CONFIG.live.signature,
      willUseLive: isLive && !!NETOPIA_CONFIG.live.signature,
      envVars: {
        NETOPIA_LIVE_SIGNATURE: process.env.NETOPIA_LIVE_SIGNATURE
          ? "SET"
          : "NOT SET",
        NETOPIA_LIVE_PUBLIC_KEY: process.env.NETOPIA_LIVE_PUBLIC_KEY
          ? "SET"
          : "NOT SET",
        URL: process.env.URL || "NOT SET",
      },
    });

    // 🚨 PRODUCTION DEBUG: Verifică de ce nu folosește LIVE mode
    if (isLive && !config.signature) {
      console.error(
        "🚨 PRODUCTION ERROR: Live mode requested but no live signature!"
      );
      console.error("Environment check:", {
        NETOPIA_LIVE_SIGNATURE: process.env.NETOPIA_LIVE_SIGNATURE
          ? `SET (${process.env.NETOPIA_LIVE_SIGNATURE.length} chars)`
          : "MISSING",
        NETOPIA_LIVE_PUBLIC_KEY: process.env.NETOPIA_LIVE_PUBLIC_KEY
          ? "SET"
          : "MISSING",
        NODE_ENV: process.env.NODE_ENV,
        URL: process.env.URL,
      });
    }

    // Dacă avem o signature customă din frontend, o folosim
    if (hasCustomSignature) {
      config = {
        ...config,
        signature: paymentData.posSignature,
      };
      console.log("🔄 Using custom signature from frontend");
    }

    console.log(
      `✅ Using ${config.signature === "NETOPIA_SANDBOX_TEST_SIGNATURE" ? "SANDBOX" : "LIVE"} Netopia configuration`
    );

    // Verifică configurația finală
    if (!config.signature) {
      throw new Error("No valid NETOPIA configuration found");
    }

    // Creează payload-ul pentru NETOPIA
    const payload = createNetopiaPayload(paymentData, config);

    // Simulation pentru development local ȘI pentru testing în producție
    // Folosește origin-ul cererii pentru a determina mediul corect
    const requestOrigin = event.headers.origin || "";
    const baseUrl =
      requestOrigin || process.env.URL || "https://lupulsicorbul.com";
    const isLocalDev =
      baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    const isTestOrder =
      paymentData.orderId && paymentData.orderId.includes("TEST-");

    // Simulare dacă suntem în local dev SAU dacă este comandă de test în producție
    if (!paymentData.live && (isLocalDev || isTestOrder)) {
      const amount = payload.payment.data.amount;
      const currency = payload.payment.data.currency;

      console.log("🧪 Simulation mode activated:", {
        isLocalDev,
        isTestOrder,
        baseUrl,
        requestOrigin,
        host: event.headers.host,
        orderId: paymentData.orderId,
        live: paymentData.live,
      });

      // Detectează mediul corect pentru URL-ul de simulare
      let simulationUrl;
      if (isLocalDev) {
        // Development - folosește localhost cu port 5173
        simulationUrl = `http://localhost:5173/payment-simulation?orderId=${payload.payment.data.orderId}&amount=${amount}&currency=${currency}&test=1`;
      } else {
        // Production - folosește domeniul real
        simulationUrl = `${baseUrl}/payment-simulation?orderId=${payload.payment.data.orderId}&amount=${amount}&currency=${currency}&test=1`;
      }

      console.log("🎯 Generated simulation URL:", simulationUrl);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          paymentUrl: simulationUrl,
          orderId: payload.payment.data.orderId,
        }),
      };
    }

    // Inițiază plata la NETOPIA
    console.log("🚀 Initiating payment with config:", {
      endpoint: config.endpoint,
      hasSignature: !!config.signature,
      signaturePreview: config.signature?.substring(0, 10) + "...",
      payloadOrderId: payload.payment.data.orderId,
      payloadAmount: payload.payment.data.amount,
    });

    const result = await initiateNetopiaPayment(payload, config);

    // If sandbox returned HTML form, send it as text/html for popup
    if (result.html && typeof result.paymentUrl === "string") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: result.paymentUrl,
      };
    }

    // Otherwise return JSON
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: result.paymentUrl,
        orderId: result.orderId,
      }),
    };
  } catch (error) {
    console.error("Error in NETOPIA initiate:", error);

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Payment initiation failed",
        message: error.message,
      }),
    };
  }
};
