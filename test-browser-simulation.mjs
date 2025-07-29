// Test exact ca în browser pentru v1.x
const testData = {
  orderId: `TEST-BROWSER-${Date.now()}`,
  amount: 500,
  currency: "RON",
  description: "Test Lupul și Corbul - Plată Card",
  customerInfo: {
    firstName: "Test",
    lastName: "User",
    email: "test@lupulsicorbul.com",
    phone: "+40712345678",
    address: "Strada Test 123",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010000",
  },
};

console.log("🧪 Testing exact browser simulation for v1.x");
console.log("Data:", testData);

// Simulate exact browser call
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

  const responseText = await response.text();
  console.log("📄 Response Text:", responseText);

  if (response.ok) {
    try {
      const json = JSON.parse(responseText);
      console.log("✅ SUCCESS - JSON Response:", json);

      if (json.success && json.paymentUrl) {
        console.log("🎯 Payment URL ready:", json.paymentUrl);
        console.log("🆔 Order ID:", json.orderId);
      }
    } catch (parseError) {
      console.log("❌ FAILED - JSON Parse Error:", parseError.message);
      console.log("Raw response was:", responseText.substring(0, 200));
    }
  } else {
    console.log("❌ HTTP Error:", response.status, response.statusText);
  }
} catch (networkError) {
  console.log("🚨 Network Error:", networkError.message);
}

console.log("🏁 Browser simulation test completed");
