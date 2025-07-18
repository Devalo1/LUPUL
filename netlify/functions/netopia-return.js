/**
 * Funcție Netlify pentru gestionarea returnului de la NETOPIA
 * Această funcție procesează returnul utilizatorului după plată
 */

/**
 * Handler principal pentru endpoint-ul de return
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

  try {
    // Parse parametrii din query string sau body
    let params = {};

    if (event.httpMethod === "GET") {
      params = event.queryStringParameters || {};
    } else if (event.httpMethod === "POST") {
      params = JSON.parse(event.body || "{}");
    }

    const { orderId, paymentId, status, errorCode, errorMessage } = params;

    console.log("NETOPIA return received:", {
      orderId,
      paymentId,
      status,
      errorCode,
      errorMessage,
    });

    // Determină URL-ul de redirecționare bazat pe status
    let redirectUrl = process.env.URL || "https://lupul-si-corbul.netlify.app";

    switch (status) {
      case "confirmed":
      case "success":
        redirectUrl += "/checkout-success";
        break;

      case "pending":
        redirectUrl += "/checkout-success?status=pending";
        break;

      case "canceled":
        redirectUrl +=
          "/checkout?status=canceled&message=" +
          encodeURIComponent("Plata a fost anulată");
        break;

      case "failed":
      case "error":
        redirectUrl +=
          "/checkout?status=failed&error=" +
          encodeURIComponent(
            errorMessage || "Plata a eșuat. Vă rugăm să încercați din nou."
          );
        break;

      default:
        redirectUrl +=
          "/checkout?status=unknown&message=" +
          encodeURIComponent("Status plată necunoscut");
    }

    // Adaugă orderId la URL pentru tracking
    if (orderId) {
      const separator = redirectUrl.includes("?") ? "&" : "?";
      redirectUrl += `${separator}orderId=${orderId}`;
    }

    // Pentru GET requests, redirecționează direct
    if (event.httpMethod === "GET") {
      return {
        statusCode: 302,
        headers: {
          ...headers,
          Location: redirectUrl,
        },
        body: "",
      };
    }

    // Pentru POST requests, returnează JSON cu URL-ul de redirecționare
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        redirectUrl,
        orderId,
        status,
        message: "Payment processed successfully",
      }),
    };
  } catch (error) {
    console.error("Error processing NETOPIA return:", error);

    // În caz de eroare, redirecționează către pagina de plată cu eroarea
    const errorUrl =
      (process.env.URL || "https://lupul-si-corbul.netlify.app") +
      "/payment?status=error&error=" +
      encodeURIComponent(error.message);

    if (event.httpMethod === "GET") {
      return {
        statusCode: 302,
        headers: {
          ...headers,
          Location: errorUrl,
        },
        body: "",
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
        redirectUrl: errorUrl,
      }),
    };
  }
};
