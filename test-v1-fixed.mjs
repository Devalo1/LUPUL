/**
 * Test pentru netopia-initiate-fixed (v1.x cu JSON response)
 */

const testData = {
  orderId: `TEST-V1-${Date.now()}`,
  amount: 12.5,
  currency: "RON",
  description: "Test NETOPIA v1.x Fixed - Lupul și Corbul",
  customerInfo: {
    firstName: "Ion",
    lastName: "Popescu",
    email: "test@lupulsicorbul.com",
    phone: "+40712345678",
    address: "Strada Test 123",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010000",
  },
};

console.log("🧪 Testing NETOPIA v1.x Fixed Implementation");
console.log("==================================================");
console.log("📋 Test Payment Data:");
console.log(JSON.stringify(testData, null, 2));

console.log(
  "🌐 Testing local endpoint: http://localhost:8888/.netlify/functions/netopia-initiate-fixed"
);

try {
  const response = await fetch(
    "http://localhost:8888/.netlify/functions/netopia-initiate-fixed",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    }
  );

  console.log("📡 Response Status:", response.status);
  console.log("📋 Response Headers:");
  for (const [key, value] of response.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }

  const rawResponse = await response.text();
  console.log("📄 Raw Response:");
  console.log(
    rawResponse.substring(0, 500) + (rawResponse.length > 500 ? "..." : "")
  );

  // Încearcă să parseze JSON
  try {
    const jsonResponse = JSON.parse(rawResponse);
    console.log("✅ JSON Response parsed successfully:");
    console.log(JSON.stringify(jsonResponse, null, 2));
  } catch (parseError) {
    console.log("❌ Failed to parse as JSON:", parseError.message);

    // Verifică dacă e HTML
    if (rawResponse.includes("<!DOCTYPE") || rawResponse.includes("<html")) {
      console.log("🔍 Response appears to be HTML (not JSON)");
    }
  }
} catch (error) {
  console.error("🚨 Request failed:", error.message);
}

console.log("==================================================");
console.log("🏁 Test completed");
