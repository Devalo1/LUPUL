/**
 * Funcție Netlify pentru inițierea plăților NETOPIA
 * Această funcție creează o nouă sesiune de plată și returnează URL-ul NETOPIA
 */

import crypto from "crypto";

// Configurație NETOPIA
const NETOPIA_CONFIG = {
  sandbox: {
    // Use sandbox POS signature from environment or fallback to provided sandbox key
    signature:
      process.env.NETOPIA_SANDBOX_SIGNATURE || "SANDBOX_SIGNATURE_PLACEHOLDER",
    // Use production 3DS endpoint for sandbox transactions
    endpoint: "https://secure.sandbox.netopia-payments.com/payment/card/start",
    publicKey: process.env.NETOPIA_SANDBOX_PUBLIC_KEY,
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE,
    endpoint: "https://secure.netopia-payments.com/payment/card/start",
    publicKey: process.env.NETOPIA_LIVE_PUBLIC_KEY,
  },
};

/**
 * Creează payload-ul pentru NETOPIA conform API-ului oficial v3
 * Documentație: https://netopia-system.stoplight.io/docs/payments-api/d85c6f3d36ce1-create-a-payment-card-start
 */
function createNetopiaPayload(paymentData, config) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";

  // NETOPIA v3 API payload structure - EXACT conform documentației oficiale
  return {
    config: {
      emailTemplate: "", // Optional - empty for default
      emailSubject: "", // Optional - empty for default
      notifyUrl: `${baseUrl}/.netlify/functions/netopia-notify`,
      redirectUrl: `${baseUrl}/.netlify/functions/netopia-return`,
      language: "ro",
    },
    payment: {
      options: {
        installments: 0, // 0 pentru fără rate
        bonus: 0, // Conform documentației
      },
      instrument: {
        type: "card",
        account: "", // Gol pentru payment form
        expMonth: "", // Gol pentru payment form
        expYear: "", // Gol pentru payment form
        secretCode: "", // Gol pentru payment form
        token: "", // Gol pentru payment form
      },
      data: {
        // Custom payment data - poate fi gol
      },
    },
    order: {
      ntpID: "", // NETOPIA internal id - obsolete, lăsăm gol
      posSignature: config.signature,
      dateTime: new Date().toISOString(),
      description: paymentData.description || "Comandă lupulsicorbul.com",
      orderID: paymentData.orderId,
      amount: parseFloat(paymentData.amount),
      currency: "RON",
      billing: {
        email: paymentData.customerInfo.email || "test@lupulsicorbul.com",
        phone: paymentData.customerInfo.phone || "+40712345678",
        firstName: paymentData.customerInfo.firstName || "Test",
        lastName: paymentData.customerInfo.lastName || "Customer",
        city: paymentData.customerInfo.city || "Bucuresti",
        country: 642, // România conform ISO 3166-1 numeric
        countryName: "Romania",
        state: paymentData.customerInfo.county || "Bucuresti",
        postalCode: paymentData.customerInfo.postalCode || "123456",
        details: paymentData.customerInfo.address || "Strada Test 1",
      },
      shipping: {
        email: paymentData.customerInfo.email || "test@lupulsicorbul.com",
        phone: paymentData.customerInfo.phone || "+40712345678",
        firstName: paymentData.customerInfo.firstName || "Test",
        lastName: paymentData.customerInfo.lastName || "Customer",
        city: paymentData.customerInfo.city || "Bucuresti",
        country: 642, // România conform ISO 3166-1 numeric
        state: paymentData.customerInfo.county || "Bucuresti",
        postalCode: paymentData.customerInfo.postalCode || "123456",
        details: paymentData.customerInfo.address || "Strada Test 1",
      },
      products: [
        // Adăugăm un produs minimal pentru a respecta structura
        {
          name: paymentData.description || "Produs digital",
          code: paymentData.orderId,
          category: "digital",
          price: parseFloat(paymentData.amount),
          vat: 19, // TVA România
        },
      ],
      installments: {
        selected: 0, // Fără rate
        available: [0], // Doar plata integrală
      },
      data: {
        // Custom merchant parameters - poate fi gol
      },
    },
  };
}

/**
 * Trimite request JSON la NETOPIA pentru inițierea plății
 * Conform API v3: https://netopia-system.stoplight.io/docs/payments-api/d85c6f3d36ce1-create-a-payment-card-start
 */
async function initiateNetopiaPayment(payload, config) {
  console.log("🚀 Sending direct JSON request to NETOPIA API:", {
    endpoint: config.endpoint,
    orderId: payload.order.orderID,
    amount: payload.order.amount,
    posSignature: payload.order.posSignature.substring(0, 10) + "...",
  });

  try {
    // Fă request JSON direct la NETOPIA API conform documentației
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": config.signature, // Authorization header cu POS signature
      },
      body: JSON.stringify(payload),
    });

    console.log("🔍 NETOPIA Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ NETOPIA API Error Response:", errorText);
      throw new Error(`NETOPIA API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("✅ NETOPIA API Response received:", {
      status: responseData.payment?.status,
      ntpID: responseData.payment?.ntpID,
      paymentURL: responseData.payment?.paymentURL,
      hasCustomerAction: !!responseData.customerAction,
      actionType: responseData.customerAction?.type,
    });

    // Verifica statusul răspunsului
    if (responseData.payment?.status === 15) {
      // Status 15 = 3-D Secure authentication required
      console.log("� 3DS Authentication required");
      
      if (responseData.customerAction?.type === "Authentication3D") {
        // Returnează form HTML pentru 3DS authentication
        const formData = responseData.customerAction.formData || {};
        const formInputs = Object.entries(formData)
          .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}"/>`)
          .join('\n    ');

        const form3DS = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Autentificare 3D Secure</title>
  <style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}</style>
</head>
<body>
  <h3>Redirecționare pentru autentificare 3D Secure...</h3>
  <p>Vă rugăm așteptați...</p>
  <form id="form3ds" action="${responseData.customerAction.url}" method="post" target="_top">
    ${formInputs}
  </form>
  <script>
    console.log('3DS Authentication Form:', {
      url: '${responseData.customerAction.url}',
      token: '${responseData.customerAction.authenticationToken?.substring(0, 10)}...'
    });
    document.getElementById('form3ds').submit();
  </script>
</body>
</html>`;

        return {
          success: true,
          paymentUrl: form3DS,
          orderId: payload.order.orderID,
          html: true,
          status: "3ds_required",
        };
      }
    } else if (responseData.payment?.status === 3) {
      // Status 3 = paid (direct success)
      return {
        success: true,
        paymentUrl: responseData.payment.paymentURL,
        orderId: payload.order.orderID,
        status: "paid",
      };
    } else if (responseData.payment?.paymentURL) {
      // Redirect to payment URL
      return {
        success: true,
        paymentUrl: responseData.payment.paymentURL,
        orderId: payload.order.orderID,
        status: "redirect",
      };
    }

    // Default fallback
    console.error("⚠️ Unexpected NETOPIA response format:", responseData);
    throw new Error("Format de răspuns neașteptat de la NETOPIA");

  } catch (error) {
    console.error("❌ NETOPIA API Request failed:", error);
    
    // Fallback pentru development - simulare locală
    const baseUrl = process.env.URL || "https://lupulsicorbul.com";
    if (baseUrl.includes("localhost") || !config.live) {
      console.log("🧪 Fallback to local simulation for development");
      return {
        success: true,
        paymentUrl: `${baseUrl}/payment-simulation?orderId=${payload.order.orderID}&amount=${payload.order.amount}&currency=${payload.order.currency}&test=1`,
        orderId: payload.order.orderID,
        status: "simulation",
      };
    }

    throw error;
  }
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
    // În producție, dacă există cheia live și URL-ul este domeniul live, forțăm modul live
    if (
      process.env.NETOPIA_LIVE_SIGNATURE &&
      process.env.URL &&
      process.env.URL.includes("lupulsicorbul.com")
    ) {
      isLive = true;
    } else if (paymentData.live === true) {
      isLive = true;
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

    // Creează payload-ul pentru NETOPIA v3 API
    const payload = createNetopiaPayload(paymentData, config);

    // Inițiază plata la NETOPIA folosind API v3
    console.log("🚀 Initiating payment with NETOPIA v3 API:", {
      endpoint: config.endpoint,
      hasSignature: !!config.signature,
      signaturePreview: config.signature?.substring(0, 10) + "...",
      payloadOrderId: payload.order.orderID,
      payloadAmount: payload.order.amount,
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
