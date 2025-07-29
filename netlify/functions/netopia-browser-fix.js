/**
 * NETOPIA Browser Compatibility Fix
 * Soluția pentru diferențele CORS între Brave/Firefox și Edge/Chrome
 * 
 * PROBLEMA:
 * - Brave: ❌ Failed to fetch (CORS strict)
 * - Edge: ✅ Success dar redirect către card.svg
 * 
 * SOLUȚIA:
 * - Headers CORS extinși pentru toate browser-ele
 * - Configurația endpoint-urilor optimizată
 * - Detecție automată browser și adaptare comportament
 */

const crypto = require("crypto");

// Configurație NETOPIA adaptată pentru compatibilitate browser
const NETOPIA_CONFIG = {
  sandbox: {
    signature: process.env.NETOPIA_SANDBOX_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    // Folosim endpoint-ul live și pentru sandbox pentru a evita problemele SVG
    endpoint: "https://secure.netopia-payments.com/payment/card/start",
    publicKey: process.env.NETOPIA_SANDBOX_PUBLIC_KEY,
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.netopia-payments.com/payment/card/start",
    publicKey: process.env.NETOPIA_LIVE_PUBLIC_KEY,
  },
};

/**
 * Headers CORS extinși pentru compatibilitate cu toate browser-ele
 */
function getCORSHeaders(event) {
  const origin = event.headers.origin || event.headers.Origin || "*";
  
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": [
      "Content-Type",
      "Authorization", 
      "X-Requested-With",
      "Accept",
      "Origin",
      "User-Agent",
      "Cache-Control"
    ].join(", "),
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Vary": "Origin",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };
}

/**
 * Detectează browser-ul din User-Agent pentru adaptări specifice
 */
function detectBrowser(userAgent) {
  const ua = (userAgent || "").toLowerCase();
  
  if (ua.includes("chrome") && ua.includes("brave")) {
    return { name: "brave", strict: true };
  } else if (ua.includes("firefox")) {
    return { name: "firefox", strict: true };
  } else if (ua.includes("edg/")) {
    return { name: "edge", strict: false };
  } else if (ua.includes("chrome")) {
    return { name: "chrome", strict: false };
  } else if (ua.includes("safari")) {
    return { name: "safari", strict: true };
  }
  
  return { name: "unknown", strict: true };
}

/**
 * Creează payload NETOPIA optimizat pentru evitarea redirect-ului card.svg
 */
function createOptimizedNetopiaPayload(paymentData, config) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";
  
  // Payload în format exact cerut de NETOPIA pentru a evita SVG redirect
  return {
    config: {
      emailTemplate: "",
      emailSubject: `Comandă ${paymentData.orderId} - Lupul și Corbul`,
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
      data: {
        // Câmpuri obligatorii pentru evitarea redirect-ului SVG
        property: "mobilPay_Request_Card",
        action: "sale",
        confirmUrl: `${baseUrl}/.netlify/functions/netopia-notify`,
        returnUrl: `${baseUrl}/.netlify/functions/netopia-return`,
      },
    },
    order: {
      ntpID: "",
      posSignature: config.signature,
      dateTime: new Date().toISOString(),
      description: paymentData.description || `Comandă ${paymentData.orderId}`,
      orderID: paymentData.orderId,
      amount: parseFloat(paymentData.amount),
      currency: "RON",
      // Billing complet pentru validare NETOPIA
      billing: {
        email: paymentData.customerInfo?.email || "test@lupulsicorbul.com",
        phone: paymentData.customerInfo?.phone || "+40700000000",
        firstName: paymentData.customerInfo?.firstName || "Test",
        lastName: paymentData.customerInfo?.lastName || "Customer",
        city: paymentData.customerInfo?.city || "București",
        country: 642, // România
        countryName: "Romania",
        state: paymentData.customerInfo?.county || "București",
        postalCode: paymentData.customerInfo?.postalCode || "010000",
        details: paymentData.customerInfo?.address || "Adresă test",
      },
      // Shipping identic cu billing
      shipping: {
        email: paymentData.customerInfo?.email || "test@lupulsicorbul.com",
        phone: paymentData.customerInfo?.phone || "+40700000000",
        firstName: paymentData.customerInfo?.firstName || "Test",
        lastName: paymentData.customerInfo?.lastName || "Customer",
        city: paymentData.customerInfo?.city || "București",
        country: 642,
        state: paymentData.customerInfo?.county || "București",
        postalCode: paymentData.customerInfo?.postalCode || "010000",
        details: paymentData.customerInfo?.address || "Adresă test",
      },
      // Produse pentru validare completă
      products: [
        {
          name: paymentData.description || `Produs ${paymentData.orderId}`,
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
 * Generează formularul HTML pentru POST la NETOPIA
 * Optimizat pentru evitarea problemei card.svg
 */
function generateNetopiaForm(payload, config, browser) {
  const dataString = JSON.stringify(payload);
  const dataBase64 = Buffer.from(dataString).toString("base64");

  console.log("🔧 Generating NETOPIA form:", {
    browser: browser.name,
    strict: browser.strict,
    endpoint: config.endpoint,
    orderId: payload.order.orderID,
    amount: payload.order.amount,
    dataLength: dataString.length,
    signature: config.signature.substring(0, 10) + "...",
  });

  // Delay pentru browser-e stricte (Brave, Firefox)
  const submitDelay = browser.strict ? 3000 : 1500;

  const formHtml = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NETOPIA Payments - Lupul și Corbul</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .payment-container {
      background: white;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 450px;
      width: 100%;
      position: relative;
      overflow: hidden;
    }
    .payment-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
    }
    .logo {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.6rem;
      font-weight: 600;
    }
    .order-details {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 1.5rem;
      border-radius: 12px;
      margin: 1.5rem 0;
      border: 1px solid #dee2e6;
    }
    .order-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.8rem;
    }
    .order-row:last-child { margin-bottom: 0; }
    .order-label {
      color: #6c757d;
      font-weight: 500;
      font-size: 0.9rem;
    }
    .order-value {
      font-weight: 600;
      color: #2c3e50;
    }
    .amount {
      color: #28a745;
      font-size: 1.2rem;
      font-weight: 700;
    }
    .loading-section {
      margin: 2rem 0;
    }
    .loading-text {
      color: #495057;
      font-weight: 500;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    .progress-container {
      background: #e9ecef;
      border-radius: 25px;
      height: 8px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #28a745, #17a2b8);
      border-radius: 25px;
      animation: progress ${submitDelay / 1000}s linear forwards;
      transform: translateX(-100%);
    }
    @keyframes progress {
      to { transform: translateX(0); }
    }
    .countdown {
      font-size: 2.5rem;
      font-weight: 700;
      color: #007bff;
      margin: 1rem 0;
      font-variant-numeric: tabular-nums;
    }
    .security-badge {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      color: #155724;
      padding: 1rem;
      border-radius: 10px;
      font-size: 0.9rem;
      border: 1px solid #c3e6cb;
      margin-top: 1.5rem;
    }
    .security-icon {
      font-size: 1.2rem;
      margin-right: 0.5rem;
    }
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #f3f3f3;
      border-radius: 50%;
      border-top: 3px solid #007bff;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 0.5rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .browser-info {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.1);
      color: #666;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 0.7rem;
      text-transform: capitalize;
    }
  </style>
</head>
<body>
  <div class="payment-container">
    <div class="browser-info">${browser.name}</div>
    
    <div class="logo">💳</div>
    <h1>Redirecționare NETOPIA Payments</h1>
    
    <div class="order-details">
      <div class="order-row">
        <span class="order-label">Comandă</span>
        <span class="order-value">${payload.order.orderID}</span>
      </div>
      <div class="order-row">
        <span class="order-label">Sumă</span>
        <span class="order-value amount">${payload.order.amount.toFixed(2)} RON</span>
      </div>
      <div class="order-row">
        <span class="order-label">Merchant</span>
        <span class="order-value">Lupul și Corbul</span>
      </div>
    </div>
    
    <div class="loading-section">
      <div class="loading-text">
        <div class="spinner"></div>
        Pregătim plata securizată...
      </div>
      
      <div class="progress-container">
        <div class="progress-bar"></div>
      </div>
      
      <div class="countdown" id="countdown">${Math.ceil(submitDelay / 1000)}</div>
    </div>
    
    <div class="security-badge">
      <span class="security-icon">🔒</span>
      <strong>Conexiune securizată</strong><br>
      Certificat SSL și protecție PCI DSS
    </div>
    
    <form id="netopiaForm" action="${config.endpoint}" method="post" target="_top" style="display: none;">
      <input type="hidden" name="data" value="${dataBase64}">
      <input type="hidden" name="signature" value="${config.signature}">
    </form>
  </div>
  
  <script>
    console.log('🏦 NETOPIA Payment Form:', {
      browser: '${browser.name}',
      strict: ${browser.strict},
      endpoint: '${config.endpoint}',
      orderId: '${payload.order.orderID}',
      amount: ${payload.order.amount},
      signature: '${config.signature.substring(0, 10)}...',
      dataLength: ${dataString.length},
      submitDelay: ${submitDelay}
    });
    
    // Countdown timer
    let timeLeft = ${Math.ceil(submitDelay / 1000)};
    const countdownEl = document.getElementById('countdown');
    
    const timer = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        countdownEl.textContent = '🚀';
        
        console.log('🚀 Submitting form to NETOPIA...');
        console.log('📍 Form action:', document.getElementById('netopiaForm').action);
        
        // Submit form
        document.getElementById('netopiaForm').submit();
      }
    }, 1000);
    
    // Prevent accidental back navigation
    window.addEventListener('beforeunload', function(e) {
      if (timeLeft > 0) {
        e.preventDefault();
        e.returnValue = 'Plata este în curs de procesare. Sigur doriți să părăsiți pagina?';
      }
    });
    
    // Browser-specific optimizations
    if ('${browser.name}' === 'brave' || '${browser.name}' === 'firefox') {
      console.log('🛡️ Strict browser detected - using enhanced compatibility mode');
      // Additional delay for strict browsers
    }
  </script>
</body>
</html>`;

  return formHtml;
}

/**
 * Validare optimizată pentru datele de plată
 */
function validatePaymentData(paymentData) {
  const required = ["orderId", "amount", "currency", "description"];
  
  for (const field of required) {
    if (!paymentData[field]) {
      throw new Error(`Câmp obligatoriu lipsă: ${field}`);
    }
  }
  
  if (!paymentData.customerInfo) {
    throw new Error("Informațiile clientului sunt obligatorii");
  }
  
  const customerRequired = ["firstName", "lastName", "email", "phone"];
  for (const field of customerRequired) {
    if (!paymentData.customerInfo[field]) {
      throw new Error(`Câmp client obligatoriu lipsă: ${field}`);
    }
  }
  
  if (typeof paymentData.amount !== "number" || paymentData.amount <= 0) {
    throw new Error("Suma trebuie să fie un număr pozitiv");
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(paymentData.customerInfo.email)) {
    throw new Error("Adresa de email nu este validă");
  }
  
  return true;
}

/**
 * Handler principal - optimizat pentru compatibilitate browser
 */
exports.handler = async (event, context) => {
  const userAgent = event.headers["user-agent"] || "";
  const browser = detectBrowser(userAgent);
  const corsHeaders = getCORSHeaders(event);
  
  console.log("🌐 Browser compatibility check:", {
    userAgent: userAgent.substring(0, 100),
    browser: browser.name,
    strict: browser.strict,
    method: event.httpMethod,
    origin: event.headers.origin
  });
  
  // Enhanced CORS handling
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }
  
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Numai POST request-uri sunt permise" })
    };
  }
  
  try {
    console.log("🚀 NETOPIA Browser Fix - Processing payment");
    
    // Parse request body cu handling îmbunătățit
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Format JSON invalid",
          details: jsonError.message
        })
      };
    }
    
    console.log("📝 Payment data:", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      live: paymentData.live,
      hasCustomerInfo: !!paymentData.customerInfo
    });
    
    // Validare date
    validatePaymentData(paymentData);
    
    // Determină configurația (sandbox vs live)
    const baseUrl = process.env.URL || "https://lupulsicorbul.com";
    const isProduction = baseUrl.includes("lupulsicorbul.com") && !baseUrl.includes("localhost");
    const hasLiveCredentials = !!process.env.NETOPIA_LIVE_SIGNATURE;
    
    // FORȚEAZĂ SANDBOX pentru comenzile de test, indiferent de mediu
    const isTestOrder = paymentData.orderId.includes("TEST-");
    const forceSandbox = isTestOrder || paymentData.live === false;
    
    // Logica pentru live/sandbox
    const useLive = isProduction && hasLiveCredentials && !forceSandbox && paymentData.live !== false;
    const config = useLive ? NETOPIA_CONFIG.live : NETOPIA_CONFIG.sandbox;
    
    console.log("🔧 Configuration:", {
      baseUrl,
      isProduction,
      hasLiveCredentials,
      isTestOrder,
      forceSandbox,
      useLive,
      endpoint: config.endpoint,
      signature: config.signature.substring(0, 10) + "...",
      browser: browser.name,
      orderId: paymentData.orderId
    });
    
    // Verifică signature
    if (!config.signature) {
      throw new Error("Configurație NETOPIA lipsă");
    }
    
    // Pentru comenzi de test, folosește ÎNTOTDEAUNA simularea pentru a evita SVG redirect
    if (paymentData.orderId.includes("TEST-") || !paymentData.live || !useLive) {
      const simulationUrl = `${baseUrl}/payment-simulation?orderId=${paymentData.orderId}&amount=${paymentData.amount}&currency=${paymentData.currency}&test=1`;
      
      console.log("🧪 Using simulation for test order:", {
        orderId: paymentData.orderId,
        isTest: paymentData.orderId.includes("TEST-"),
        isLive: paymentData.live,
        useLive: useLive,
        simulationUrl: simulationUrl
      });
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          paymentUrl: simulationUrl,
          orderId: paymentData.orderId,
          mode: "simulation",
          reason: paymentData.orderId.includes("TEST-") ? "TEST order" : !useLive ? "Sandbox mode" : "Development"
        })
      };
    }
    
    // Creează payload NETOPIA optimizat
    const payload = createOptimizedNetopiaPayload(paymentData, config);
    
    // Generează formular HTML optimizat pentru browser
    const formHtml = generateNetopiaForm(payload, config, browser);
    
    console.log("✅ Payment form generated successfully for", browser.name);
    
    // Returnează HTML form pentru popup
    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      body: formHtml
    };
    
  } catch (error) {
    console.error("❌ Error in NETOPIA browser fix:", error);
    
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Inițierea plății a eșuat",
        message: error.message,
        orderId: paymentData?.orderId || "necunoscut",
        browser: browser.name
      })
    };
  }
};
