/**
 * Test script pentru a simula o comandă completă cu embleme
 * Acesta simulează payload-ul exact pe care îl primește process-payment-completion
 */

console.log("🧪 Testing emblem order completion...");

// Payload-ul exact pe care îl primește funcția process-payment-completion
const testPayload = {
  ntpID: "LC-12345-TEST",
  orderId: "LC-12345-TEST", // Adăugat aici la nivel de rădăcină
  orderData: {
    orderId: "LC-12345-TEST",
    userId: "test-user-123",
    total: 75, // 3 embleme x 25 RON
    items: [
      {
        id: "emblem_protection",
        name: "Emblemă de Protecție",
        price: 25,
        quantity: 1,
        emblemType: "protection",
      },
      {
        id: "emblem_power",
        name: "Emblemă de Putere",
        price: 25,
        quantity: 1,
        emblemType: "power",
      },
      {
        id: "emblem_wisdom",
        name: "Emblemă de Înțelepciune",
        price: 25,
        quantity: 1,
        emblemType: "wisdom",
      },
    ],
    customerInfo: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "0123456789",
    },
  },
  amount: 75,
  currency: "RON",
  status: "confirmed",
};

async function testEmblemOrderCompletion() {
  try {
    console.log("📤 Sending test payload to process-payment-completion...");
    console.log("📦 Payload:", JSON.stringify(testPayload, null, 2));

    const response = await fetch(
      "http://localhost:8888/.netlify/functions/process-payment-completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "EmblemTest/1.0",
          Accept: "application/json",
        },
        body: JSON.stringify(testPayload),
      }
    );

    console.log("📥 Response status:", response.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("📥 Response body:", responseText);

    if (response.ok) {
      console.log("✅ Test completed successfully!");
      console.log(
        '🔮 Check Firebase "emblems" collection for new emblem entries'
      );
      console.log("📧 Check for confirmation emails");
    } else {
      console.log("❌ Test failed with status:", response.status);
    }
  } catch (error) {
    console.error("🚨 Test error:", error);
  }
}

testEmblemOrderCompletion();
