/**
 * NETOPIA Payment Initiate - FIXED FOR BLANK PAGE ISSUE
 *
 * ROOT CAUSE: The current implementation sends JSON to Netopia, which returns SVG.
 * SOLUTION: Generate HTML form that POSTs to Netopia with proper data structure.
 */

import crypto from "crypto";

// Configurație NETOPIA
const NETOPIA_CONFIG = {
  sandbox: {
    signature:
      process.env.NETOPIA_SANDBOX_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.sandbox.netopia-payments.com/payment/card/start",
    publicKey: process.env.NETOPIA_SANDBOX_PUBLIC_KEY,
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.netopia-payments.com/payment/card/start",
    publicKey: process.env.NETOPIA_LIVE_PUBLIC_KEY,
  },
};

/**
 * Creează payload-ul pentru NETOPIA în format corect pentru form POST
 */
function createNetopiaPayload(paymentData, config) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";

  return {
    config: {
      emailTemplate: "",
      emailSubject: "",
      notifyUrl: `${baseUrl}/.netlify/functions/netopia-notify`,
      redirectUrl: `${baseUrl}/.netlify/functions/netopia-return`,
      language: "ro",
    },
    payment: {
      options: {
        installments: 0,
        bonus: 0,
      },
      instrument: {
        type: "card",
        account: "",
        expMonth: "",
        expYear: "",
        secretCode: "",
        token: "",
      },
      data: {},
    },
    order: {
      ntpID: "",
      posSignature: config.signature,
      dateTime: new Date().toISOString(),
      description: paymentData.description || "Comandă lupulsicorbul.com",
      orderID: paymentData.orderId,
      amount: parseFloat(paymentData.amount),
      currency: "RON",
      billing: {
        email: paymentData.customerInfo?.email || "test@lupulsicorbul.com",
        phone: paymentData.customerInfo?.phone || "+40700000000",
        firstName: paymentData.customerInfo?.firstName || "Test",
        lastName: paymentData.customerInfo?.lastName || "Customer",
        city: paymentData.customerInfo?.city || "Bucuresti",
        country: 642,
        countryName: "Romania",
        state: paymentData.customerInfo?.county || "Bucuresti",
        postalCode: paymentData.customerInfo?.postalCode || "010000",
        details: paymentData.customerInfo?.address || "Adresa test",
      },
      shipping: {
        email: paymentData.customerInfo?.email || "test@lupulsicorbul.com",
        phone: paymentData.customerInfo?.phone || "+40700000000",
        firstName: paymentData.customerInfo?.firstName || "Test",
        lastName: paymentData.customerInfo?.lastName || "Customer",
        city: paymentData.customerInfo?.city || "Bucuresti",
        country: 642,
        state: paymentData.customerInfo?.county || "Bucuresti",
        postalCode: paymentData.customerInfo?.postalCode || "010000",
        details: paymentData.customerInfo?.address || "Adresa test",
      },
      products: [
        {
          name: paymentData.description || "Produs lupulsicorbul.com",
          code: paymentData.orderId,
          category: "digital",
          price: parseFloat(paymentData.amount),
          vat: 19,
        },
      ],
      installments: {
        selected: 0,
        available: [0],
      },
      data: {},
    },
  };
}

/**
 * Generează formularul HTML pentru submission la Netopia
 */
function generateNetopiaForm(payload, config) {
  const dataString = JSON.stringify(payload);
  const dataBase64 = Buffer.from(dataString).toString("base64");

  console.log("🔧 Generating Netopia form:", {
    endpoint: config.endpoint,
    orderId: payload.order.orderID,
    amount: payload.order.amount,
    dataLength: dataString.length,
    signature: config.signature.substring(0, 10) + "...",
  });

  const formHtml = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecționare NETOPIA Payments</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .payment-container {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .logo {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    .order-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      font-size: 0.9rem;
      color: #666;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #666;
      margin: 1rem 0;
    }
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-radius: 50%;
      border-top: 2px solid #3498db;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .security-info {
      background: #e8f5e8;
      color: #2d5016;
      padding: 0.5rem;
      border-radius: 5px;
      font-size: 0.8rem;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="payment-container">
    <div class="logo">💳</div>
    <h1>Redirecționare NETOPIA Payments</h1>
    
    <div class="order-info">
      <strong>Comandă:</strong> ${payload.order.orderID}<br>
      <strong>Suma:</strong> ${payload.order.amount.toFixed(2)} RON<br>
      <strong>Merchant:</strong> Lupul și Corbul
    </div>
    
    <div class="loading">
      <div class="spinner"></div>
      Redirecționare către plata securizată...
    </div>
    
    <div class="security-info">
      🔒 Conexiune securizată NETOPIA Payments
    </div>
    
    <form id="netopiaForm" action="${config.endpoint}" method="post" target="_top">
      <input type="hidden" name="data" value="${dataBase64}">
      <input type="hidden" name="signature" value="${config.signature}">
    </form>
  </div>
  
  <script>
    console.log('🏦 NETOPIA Form Data:', {
      endpoint: '${config.endpoint}',
      orderId: '${payload.order.orderID}',
      amount: ${payload.order.amount},
      signature: '${config.signature.substring(0, 10)}...',
      dataLength: ${dataString.length}
    });
    
    // Auto-submit form after 2 seconds to show loading animation
    setTimeout(() => {
      console.log('🚀 Submitting form to NETOPIA...');
      document.getElementById('netopiaForm').submit();
    }, 2000);
  </script>
</body>
</html>`;

  return formHtml;
}

/**
 * Handler principal - Funcție Netlify
 */
export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log("🔧 NETOPIA INITIATE - BLANK PAGE FIX");

    // Parse request body
    let paymentData;
    try {
      let rawBody = event.body || "";
      if (event.isBase64Encoded) {
        rawBody = Buffer.from(rawBody, "base64").toString("utf-8");
      }
      paymentData = JSON.parse(rawBody || "{}");
    } catch (jsonError) {
      console.error("❌ JSON Parse Error:", jsonError.message);
      return {
        statusCode: 400,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid JSON in request body",
          details: jsonError.message,
        }),
      };
    }

    console.log("🔧 Payment data received:", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      live: paymentData.live,
      hasCustomerInfo: !!paymentData.customerInfo,
    });

    // Validează datele obligatorii
    if (!paymentData.orderId || !paymentData.amount) {
      throw new Error("Missing required fields: orderId or amount");
    }

    // Determină configurația (sandbox vs live)
    const baseUrl = process.env.URL || "https://lupulsicorbul.com";
    const isProduction =
      baseUrl.includes("lupulsicorbul.com") && !baseUrl.includes("localhost");
    const hasLiveCredentials = !!process.env.NETOPIA_LIVE_SIGNATURE;

    // Forțează sandbox dacă nu avem credențiale live
    const useLive =
      isProduction && hasLiveCredentials && paymentData.live !== false;

    const config = useLive ? NETOPIA_CONFIG.live : NETOPIA_CONFIG.sandbox;

    console.log("🔧 Environment configuration:", {
      baseUrl,
      isProduction,
      hasLiveCredentials,
      useLive,
      endpoint: config.endpoint,
      signature: config.signature.substring(0, 10) + "...",
    });

    // Validează configurația
    if (!config.signature) {
      throw new Error("NETOPIA signature not configured");
    }

    // Creează payload-ul pentru NETOPIA
    const payload = createNetopiaPayload(paymentData, config);

    // Generează formularul HTML (SOLUȚIA PENTRU BLANK PAGE)
    const formHtml = generateNetopiaForm(payload, config);

    console.log("✅ Payment form generated successfully");

    // Returnează HTML form care va fi afișat în popup
    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
      body: formHtml,
    };
  } catch (error) {
    console.error("❌ Error in NETOPIA initiate:", error);

    return {
      statusCode: 400,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Payment initiation failed",
        message: error.message,
        orderId: paymentData?.orderId || "unknown",
      }),
    };
  }
};
