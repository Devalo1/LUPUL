/**
 * NETOPIA Production Test Handler
 * Handler special pentru testarea în producție care evită SVG redirect-ul
 * prin returnarea ÎNTOTDEAUNA a simulării pentru comenzile TEST-*
 */

import { handler as browserFixHandler } from "./netopia-browser-fix.js";

export const handler = async (event, context) => {
  console.log("🧪 NETOPIA Production Test - Override pentru comenzile TEST");

  // Parse request body pentru a verifica dacă e comandă TEST
  let paymentData;
  try {
    let rawBody = event.body || "";
    if (event.isBase64Encoded) {
      rawBody = Buffer.from(rawBody, "base64").toString("utf-8");
    }
    paymentData = JSON.parse(rawBody || "{}");
  } catch (e) {
    console.error("❌ JSON Parse Error:", e.message);
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  // Dacă e comandă TEST în producție, FORȚEAZĂ simularea
  if (paymentData.orderId && paymentData.orderId.includes("TEST-")) {
    console.log(
      "🚨 TEST order detected in production - FORCING simulation mode"
    );

    const baseUrl = process.env.URL || "https://lupulsicorbul.com";
    const simulationUrl = `${baseUrl}/payment-simulation?orderId=${paymentData.orderId}&amount=${paymentData.amount}&currency=${paymentData.currency}&test=1&forced=true`;

    const corsHeaders = {
      "Access-Control-Allow-Origin": event.headers.origin || "*",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent, Cache-Control",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    };

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        paymentUrl: simulationUrl,
        orderId: paymentData.orderId,
        mode: "forced-simulation",
        reason: "TEST order in production - SVG redirect prevention",
      }),
    };
  }

  // Pentru comenzile non-TEST, folosește handler-ul normal
  console.log("📦 Non-TEST order - using normal browser fix handler");
  return browserFixHandler(event, context);
};
