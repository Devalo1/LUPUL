/**
 * Script de test pentru process-payment-completion
 * Simulează diferite scenarii de plăți finalizate cu embleme
 */

// Testează direct funcția handler
async function testPaymentCompletion() {
  const baseUrl =
    "http://localhost:8888/.netlify/functions/process-payment-completion";

  console.log("🧪 Testing payment completion function...");

  // Test 1: Comandă normală fără embleme
  const normalOrder = {
    orderId: "LC-TEST-NORMAL-123",
    paymentInfo: {
      paymentId: "NETOPIA_TEST_123",
      status: "confirmed",
    },
    orderData: {
      orderNumber: "LC-TEST-NORMAL-123",
      customerEmail: "test@test.com",
      customerName: "Test User",
      customerPhone: "0700000000",
      customerAddress: "Test Address",
      customerCity: "Bucharest",
      customerCounty: "Bucharest",
      totalAmount: 100,
      userId: "test-user-real-123",
      items: [
        {
          id: "product_123",
          name: "Produs normal",
          price: 100,
          quantity: 1,
        },
      ],
      date: new Date().toISOString(),
      paymentMethod: "card",
    },
  };

  // Test 2: Comandă cu emblemă
  const emblemOrder = {
    orderId: "LC-TEST-EMBLEM-456",
    paymentInfo: {
      paymentId: "NETOPIA_EMBLEM_456",
      status: "confirmed",
    },
    orderData: {
      orderNumber: "LC-TEST-EMBLEM-456",
      customerEmail: "emblem@test.com",
      customerName: "Emblem Buyer",
      customerPhone: "0700000001",
      customerAddress: "Emblem Address",
      customerCity: "Cluj-Napoca",
      customerCounty: "Cluj",
      totalAmount: 25,
      userId: "emblem-user-789",
      items: [
        {
          id: "emblem_protection",
          name: "Emblema Protecției + Tricou Premium + QR Cod",
          price: 25,
          quantity: 1,
        },
      ],
      date: new Date().toISOString(),
      paymentMethod: "card",
    },
  };

  // Test 3: Comandă mixtă (produs normal + emblemă)
  const mixedOrder = {
    orderId: "LC-TEST-MIXED-789",
    paymentInfo: {
      paymentId: "NETOPIA_MIXED_789",
      status: "confirmed",
    },
    orderData: {
      orderNumber: "LC-TEST-MIXED-789",
      customerEmail: "mixed@test.com",
      customerName: "Mixed Buyer",
      customerPhone: "0700000002",
      customerAddress: "Mixed Address",
      customerCity: "Iasi",
      customerCounty: "Iasi",
      totalAmount: 175,
      userId: "mixed-user-999",
      items: [
        {
          id: "product_456",
          name: "Produs normal",
          price: 150,
          quantity: 1,
        },
        {
          id: "emblem_wisdom",
          name: "Emblema Înțelepciunii + Tricou Premium + QR Cod",
          price: 25,
          quantity: 1,
        },
      ],
      date: new Date().toISOString(),
      paymentMethod: "card",
    },
  };

  // Testează fiecare scenariu
  const tests = [
    { name: "Normal Order", data: normalOrder },
    { name: "Emblem Order", data: emblemOrder },
    { name: "Mixed Order", data: mixedOrder },
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing ${test.name}...`);
      console.log("📦 Order data:", JSON.stringify(test.data, null, 2));

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(test.data),
      });

      const result = await response.text();
      console.log(`✅ ${test.name} Response Status:`, response.status);
      console.log(
        `📄 ${test.name} Response:`,
        result.substring(0, 500) + "..."
      );
    } catch (error) {
      console.error(`❌ ${test.name} Failed:`, error.message);
    }
  }
}

// Test simplu de ping la funcție
async function pingFunction() {
  try {
    console.log("🏓 Ping test...");

    const response = await fetch(
      "http://localhost:8888/.netlify/functions/process-payment-completion",
      {
        method: "OPTIONS",
      }
    );

    console.log("🏓 Ping Status:", response.status);
    console.log(
      "🏓 Ping Headers:",
      Object.fromEntries(response.headers.entries())
    );
  } catch (error) {
    console.error("❌ Ping failed:", error.message);
  }
}

// Test cu date minime pentru debugging
async function testMinimal() {
  try {
    console.log("\n🔬 Minimal test...");

    const minimalData = {
      orderId: "TEST-MINIMAL-123",
    };

    const response = await fetch(
      "http://localhost:8888/.netlify/functions/process-payment-completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(minimalData),
      }
    );

    const result = await response.text();
    console.log("🔬 Minimal Status:", response.status);
    console.log("🔬 Minimal Response:", result);
  } catch (error) {
    console.error("❌ Minimal test failed:", error.message);
  }
}

// Rulează toate testele
async function runAllTests() {
  console.log("🚀 Starting payment completion tests...\n");

  await pingFunction();
  await testMinimal();
  await testPaymentCompletion();

  console.log("\n✅ All tests completed!");
}

// Rulează testele
runAllTests().catch(console.error);
