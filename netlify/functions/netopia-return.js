/**
 * Netlify Function to handle NETOPIA return callback
 * Redirects to SPA route /order-confirmation with appropriate query params
 * AND restores order data in sessionStorage from cookie backup
 */
export const handler = async (event, context) => {
  console.log("🔙 NETOPIA Return Handler called");
  console.log(
    "Query params:",
    event.queryStringParameters,
    "Method:",
    event.httpMethod
  );
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

    // Extract parameters - handle duplicate orderId from NETOPIA
    let { orderId, status, paymentId, errorCode, errorMessage } = params;

    // Fix duplicate orderId issue (NETOPIA sometimes sends orderId=ID1&orderId=ID2)
    if (orderId && typeof orderId === "string" && orderId.includes(",")) {
      orderId = orderId.split(",")[0].trim(); // Take first orderId
      console.log("🔧 Fixed duplicate orderId, using:", orderId);
    }

    // 🆕 RESTORE SESSION DATA - Recuperează datele din cookie și le salvează în sessionStorage
    let sessionBackupData = null; // Declarăm variabila în scope-ul principal

    if (orderId) {
      try {
        // Caută cookie pentru această comandă
        const cookies = event.headers.cookie || "";
        console.log("🍪 DEBUG: All cookies received:", cookies);
        console.log(
          "🔍 DEBUG: Looking for cookie pattern:",
          `orderRecovery_${orderId}`
        );

        const cookieMatch = cookies.match(
          new RegExp(`orderRecovery_${orderId}=([^;]+)`)
        );

        console.log("🔍 DEBUG: Cookie match result:", cookieMatch);

        if (cookieMatch) {
          const cookieValue = decodeURIComponent(cookieMatch[1]);

          // Funcție pentru decodare Unicode-safe (match cu encoding-ul din Checkout.tsx)
          const unicodeBase64Decode = (str) => {
            return decodeURIComponent(
              atob(str)
                .split("")
                .map(
                  (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
            );
          };

          const recoveryData = JSON.parse(unicodeBase64Decode(cookieValue));

          console.log("🍪 Recovery data found in cookie for:", orderId);
          console.log("📧 Customer email recovered:", recoveryData.email);

          // Formatează datele pentru sessionStorage (formatul așteptat de OrderConfirmation)
          sessionBackupData = {
            orderId: orderId,
            customerInfo: {
              firstName: recoveryData.customerName.split(" ")[0] || "Client",
              lastName:
                recoveryData.customerName.split(" ").slice(1).join(" ") ||
                "Recuperat",
              email: recoveryData.email,
              phone: recoveryData.phone,
              address: recoveryData.address,
              city: recoveryData.city,
              county: recoveryData.county,
            },
            amount: parseFloat(recoveryData.amount),
            description: `Comandă Lupul și Corbul - Recuperat din cookie`,
            timestamp: recoveryData.timestamp,
            source: "NetopiaReturn-CookieRecovery",
          };

          console.log(
            "💾 Restoring sessionStorage with real customer data:",
            sessionBackupData.customerInfo.email
          );

          // IMPORTANT: Aceste date vor fi disponibile în browser la încărcarea OrderConfirmation
          // Nu putem seta direct sessionStorage aici (server-side), dar putem include datele în redirect
        } else {
          console.log("⚠️ No cookie recovery data found for orderId:", orderId);
        }
      } catch (cookieError) {
        console.error("❌ Error processing cookie recovery:", cookieError);
      }
    }

    // Build query string
    const queryParams = new URLSearchParams();

    // 🆕 FALLBACK LOCAL DEVELOPMENT - Adaugă parametru special pentru development local când nu avem cookies
    const isLocalDev =
      event.headers.host && event.headers.host.includes("localhost");
    const hasCookieData = sessionBackupData !== null;

    if (isLocalDev && !hasCookieData) {
      console.log(
        "🔧 LOCAL DEV: Activating fallback recovery mode - no cookies found on localhost"
      );
      queryParams.set("localFallback", "true");
    }
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
        Location: redirectPath,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      body: "",
    };
  } catch (error) {
    console.error("Error in return handler:", error);
    // On error, redirect with error status
    const errorRedirect = `/order-confirmation?status=error&errorMessage=${encodeURIComponent("Error processing return")}`;
    return {
      statusCode: 302,
      headers: { Location: errorRedirect },
      body: "",
    };
  }
};
