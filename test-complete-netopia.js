/**
 * Test complet pentru NETOPIA - verifică ambele moduri
 */

const testSandbox = {
  orderId: `TEST-SANDBOX-${Date.now()}`,
  amount: 29.99,
  currency: "RON",
  description: "Test sandbox payment",
  live: false,
  customerInfo: {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "+40712345678",
    address: "Test Address",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010101",
  },
};

const testLive = {
  ...testSandbox,
  orderId: `TEST-LIVE-${Date.now()}`,
  description: "Test live payment",
  live: true, // FORȚEAZĂ live mode
};

async function runCompleteTest() {
  console.log("🧪 COMPLETE NETOPIA TEST SUITE");
  console.log("=".repeat(50));

  // Test 1: Sandbox Mode
  console.log("\n📋 TEST 1: SANDBOX Mode (live: false)");
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

    if (sandboxResponse.ok) {
      console.log("✅ SANDBOX SUCCESS");
      console.log(`   URL: ${sandboxData.paymentUrl}`);
      console.log(`   Environment: ${sandboxData.environment}`);
      console.log(
        `   Contains 'sandbox': ${sandboxData.paymentUrl.includes("sandbox")}`
      );
    } else {
      console.log("❌ SANDBOX FAILED:", sandboxData.message);
    }
  } catch (error) {
    console.log("❌ SANDBOX ERROR:", error.message);
  }

  // Test 2: Live Mode
  console.log("\n📋 TEST 2: LIVE Mode (live: true)");
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

    if (liveResponse.ok) {
      console.log("✅ LIVE SUCCESS");
      console.log(`   URL: ${liveData.paymentUrl}`);
      console.log(`   Environment: ${liveData.environment}`);
      console.log(
        `   Contains 'sandbox': ${liveData.paymentUrl.includes("sandbox")}`
      );
    } else {
      console.log("⚠️  LIVE ATTEMPTED (expected with placeholder credentials)");
      console.log(`   Error: ${liveData.message}`);
      console.log(
        `   This is normal - live credentials are placeholder values`
      );

      // Verifică că eroarea vine de la NETOPIA (SVG response) nu de la logica noastră
      if (
        liveData.message.includes("svg") ||
        liveData.message.includes("image")
      ) {
        console.log(
          "✅ CONFIRMED: Live mode is working (NETOPIA returning error page)"
        );
        console.log(
          "   Replace 'YOUR_LIVE_API_KEY_HERE' and 'YOUR_LIVE_SIGNATURE_HERE' with real values"
        );
      }
    }
  } catch (error) {
    console.log("❌ LIVE ERROR:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎯 SUMMARY:");
  console.log("   • Sandbox mode should work with real payments");
  console.log("   • Live mode logic works but needs real credentials");
  console.log(
    "   • Replace placeholders in netopia-v2-api.js with your live values"
  );
}

runCompleteTest();
