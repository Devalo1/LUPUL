/**
 * Test pentru NETOPIA sandbox mode în producție
 */

const testData = {
  orderId: `TEST-SANDBOX-${Date.now()}`,
  amount: 29.99,
  currency: "RON",
  description: "Test sandbox payment",
  live: false, // FORȚEAZĂ sandbox mode
  customerInfo: {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "+40712345678",
    address: "Test Address",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010101",
  },
};

async function testSandboxMode() {
  try {
    console.log("🧪 Testing NETOPIA production sandbox mode...");
    console.log("📡 Making request to production endpoint...");
    console.log("🔍 Payload:", {
      orderId: testData.orderId,
      amount: testData.amount,
      live: testData.live,
    });

    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    console.log("📨 Response status:", response.status);
    console.log(
      "📨 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS! Sandbox payment initiated:");
      console.log("🔗 Payment URL:", data.paymentUrl);
      console.log("🆔 Order ID:", data.orderId);
      console.log("🌍 Environment:", data.environment);
      console.log("📋 Full response:", data);

      // Verifică că URL-ul conține sandbox
      if (data.paymentUrl && data.paymentUrl.includes("sandbox")) {
        console.log("✅ Confirmed: Using SANDBOX environment");
      } else {
        console.log("⚠️  Warning: URL doesn't contain 'sandbox'");
      }
    } else {
      console.log("❌ Error response:", data);
    }
  } catch (error) {
    console.error("🚨 Test failed:", error.message);
  }
}

testSandboxMode();
