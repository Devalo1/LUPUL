/**
 * NETOPIA Payment Initiate - CONFORM DOCUMENTAȚIEI OFICIALE
 * Implementare exactă conform: https://netopia-system.stoplight.io/docs/payments-api/d85c6f3d36ce1-create-a-payment-card-start
 */

// Credențiale LIVE primite de la NETOPIA pe 28 iulie 2025
const NETOPIA_CONFIG = {
  sandbox: {
    signature: "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.sandbox.netopia-payments.com/payment/card/start", // EXACT din documentație
  },
  production: {
    signature: "2ZOW-PJ5X-HYYC-IENE-APZO", 
    endpoint: "https://secure.netopia-payments.com/payment/card/start", // Când va fi activat
    fallbackEndpoint: "https://secure.netopia-payments.com/payment/card", // API standard pentru fallback
  }
};

/**
 * Creează payload EXACT conform documentației oficiale NETOPIA v3
 */
function createOfficialPayload(paymentData) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";
  
  return {
    config: {
      emailTemplate: "", // Optional - empty for default
      emailSubject: "", // Optional - empty for default
      notifyUrl: `${baseUrl}/.netlify/functions/netopia-notify`,
      redirectUrl: `${baseUrl}/.netlify/functions/netopia-return`,
      language: "ro"
    },
    payment: {
      options: {
        installments: 0,
        bonus: 0
      },
      instrument: {
        type: "card",
        account: "", // Empty pentru payment form
        expMonth: "", // Empty pentru payment form
        expYear: "", // Empty pentru payment form
        secretCode: "", // Empty pentru payment form
        token: ""
      },
      data: {
        // Custom payment data - poate fi gol
      }
    },
    order: {
      ntpID: "", // NETOPIA internal id - obsolete
      posSignature: paymentData.signature || NETOPIA_CONFIG.sandbox.signature,
      dateTime: new Date().toISOString(),
      description: paymentData.description || "Comandă lupulsicorbul.com",
      orderID: paymentData.orderId,
      amount: parseFloat(paymentData.amount),
      currency: "RON",
      billing: {
        email: paymentData.customerInfo?.email || "test@lupulsicorbul.com",
        phone: paymentData.customerInfo?.phone || "+407xxxxxxxx",
        firstName: paymentData.customerInfo?.firstName || "First",
        lastName: paymentData.customerInfo?.lastName || "Last",
        city: paymentData.customerInfo?.city || "Bucuresti",
        country: 642, // România conform ISO 3166-1 numeric
        countryName: "Romania",
        state: paymentData.customerInfo?.county || "Bucuresti",
        postalCode: paymentData.customerInfo?.postalCode || "123456",
        details: paymentData.customerInfo?.address || ""
      },
      shipping: {
        email: paymentData.customerInfo?.email || "test@lupulsicorbul.com",
        phone: paymentData.customerInfo?.phone || "+407xxxxxxxx",
        firstName: paymentData.customerInfo?.firstName || "First",
        lastName: paymentData.customerInfo?.lastName || "Last",
        city: paymentData.customerInfo?.city || "Bucuresti",
        country: 642,
        state: paymentData.customerInfo?.county || "Bucuresti",
        postalCode: paymentData.customerInfo?.postalCode || "123456",
        details: paymentData.customerInfo?.address || ""
      },
      products: [{
        name: paymentData.description || "Produs digital",
        code: paymentData.orderId,
        category: "digital",
        price: parseFloat(paymentData.amount),
        vat: 19
      }],
      installments: {
        selected: 0,
        available: [0]
      },
      data: {
        // Custom merchant parameters
      }
    }
  };
}

/**
 * Trimite request la NETOPIA conform documentației oficiale
 */
async function callNetopiaAPI(payload, config, isSandbox = false) {
  const endpoint = isSandbox ? config.sandbox.endpoint : config.production.endpoint;
  const signature = isSandbox ? config.sandbox.signature : config.production.signature;
  
  console.log(`🚀 Calling NETOPIA ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} API:`, {
    endpoint,
    orderId: payload.order.orderID,
    amount: payload.order.amount,
    signature: signature.substring(0, 10) + "..."
  });

  // Headers EXACT conform documentației
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": signature // EXACT ca în documentație
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    console.log(`📡 NETOPIA ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} Response:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ NETOPIA ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} Error:`, errorText.substring(0, 200));
      
      // Pentru production, încearcă fallback la API standard
      if (!isSandbox && response.status === 404) {
        console.log("🔄 Trying production fallback API...");
        return await callNetopiaFallback(payload, config);
      }
      
      throw new Error(`NETOPIA API Error: ${response.status}`);
    }

    // Procesează răspunsul JSON conform documentației
    const data = await response.json();
    console.log("✅ NETOPIA API Response:", {
      hasPayment: !!data.payment,
      status: data.payment?.status,
      hasPaymentURL: !!data.payment?.paymentURL,
      hasCustomerAction: !!data.customerAction,
      actionType: data.customerAction?.type
    });

    return data;

  } catch (error) {
    console.error(`❌ NETOPIA ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} API failed:`, error.message);
    throw error;
  }
}

/**
 * Fallback la API standard pentru production
 */
async function callNetopiaFallback(payload, config) {
  console.log("🔄 Using fallback API standard for production");
  
  const response = await fetch(config.production.fallbackEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fallback API Error: ${response.status} - ${errorText.substring(0, 100)}`);
  }

  // Procesează răspunsul (poate fi HTML sau JSON)
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    // Răspuns HTML - returnează ca form
    const htmlResponse = await response.text();
    return {
      payment: {
        status: 15, // 3DS required
        paymentURL: null
      },
      customerAction: {
        type: "HTMLForm",
        formData: { html: htmlResponse }
      }
    };
  }
}

/**
 * Handler principal conform documentației NETOPIA
 */
export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log("🚀 NETOPIA OFFICIAL API - Starting payment initiation");
    
    // Parse request data
    let paymentData;
    try {
      let rawBody = event.body || "";
      if (event.isBase64Encoded) {
        rawBody = Buffer.from(rawBody, "base64").toString("utf-8");
      }
      paymentData = JSON.parse(rawBody || "{}");
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid JSON" }),
      };
    }

    console.log("📋 Payment data:", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      hasCustomerInfo: !!paymentData.customerInfo,
      environment: paymentData.environment || 'auto-detect'
    });

    // Validare 
    if (!paymentData.orderId || !paymentData.amount) {
      throw new Error("Missing orderId or amount");
    }

    // Creează payload conform documentației oficiale
    const payload = createOfficialPayload(paymentData);
    
    // Determină mediul (sandbox vs production)
    const baseUrl = process.env.URL || "https://lupulsicorbul.com";
    const isProduction = baseUrl.includes("lupulsicorbul.com") && !paymentData.forceSandbox;
    
    console.log("🎯 Environment detection:", {
      baseUrl,
      isProduction,
      willUseSandbox: !isProduction
    });

    // Apelează API-ul NETOPIA
    const result = await callNetopiaAPI(payload, NETOPIA_CONFIG, !isProduction);

    // Procesează răspunsul conform documentației
    if (result.payment) {
      if (result.payment.status === 15 && result.customerAction?.type === "Authentication3D") {
        // 3D Secure authentication required
        const formData = result.customerAction.formData || {};
        const formInputs = Object.entries(formData)
          .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}"/>`)
          .join("\n    ");

        const form3DS = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Autentificare 3D Secure</title>
  <style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;background:#f5f5f5;}</style>
</head>
<body>
  <div style="max-width:400px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
    <h3>🔒 Autentificare 3D Secure</h3>
    <p>Redirecționare către banca dvs. pentru autentificare...</p>
    <div style="margin:20px 0;">
      <div style="display:inline-block;width:20px;height:20px;border:2px solid #007bff;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
    </div>
  </div>
  <form id="form3ds" action="${result.customerAction.url}" method="post" target="_top">
    ${formInputs}
  </form>
  <script>
    console.log('3DS Authentication:', {
      url: '${result.customerAction.url}',
      token: '${result.customerAction.authenticationToken?.substring(0, 10)}...'
    });
    document.getElementById('form3ds').submit();
  </script>
  <style>
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</body>
</html>`;

        return {
          statusCode: 200,
          headers: { "Content-Type": "text/html" },
          body: form3DS,
        };
      } else if (result.payment.paymentURL) {
        // Direct payment URL
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            paymentUrl: result.payment.paymentURL,
            orderId: paymentData.orderId,
            status: result.payment.status
          }),
        };
      } else if (result.customerAction?.formData?.html) {
        // HTML form from fallback
        return {
          statusCode: 200,
          headers: { "Content-Type": "text/html" },
          body: result.customerAction.formData.html,
        };
      }
    }

    // Handle error responses conform documentației
    if (result.error) {
      console.error("❌ NETOPIA API Error:", result.error);
      throw new Error(`NETOPIA Error ${result.error.code}: ${result.error.message}`);
    }

    throw new Error("Unexpected response format from NETOPIA");

  } catch (error) {
    console.error("❌ Error in payment initiation:", error.message);
    
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
