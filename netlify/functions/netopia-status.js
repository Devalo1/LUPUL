/**
 * Funcție Netlify pentru verificarea statusului plăților NETOPIA
 * Această funcție verifică statusul unei comenzi în sistemul NETOPIA
 */

// Configurație NETOPIA
const NETOPIA_CONFIG = {
  sandbox: {
    signature: "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.sandbox.netopia-payments.com/query",
    publicKey: process.env.NETOPIA_SANDBOX_PUBLIC_KEY,
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE,
    endpoint: "https://secure.netopia-payments.com/query",
    publicKey: process.env.NETOPIA_LIVE_PUBLIC_KEY,
  },
};

/**
 * Simulează verificarea statusului pentru sandbox
 */
function simulateStatusCheck(orderId) {
  // Simulare pentru dezvoltare
  const statuses = ["pending", "confirmed", "failed"];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    orderId,
    status: randomStatus,
    amount: 5000, // 50.00 RON în bani
    currency: "RON",
    timestamp: new Date().toISOString(),
    paymentId: `PAY${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    method: "card",
    card: {
      masked: "****-****-****-1234",
      type: "VISA",
    },
  };
}

/**
 * Verifică statusul plății la NETOPIA
 */
async function checkNetopiaStatus(orderId, config) {
  try {
    // Pentru sandbox, simulăm verificarea
    if (config.signature === "2ZOW-PJ5X-HYYC-IENE-APZO") {
      console.log("Live mode: Making real API call to NETOPIA for", orderId);

      // Verifică dacă este o comandă de test (LP + caractere random)
      if (orderId.startsWith("LP") && orderId.length > 10) {
        console.log("Test order detected in live mode, using simulation");
        return simulateStatusCheck(orderId);
      }
    } else {
      console.log("Sandbox mode: Simulating status check for", orderId);
      return simulateStatusCheck(orderId);
    }

    // În producție, aici ar fi request-ul real către NETOPIA API
    const queryData = {
      action: "status",
      signature: config.signature,
      orderId: orderId,
    };

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NETOPIA-Signature": config.signature,
      },
      body: JSON.stringify(queryData),
    });

    if (!response.ok) {
      throw new Error(
        `NETOPIA API error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    return {
      orderId: result.orderId || orderId,
      status: result.status || "unknown",
      amount: result.amount,
      currency: result.currency || "RON",
      timestamp: result.timestamp || new Date().toISOString(),
      paymentId: result.paymentId,
      method: result.method,
      card: result.card,
    };
  } catch (error) {
    console.error("Error checking NETOPIA status:", error);
    throw error;
  }
}

/**
 * Handler principal pentru endpoint-ul de status
 */
export const handler = async (event, context) => {
  // Headers CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

  // Acceptă GET și POST requests
  if (!["GET", "POST"].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    let orderId,
      isLive = false;

    // Extrage parametrii din request
    if (event.httpMethod === "GET") {
      orderId = event.queryStringParameters?.orderId;
      isLive = event.queryStringParameters?.live === "true";
    } else {
      const body = JSON.parse(event.body || "{}");
      orderId = body.orderId;
      isLive = body.live === true;
    }

    if (!orderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing orderId parameter" }),
      };
    }

    console.log("Checking NETOPIA status for order:", orderId);
    console.log("Using live mode:", isLive);

    // Determină configurația
    const config = isLive ? NETOPIA_CONFIG.live : NETOPIA_CONFIG.sandbox;
    console.log("Config signature:", config.signature);
    console.log("Config endpoint:", config.endpoint);

    // Verifică configurația
    if (isLive && !config.signature) {
      throw new Error("NETOPIA live configuration not found");
    }

    // Verifică statusul la NETOPIA
    const status = await checkNetopiaStatus(orderId, config);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: status,
        message: "Status retrieved successfully",
      }),
    };
  } catch (error) {
    console.error("Error in NETOPIA status check:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Status check failed",
        message: error.message,
      }),
    };
  }
};
