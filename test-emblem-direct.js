const testEmblemFunction = async () => {
  console.log("🧪 Testing Netlify emblem function...");

  try {
    const testData = {
      orderId: "TEST-" + Date.now(),
      amount: 50,
      emblemType: "lupul_înțelept",
      userId: "test-user-123",
      description: "Test emblem purchase",
      customerInfo: {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        phone: "+40700000000",
        city: "Test City",
        county: "Test County",
      },
    };

    console.log("📤 Sending test request:", testData);

    const response = await fetch(
      "http://localhost:8888/.netlify/functions/netopia-initiate-emblem",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("📄 Response body:", responseText);

    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log("✅ Parsed JSON:", jsonData);
        return jsonData;
      } catch (e) {
        console.log("📄 Response is not JSON:", responseText);
        return responseText;
      }
    } else {
      console.error("❌ Request failed:", response.status, responseText);
      return null;
    }
  } catch (error) {
    console.error("🚨 Network error:", error);
    return null;
  }
};

// Run the test
testEmblemFunction().then((result) => {
  console.log("🏁 Test completed. Result:", result);
});
