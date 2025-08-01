// Test pentru endpoint-ul netopia-initiate-emblem
async function testEmblemEndpoint() {
  console.log("🧪 Testing netopia-initiate-emblem endpoint...");

  const testData = {
    amount: 25,
    currency: "RON",
    orderDetails: {
      emblemName: "Test Emblem",
      emblemType: "protection",
      quantity: 1,
      unitPrice: 25,
    },
    emblemType: "protection",
    userId: "test-user-123",
  };

  try {
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

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Success! Response data:", data);
    } else {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
    }
  } catch (error) {
    console.error("💥 Network error:", error);
  }
}

// Test netopiaService endpoint resolution
console.log("🔍 Testing netopiaService endpoint resolution...");
console.log("Current port:", window.location.port);
console.log("Current hostname:", window.location.hostname);

testEmblemEndpoint();
