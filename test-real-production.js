import fetch from "node-fetch";

async function testRealProduction() {
  console.log("🔍 Testing REAL PRODUCTION payment flow...");

  const payload = {
    orderId: `PROD-TEST-${Date.now()}`,
    amount: 1.0, // Suma mică pentru test
    currency: "RON",
    description: "Test producție reală",
    live: true, // EXPLICIT live mode
    customerInfo: {
      firstName: "Test",
      lastName: "Production",
      email: "test@production.com",
      phone: "+40712345678",
      address: "Test Address",
      city: "Bucuresti",
      county: "Bucuresti",
      postalCode: "010101",
    },
  };

  console.log("📤 Payload being sent:");
  console.log(JSON.stringify(payload, null, 2));

  try {
    console.log("🌐 Making request to production function...");
    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    console.log("\n📋 PRODUCTION RESPONSE:");
    console.log("Status:", response.status);
    console.log("Success:", result.success);
    console.log("Environment:", result.environment);
    console.log("PaymentURL:", result.paymentUrl);

    if (result.paymentUrl) {
      const url = new URL(result.paymentUrl);
      console.log("\n🔍 URL BREAKDOWN:");
      console.log("Full URL:", result.paymentUrl);
      console.log("Host:", url.host);

      if (url.host === "secure-sandbox.netopia-payments.com") {
        console.log("❌ PROBLEM: Still going to SANDBOX!");
        console.log(
          "This means the live configuration is not working correctly."
        );
      } else if (url.host === "secure.netopia-payments.com") {
        console.log("✅ SUCCESS: Going to LIVE system!");
      } else {
        console.log("❓ UNKNOWN HOST:", url.host);
      }
    }

    console.log("\n📋 FULL RESPONSE:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testRealProduction();
