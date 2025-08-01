/**
 * Test pentru a verifica exact ce mediu se folosește în producție
 */

async function testProductionEnvironment() {
  console.log("🔍 Testing production environment detection...\n");

  const testPayload = {
    orderId: `ENV-TEST-${Date.now()}`,
    amount: "49.99",
    emblemType: "corbul-mistic",
    userId: "env-test-user",
    customerInfo: {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      phone: "+40712345678",
      city: "Bucharest",
      county: "Bucharest",
      postalCode: "010101",
      address: "Test Address 123",
    },
    description: "Environment Test Emblem",
  };

  try {
    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-initiate-emblem",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      }
    );

    console.log(`Status: ${response.status} ${response.statusText}`);

    const responseData = await response.json();

    console.log("Full Response:", JSON.stringify(responseData, null, 2));

    if (responseData.paymentUrl) {
      console.log("\n🔗 Payment URL Analysis:");
      console.log("URL:", responseData.paymentUrl);

      if (
        responseData.paymentUrl.includes("secure.sandbox.netopia-payments.com")
      ) {
        console.log("❌ SANDBOX environment detected in production!");
      } else if (
        responseData.paymentUrl.includes("secure.netopia-payments.com")
      ) {
        console.log("✅ LIVE environment detected in production!");
      } else {
        console.log("❓ Unknown environment:", responseData.paymentUrl);
      }
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

// Rulează testul
testProductionEnvironment().catch(console.error);
