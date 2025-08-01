// Quick CORS test for netopia-v2-api
async function testCORS() {
  try {
    console.log(
      "🧪 Testing CORS for netopia-v2-api with Cache-Control header..."
    );

    const response = await fetch(
      "http://localhost:8888/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "text/html,application/json,*/*",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          orderId: "test-cors-123",
          amount: 100,
          currency: "RON",
          description: "Test CORS",
          customerInfo: {
            firstName: "Test",
            lastName: "User",
            email: "test@test.com",
            phone: "0700000000",
            city: "Bucharest",
            county: "Bucharest",
            address: "Test Address",
            postalCode: "010000",
          },
        }),
      }
    );

    console.log("✅ CORS Test SUCCESS!");
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text.substring(0, 200) + "...");
  } catch (error) {
    console.error("❌ CORS Test FAILED!");
    console.error("Error:", error.message);
    console.error("Error type:", error.constructor.name);
  }
}

testCORS();
