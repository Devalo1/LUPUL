/**
 * Funcție Netlify pentru inițierea plăților NETOPIA
 * Această funcție creează o nouă sesiune de plată și returnează URL-ul NETOPIA
 */

import crypto from "crypto";

// Configurație NETOPIA
const NETOPIA_CONFIG = {
  sandbox: {
    mode: "sandbox",
    // Use live signature as fallback for sandbox to avoid SVG redirect issue
    signature:
      process.env.NETOPIA_SANDBOX_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    // Use live endpoint even for sandbox to avoid redirect issues
    endpoint: "https://secure.netopia-payments.com/payment/card",
    publicKey:
      process.env.NETOPIA_SANDBOX_PUBLIC_KEY || "2ZOW-PJ5X-HYYC-IENE-APZO",
  },
  live: {
    mode: "live",
    signature: process.env.NETOPIA_LIVE_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.netopia-payments.com/payment/card",
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
    <input type="hidden" name="env_key" value="${config.publicKey}"/>
  </form>
  <script>
    console.log('NETOPIA Form Data:', {
      endpoint: '${config.endpoint}',
      dataLength: ${dataBase64.length},
      env_key: '${config.publicKey?.substring(0, 10)}...'
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

    const isLive = paymentData.live;
    const hasCustomSignature = !!paymentData.posSignature;

    // Forțăm mereu LIVE mode pentru a evita problema cu SVG-ul
    let config = NETOPIA_CONFIG.live;
    console.log("🚀 Forcing LIVE mode to prevent SVG redirect issue.");
    console.log("🔧 Using configuration:", {
      mode: config.mode,
      endpoint: config.endpoint,
      hasSignature: !!config.signature,
    });
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

    // Enhanced 3DS simulation for local development
    const baseUrl = process.env.URL || event.headers.origin || "";
    if (!paymentData.live && baseUrl.includes("localhost")) {
      const amount = payload.payment.data.amount;
      const currency = payload.payment.data.currency;

      // If this is a test request (contains TEST- in orderId), return JSON for the test button
      if (paymentData.orderId && paymentData.orderId.includes("TEST-")) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: "Test connection successful",
            orderId: paymentData.orderId,
            amount: amount,
            currency: currency,
            mode: "test-simulation",
            paymentUrl: `${baseUrl}/test-simulation-completed`,
          }),
        };
      }

      // Create realistic 3DS simulation HTML for actual payments
      const simulation3DS = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>NETOPIA 3DS Simulation - Lupul și Corbul</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      background: #f5f5f5; 
      margin: 0; 
      padding: 20px; 
    }
    .container { 
      max-width: 500px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 10px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
      overflow: hidden;
    }
    .header { 
      background: #2563eb; 
      color: white; 
      padding: 20px; 
      text-align: center; 
    }
    .content { 
      padding: 30px; 
      text-align: center; 
    }
    .step { 
      margin: 20px 0; 
      padding: 15px; 
      border-radius: 8px; 
      display: none; 
    }
    .step.active { 
      display: block; 
    }
    .step1 { 
      background: #dbeafe; 
      border: 1px solid #3b82f6; 
    }
    .step2 { 
      background: #fef3c7; 
      border: 1px solid #f59e0b; 
    }
    .step3 { 
      background: #d1fae5; 
      border: 1px solid #10b981; 
    }
    .card-input { 
      width: 80%; 
      padding: 10px; 
      margin: 10px; 
      border: 1px solid #ccc; 
      border-radius: 5px; 
      font-size: 16px;
    }
    .btn { 
      background: #2563eb; 
      color: white; 
      padding: 12px 24px; 
      border: none; 
      border-radius: 5px; 
      cursor: pointer; 
      font-size: 16px; 
      margin: 10px;
    }
    .btn:hover { 
      background: #1d4ed8; 
    }
    .progress { 
      width: 100%; 
      height: 4px; 
      background: #e5e7eb; 
      margin: 20px 0;
    }
    .progress-bar { 
      height: 100%; 
      background: #2563eb; 
      transition: width 0.3s ease; 
    }
    .order-info { 
      background: #f9fafb; 
      padding: 15px; 
      border-radius: 8px; 
      margin: 15px 0; 
      border-left: 4px solid #2563eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔒 NETOPIA 3DS Secure</h2>
      <p>Simulare Plată Securizată</p>
    </div>
    
    <div class="progress">
      <div class="progress-bar" id="progressBar" style="width: 33%"></div>
    </div>
    
    <div class="content">
      <div class="order-info">
        <strong>Comandă:</strong> ${payload.payment.data.orderId}<br>
        <strong>Suma:</strong> ${(amount / 100).toFixed(2)} ${currency}<br>
        <strong>Merchant:</strong> Lupul și Corbul
      </div>
      
      <!-- Step 1: Card Details -->
      <div class="step step1 active" id="step1">
        <h3>📱 Pas 1: Verificare Card</h3>
        <p>Vă rugăm confirmați ultimele 4 cifre ale cardului:</p>
        <input type="text" class="card-input" placeholder="**** **** **** 1234" maxlength="4" id="cardDigits">
        <br>
        <button class="btn" onclick="nextStep(2)">Continuă</button>
      </div>
      
      <!-- Step 2: 3DS Authentication -->
      <div class="step step2" id="step2">
        <h3>📲 Pas 2: Autentificare 3DS</h3>
        <p>Am trimis un cod de verificare prin SMS la numărul:</p>
        <strong>+40 7XX XXX X78</strong>
        <br><br>
        <input type="text" class="card-input" placeholder="Cod SMS (6 cifre)" maxlength="6" id="smsCode">
        <br>
        <button class="btn" onclick="nextStep(3)">Verifică Codul</button>
        <br>
        <small style="color: #666;">💡 Pentru simulare, introduceți orice cod de 6 cifre</small>
      </div>
      
      <!-- Step 3: Processing -->
      <div class="step step3" id="step3">
        <h3>⏳ Pas 3: Procesare Plată</h3>
        <p>Plata este în curs de procesare...</p>
        <div style="margin: 20px 0;">
          <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <p><small>Vă rugăm așteptați, nu închideți această fereastră.</small></p>
      </div>
    </div>
  </div>
  
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
  
  <script>
    let currentStep = 1;
    
    function nextStep(step) {
      // Validate inputs
      if (step === 2) {
        const cardDigits = document.getElementById('cardDigits').value;
        if (cardDigits.length !== 4) {
          alert('Vă rugăm introduceți ultimele 4 cifre ale cardului');
          return;
        }
      }
      
      if (step === 3) {
        const smsCode = document.getElementById('smsCode').value;
        if (smsCode.length !== 6) {
          alert('Vă rugăm introduceți codul SMS de 6 cifre');
          return;
        }
      }
      
      // Hide current step
      document.getElementById('step' + currentStep).classList.remove('active');
      
      // Show next step
      currentStep = step;
      document.getElementById('step' + currentStep).classList.add('active');
      
      // Update progress
      const progress = (step / 3) * 100;
      document.getElementById('progressBar').style.width = progress + '%';
      
      // Auto-redirect after processing
      if (step === 3) {
        setTimeout(function() {
          // Simulate successful payment redirect
          window.location.href = '${baseUrl}/order-confirmation?orderId=${payload.payment.data.orderId}&status=success&amount=${amount}&currency=${currency}&simulation=true';
        }, 3000);
      }
    }
    
    console.log('NETOPIA 3DS Simulation Started:', {
      orderId: '${payload.payment.data.orderId}',
      amount: ${amount},
      currency: '${currency}',
      mode: 'simulation'
    });
  </script>
</body>
</html>`;

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: simulation3DS,
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
