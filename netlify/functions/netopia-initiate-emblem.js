/**
 * Funcție Netlify pentru inițierea plăților EMBLEME prin NETOPIA API v2.x
 * Această funcție procesează comenzile de embleme NFT și inițiază plățile folosind API KEY
 */

// Configurație NETOPIA v2.x pentru embleme - folosește API KEY și endpoint-uri corecte
const NETOPIA_CONFIG = {
  sandbox: {
    mode: "sandbox",
    baseUrl: "https://secure.sandbox.netopia-payments.com",
    endpoint: "https://secure.sandbox.netopia-payments.com/payment/card/start",
    signature: "2ZOW-PJ5X-HYYC-IENE-APZO",
    apiKey: "z-2vhwpEKiI7WSe1OjU9BR-vaMgoEVEDDbaToPXkVmXKDojL3afQ4uxItEw=", // Same as working netopia-v2-api
  },
  live: {
    mode: "live",
    baseUrl: "https://secure.netopia-payments.com",
    endpoint: "https://secure.netopia-payments.com/api/payment/card/start",
    signature: process.env.NETOPIA_LIVE_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    apiKey:
      process.env.NETOPIA_LIVE_API_KEY ||
      "LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt",
  },
};

/**
 * Creează payload-ul pentru NETOPIA API v2.x - special pentru embleme
 * FOLOSEȘTE EXACT ACEEAȘI STRUCTURĂ CA netopia-v2-api.js QUI FUNCȚIONEAZĂ
 */
function createEmblemPayload(paymentData, config) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";

  return {
    // Payment configuration
    config: {
      emailTemplate: "",
      emailSubject: "",
      notifyUrl: `${baseUrl}/.netlify/functions/netopia-notify-emblem`,
      redirectUrl: `${baseUrl}/.netlify/functions/netopia-return-emblem`,
      language: "ro",
    },

    // Payment details
    payment: {
      options: {
        installments: 0,
        bonus: 0,
      },
      instrument: {
        type: "card",
      },
      data: {
        emblemType: paymentData.emblemType,
        userId: paymentData.userId,
      },
    },

    // Order details - EXACT SAME STRUCTURE AS WORKING netopia-v2-api.js
    order: {
      ntpID: "",
      posSignature: config.signature,
      dateTime: new Date().toISOString().replace("Z", "+02:00"),
      description:
        paymentData.description || `Emblema ${paymentData.emblemType}`,
      orderID: paymentData.orderId,
      amount: parseFloat(paymentData.amount), // Amount in RON like working function
      currency: "RON",

      // Billing information
      billing: {
        email: paymentData.customerInfo?.email || "user@example.com",
        phone: paymentData.customerInfo?.phone || "+407xxxxxxxx",
        firstName: paymentData.customerInfo?.firstName || "First",
        lastName: paymentData.customerInfo?.lastName || "Last",
        city: paymentData.customerInfo?.city || "City",
        country: 642,
        countryName: "Country",
        state: paymentData.customerInfo?.county || "State",
        postalCode: paymentData.customerInfo?.postalCode || "Zip",
        details: paymentData.customerInfo?.address || "",
      },

      // Shipping information (same as billing for digital products)
      shipping: {
        email: paymentData.customerInfo?.email || "user@example.com",
        phone: paymentData.customerInfo?.phone || "+407xxxxxxxx",
        firstName: paymentData.customerInfo?.firstName || "First",
        lastName: paymentData.customerInfo?.lastName || "Last",
        city: paymentData.customerInfo?.city || "City",
        country: 642,
        state: paymentData.customerInfo?.county || "State",
        postalCode: paymentData.customerInfo?.postalCode || "Zip",
        details: paymentData.customerInfo?.address || "",
      },

      // Products
      products: [
        {
          name: paymentData.description || `Emblema ${paymentData.emblemType}`,
          code: paymentData.orderId,
          category: "category",
          price: parseFloat(paymentData.amount),
          vat: 19,
        },
      ],

      // Installments
      installments: {
        selected: 0,
        available: [0],
      },

      data: {
        emblemType: paymentData.emblemType,
        userId: paymentData.userId,
      },
    },
  };
}

/**
 * Trimite request către NETOPIA API v2.x pentru embleme folosind JSON POST
 */
async function initiateEmblemPayment(payload, config) {
  console.log("🔮 Initiating NETOPIA API v2.x payment for emblem:", {
    endpoint: config.endpoint,
    orderId: payload.order.orderID,
    amount: payload.order.amount,
    emblemType: payload.order.data?.emblemType,
    hasApiKey: !!config.apiKey,
    signature: config.signature,
  });

  if (!config.apiKey) {
    throw new Error(
      "NETOPIA API KEY not configured for emblems. Please check environment variables."
    );
  }

  try {
    console.log("🔮 Sending JSON request to NETOPIA API v2.x for emblem:", {
      endpoint: config.endpoint,
      method: "POST",
      payloadStructure: {
        hasConfig: !!payload.config,
        hasPayment: !!payload.payment,
        hasOrder: !!payload.order,
        orderID: payload.order?.orderID,
        amount: payload.order?.amount,
        emblemType: payload.order?.data?.emblemType,
        signature: payload.order?.posSignature,
      },
    });

    // Folosește același format ca netopia-v2-api.js
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: config.apiKey, // Direct API key, no Bearer prefix
        "User-Agent": "LupulSiCorbul-Emblems/1.0 (contact@lupulsicorbul.com)",
      },
      body: JSON.stringify(payload),
    });

    console.log("🔮 NETOPIA API v2.x Response for emblem:", {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
    });

    // Verifică tipul de conținut pentru a determina cum să proceseze răspunsul
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ NETOPIA API v2.x Error for emblem:", {
        status: response.status,
        statusText: response.statusText,
        body:
          errorText.substring(0, 500) + (errorText.length > 500 ? "..." : ""),
        contentType,
      });

      // Parse error response if it's JSON
      let errorDetails = errorText;
      try {
        if (isJson) {
          const errorJson = JSON.parse(errorText);
          errorDetails =
            errorJson.message || errorJson.error?.message || errorText;
        }
      } catch (e) {
        // Keep original error text if not JSON
      }

      throw new Error(`NETOPIA API Error ${response.status}: ${errorDetails}`);
    }

    // Parse JSON response (v2.x always returns JSON)
    if (!isJson) {
      throw new Error(
        `Unexpected content type: ${contentType}. Expected application/json for v2.x API.`
      );
    }

    const responseData = await response.json();

    console.log("✅ NETOPIA API v2.x JSON Response received for emblem:", {
      hasPayment: !!responseData.payment,
      hasPaymentUrl: !!responseData.payment?.paymentURL,
      paymentStatus: responseData.payment?.status,
      ntpID: responseData.payment?.ntpID,
      hasError: !!responseData.error,
      errorCode: responseData.error?.code,
      errorMessage: responseData.error?.message,
      hasCustomerAction: !!responseData.customerAction,
    });

    // Verifică dacă există eroare în răspuns (inclusiv error code 101 pentru redirect)
    if (responseData.error) {
      // Code 101 înseamnă "Redirect user to payment page" - this is normal for v2.x
      if (responseData.error.code === "101") {
        console.log(
          "🔮 Normal redirect response from NETOPIA v2.x for emblem (code 101)"
        );
      } else {
        console.warn(
          "⚠️ NETOPIA returned error for emblem:",
          responseData.error
        );
      }
    }

    // Verifică formatul răspunsului
    if (!responseData.payment) {
      throw new Error(
        "Invalid response format from NETOPIA API v2.x - missing payment object"
      );
    }

    const payment = responseData.payment;

    // Returnează rezultatul structurat conform cu răspunsul din exemplu
    return {
      success: true,
      paymentUrl: payment.paymentURL,
      orderId: payload.order.orderID,
      ntpID: payment.ntpID,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      operationDate: payment.operationDate,
      environment: config.baseUrl.includes("sandbox") ? "sandbox" : "live",
      apiVersion: "v2.x",
      errorCode: responseData.error?.code,
      errorMessage: responseData.error?.message,
      emblemType: payload.order.data?.emblemType,
      userId: payload.order.data?.userId,
      // Include additional fields from your successful response
      binding: payment.binding,
      instrument: payment.instrument,
      options: payment.options,
      customerAction: responseData.customerAction,
    };
  } catch (error) {
    console.error(
      "🚨 NETOPIA API v2.x Request failed for emblem:",
      error.message
    );
    throw error;
  }
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

    // Determină configurația (sandbox vs live) - UNIFIED LOGIC
    const baseUrl = process.env.URL || "https://lupulsicorbul.com";
    const isProduction =
      baseUrl.includes("lupulsicorbul.com") && !baseUrl.includes("localhost");

    const hasLiveSignature = Boolean(process.env.NETOPIA_LIVE_SIGNATURE);

    const useLive =
      paymentData.live === true || (isProduction && hasLiveSignature);
    const config = useLive ? NETOPIA_CONFIG.live : NETOPIA_CONFIG.sandbox;

    console.log(
      `🔮 Using ${config.mode.toUpperCase()} NETOPIA config for emblem payment`
    );

    console.log("🔧 Emblem Environment configuration:", {
      baseUrl,
      mode: config.mode,
      isProduction,
      hasLiveSignature,
      useLive,
      endpoint: config.endpoint,
      signature: config.signature?.substring(0, 10) + "...",
      apiBaseUrl: config.baseUrl,
      hasApiKey: !!config.apiKey,
      apiKeyPreview: config.apiKey?.substring(0, 10) + "...",
    });

    // Verifică dacă avem API KEY
    if (!config.apiKey) {
      const missingKey = useLive
        ? "NETOPIA_LIVE_API_KEY"
        : "NETOPIA_SANDBOX_API_KEY";
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "NETOPIA API KEY not configured for emblems",
          details: `Please set ${missingKey} environment variable`,
          environment: useLive ? "live" : "sandbox",
        }),
      };
    }

    // Creează payload-ul pentru NETOPIA
    const payload = createEmblemPayload(paymentData, config);

    // Inițiază plata
    const result = await initiateEmblemPayment(payload, config);

    console.log("✅ Emblem payment initiation successful:", {
      orderId: result.orderId,
      ntpID: result.ntpID,
      status: result.status,
      emblemType: result.emblemType,
      environment: result.environment,
      apiVersion: result.apiVersion,
    });

    // Returnează rezultatul JSON
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: result.paymentUrl,
        orderId: result.orderId,
        ntpID: result.ntpID,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        environment: result.environment,
        apiVersion: result.apiVersion,
        emblemType: result.emblemType,
        userId: result.userId,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        customerAction: result.customerAction,
        message: `Emblem payment initiated successfully using NETOPIA API ${result.apiVersion}`,
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

export { handler };
