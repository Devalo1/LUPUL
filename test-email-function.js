// Test script pentru funcția send-order-email
async function testSendOrderEmail() {
  const testData = {
    orderData: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "0700000000",
      address: "Str. Test 123",
      city: "București",
      county: "București",
      postalCode: "012345",
      items: [
        {
          name: "Produs Test",
          price: 1000, // 10 RON în bani
          quantity: 2,
        },
      ],
    },
    orderNumber: "TEST-" + Date.now(),
    totalAmount: 2000, // 20 RON în bani
  };

  try {
    console.log("🧪 Testing send-order-email function...");
    console.log("📋 Test data:", JSON.stringify(testData, null, 2));

    const response = await fetch(
      "http://localhost:8888/.netlify/functions/send-order-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    const result = await response.json();

    console.log("📊 Response status:", response.status);
    console.log("📝 Response data:", JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log("✅ Test PASSED: Email function works correctly!");
    } else {
      console.log("❌ Test FAILED:", result.error || "Unknown error");
    }
  } catch (error) {
    console.error("❌ Test ERROR:", error.message);
  }
}

// Run the test
testSendOrderEmail();
