/**
 * Funcție Netlify pentru inițierea plăților EMBLEME prin NETOPIA
 * Această funcție procesează comenzile de embleme NFT și inițiază plățile
 */

const crypto = require("crypto");
const {
  NETOPIA_LIVE_PRIVATE_KEY,
  NETOPIA_LIVE_CERTIFICATE,
} = require("./netopia-credentials.js");

// Configurație NETOPIA pentru embleme
const NETOPIA_CONFIG = {
  sandbox: {
    mode: "sandbox",
    signature:
      process.env.NETOPIA_SANDBOX_SIGNATURE ||
      process.env.VITE_NETOPIA_SIGNATURE_SANDBOX ||
      "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.netopia-payments.com/payment/card",
    publicKey:
      process.env.NETOPIA_SANDBOX_PUBLIC_KEY ||
      process.env.VITE_NETOPIA_PUBLIC_KEY ||
      "2ZOW-PJ5X-HYYC-IENE-APZO",
  },
  live: {
    mode: "live",
    signature:
      process.env.NETOPIA_LIVE_SIGNATURE ||
      process.env.VITE_NETOPIA_SIGNATURE_LIVE ||
      "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.netopia-payments.com/payment/card",
    publicKey:
      process.env.NETOPIA_LIVE_PUBLIC_KEY ||
      process.env.VITE_NETOPIA_PUBLIC_KEY ||
      "2ZOW-PJ5X-HYYC-IENE-APZO",
    privateKey: NETOPIA_LIVE_PRIVATE_KEY,
    certificate: NETOPIA_LIVE_CERTIFICATE,
  },
};

/**
 * Creează payload-ul pentru NETOPIA - special pentru embleme
 */
function createEmblemPayload(paymentData, config) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";

  return {
    config: {
      emailTemplate: "lupul-si-corbul-embleme",
      notifyUrl: `${baseUrl}/.netlify/functions/netopia-notify-emblem`,
      redirectUrl: `${baseUrl}/.netlify/functions/netopia-return-emblem`,
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
        confirmUrl: `${baseUrl}/.netlify/functions/netopia-notify-emblem`,
        returnUrl: `${baseUrl}/.netlify/functions/netopia-return-emblem`,
        orderId: paymentData.orderId,
        amount: paymentData.amount.toString(),
        currency: "RON",
        details: `🔮 ${paymentData.description} - Acces exclusiv la comunitatea Lupul și Corbul`,
        billing: {
          type: "person",
          firstName: paymentData.customerInfo.firstName || "Client",
          lastName: paymentData.customerInfo.lastName || "Premium",
          email: paymentData.customerInfo.email || "client@lupulsicorbul.com",
          phone: paymentData.customerInfo.phone || "0700000000",
          address: paymentData.customerInfo.address || "Strada Digitala 1",
          city: paymentData.customerInfo.city || "Bucuresti",
          county: paymentData.customerInfo.county || "Bucuresti",
          postalCode: paymentData.customerInfo.postalCode || "010001",
          country: "Romania",
        },
        shipping: {
          type: "person",
          firstName: paymentData.customerInfo.firstName || "Client",
          lastName: paymentData.customerInfo.lastName || "Premium",
          email: paymentData.customerInfo.email || "client@lupulsicorbul.com",
          phone: paymentData.customerInfo.phone || "0700000000",
          address: "Livrare digitală instantanee",
          city: "Online",
          county: "Digital",
          postalCode: "000000",
          country: "Romania",
        },
        // Metadata specifică pentru embleme
        customData: {
          emblemType: paymentData.emblemType,
          userId: paymentData.userId,
          productType: "emblem_nft",
          tier: paymentData.tier || 1,
        },
      },
    },
  };
}

/**
 * Trimite request la NETOPIA pentru inițierea plății emblemelor
 */
async function initiateEmblemPayment(payload, config) {
  const dataString = JSON.stringify(payload);
  const dataBase64 = Buffer.from(dataString).toString("base64");
  const signature = config.signature;

    console.log("🔮 NETOPIA EMBLEM Payment Debug:", {
      endpoint: config.endpoint,
      mode: config.mode,
      signature: signature?.substring(0, 10) + "...",
      orderId: payload.payment.data.orderId,
      amount: payload.payment.data.amount,
      emblemType: payload.payment.data.customData?.emblemType,
      userId: payload.payment.data.customData?.userId,
    });
    endpoint: config.endpoint,
    mode: config.mode,
    signature: signature?.substring(0, 10) + "...",
    orderId: payload.payment.data.orderId,
    amount: payload.payment.data.amount,
    emblemType: payload.payment.data.customData?.emblemType,
    userId: payload.payment.data.customData?.userId,
  });

  // Generează formularul HTML pentru 3DS
  const formHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>🔮 Procesare Plată Emblemă - Lupul și Corbul</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .loading-container {
      text-align: center;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 40px;
      border-radius: 20px;
      border: 2px solid rgba(255,215,0,0.3);
    }
    .emblem-icon { font-size: 4rem; margin-bottom: 20px; }
    .loading-text { font-size: 1.2rem; margin-bottom: 10px; }
    .spinner {
      border: 3px solid rgba(255,255,255,0.3);
      border-top: 3px solid #ffd700;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading-container">
    <div class="emblem-icon">🔮</div>
    <div class="loading-text">Se procesează plata pentru emblema ta...</div>
    <div class="loading-text">Vei fi redirectat către sistemul de plată securizat.</div>
    <div class="spinner"></div>
  </div>
  
  <form id="netopia3ds" action="${config.endpoint}" method="post" target="_top">
    <input type="hidden" name="data" value="${dataBase64}"/>
    <input type="hidden" name="signature" value="${signature}"/>
  </form>
  
  <script>
    console.log('🔮 NETOPIA Emblem Payment Initialized:', {
      orderId: '${payload.payment.data.orderId}',
      amount: ${payload.payment.data.amount},
      emblemType: '${payload.payment.data.customData?.emblemType || "unknown"}',
      currency: '${payload.payment.data.currency}',
      mode: '${config.mode}'
    });
    
    // Auto-submit după 2 secunde
    setTimeout(() => {
      document.getElementById('netopia3ds').submit();
    }, 2000);
  </script>
</body>
</html>`;

  return {
    success: true,
    paymentUrl: formHtml,
    orderId: payload.payment.data.orderId,
    html: true,
  };
}

/**
 * Handler principal pentru funcția Netlify
 */
const handler = async (event, context) => {
    // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

    // Răspunde la preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const paymentData = JSON.parse(event.body);

    console.log("🔮 EMBLEM PAYMENT INITIATE - Request received:", {
      method: event.httpMethod,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      emblemType: paymentData.emblemType,
      userId: paymentData.userId,
    });

    // Validare date
    if (
      !paymentData.orderId ||
      !paymentData.amount ||
      !paymentData.emblemType
    ) {
      throw new Error("Date incomplete pentru plata emblemei");
    }

    // Determină configurația (sandbox vs live)
    const isProduction =
      process.env.NODE_ENV === "production" ||
      process.env.CONTEXT === "production";

    const hasLiveCredentials = Boolean(
      process.env.NETOPIA_LIVE_SIGNATURE &&
        process.env.NETOPIA_LIVE_SIGNATURE !== "2ZOW-PJ5X-HYYC-IENE-APZO"
    );

    const useLive = isProduction && hasLiveCredentials;
    const config = useLive ? NETOPIA_CONFIG.live : NETOPIA_CONFIG.sandbox;

    console.log(
      `🔮 Using ${config.mode.toUpperCase()} NETOPIA config for emblem payment`
    );

    // Creează payload-ul pentru NETOPIA
    const payload = createEmblemPayload(paymentData, config);

    // Inițiază plata
    const result = await initiateEmblemPayment(payload, config);

    // Returnează HTML form pentru 3DS
    if (result.html && typeof result.paymentUrl === "string") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: result.paymentUrl,
      };
    }

    // Fallback JSON response
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
    console.error("🚨 Error in EMBLEM payment initiate:", error);

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Emblem payment initiation failed",
        message: error.message,
      }),
    };
  }

};
module.exports = { handler };
module.exports = { handler };
