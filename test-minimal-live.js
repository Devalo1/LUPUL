/**
 * Test simplu pentru NETOPIA live cu configurația minimă
 */

const testLive = {
  orderId: `TEST-LIVE-${Date.now()}`,
  amount: 29.99,
  currency: "RON",
  description: "Test live payment",
  live: true, // FORȚEAZĂ live mode
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

async function testLiveMinimal() {
  try {
    console.log("🧪 Testing NETOPIA LIVE with minimal config change...");
    console.log("🔑 Only API KEY changed for live mode");

    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testLive),
      }
    );

    console.log("📨 Response status:", response.status);
    console.log(
      "📨 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS! Live payment initiated:");
      console.log("🔗 Payment URL:", data.paymentUrl);
      console.log("🌍 Environment:", data.environment);
      console.log(
        "🔍 URL check - contains 'sandbox':",
        data.paymentUrl?.includes("sandbox")
      );
      console.log(
        "🔍 URL check - contains 'secure.netopia-payments.com':",
        data.paymentUrl?.includes("secure.netopia-payments.com")
      );
    } else {
      console.log("❌ Error response:", data);

      // Check if it's trying live but getting authentication error
      if (data.message?.includes("svg") || data.message?.includes("image")) {
        console.log(
          "✅ GOOD: Function is trying LIVE mode (NETOPIA authentication issue expected)"
        );
      }
    }
  } catch (error) {
    console.error("🚨 Test failed:", error.message);
  }
}

testLiveMinimal();
