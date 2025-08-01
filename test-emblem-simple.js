// Test simplu pentru process-payment-completion cu embleme
async function testEmblemProcessing() {
  try {
    console.log("🧪 Testing emblem processing...");

    const emblemOrderData = {
      orderId: "EMBLEM-TEST-999",
      orderData: {
        orderNumber: "EMBLEM-TEST-999",
        customerEmail: "emblem-test@test.com",
        customerName: "Emblem Test User",
        userId: "emblem-test-user-999",
        items: [
          {
            id: "emblem_protection",
            name: "Emblema Protecției + Tricou Premium + QR Cod",
            price: 25,
            quantity: 1,
          },
        ],
        totalAmount: 25,
        date: new Date().toISOString(),
        paymentMethod: "card",
      },
    };

    console.log("📦 Sending emblem order data...");

    const response = await fetch(
      "http://localhost:8888/.netlify/functions/process-payment-completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emblemOrderData),
      }
    );

    console.log("📡 Response status:", response.status);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Success response:", JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log("❌ Error response:", error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testEmblemProcessing();
