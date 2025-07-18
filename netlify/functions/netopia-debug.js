/**
 * Funcție Netlify pentru debugging configurației NETOPIA în producție
 */

export const handler = async (event, context) => {
  try {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Content-Type": "application/json",
    };

    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers, body: "" };
    }

    // Verifică variabilele de mediu NETOPIA
    const envVars = {
      NETOPIA_LIVE_SIGNATURE: process.env.NETOPIA_LIVE_SIGNATURE
        ? "SET (length: " + process.env.NETOPIA_LIVE_SIGNATURE.length + ")"
        : "NOT SET",
      NETOPIA_LIVE_PUBLIC_KEY: process.env.NETOPIA_LIVE_PUBLIC_KEY
        ? "SET (length: " + process.env.NETOPIA_LIVE_PUBLIC_KEY.length + ")"
        : "NOT SET",
      NETOPIA_SANDBOX_PUBLIC_KEY: process.env.NETOPIA_SANDBOX_PUBLIC_KEY
        ? "SET"
        : "NOT SET",
      URL: process.env.URL || "NOT SET",
      NODE_ENV: process.env.NODE_ENV || "NOT SET",
    };

    // Determină modul de funcționare
    const isLive =
      process.env.NETOPIA_LIVE_SIGNATURE &&
      process.env.NETOPIA_LIVE_SIGNATURE !== "2ZOW-PJ5X-HYYC-IENE-APZO";

    const config = {
      mode: isLive ? "LIVE" : "SANDBOX",
      signature: isLive
        ? process.env.NETOPIA_LIVE_SIGNATURE?.substring(0, 10) + "..."
        : "2ZOW-PJ5X-HYYC-IENE-APZO",
      endpoint: isLive
        ? "https://secure.netopia-payments.com/payment/card"
        : "https://secure-sandbox.netopia-payments.com/payment/card",
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(
        {
          status: "success",
          timestamp: new Date().toISOString(),
          environment: envVars,
          netopiaConfig: config,
          hostname: event.headers.host,
          message: isLive
            ? "✅ NETOPIA LIVE MODE ACTIVE"
            : "⚠️ NETOPIA SANDBOX MODE (simulare) - Verifică variabilele de mediu",
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
