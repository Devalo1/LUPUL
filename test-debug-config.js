/**
 * Test pentru a vedea exact ce configurație folosește funcția
 */

const testLive = {
  orderId: `TEST-LIVE-DEBUG-${Date.now()}`,
  amount: 29.99,
  currency: "RON",
  description: "Test live debug",
  live: true,
  customerInfo: {
    firstName: "Test",
    lastName: "Debug",
    email: "test@debug.com",
    phone: "+40712345678",
    address: "Test Address",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010101",
  },
};

const testSandbox = {
  ...testLive,
  orderId: `TEST-SANDBOX-DEBUG-${Date.now()}`,
  description: "Test sandbox debug",
  live: false,
};

async function debugConfigTest() {
  console.log("🔍 DEBUG: Testing both configurations to see the difference");

  // Test 1: Sandbox
  console.log("\n📋 TEST 1: SANDBOX (live: false)");
  try {
    const sandboxResponse = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testSandbox),
      }
    );

    const sandboxData = await sandboxResponse.json();
    console.log("✅ Sandbox result:");
    console.log(`   Environment: ${sandboxData.environment}`);
    console.log(
      `   PaymentURL starts with: ${sandboxData.paymentUrl?.substring(0, 50)}...`
    );
  } catch (e) {
    console.log("❌ Sandbox error:", e.message);
  }

  // Test 2: Live
  console.log("\n📋 TEST 2: LIVE (live: true)");
  try {
    const liveResponse = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testLive),
      }
    );

    const liveData = await liveResponse.json();
    console.log("✅ Live result:");
    console.log(`   Environment: ${liveData.environment}`);
    console.log(
      `   PaymentURL starts with: ${liveData.paymentUrl?.substring(0, 50)}...`
    );

    if (liveData.environment === "live") {
      console.log("🎯 SUCCESS: Live mode is working!");
    } else {
      console.log("⚠️  Still using sandbox config");
    }
  } catch (e) {
    console.log("❌ Live error:", e.message);
  }
}

debugConfigTest();
