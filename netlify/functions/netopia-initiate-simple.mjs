/**
 * NETOPIA Payment Initiate - SIMPLIFIED VERSION
 * Folosește doar API standard /payment/card cu credențialele LIVE
 * Versiune stabilă până când v3 este activat complet
 */

// Credențiale LIVE primite de la NETOPIA pe 28 iulie 2025
const NETOPIA_LIVE_CONFIG = {
  signature: "2ZOW-PJ5X-HYYC-IENE-APZO",
  endpoint: "https://secure.netopia-payments.com/payment/card",
  // Certificatele vor fi folosite pentru verificări și eventual v3
  publicKey: process.env.NETOPIA_CERTIFICATE,
  privateKey: process.env.NETOPIA_PRIVATE_KEY,
};

/**
 * Creează payload simplu pentru API standard NETOPIA
 */
function createSimplePayload(paymentData) {
  const baseUrl = process.env.URL || "https://lupulsicorbul.com";

  return {
    config: {
      notifyUrl: `${baseUrl}/.netlify/functions/netopia-notify`,
      redirectUrl: `${baseUrl}/.netlify/functions/netopia-return`,
      language: "ro",
    },
    payment: {
      options: { installments: 0, bonus: 0 },
      instrument: { type: "card" },
    },
    order: {
      posSignature: NETOPIA_LIVE_CONFIG.signature,
      dateTime: new Date().toISOString(),
      description: paymentData.description || "Comandă lupulsicorbul.com",
      orderID: paymentData.orderId,
      amount: parseFloat(paymentData.amount),
      currency: "RON",
      billing: {
        email: paymentData.customerInfo?.email || "test@lupulsicorbul.com",
        phone: paymentData.customerInfo?.phone || "+40712345678",
        firstName: paymentData.customerInfo?.firstName || "Test",
        lastName: paymentData.customerInfo?.lastName || "Customer",
        city: paymentData.customerInfo?.city || "Bucuresti",
        country: 642,
        countryName: "Romania",
        state: paymentData.customerInfo?.county || "Bucuresti",
        postalCode: paymentData.customerInfo?.postalCode || "123456",
        details: paymentData.customerInfo?.address || "Strada Test 1",
      },
      products: [
        {
          name: paymentData.description || "Produs digital",
          code: paymentData.orderId,
          category: "digital",
          price: parseFloat(paymentData.amount),
          vat: 19,
        },
      ],
    },
  };
}

/**
 * Handler principal - VERSIUNEA SIMPLIFICATĂ
 */
export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
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
    console.log("🚀 NETOPIA SIMPLE - Starting payment initiation");

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
    });

    // Validare básica
    if (!paymentData.orderId || !paymentData.amount) {
      throw new Error("Missing orderId or amount");
    }

    // Creează payload și trimite la NETOPIA
    const payload = createSimplePayload(paymentData);

    console.log("🔄 Sending to NETOPIA API standard:", {
      endpoint: NETOPIA_LIVE_CONFIG.endpoint,
      orderId: payload.order.orderID,
      amount: payload.order.amount,
      signature: NETOPIA_LIVE_CONFIG.signature.substring(0, 10) + "...",
    });

    const response = await fetch(NETOPIA_LIVE_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📡 NETOPIA Response:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ NETOPIA Error:", errorText.substring(0, 200));
      throw new Error(`NETOPIA API Error: ${response.status}`);
    }

    // Procesează răspunsul
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      // Răspuns JSON - API v2/v3 response
      const data = await response.json();
      console.log("✅ JSON Response received:", {
        hasPayment: !!data.payment,
        status: data.payment?.status,
        hasPaymentURL: !!data.payment?.paymentURL,
      });

      if (data.payment?.paymentURL) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            paymentUrl: data.payment.paymentURL,
            orderId: paymentData.orderId,
          }),
        };
      }
    } else {
      // Răspuns HTML - redirect page sau form
      const htmlResponse = await response.text();
      console.log("📄 HTML Response received, length:", htmlResponse.length);

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: htmlResponse,
      };
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
