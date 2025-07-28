/**
 * Funcție Netlify pentru inițierea plăților MARKETPLACE (Client → Client)
 * Această funcție procesează revânzările pe marketplace-ul intern
 */

import crypto from "crypto";

// Configurare Netopia (aceleași credentiale ca pentru vânzări primare)
const NETOPIA_CONFIG = {
  sandbox: {
    signature:
      process.env.NETOPIA_SANDBOX_SIGNATURE || "SANDBOX_SIGNATURE_PLACEHOLDER",
    endpoint: "https://secure.sandbox.netopia-payments.com/payment/card/start",
    publicKey: process.env.NETOPIA_SANDBOX_PUBLIC_KEY,
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE,
    endpoint: "https://secure.netopia-payments.com/payment/card/start",
    publicKey: process.env.NETOPIA_LIVE_PUBLIC_KEY,
  },
};

// Determină configurația (sandbox vs live)
const isLive =
  process.env.NODE_ENV === "production" &&
  process.env.NETOPIA_LIVE_MODE === "true" &&
  process.env.NETOPIA_LIVE_SIGNATURE;

const NETOPIA_CURRENT_CONFIG = isLive
  ? NETOPIA_CONFIG.live
  : NETOPIA_CONFIG.sandbox;

/**
 * Creează payload-ul pentru plata marketplace cu structura corectă Netopia
 */
function createMarketplacePayload(paymentData) {
  const {
    orderId,
    amount,
    currency,
    description,
    customerInfo,
    listingId,
    emblemId,
    sellerId,
    buyerId,
  } = paymentData;

  const baseUrl = process.env.URL || "https://lupulsicorbul.com";

  return {
    config: {
      emailTemplate: "lupul-si-corbul-marketplace",
      notifyUrl: `${baseUrl}/.netlify/functions/netopia-notify-marketplace`,
      redirectUrl: `${baseUrl}/.netlify/functions/netopia-return-marketplace`,
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
        confirmUrl: `${baseUrl}/.netlify/functions/netopia-notify-marketplace`,
        returnUrl: `${baseUrl}/.netlify/functions/netopia-return-marketplace`,
        signature: NETOPIA_CURRENT_CONFIG.signature,
        orderId: orderId,
        amount: amount.toString(),
        currency: currency,
        details: description,
        billing: {
          type: "person",
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          county: customerInfo.county,
          postalCode: customerInfo.postalCode,
          country: "Romania",
        },
        shipping: {
          type: "person",
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          county: customerInfo.county,
          postalCode: customerInfo.postalCode,
          country: "Romania",
        },
      },
    },
    // Metadata specifică marketplace
    marketplace: {
      listingId: listingId,
      emblemId: emblemId,
      sellerId: sellerId,
      buyerId: buyerId,
      type: "emblem_marketplace_purchase",
    },
  };
}

/**
 * Inițiază plata marketplace prin Netopia cu endpoint-ul corect
 */
async function initiateMarketplacePayment(paymentData) {
  try {
    const payload = createMarketplacePayload(paymentData);

    console.log("🏪 Initiating marketplace payment:", {
      orderId: payload.payment.data.orderId,
      amount: payload.payment.data.amount,
      listingId: payload.marketplace.listingId,
      seller: payload.marketplace.sellerId,
      buyer: payload.marketplace.buyerId,
      endpoint: NETOPIA_CURRENT_CONFIG.endpoint,
    });

    // Creează form-ul HTML pentru redirectarea la Netopia
    const dataString = JSON.stringify(payload);
    const dataBase64 = Buffer.from(dataString).toString("base64");

    // Generează form-ul HTML pentru redirectare
    const formHtml = `
      <!DOCTYPE html>
      <html lang="ro">
      <head>
        <title>Cumpărare Emblemă Marketplace - Lupul și Corbul</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
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
          .amount {
            font-size: 2rem;
            color: #2ecc71;
            font-weight: bold;
            margin: 1rem 0;
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
          .info {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            font-size: 0.9rem;
            color: #666;
          }
          .endpoint-info {
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
          <div class="logo">🏪</div>
          <h1>Cumpărare Emblemă Marketplace</h1>
          <div class="amount">${(payload.payment.data.amount / 100).toFixed(2)} RON</div>
          
          <div class="info">
            <strong>Emblemă:</strong> ${payload.payment.data.details}<br>
            <strong>Comanda:</strong> ${payload.payment.data.orderId}
          </div>
          
          <div class="loading">
            <div class="spinner"></div>
            Redirectare către plata securizată Netopia...
          </div>
          
          <div class="endpoint-info">
            ✅ Endpoint corect: ${NETOPIA_CURRENT_CONFIG.endpoint}
          </div>
          
          <form id="paymentForm" method="POST" action="${NETOPIA_CURRENT_CONFIG.endpoint}" target="_top">
            <input type="hidden" name="signature" value="${NETOPIA_CURRENT_CONFIG.signature}">
            <input type="hidden" name="data" value="${dataBase64}">
          </form>
        </div>
        
        <script>
          console.log('🏪 Marketplace Payment Form:', {
            endpoint: '${NETOPIA_CURRENT_CONFIG.endpoint}',
            signature: '${NETOPIA_CURRENT_CONFIG.signature.substring(0, 10)}...',
            orderId: '${payload.payment.data.orderId}',
            amount: '${payload.payment.data.amount}'
          });
          
          // Redirect automat către Netopia după 2 secunde
          setTimeout(function() {
            document.getElementById('paymentForm').submit();
          }, 2000);
        </script>
      </body>
      </html>
    `;

    return {
      success: true,
      form3DS: formHtml,
      orderId: payload.payment.data.orderId,
    };
  } catch (error) {
    console.error("❌ Error initiating marketplace payment:", error);
    throw error;
  }
}

/**
 * Handler principal pentru inițierea plăților marketplace
 */
export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

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
    console.log("🏪 MARKETPLACE PAYMENT REQUEST received");

    const paymentData = JSON.parse(event.body);

    // Validare date marketplace
    const requiredFields = [
      "orderId",
      "amount",
      "currency",
      "description",
      "customerInfo",
      "listingId",
      "emblemId",
      "sellerId",
      "buyerId",
      "isMarketplacePurchase",
    ];

    for (const field of requiredFields) {
      if (!paymentData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!paymentData.isMarketplacePurchase) {
      throw new Error("Not a marketplace purchase request");
    }

    // Verifică configurarea Netopia
    if (
      !NETOPIA_CURRENT_CONFIG.signature ||
      !NETOPIA_CURRENT_CONFIG.publicKey
    ) {
      throw new Error("Netopia configuration missing");
    }

    console.log("🏪 Processing marketplace payment:", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      listingId: paymentData.listingId,
      seller: paymentData.sellerId,
      buyer: paymentData.buyerId,
    });

    // Inițiază plata
    const result = await initiateMarketplacePayment(paymentData);

    // Returnează form-ul 3DS
    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "text/html",
      },
      body: result.form3DS,
    };
  } catch (error) {
    console.error("🚨 Error processing marketplace payment request:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to initiate marketplace payment",
        message: error.message,
      }),
    };
  }
};
