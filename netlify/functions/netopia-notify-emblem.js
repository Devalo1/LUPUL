/**
 * Funcție Netlify pentru procesarea notificărilor NETOPIA pentru embleme NFT
 * Această funcție este apelată de NETOPIA când statusul plății se schimbă
 */

export const handler = async (event, context) => {
  console.log("🔮 NETOPIA EMBLEM NOTIFY - Request received:", {
    method: event.httpMethod,
    headers: event.headers,
    queryParams: event.queryStringParameters,
    body: event.body,
    timestamp: new Date().toISOString(),
  });

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    // Parse notification data from NETOPIA
    let notificationData = {};

    // NETOPIA poate trimite date prin POST body sau query parameters
    if (event.body) {
      try {
        notificationData = JSON.parse(event.body);
      } catch (e) {
        // Poate fi form-encoded
        const formData = new URLSearchParams(event.body);
        notificationData = Object.fromEntries(formData);
      }
    }

    // Merge cu query parameters
    if (event.queryStringParameters) {
      notificationData = {
        ...notificationData,
        ...event.queryStringParameters,
      };
    }

    console.log("🔮 EMBLEM NOTIFY - Parsed notification data:", {
      ntpID: notificationData.ntpID,
      orderID: notificationData.orderID,
      amount: notificationData.amount,
      status: notificationData.status,
      errorCode: notificationData.errorCode,
      errorMessage: notificationData.errorMessage,
      allData: notificationData,
    });

    const { ntpID, orderID, amount, status, errorCode, errorMessage } =
      notificationData;

    // Validare date obligatorii
    if (!ntpID || !orderID) {
      console.error("❌ EMBLEM NOTIFY - Missing required fields:", {
        ntpID: !!ntpID,
        orderID: !!orderID,
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required notification fields",
          required: ["ntpID", "orderID"],
        }),
      };
    }

    // Procesează notificarea pe baza statusului
    let processingResult = {
      processed: false,
      action: "none",
      emblemStatus: "pending",
    };

    switch (status) {
      case "confirmed":
      case "paid":
        console.log(
          "✅ EMBLEM PAYMENT CONFIRMED - Processing emblem activation"
        );
        processingResult = {
          processed: true,
          action: "activate_emblem",
          emblemStatus: "active",
          message: "Emblem NFT activated successfully",
        };

        // Aici ar trebui să activezi emblema în baza de date
        // Exemplu: await activateEmblemNFT(orderID, ntpID);

        break;

      case "pending":
        console.log("⏳ EMBLEM PAYMENT PENDING - Waiting for confirmation");
        processingResult = {
          processed: true,
          action: "wait",
          emblemStatus: "pending",
          message: "Emblem payment is pending confirmation",
        };
        break;

      case "canceled":
      case "expired":
        console.log("❌ EMBLEM PAYMENT CANCELED/EXPIRED");
        processingResult = {
          processed: true,
          action: "cancel_emblem",
          emblemStatus: "cancelled",
          message: "Emblem purchase was cancelled or expired",
        };
        break;

      default:
        console.warn("⚠️ EMBLEM - Unknown payment status:", status);
        processingResult = {
          processed: false,
          action: "log_unknown",
          emblemStatus: "unknown",
          message: `Unknown payment status: ${status}`,
        };
    }

    // Log pentru debugging
    console.log("🔮 EMBLEM PROCESSING RESULT:", {
      orderID,
      ntpID,
      status,
      processingResult,
      timestamp: new Date().toISOString(),
    });

    // Returnează success la NETOPIA (important pentru confirmarea notificării)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Emblem notification processed successfully",
        orderID,
        ntpID,
        status,
        emblemStatus: processingResult.emblemStatus,
        action: processingResult.action,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("🚨 EMBLEM NOTIFY ERROR:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Internal server error processing emblem notification",
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
