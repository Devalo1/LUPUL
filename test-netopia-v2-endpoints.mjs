/**
 * Test pentru a găsi endpoint-ul corect pentru NETOPIA API v2.x
 * Testez diferite URL-uri posibile pentru API v2.x
 */

// API KEY pentru testare (din .env)
const API_KEY = "VfjsAdVjct7hQkMXRHKlimzmGGUHztw1e-C1PmvUoBlxkHs05BeWPpx0SXgV";

// Endpoint-uri posibile pentru NETOPIA API v2.x
const ENDPOINTS_TO_TEST = [
  "https://sandbox.netopia-payments.com/payment/card/start",
  "https://sandbox.netopia-payments.com/api/payment/card/start",
  "https://sandbox.netopia-payments.com/api/v2/payment/card/start",
  "https://sandbox.netopia-payments.com/api/v2.x/payment/card/start",
  "https://secure.netopia-payments.com/payment/card/start", // Live pentru comparație
];

// Payload de test minim
const testPayload = {
  config: {
    emailTemplate: "",
    notifyUrl: "https://lupulsicorbul.com/webhook/netopia",
    redirectUrl: "https://lupulsicorbul.com/payment/return",
    language: "ro",
  },
  payment: {
    options: {
      installments: 1,
      bonus: 0,
    },
    instrument: {
      type: "card",
      account: "",
      expMonth: 0,
      expYear: 0,
      secretCode: "",
      token: "",
    },
  },
  order: {
    ntpID: "",
    posSignature: "",
    dateTime: new Date().toISOString(),
    description: "Test API v2.x",
    orderID: "TEST-V2-" + Date.now(),
    amount: 1.0,
    currency: "RON",
    billing: {
      email: "test@lupulsicorbul.com",
      phone: "+40700000000",
      firstName: "Test",
      lastName: "User",
      city: "Bucuresti",
      country: 642,
      countryName: "Romania",
      state: "Bucuresti",
      postalCode: "010000",
      details: "Test address",
    },
    products: [
      {
        name: "Test Product",
        code: "TEST001",
        category: "Testing",
        price: 1.0,
        vat: 19,
        quantity: 1,
      },
    ],
  },
};

async function testEndpoint(url) {
  console.log(`\n🧪 Testing endpoint: ${url}`);
  console.log("─".repeat(80));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: API_KEY,
        "User-Agent": "LupulSiCorbul/1.0 Test",
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.headers.get("content-type")}`);

    const responseText = await response.text();

    // Verifică dacă răspunsul este JSON sau HTML
    if (response.headers.get("content-type")?.includes("application/json")) {
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log("✅ JSON Response:", JSON.stringify(jsonResponse, null, 2));
        return { success: true, data: jsonResponse };
      } catch (e) {
        console.log("⚠️  Invalid JSON response");
        return { success: false, error: "Invalid JSON" };
      }
    } else {
      // HTML response - probabil 404 sau eroare
      if (
        responseText.includes("Page not found") ||
        responseText.includes("404")
      ) {
        console.log("❌ 404 - Endpoint not found");
        return { success: false, error: "404 Not Found" };
      } else {
        console.log("🔍 HTML Response (first 200 chars):");
        console.log(responseText.substring(0, 200) + "...");
        return { success: false, error: "HTML response" };
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log("🚀 NETOPIA API v2.x Endpoint Discovery");
  console.log("=".repeat(80));
  console.log(`🔑 Using API KEY: ${API_KEY.substring(0, 15)}...`);
  console.log(`📦 Test payload order ID: ${testPayload.order.orderID}`);

  const results = [];

  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(endpoint);
    results.push({
      endpoint,
      ...result,
    });

    // Pauză între cereri pentru a nu suprasolicita serverele
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n📊 SUMMARY RESULTS");
  console.log("=".repeat(80));

  results.forEach((result) => {
    const status = result.success ? "✅ SUCCESS" : "❌ FAILED";
    console.log(`${status} - ${result.endpoint}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const successfulEndpoints = results.filter((r) => r.success);
  if (successfulEndpoints.length > 0) {
    console.log(
      `\n🎉 Found ${successfulEndpoints.length} working endpoint(s)!`
    );
  } else {
    console.log(
      "\n⚠️  No working endpoints found. API v2.x might not be available yet or requires different authentication."
    );
  }
}

main().catch(console.error);
