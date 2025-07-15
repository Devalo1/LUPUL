/**
 * Funcție Netlify pentru inițierea plăților NETOPIA
 * Această funcție creează o nouă sesiune de plată și returnează URL-ul NETOPIA
 */

const crypto = require("crypto");

// Configurație NETOPIA
const NETOPIA_CONFIG = {
  sandbox: {
    signature: "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure-sandbox.netopia-payments.com/payment/card",
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
  const baseUrl = process.env.URL || "https://lupul-si-corbul.netlify.app";

  return {
    config: {
      emailTemplate: "lupul-si-corbul",
      notifyUrl: `${baseUrl}/netlify/functions/netopia-notify`,
      redirectUrl: `${baseUrl}/netlify/functions/netopia-return`,
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
  try {
    // Pentru sandbox, simulăm inițierea plății
    if (config.signature === "2ZOW-PJ5X-HYYC-IENE-APZO") {
      console.log("Sandbox mode: Simulating NETOPIA payment initiation");

      // Simulare URL de plată pentru sandbox
      const simulatedPaymentUrl = `${config.endpoint}?orderId=${payload.payment.data.orderId}&amount=${payload.payment.data.amount}&test=1`;

      return {
        success: true,
        paymentUrl: simulatedPaymentUrl,
        orderId: payload.payment.data.orderId,
      };
    }

    // În producție, aici ar fi request-ul real către NETOPIA API
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
    // Parse request body
    const paymentData = JSON.parse(event.body || "{}");

    console.log("Initiating NETOPIA payment:", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
    });

    // Validează datele de plată
    validatePaymentData(paymentData);

    // Determină configurația (sandbox vs live)
    const isLive = paymentData.live === true;
    const config = isLive ? NETOPIA_CONFIG.live : NETOPIA_CONFIG.sandbox;

    // Verifică configurația
    if (isLive && !config.signature) {
      throw new Error("NETOPIA live configuration not found");
    }

    // Creează payload-ul pentru NETOPIA
    const payload = createNetopiaPayload(paymentData, config);

    // Inițiază plata la NETOPIA
    const result = await initiateNetopiaPayment(payload, config);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentUrl: result.paymentUrl,
        orderId: result.orderId,
        message: "Payment initiated successfully",
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
