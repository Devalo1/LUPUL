/**
 * Script pentru testarea endpoint-urilor NETOPIA
 * Verifică disponibilitatea API-urilor și răspunsurile primite
 */

const endpoints = [
  {
    name: "NETOPIA Production v2/Standard",
    url: "https://secure.netopia-payments.com/payment/card",
    method: "POST",
  },
  {
    name: "NETOPIA Production v3 (de testat)",
    url: "https://secure.netopia-payments.com/payment/card/start",
    method: "POST",
  },
  {
    name: "NETOPIA Sandbox v2/Standard",
    url: "https://secure.sandbox.netopia-payments.com/payment/card",
    method: "POST",
  },
  {
    name: "NETOPIA Sandbox v3 (de testat)",
    url: "https://secure.sandbox.netopia-payments.com/payment/card/start",
    method: "POST",
  },
];

const testPayload = {
  config: {
    emailTemplate: "",
    emailSubject: "",
    notifyUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
    redirectUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-return",
    language: "ro",
  },
  payment: {
    options: {
      installments: 0,
      bonus: 0,
    },
    instrument: {
      type: "card",
      account: "",
      expMonth: "",
      expYear: "",
      secretCode: "",
      token: "",
    },
    data: {},
  },
  order: {
    ntpID: "",
    posSignature: "TEST_SIGNATURE",
    dateTime: new Date().toISOString(),
    description: "Test payment lupulsicorbul.com",
    orderID: "TEST_" + Date.now(),
    amount: 10.0,
    currency: "RON",
    billing: {
      email: "test@lupulsicorbul.com",
      phone: "+40712345678",
      firstName: "Test",
      lastName: "Customer",
      city: "Bucuresti",
      country: 642,
      countryName: "Romania",
      state: "Bucuresti",
      postalCode: "123456",
      details: "Strada Test 1",
    },
    shipping: {
      email: "test@lupulsicorbul.com",
      phone: "+40712345678",
      firstName: "Test",
      lastName: "Customer",
      city: "Bucuresti",
      country: 642,
      state: "Bucuresti",
      postalCode: "123456",
      details: "Strada Test 1",
    },
    products: [
      {
        name: "Produs test",
        code: "TEST_001",
        category: "digital",
        price: 10.0,
        vat: 19,
      },
    ],
    installments: {
      selected: 0,
      available: [0],
    },
    data: {},
  },
};

async function testEndpoint(endpoint) {
  console.log(`\n🧪 Testing: ${endpoint.name}`);
  console.log(`📍 URL: ${endpoint.url}`);

  try {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "LUPUL-SICORBUL-TEST/1.0",
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`✅ Status: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get("content-type") || "";
    console.log(`📋 Content-Type: ${contentType}`);

    // Încercăm să citim răspunsul
    let responseText = "";
    try {
      responseText = await response.text();
      console.log(`📄 Response length: ${responseText.length} characters`);

      if (contentType.includes("application/json")) {
        try {
          const jsonData = JSON.parse(responseText);
          console.log(
            `🔍 JSON Response:`,
            JSON.stringify(jsonData, null, 2).slice(0, 500)
          );
        } catch (jsonError) {
          console.log(`❌ JSON Parse Error: ${jsonError.message}`);
        }
      } else if (contentType.includes("text/html")) {
        console.log(`🌐 HTML Response detected`);
        if (
          responseText.includes("Page not found") ||
          responseText.includes("404")
        ) {
          console.log(`❌ 404 Page - Endpoint not available`);
        }
        console.log(`📄 HTML Preview: ${responseText.slice(0, 200)}...`);
      } else {
        console.log(`📄 Text Response: ${responseText.slice(0, 200)}...`);
      }
    } catch (readError) {
      console.log(`❌ Error reading response: ${readError.message}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
}

async function runTests() {
  console.log("🚀 NETOPIA Endpoint Testing Started");
  console.log("=" + "=".repeat(50));

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }

  console.log("\n" + "=".repeat(51));
  console.log("✅ Testing completed!");
  console.log("\n💡 Recommendations:");
  console.log(
    "- Folosește endpoint-ul /payment/card (standard) nu /payment/card/start"
  );
  console.log("- Verifică că API v3 este efectiv live în producție");
  console.log("- Configurează corect POS signature pentru request-uri");
}

// Rulează testele
runTests().catch(console.error);
