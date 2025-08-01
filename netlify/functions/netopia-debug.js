/**
 * 🔧 NETOPIA DEBUG FUNCTION
 * 
 * Versiune simplificată pentru debugging care nu face request real către NETOPIA
 */

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let paymentData;
  try {
    let rawBody = event.body || '';
    if (event.isBase64Encoded) {
      rawBody = Buffer.from(rawBody, 'base64').toString('utf-8');
    }
    paymentData = JSON.parse(rawBody || '{}');
  } catch (e) {
    paymentData = {};
  }

  const baseUrl = process.env.URL || 'https://lupulsicorbul.com';
  const isProduction = baseUrl.includes('lupulsicorbul.com');
  const hasLiveSignature = Boolean(process.env.NETOPIA_LIVE_SIGNATURE);
  const hasLiveApiKey = Boolean(process.env.NETOPIA_LIVE_API_KEY);
  const useLive = paymentData.live === true || (isProduction && hasLiveSignature);

  const debugInfo = {
    success: true,
    message: 'NETOPIA Debug Function Working',
    timestamp: new Date().toISOString(),
    environment: { baseUrl, isProduction, useLive },
    configuration: {
      hasLiveSignature,
      hasLiveApiKey,
      configuredForProduction: hasLiveSignature && hasLiveApiKey
    },
    validation: {
      canProceed: hasLiveSignature && hasLiveApiKey
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(debugInfo, null, 2)
  };
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
      VITE_NETOPIA_SIGNATURE_LIVE: process.env.VITE_NETOPIA_SIGNATURE_LIVE
        ? "SET (length: " + process.env.VITE_NETOPIA_SIGNATURE_LIVE.length + ")"
        : "NOT SET",
      NETOPIA_LIVE_PUBLIC_KEY: process.env.NETOPIA_LIVE_PUBLIC_KEY
        ? "SET (length: " + process.env.NETOPIA_LIVE_PUBLIC_KEY.length + ")"
        : "NOT SET",
      NETOPIA_LIVE_PRIVATE_KEY: process.env.NETOPIA_LIVE_PRIVATE_KEY
        ? "SET (length: " + process.env.NETOPIA_LIVE_PRIVATE_KEY.length + ")"
        : "NOT SET",
      NETOPIA_LIVE_PRIVATE_KEY_B64: process.env.NETOPIA_LIVE_PRIVATE_KEY_B64
        ? "SET (length: " +
          process.env.NETOPIA_LIVE_PRIVATE_KEY_B64.length +
          ")"
        : "NOT SET",
      NETOPIA_LIVE_CERTIFICATE: process.env.NETOPIA_LIVE_CERTIFICATE
        ? "SET (length: " + process.env.NETOPIA_LIVE_CERTIFICATE.length + ")"
        : "NOT SET",
      NETOPIA_LIVE_CERTIFICATE_B64: process.env.NETOPIA_LIVE_CERTIFICATE_B64
        ? "SET (length: " +
          process.env.NETOPIA_LIVE_CERTIFICATE_B64.length +
          ")"
        : "NOT SET",
      VITE_PAYMENT_LIVE_KEY: process.env.VITE_PAYMENT_LIVE_KEY
        ? "SET (" + process.env.VITE_PAYMENT_LIVE_KEY + ")"
        : "NOT SET",
      URL: process.env.URL || "NOT SET",
      NODE_ENV: process.env.NODE_ENV || "NOT SET",
    };

    // Determină modul de funcționare
    const isProductionURL =
      process.env.URL &&
      (process.env.URL.includes("netlify.app") ||
        process.env.URL.includes("lupulsicorbul.com"));

    const liveSignature =
      process.env.NETOPIA_LIVE_SIGNATURE ||
      process.env.VITE_NETOPIA_SIGNATURE_LIVE;

    const hasLiveCredentials = !!(
      liveSignature &&
      NETOPIA_LIVE_PRIVATE_KEY &&
      NETOPIA_LIVE_CERTIFICATE
    );

    const isLive = isProductionURL && hasLiveCredentials;

    const config = {
      mode: isLive ? "LIVE" : "SANDBOX",
      signature: isLive
        ? liveSignature?.substring(0, 10) + "..."
        : "SANDBOX_MODE",
      endpoint: "https://secure.netopia-payments.com/payment/card/start", // Always use live endpoint
      hasCredentials: hasLiveCredentials,
      credentialsDetails: {
        privateKeyLength: NETOPIA_LIVE_PRIVATE_KEY
          ? NETOPIA_LIVE_PRIVATE_KEY.length
          : 0,
        certificateLength: NETOPIA_LIVE_CERTIFICATE
          ? NETOPIA_LIVE_CERTIFICATE.length
          : 0,
        signatureSet: !!liveSignature,
      },
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
            ? "✅ NETOPIA LIVE MODE ACTIVE - 3DS will work correctly"
            : "⚠️ NETOPIA SANDBOX MODE - Missing live credentials or not in production",
          recommendations: isLive
            ? ["Configuration is correct for production payments"]
            : [
                "Check that all NETOPIA live credentials are set in Netlify",
                "Ensure VITE_NETOPIA_SIGNATURE_LIVE is set",
                "Ensure NETOPIA_LIVE_PRIVATE_KEY_B64 is set",
                "Ensure NETOPIA_LIVE_CERTIFICATE_B64 is set",
                "Redeploy after setting environment variables",
              ],
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
