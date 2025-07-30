/**
 * Test detaliat pentru a vedea exact ce se întâmplă cu live mode
 */

const testLive = {
  orderId: `TEST-LIVE-${Date.now()}`,
  amount: 29.99,
  currency: "RON",
  description: "Test live payment with real credentials",
  live: true,
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

async function testLiveDetailed() {
  try {
    console.log("🧪 Testing NETOPIA LIVE mode with REAL credentials...");
    console.log("🔍 Payload:", {
      orderId: testLive.orderId,
      amount: testLive.amount,
      live: testLive.live,
    });

    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testLive),
      }
    );

    console.log("📨 Response status:", response.status);
    console.log(
      "📨 Response headers:",
      Object.fromEntries(response.headers.entries())
    );
    console.log("📨 Content-Type:", response.headers.get("content-type"));

    const responseText = await response.text();
    console.log(
      "📨 Raw response (first 200 chars):",
      responseText.substring(0, 200)
    );

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("📋 Parsed JSON response:", data);
    } catch (e) {
      console.log("❌ Response is not JSON:", e.message);
      console.log("📋 Raw response type:", typeof responseText);

      if (responseText.includes("svg") || responseText.includes("SVG")) {
        console.log("🖼️  Response contains SVG - likely NETOPIA error page");
      }
      if (responseText.includes("html") || responseText.includes("HTML")) {
        console.log("🌐 Response contains HTML - likely NETOPIA error page");
      }
      return;
    }

    if (response.ok && data.success) {
      console.log("✅ SUCCESS! Live payment initiated:");
      console.log("🔗 Payment URL:", data.paymentUrl);
      console.log("🆔 Order ID:", data.orderId);
      console.log("🌍 Environment:", data.environment);

      if (data.paymentUrl && !data.paymentUrl.includes("sandbox")) {
        console.log(
          "✅ CONFIRMED: Using LIVE environment (no 'sandbox' in URL)"
        );
      } else if (data.paymentUrl && data.paymentUrl.includes("sandbox")) {
        console.log("⚠️  WARNING: Still using sandbox despite live=true");
      }
    } else {
      console.log("❌ Error in live mode:", data?.message || "Unknown error");
    }
  } catch (error) {
    console.error("🚨 Test failed:", error.message);
  }
}

testLiveDetailed();
