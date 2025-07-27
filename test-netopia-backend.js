import fetch from "node-fetch";

console.log("🧪 Testing Netopia Backend Function\n");

// Test data
const testPayload = {
  orderId: "TEST_" + Date.now(),
  amount: 100, // 1 RON
  currency: "RON",
  description: "Test backend payment",
  customerInfo: {
    firstName: "Test",
    lastName: "Backend",
    email: "test@backend.com",
    phone: "0700000000",
    address: "Test Address",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010000",
  },
  posSignature: "2ZOW-PJ5X-HYYC-IENE-APZO", // Sandbox signature
  live: false,
};

// Test URLs
const urls = [
  "http://localhost:8888/.netlify/functions/netopia-initiate", // Netlify dev
  "https://lupulsicorbul.com/.netlify/functions/netopia-initiate", // Production
];

async function testBackend(url) {
  console.log(`\n🔍 Testing: ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "NetopiaTest/1.0",
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get("content-type")}`);

    const responseText = await response.text();

    if (responseText.includes("<form") && responseText.includes("netopia")) {
      console.log("✅ HTML Form detected (likely 3DS)");
      console.log("Form preview:", responseText.substring(0, 200) + "...");
    } else if (responseText.includes("paymentUrl")) {
      const data = JSON.parse(responseText);
      console.log("✅ JSON Response:", data);
    } else {
      console.log("❌ Unexpected response:", responseText.substring(0, 200));
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

// Test with LIVE signature if available
async function testLiveBackend(url) {
  console.log(`\n🔴 Testing LIVE mode: ${url}`);

  const livePayload = {
    ...testPayload,
    orderId: "LIVE_TEST_" + Date.now(),
    posSignature:
      process.env.VITE_NETOPIA_SIGNATURE_LIVE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    live: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "NetopiaLiveTest/1.0",
      },
      body: JSON.stringify(livePayload),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();

    if (responseText.includes("secure.netopia-payments.com")) {
      console.log("✅ LIVE endpoint detected in response!");
    } else if (responseText.includes("secure-sandbox.netopia-payments.com")) {
      console.log("⚠️  Still using SANDBOX endpoint");
    }

    console.log("Response preview:", responseText.substring(0, 300));
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

// Run tests
async function runTests() {
  for (const url of urls) {
    await testBackend(url);
    await testLiveBackend(url);
  }

  console.log("\n📋 Environment Variables Check:");
  console.log(
    "VITE_NETOPIA_SIGNATURE_LIVE:",
    process.env.VITE_NETOPIA_SIGNATURE_LIVE ? "SET" : "NOT SET"
  );
  console.log(
    "NETOPIA_LIVE_SIGNATURE:",
    process.env.NETOPIA_LIVE_SIGNATURE ? "SET" : "NOT SET"
  );
}

runTests().catch(console.error);
