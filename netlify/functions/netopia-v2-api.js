/**
 * NETOPIA Payment API v2.x - Conform documentației oficiale
 * https://doc.netopia-payments.com/docs/payment-api/v2.x/introduction
 *
 * Această implementare folosește API KEY în loc de POS signature
 * și JSON requests în loc de form POST
 */

// Configurație pentru NETOPIA API v2.x
const NETOPIA_V2_CONFIG = {
  sandbox: {
    baseUrl: "https://secure.sandbox.netopia-payments.com",
    endpoint: "https://secure.sandbox.netopia-payments.com/payment/card/start",
    signature: "2ZOW-PJ5X-HYYC-IENE-APZO", // Your sandbox signature
    apiKey: "z-2vhwpEKiI7WSe1OjU9BR-vaMgoEVEDDbaToPXkVmXKDojL3afQ4uxItEw=", // Your sandbox API key
  },
  live: {
    baseUrl: "https://secure.netopia-payments.com",
    endpoint: "https://secure.netopia-payments.com/api/payment/card/start",
    signature: process.env.NETOPIA_LIVE_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    apiKey:
      process.env.NETOPIA_LIVE_API_KEY ||
      "LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt",
  },
};

/**
 * Creează payload-ul pentru NETOPIA API v2.x
 * Conform exemplului din documentația NETOPIA v2.x
 */
function createNetopiaV2Payload(paymentData, config) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";

  return {
    // Payment configuration
    config: {
      emailTemplate: "",
      emailSubject: "",
      notifyUrl:
        paymentData.confirmUrl ||
        `${baseUrl}/.netlify/functions/netopia-notify`,
      redirectUrl:
        paymentData.returnUrl || `${baseUrl}/.netlify/functions/netopia-return`,
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
        property1: "string",
        property2: "string",
      },
    },

    // Order details
    order: {
      ntpID: "",
      posSignature: config.signature, // Use the signature from config
      dateTime: new Date().toISOString().replace("Z", "+02:00"), // Romanian timezone
      description: paymentData.description || `Comandă ${paymentData.orderId}`,
      orderID: paymentData.orderId,
      amount: parseFloat(paymentData.amount), // Amount is already in RON from frontend
      currency: "RON",

      // Billing information
      billing: {
        email: paymentData.customerInfo?.email || "user@example.com",
        phone: paymentData.customerInfo?.phone || "+407xxxxxxxx",
        firstName: paymentData.customerInfo?.firstName || "First",
        lastName: paymentData.customerInfo?.lastName || "Last",
        city: paymentData.customerInfo?.city || "City",
        country: 642, // Romania country code
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
          name: paymentData.description || "name",
          code: paymentData.orderId || "SKU",
          category: "category",
          price: parseFloat(paymentData.amount),
          vat: 19, // 19% TVA România
        },
      ],

      // Installments
      installments: {
        selected: 0,
        available: [0],
      },

      data: {
        property1: "string",
        property2: "string",
      },
    },
  };
}

/**
 * Trimite request către NETOPIA API v2.x folosind JSON POST
 * Conform cu API-ul v2.x care returnează JSON response
 */
async function initiateNetopiaV2Payment(payload, config) {
  console.log("🚀 Initiating NETOPIA API v2.x payment:", {
    endpoint: config.endpoint,
    orderId: payload.order.orderID,
    amount: payload.order.amount,
    hasApiKey: !!config.apiKey,
    signature: config.signature,
  });

  if (!config.apiKey) {
    throw new Error(
      "NETOPIA API KEY not configured. Please check environment variables."
    );
  }

  try {
    console.log("📡 Sending JSON request to NETOPIA API v2.x:", {
      endpoint: config.endpoint,
      method: "POST",
      payloadStructure: {
        hasConfig: !!payload.config,
        hasPayment: !!payload.payment,
        hasOrder: !!payload.order,
        orderID: payload.order?.orderID,
        amount: payload.order?.amount,
        signature: payload.order?.posSignature,
      },
    });

    // Use exact format from working curl command
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: config.apiKey, // Direct API key, no Bearer prefix
        "User-Agent": "LupulSiCorbul/1.0 (contact@lupulsicorbul.com)",
      },
      body: JSON.stringify(payload),
    });

    console.log("📨 NETOPIA API v2.x Response:", {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
    });

    // Verifică tipul de conținut pentru a determina cum să proceseze răspunsul
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ NETOPIA API v2.x Error:", {
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

    console.log("✅ NETOPIA API v2.x JSON Response received:", {
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
        console.log("📋 Normal redirect response from NETOPIA v2.x (code 101)");
      } else {
        console.warn("⚠️ NETOPIA returned error:", responseData.error);
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
      // Include additional fields from your successful response
      binding: payment.binding,
      instrument: payment.instrument,
      options: payment.options,
      customerAction: responseData.customerAction,
    };
  } catch (error) {
    console.error("🚨 NETOPIA API v2.x Request failed:", error.message);
    throw error;
  }
}

/**
 * Handler principal pentru Netlify Function
 */
export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
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

  // Declare paymentData outside try block so it's available in catch
  let paymentData;

  try {
    console.log("🌟 NETOPIA API v2.x - New payment initiation");

    // Parse request body
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
        headers,
        body: JSON.stringify({
          error: "Invalid JSON in request body",
          details: jsonError.message,
        }),
      };
    }

    console.log("📋 Payment data received:", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      live: paymentData.live,
      hasCustomerInfo: !!paymentData.customerInfo,
      customerEmail: paymentData.customerInfo?.email,
    });

    // Validează datele obligatorii
    if (!paymentData.orderId || !paymentData.amount) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields: orderId or amount",
        }),
      };
    }

    // Determină configurația (sandbox vs live)
    const baseUrl =
      process.env.URL ||
      context?.headers?.origin ||
      "https://lupulsicorbul.com";
    const isProduction =
      baseUrl.includes("lupulsicorbul.com") && !baseUrl.includes("localhost");
    const hasLiveSignature = Boolean(process.env.NETOPIA_LIVE_SIGNATURE);

    // Folosește live mode când payload-ul specifică live=true sau când suntem în producție
    const useLive =
      paymentData.live === true || (isProduction && hasLiveSignature);
    const config = useLive ? NETOPIA_V2_CONFIG.live : NETOPIA_V2_CONFIG.sandbox;

    console.log("🔧 Environment configuration:", {
      baseUrl,
      isProduction,
      hasLiveSignature,
      useLive,
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
          error: "NETOPIA API KEY not configured",
          details: `Please set ${missingKey} environment variable`,
          environment: useLive ? "live" : "sandbox",
        }),
      };
    }

    // Creează payload-ul pentru NETOPIA API v2.x
    const payload = createNetopiaV2Payload(paymentData, config);

    console.log("🔍 COMPLETE PAYLOAD DEBUG:", {
      payloadKeys: Object.keys(payload),
      config: payload.config,
      payment: payload.payment,
      order: {
        ...payload.order,
        // Log full order details
        ntpID: payload.order.ntpID,
        posSignature: payload.order.posSignature,
        dateTime: payload.order.dateTime,
        description: payload.order.description,
        orderID: payload.order.orderID,
        amount: payload.order.amount,
        currency: payload.order.currency,
        billing: payload.order.billing,
        shipping: payload.order.shipping,
        products: payload.order.products,
      },
    });

    // Inițiază plata folosind API v2.x
    const result = await initiateNetopiaV2Payment(payload, config);

    console.log("✅ Payment initiation successful:", {
      orderId: result.orderId,
      ntpID: result.ntpID,
      status: result.status,
      environment: result.environment,
      apiVersion: result.apiVersion,
    });

    // Returnează rezultatul
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: result.paymentUrl,
        orderId: result.orderId,
        ntpID: result.ntpID,
        method: result.method,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        token: result.token,
        environment: result.environment,
        apiVersion: result.apiVersion,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        customerAction: result.customerAction,
        paymentData: result.paymentData,
        message: `Payment initiated successfully using NETOPIA API ${result.apiVersion}`,
      }),
    };
  } catch (error) {
    console.error("❌ Error in NETOPIA API v2.x handler:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Payment initiation failed",
        message: error.message,
        orderId: paymentData?.orderId || "unknown",
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
