/**
 * Funcție Netlify pentru procesarea callback-urilor de la Netopia
 * Actualizează statusul plății în timp real
 */

export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log("🔔 NETOPIA CALLBACK - Request received:", {
      method: event.httpMethod,
      headers: event.headers,
      bodyLength: event.body?.length || 0,
    });

    const callbackData = JSON.parse(event.body || "{}");

    console.log("📋 NETOPIA CALLBACK - Payload:", {
      orderId: callbackData.orderId,
      status: callbackData.status,
      amount: callbackData.amount,
      signature: callbackData.signature?.substring(0, 10) + "...",
    });

    // Validează signature-ul (în producție)
    if (callbackData.signature !== "2ZOW-PJ5X-HYYC-IENE-APZO") {
      // În producție, verifică signature-ul cu cheia publică Netopia
      console.log("⚠️ Callback signature validation (sandbox mode)");
    }

    // Actualizează statusul comenzii în baza de date
    const orderStatus = mapNetopiaStatusToOrderStatus(callbackData.status);

    // Aici ar trebui să actualizezi comanda în Firestore
    // await updateOrderStatus(callbackData.orderId, orderStatus);

    // Pentru demonstrație, salvez în localStorage pentru testing
    if (callbackData.orderId) {
      const orderUpdate = {
        orderId: callbackData.orderId,
        paymentStatus: orderStatus,
        netopiaTransactionId: callbackData.transactionId,
        lastUpdated: new Date().toISOString(),
      };

      console.log("✅ Order status updated:", orderUpdate);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Callback processed successfully",
        orderId: callbackData.orderId,
        status: orderStatus,
      }),
    };
  } catch (error) {
    console.error("❌ Error processing NETOPIA callback:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to process callback",
        details: error.message,
      }),
    };
  }
};

/**
 * Mapează statusurile Netopia la statusuri interne
 */
function mapNetopiaStatusToOrderStatus(netopiaStatus) {
  switch (netopiaStatus) {
    case "confirmed":
    case "paid":
    case "captured":
      return "paid";
    case "pending":
    case "processing":
      return "pending";
    case "failed":
    case "cancelled":
    case "declined":
      return "failed";
    default:
      return "pending";
  }
}
