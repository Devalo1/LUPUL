import fetch from "node-fetch";

async function testPlatformPaymentFlow() {
  console.log("🔍 Testing EXACT platform payment flow...");

  // Simulez exact ce face frontend-ul când user-ul apasă "Plată cu cardul"
  // Folosesc aceleași date ca pe platformă
  const platformPayload = {
    orderId: `LC-${Date.now()}`,
    amount: 29.99,
    currency: "RON",
    description: `Comandă LC-${Date.now()}`,
    customerInfo: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "+40712345678",
      address: "Strada Test nr. 1",
      city: "București",
      county: "București",
      postalCode: "010101",
    },
    language: "ro",
    returnUrl: "https://lupulsicorbul.com/order-confirmation",
    confirmUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
    // ASTA e cheia - să văd ce trimite frontend-ul
    live: true, // Dacă frontend-ul nu trimite asta sau trimite false, va merge la sandbox
  };

  console.log("📤 Platform payload structure:");
  console.log(JSON.stringify(platformPayload, null, 2));

  try {
    // Exact același request ca frontend-ul
    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "text/html,application/json,*/*",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(platformPayload),
        credentials: "same-origin",
      }
    );

    console.log("📨 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error response:", errorText.substring(0, 500));
      return;
    }

    const result = await response.json();

    console.log("\n🔍 PLATFORM RESPONSE ANALYSIS:");
    console.log("Success:", result.success);
    console.log("Environment:", result.environment);
    console.log("PaymentURL:", result.paymentUrl);
    console.log("NTPID:", result.ntpID);
    console.log("API Version:", result.apiVersion);

    if (result.paymentUrl) {
      const url = new URL(result.paymentUrl);
      console.log("\n🎯 CRITICAL URL CHECK:");
      console.log("Full URL:", result.paymentUrl);
      console.log("Host:", url.host);
      console.log("Protocol:", url.protocol);

      // Verificarea critică
      if (url.host.includes("sandbox")) {
        console.log("❌ PROBLEM CONFIRMED: Still going to SANDBOX!");
        console.log("   This means either:");
        console.log(
          "   1. Frontend sends live:false or missing live parameter"
        );
        console.log("   2. Backend ignores live:true parameter");
        console.log("   3. Environment variables not loaded correctly");
      } else if (url.host === "secure.netopia-payments.com") {
        console.log("✅ SUCCESS: Going to LIVE system!");
      } else {
        console.log("❓ UNKNOWN HOST PATTERN:", url.host);
      }
    }

    // Log pentru debugging
    console.log("\n📋 COMPLETE BACKEND RESPONSE:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

// Testez și cu explicit live:false pentru comparație
async function testSandboxMode() {
  console.log("\n🧪 Testing SANDBOX mode for comparison...");

  const sandboxPayload = {
    orderId: `SANDBOX-${Date.now()}`,
    amount: 1.0,
    currency: "RON",
    description: "Test sandbox",
    customerInfo: {
      firstName: "Test",
      lastName: "Sandbox",
      email: "test@sandbox.com",
      phone: "+40712345678",
      address: "Test Address",
      city: "București",
      county: "București",
      postalCode: "010101",
    },
    live: false, // EXPLICIT sandbox
  };

  try {
    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sandboxPayload),
      }
    );

    const result = await response.json();
    console.log("Sandbox URL:", result.paymentUrl);

    if (result.paymentUrl) {
      const url = new URL(result.paymentUrl);
      console.log("Sandbox Host:", url.host);
    }
  } catch (error) {
    console.error("Sandbox test failed:", error.message);
  }
}

// Rulez ambele teste
console.log("🚀 Starting platform payment flow tests...\n");
await testPlatformPaymentFlow();
await testSandboxMode();
