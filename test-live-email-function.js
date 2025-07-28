// Test script pentru funcția send-order-email pe producție
async function testLiveEmailFunction() {
  const testData = {
    orderData: {
      firstName: "Test",
      lastName: "Administrator",
      email: "lupulsicorbul@gmail.com", // Email real pentru test
      phone: "0700000000",
      address: "Str. Test 123",
      city: "București",
      county: "București",
      postalCode: "012345",
      items: [
        {
          name: "Test Email Function",
          price: 1000, // 10 RON în bani
          quantity: 1
        }
      ]
    },
    orderNumber: "TEST-EMAIL-" + Date.now(),
    totalAmount: 1000 // 10 RON în bani
  };

  try {
    console.log("🧪 Testing LIVE send-order-email function...");
    console.log("📋 Test data:", JSON.stringify(testData, null, 2));

    const response = await fetch("https://lupulsicorbul.com/.netlify/functions/send-order-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log("📊 Response status:", response.status);
    console.log("📝 Response data:", JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      if (result.development) {
        console.log("⚠️  DEVELOPMENT MODE: Emails were simulated, not sent");
      } else {
        console.log("✅ Test PASSED: Real emails were sent successfully!");
        console.log("📧 Customer email ID:", result.customerEmailId);
        console.log("📧 Admin email ID:", result.adminEmailId);
      }
    } else {
      console.log("❌ Test FAILED:", result.error || "Unknown error");
    }

  } catch (error) {
    console.error("❌ Test ERROR:", error.message);
  }
}

// Run the test
testLiveEmailFunction();
