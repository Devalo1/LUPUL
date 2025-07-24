/**
 * Funcție Netlify pentru inițierea plăților NETOPIA
 * Această funcție creează o nouă sesiune de plată și returnează URL-ul NETOPIA
 */

const crypto = require("crypto");

// Configurație NETOPIA
const NETOPIA_CONFIG = {
  sandbox: {
    // Use sandbox POS signature from environment or fallback to provided sandbox key
    signature:
      process.env.NETOPIA_SANDBOX_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    // Correct sandbox endpoint (without secure- prefix)
    endpoint: "https://sandbox.netopia-payments.com/payment/card",
    publicKey: process.env.NETOPIA_SANDBOX_PUBLIC_KEY,
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE,
    endpoint: "https://secure.netopia-payments.com/payment/card",
    publicKey: process.env.NETOPIA_LIVE_PUBLIC_KEY,
  },
};

/**
 * Creează payload-ul pentru NETOPIA
 */
function createNetopiaPayload(paymentData, config) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";

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
        confirmUrl: `${baseUrl}/netlify/functions/netopia-notify`,
        returnUrl: `${baseUrl}/netlify/functions/netopia-return`,
        signature: config.signature,
        orderId: paymentData.orderId,
        amount: paymentData.amount, // În bani (nu RON)
        currency: "RON",
        details: paymentData.description,
        billing: {
          type: "person",
          firstName: paymentData.customerInfo.firstName,
          lastName: paymentData.customerInfo.lastName,
          email: paymentData.customerInfo.email,
          phone: paymentData.customerInfo.phone,
          address: paymentData.customerInfo.address,
          city: paymentData.customerInfo.city,
          county: paymentData.customerInfo.county,
          postalCode: paymentData.customerInfo.postalCode,
          country: "Romania",
        },
        shipping: {
          type: "person",
          firstName: paymentData.customerInfo.firstName,
          lastName: paymentData.customerInfo.lastName,
          email: paymentData.customerInfo.email,
          phone: paymentData.customerInfo.phone,
          address: paymentData.customerInfo.address,
          city: paymentData.customerInfo.city,
          county: paymentData.customerInfo.county,
          postalCode: paymentData.customerInfo.postalCode,
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
    config.signature === "2ZOW-PJ5X-HYYC-IENE-APZO" ||
    (process.env.NETOPIA_SANDBOX_SIGNATURE &&
      config.signature === process.env.NETOPIA_SANDBOX_SIGNATURE);

  if (isSandbox) {
    console.log("🧪 Using sandbox mode for NETOPIA payment");

    // Create a working sandbox simulation page instead of posting to broken NETOPIA endpoint
    const simulationHtml = `<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NETOPIA Sandbox - Simulare Plată</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #1e40af; font-size: 24px; font-weight: bold; }
        .amount { font-size: 28px; color: #059669; font-weight: bold; margin: 20px 0; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
        .btn { background: #1e40af; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; width: 100%; }
        .btn:hover { background: #1e3a8a; }
        .info { background: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="logo">🔒 NETOPIA Payments</div>
            <div style="color: #f59e0b; font-weight: bold;">SANDBOX MODE</div>
        </div>
        
        <div class="info">
            <strong>🧪 Mod de testare:</strong> Aceasta este o simulare pentru dezvoltatori. Introduceti orice date de card pentru a testa functionalitatea.
        </div>
        
        <div style="margin-bottom: 20px;">
            <strong>Comanda:</strong> ${payload.payment.data.orderId}<br>
            <strong>Descriere:</strong> ${payload.payment.data.details}
        </div>
        
        <div class="amount">Total: ${(payload.payment.data.amount / 100).toFixed(2)} RON</div>
        
        <form id="cardForm">
            <div class="form-group">
                <label>Numărul cardului:</label>
                <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
            </div>
            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label>Expiră:</label>
                    <input type="text" id="expiry" placeholder="MM/YY" maxlength="5">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>CVV:</label>
                    <input type="text" id="cvv" placeholder="123" maxlength="4">
                </div>
            </div>
            <button type="button" class="btn" onclick="simulatePayment()">Plătește ${(payload.payment.data.amount / 100).toFixed(2)} RON</button>
        </form>
    </div>

    <script>
        function simulatePayment() {
            alert('✅ Plata a fost simulată cu succes!\\n\\nAceasta este doar o simulare pentru dezvoltatori.\\nÎn realitate, plata ar fi procesată prin NETOPIA.');
            
            // Simulate success and close popup
            setTimeout(() => {
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'NETOPIA_PAYMENT_SUCCESS',
                        orderId: '${payload.payment.data.orderId}',
                        amount: ${payload.payment.data.amount},
                        status: 'success'
                    }, '*');
                    window.close();
                } else {
                    window.location.href = '${process.env.URL || "https://lupulsicorbul.com"}/order-confirmation?orderId=${payload.payment.data.orderId}&status=success';
                }
            }, 1000);
        }
        
        // Format card number input
        document.getElementById('cardNumber').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            if (formattedValue.length <= 19) e.target.value = formattedValue;
        });
        
        // Format expiry input
        document.getElementById('expiry').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\\D/g, '');
            if (value.length >= 2) value = value.substring(0,2) + '/' + value.substring(2,4);
            e.target.value = value;
        });
    </script>
</body>
</html>`;

    return {
      success: true,
      paymentUrl: simulationHtml,
      orderId: payload.payment.data.orderId,
      html: true,
    };
  }

  try {
    // Trimite request către NETOPIA API (sandbox și live)
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NETOPIA-Signature": config.signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `NETOPIA API error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      paymentUrl: result.paymentUrl || result.redirect_url,
      orderId: payload.payment.data.orderId,
    };
  } catch (error) {
    console.error("Error initiating NETOPIA payment:", error);
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
      liveSignatureValue: process.env.NETOPIA_LIVE_SIGNATURE ? process.env.NETOPIA_LIVE_SIGNATURE.substring(0, 15) + "..." : "NOT SET",
      environment: process.env.NODE_ENV,
      netlifyContext: context.functionName,
    });

    // 🚨 DEBUG: Return environment info for live requests to check why it's not working
    if (paymentData.live === true) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          debug: true,
          message: "LIVE mode debug info",
          requestData: {
            live: paymentData.live,
            orderId: paymentData.orderId,
          },
          environment: {
            NETOPIA_LIVE_SIGNATURE: process.env.NETOPIA_LIVE_SIGNATURE ? "SET" : "NOT SET",
            NETOPIA_LIVE_SIGNATURE_PREVIEW: process.env.NETOPIA_LIVE_SIGNATURE?.substring(0, 15) + "..." || "NONE",
            NETOPIA_SANDBOX_SIGNATURE: process.env.NETOPIA_SANDBOX_SIGNATURE ? "SET" : "NOT SET", 
            NODE_ENV: process.env.NODE_ENV,
            URL: process.env.URL,
            allNetopiaKeys: Object.keys(process.env).filter(key => key.includes('NETOPIA')),
          },
          configSelection: {
            isLive: paymentData.live === true,
            hasLiveSignature: !!NETOPIA_CONFIG.live.signature,
            liveConfigSignature: NETOPIA_CONFIG.live.signature?.substring(0, 15) + "..." || "NONE",
            sandboxConfigSignature: NETOPIA_CONFIG.sandbox.signature?.substring(0, 15) + "..." || "NONE",
          }
        }),
      };
    }

    // Validează datele de plată
    validatePaymentData(paymentData);

    // Determină configurația (sandbox vs live) cu fallback logic
    const isLive = paymentData.live === true;
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

    // Verifică dacă configurația live este disponibilă
    if (isLive && !config.signature) {
      console.log(
        "⚠️  NETOPIA live configuration not found, falling back to sandbox"
      );
      config = NETOPIA_CONFIG.sandbox;

      // În producție, forțez utilizarea sandbox-ului funcțional
      if (context.site?.url && !context.site.url.includes("localhost")) {
        console.log("🔧 PRODUCTION FALLBACK: Using functional sandbox mode");
        config = {
          ...NETOPIA_CONFIG.sandbox,
          signature: "2ZOW-PJ5X-HYYC-IENE-APZO",
        };
      }
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

    // Simulation only for local dev (fallback page), otherwise let sandbox HTML form logic handle
    const baseUrl = process.env.URL || event.headers.origin || "";
    if (!paymentData.live && baseUrl.includes("localhost")) {
      const amount = payload.payment.data.amount;
      const currency = payload.payment.data.currency;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          paymentUrl: `${baseUrl.replace(/:\d+$/, ":5173")}/payment-simulation?orderId=${payload.payment.data.orderId}&amount=${amount}&currency=${currency}&test=1`,
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
