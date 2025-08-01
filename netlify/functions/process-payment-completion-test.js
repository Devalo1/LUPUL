/**
 * Versiune de test pentru process-payment-completion
 * Fără Firebase pentru a testa logica de detecție a emblemelor
 */

export const handler = async (event, context) => {
  console.log("🧪 TEST: Payment completion function called");
  console.log("🧪 TEST: Event method:", event.httpMethod);
  console.log("🧪 TEST: Headers:", JSON.stringify(event.headers, null, 2));

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const requestData = JSON.parse(event.body);
    console.log("🧪 TEST: Request data:", JSON.stringify(requestData, null, 2));

    const { ntpID, orderId, orderData, amount, currency, status } = requestData;

    if (!orderId) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Order ID is required" }),
      };
    }

    console.log("🧪 TEST: Order ID:", orderId);
    console.log("🧪 TEST: Status:", status);

    // Check for emblem processing
    if (orderData && orderData.items) {
      console.log("🧪 TEST: Processing items:", orderData.items.length);

      const emblemItems = orderData.items.filter(
        (item) => item.id && item.id.startsWith("emblem_")
      );

      if (emblemItems.length > 0) {
        console.log("🔮 TEST: Found emblem items:", emblemItems.length);
        console.log("🔮 TEST: Emblem details:");

        emblemItems.forEach((emblem, index) => {
          const emblemType = emblem.id.replace("emblem_", "");
          console.log(`🔮 TEST: Emblem ${index + 1}:`, {
            id: emblem.id,
            name: emblem.name,
            type: emblemType,
            userId: orderData.userId,
            orderId: orderId,
          });
        });

        console.log(
          "🔮 TEST: Would create emblems in Firebase (disabled for test)"
        );
      } else {
        console.log("ℹ️ TEST: No emblem items found in order");
      }
    } else {
      console.log("⚠️ TEST: No items found in orderData");
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: true,
        message: "Test completed successfully",
        orderProcessed: orderId,
        emblemItemsFound:
          orderData?.items?.filter((item) => item.id?.startsWith("emblem_"))
            ?.length || 0,
      }),
    };
  } catch (error) {
    console.error("🚨 TEST: Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};
