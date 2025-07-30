/**
 * Versiune simplificată a funcției notify pentru testarea NETOPIA
 * Returnează întotdeauna status 200 și confirmă primirea notificării
 */

export const handler = async (event, context) => {
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

  // NETOPIA așteaptă întotdeauna status 200, chiar dacă metoda e greșită
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Method not allowed, expected POST",
        received: true,
      }),
    };
  }

  try {
    console.log("🔮 EMBLEM PAYMENT NOTIFICATION received:", {
      headers: event.headers,
      body: event.body?.substring(0, 200) + "...",
    });

    // Parse notificarea de la Netopia
    let notificationData;

    if (
      event.headers["content-type"]?.includes(
        "application/x-www-form-urlencoded"
      )
    ) {
      // Notificarea vine ca form data
      const params = new URLSearchParams(event.body);
      notificationData = {
        orderId: params.get("orderId"),
        status: params.get("status"),
        amount: params.get("amount"),
        signature: params.get("signature"),
        data: params.get("data"),
      };
    } else {
      // Notificarea vine ca JSON
      notificationData = JSON.parse(event.body);
    }

    console.log("🔮 Parsed notification data:", {
      orderId: notificationData.orderId,
      status: notificationData.status,
      amount: notificationData.amount,
    });

    // Pentru test - acceptă orice semnătură
    // În producție, aici ar trebui verificată semnătura NETOPIA

    // Extrage informațiile despre comandă din orderId
    const orderIdParts = notificationData.orderId.split("_");
    if (orderIdParts.length < 4 || orderIdParts[0] !== "emblem") {
      throw new Error("Invalid emblem order ID format");
    }

    // Parsing logic pentru diferite formate
    let emblemType, userId;

    if (orderIdParts.length === 5) {
      // Format: emblem_cautatorul_lumina_userId_timestamp
      emblemType = orderIdParts[1] + "_" + orderIdParts[2];
      userId = orderIdParts[3];
    } else if (orderIdParts.length === 4) {
      // Format: emblem_tip_userId_timestamp
      emblemType = orderIdParts[1];
      userId = orderIdParts[2];
    } else {
      // Fallback: ultimele 2 părți sunt userId și timestamp
      const emblemTypeParts = orderIdParts.slice(1, -2);
      emblemType = emblemTypeParts.join("_");
      userId = orderIdParts[orderIdParts.length - 2];
    }

    console.log("🔍 Parsed order data:", {
      originalOrderId: notificationData.orderId,
      parts: orderIdParts,
      emblemType: emblemType,
      userId: userId,
    });

    const orderData = {
      orderId: notificationData.orderId,
      emblemType: emblemType,
      userId: userId,
      amount: notificationData.amount,
      status: notificationData.status,
    };

    // Simulează mintarea emblemei (fără Firebase pentru test)
    if (
      notificationData.status === "confirmed" ||
      notificationData.status === "paid"
    ) {
      // Aici ar trebui să mintăm emblema în Firebase
      // Pentru test, simulăm succesul
      const mockEmblemId = `emblem_${userId}_${Date.now()}`;

      console.log("🎉 Emblem minting simulated successfully:", {
        emblemId: mockEmblemId,
        orderId: orderData.orderId,
        userId: orderData.userId,
        emblemType: orderData.emblemType,
        paymentStatus: notificationData.status,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Payment notification processed successfully",
          emblemId: mockEmblemId,
          orderData: orderData,
          paymentStatus: notificationData.status,
        }),
      };
    } else {
      console.log("⏳ Payment not yet confirmed:", {
        orderId: orderData.orderId,
        status: notificationData.status,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Payment status recorded - awaiting confirmation",
          status: notificationData.status,
          orderData: orderData,
        }),
      };
    }
  } catch (error) {
    console.error("🚨 Error processing emblem payment notification:", error);

    // IMPORTANT: NETOPIA se așteaptă întotdeauna la status 200
    // Chiar dacă apare o eroare, returnăm 200 pentru a evita retrimiterea
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to process payment notification",
        message: error.message,
        received: true, // Confirmăm că am primit notificarea
      }),
    };
  }
};
