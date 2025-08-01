// Test simplu pentru process-payment-completion fără Firebase
const testData = [
  {
    name: "Ping Test",
    body: JSON.stringify({
      orderId: "test-ping-123",
    }),
  },
  {
    name: "Comandă cu emblemă",
    body: JSON.stringify({
      orderId: "emblem-test-456",
      orderData: {
        orderNumber: "emblem-test-456",
        customerEmail: "test@test.com",
        customerName: "Test User",
        items: [
          {
            id: "emblem_protection",
            name: "Emblema Protection + Tricou Premium",
            price: 25,
            quantity: 1,
          },
        ],
        userId: "test-user-real-123",
        totalAmount: 25,
      },
    }),
  },
  {
    name: "Comandă normală (fără emblemă)",
    body: JSON.stringify({
      orderId: "normal-test-789",
      orderData: {
        orderNumber: "normal-test-789",
        customerEmail: "test@test.com",
        items: [
          {
            id: "product-123",
            name: "Produs Normal",
            price: 50,
            quantity: 1,
          },
        ],
        totalAmount: 50,
      },
    }),
  },
];

console.log("🧪 Începe testarea process-payment-completion...\n");

async function runTests() {
  for (const test of testData) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log("📤 Request Body:", test.body);

    try {
      const response = await fetch(
        "http://localhost:8888/.netlify/functions/process-payment-completion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: test.body,
        }
      );

      console.log(`📊 Status: ${response.status}`);

      if (response.ok) {
        const result = await response.text();
        console.log("✅ Response:", result.substring(0, 200) + "...");
      } else {
        const error = await response.text();
        console.log("❌ Error:", error.substring(0, 200) + "...");
      }
    } catch (error) {
      console.log("💥 Fetch Error:", error.message);
    }

    console.log("---");
  }
}

runTests().catch(console.error);
