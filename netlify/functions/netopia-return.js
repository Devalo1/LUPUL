/**
 * Netlify Function to handle NETOPIA return callback
 * Redirects to SPA route /order-confirmation with appropriate query params
 */
exports.handler = async (event, context) => {
  console.log("🔙 NETOPIA Return Handler called");
  console.log("Query params:", event.queryStringParameters, "Method:", event.httpMethod);
  try {
    // Parse parameters from GET or POST
    let params = {};
    if (event.httpMethod === "GET") {
      params = event.queryStringParameters || {};
    } else if (event.httpMethod === "POST") {
      try {
        params = JSON.parse(event.body || "{}");
      } catch (e) {
        console.warn("Failed to parse body, falling back to query params:", e);
        params = event.queryStringParameters || {};
      }
    }

    // Extract parameters
    const { orderId, status, paymentId, errorCode, errorMessage } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (orderId) queryParams.set("orderId", orderId);
    if (status) queryParams.set("status", status);
    if (paymentId) queryParams.set("paymentId", paymentId);
    if (errorCode) queryParams.set("errorCode", errorCode);
    if (errorMessage) queryParams.set("errorMessage", errorMessage);

    // Redirect to SPA confirmation page
    const redirectPath = `/order-confirmation?${queryParams.toString()}`;
    console.log("Redirecting to:", redirectPath);
    return {
      statusCode: 302,
      headers: {
        "Location": redirectPath,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
      body: ""
    };
  } catch (error) {
    console.error("Error in return handler:", error);
    // On error, redirect with error status
    const errorRedirect = `/order-confirmation?status=error&errorMessage=${encodeURIComponent("Error processing return")}`;
    return {
      statusCode: 302,
      headers: { "Location": errorRedirect },
      body: ""
    };
  }
};