/**
 * Test detaliat pentru NETOPIA live pentru a vedea exact ce se întâmplă
 */

const testLive = {
  orderId: `TEST-LIVE-DETAILED-${Date.now()}`,
  amount: 29.99,
  currency: "RON",
  description: "Test live detailed",
  live: true,
  customerInfo: {
    firstName: "Test",
    lastName: "Live",
    email: "test@live.com",
    phone: "+40712345678",
    address: "Test Address",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010101",
  },
};

async function testLiveDetailed() {
  try {
    console.log("🧪 Testing NETOPIA LIVE with detailed logging...");
    console.log("📤 Sending payload:", JSON.stringify(testLive, null, 2));

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

    const text = await response.text();
    console.log(
      "📨 Raw response text:",
      text.substring(0, 500) + (text.length > 500 ? "..." : "")
    );

    try {
      const data = JSON.parse(text);
      console.log("📋 Parsed response:", JSON.stringify(data, null, 2));

      if (data.error) {
        console.log("❌ Error detected:", data.error);
        console.log("💬 Error message:", data.message);
      } else {
        console.log("✅ Success response received");
        console.log("🔗 Payment URL:", data.paymentUrl);
        console.log("🌍 Environment:", data.environment);
      }
    } catch (parseError) {
      console.log("❌ Failed to parse JSON response");
      console.log("📄 Response is not JSON, content:", text.substring(0, 200));
    }
  } catch (error) {
    console.error("🚨 Request failed:", error.message);
  }
}

testLiveDetailed();
