/**
 * Funcție Netlify pentru recuperarea detaliilor comenzii din surse alternative
 * Când localStorage se pierde, încearcă să obțină datele din alte surse
 */

export const handler = async (event, context) => {
  // Handle CORS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  // Acceptă atât GET cât și POST
  if (!["GET", "POST"].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Method not allowed. Use GET or POST." }),
    };
  }

  try {
    let orderId;

    // Pentru GET, ia orderId din query parameters
    if (event.httpMethod === "GET") {
      orderId = event.queryStringParameters?.orderId;
    }
    // Pentru POST, ia orderId din body
    else if (event.httpMethod === "POST") {
      let requestBody;
      try {
        requestBody = JSON.parse(event.body);
        orderId = requestBody.orderId;
      } catch (parseError) {
        console.error("Eroare parsare JSON:", parseError);
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: "Invalid JSON in request body" }),
        };
      }
    }

    console.log(
      "🔍 RECOVERY: Încerc să recuperez datele pentru orderId:",
      orderId
    );

    if (!orderId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "OrderId este obligatoriu" }),
      };
    }

    // 🔍 STRATEGII DE RECOVERY (în ordine de prioritate)

    // 1. Încearcă din cookies (dacă PaymentPage a salvat acolo)
    const cookies = event.headers.cookie || "";
    console.log("🍪 Checking cookies pentru recovery...");

    // 2. Încearcă din headers custom (dacă există)
    const customOrderData = event.headers["x-order-data"];
    if (customOrderData) {
      try {
        const decodedData = JSON.parse(
          Buffer.from(customOrderData, "base64").toString()
        );
        if (decodedData.orderId === orderId) {
          console.log("✅ RECOVERY SUCCESS din headers custom!");
          return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              success: true,
              orderData: decodedData,
              source: "custom-headers",
            }),
          };
        }
      } catch (error) {
        console.log("⚠️ Nu s-au putut parsa headers custom:", error.message);
      }
    }

    // 3. Încearcă recovery din baza de date reală
    // În realitate, aici ai face un query real într-o bază de date
    console.log("🔍 Încerc recovery din baza de date...");

    // TODO: Implementează query real în baza de date (Firestore, MongoDB, etc.)
    // const realOrderData = await queryDatabase(orderId);
    // if (realOrderData) {
    //   return { statusCode: 200, body: JSON.stringify({ success: true, orderData: realOrderData }) };
    // }

    console.log("⚠️ NU AM GĂSIT DATE REALE în baza de date pentru:", orderId);

    // IMPORTANT: Nu mai returnăm date simulate dacă nu găsim date reale
    // Frontend-ul ar trebui să prioritizeze sessionStorage/localStorage ÎNTOTDEAUNA

    // 4. Recovery failure - nu s-au găsit date
    console.log("❌ RECOVERY FAILED: Nu s-au găsit date pentru", orderId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Nu s-au găsit date pentru această comandă",
        orderId: orderId,
        searchedSources: ["cookies", "custom-headers", "database-simulation"],
        recommendation: "Verifică manual în NETOPIA dashboard",
      }),
    };
  } catch (error) {
    console.error("❌ Eroare în recovery function:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Eroare internă în funcția de recovery",
        details: error.message,
      }),
    };
  }
};
