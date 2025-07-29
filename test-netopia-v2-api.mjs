#!/usr/bin/env node

/**
 * Test Script pentru NETOPIA API v2.x
 *
 * Acest script testează noua implementare API v2.x cu API KEY
 * conform documentației oficiale NETOPIA
 */

import fetch from "node-fetch";

// Test data
const testPaymentData = {
  orderId: `TEST-V2-${Date.now()}`,
  amount: 12.5,
  currency: "RON",
  description: "Test NETOPIA API v2.x - Lupul și Corbul",
  customerInfo: {
    firstName: "Ion",
    lastName: "Popescu",
    email: "test@lupulsicorbul.com",
    phone: "+40712345678",
    address: "Strada Test 123",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010000",
  },
  live: true, // Force LIVE environment pentru testare cu API KEY real
};

async function testNetopiaV2API() {
  console.log("🧪 Testing NETOPIA API v2.x Implementation");
  console.log("=".repeat(50));

  console.log("📋 Test Payment Data:");
  console.log(JSON.stringify(testPaymentData, null, 2));
  console.log();

  try {
    // Test local development endpoint
    const localEndpoint =
      "http://localhost:8888/.netlify/functions/netopia-v2-api";

    console.log("🌐 Testing local endpoint:", localEndpoint);

    const response = await fetch(localEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(testPaymentData),
    });

    console.log("📡 Response Status:", response.status);
    console.log("📋 Response Headers:");
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log();

    const responseText = await response.text();
    console.log("📄 Raw Response:");
    console.log(
      responseText.substring(0, 500) + (responseText.length > 500 ? "..." : "")
    );
    console.log();

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("✅ JSON Response parsed successfully:");
      console.log(JSON.stringify(responseData, null, 2));
    } catch (parseError) {
      console.log("❌ Response is not valid JSON:", parseError.message);
      return;
    }

    // Analyze response
    console.log("\n🔍 Response Analysis:");

    if (responseData.success) {
      console.log("✅ Payment initiation successful!");
      console.log(`🆔 Order ID: ${responseData.orderId}`);
      console.log(`🔢 NETOPIA ID: ${responseData.ntpID || "N/A"}`);
      console.log(`📊 Status: ${responseData.status}`);
      console.log(`🌍 Environment: ${responseData.environment}`);
      console.log(`📡 API Version: ${responseData.apiVersion}`);
      console.log(
        `💳 Payment URL: ${responseData.paymentUrl?.substring(0, 80)}...`
      );

      // Test payment URL accessibility
      if (responseData.paymentUrl) {
        console.log("\n🌐 Testing payment URL accessibility...");
        try {
          const urlResponse = await fetch(responseData.paymentUrl, {
            method: "HEAD",
            timeout: 5000,
          });
          console.log(
            `✅ Payment URL accessible: ${urlResponse.status} ${urlResponse.statusText}`
          );
        } catch (urlError) {
          console.log(`⚠️ Payment URL test failed: ${urlError.message}`);
        }
      }
    } else {
      console.log("❌ Payment initiation failed!");
      console.log(`💥 Error: ${responseData.error}`);
      console.log(`📝 Message: ${responseData.message}`);

      if (responseData.details) {
        console.log(`🔍 Details: ${responseData.details}`);
      }
    }
  } catch (error) {
    console.error("🚨 Test failed with error:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Suggestion: Make sure Netlify Dev is running:");
      console.log("   npm run dev");
      console.log("   or");
      console.log("   netlify dev");
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("🏁 Test completed");
}

// Test environment variables
console.log("🔧 Environment Check:");
console.log(`NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log(
  `NETOPIA_SANDBOX_API_KEY: ${process.env.NETOPIA_SANDBOX_API_KEY ? "set" : "NOT SET"}`
);
console.log(
  `NETOPIA_LIVE_API_KEY: ${process.env.NETOPIA_LIVE_API_KEY ? "set" : "NOT SET"}`
);

if (!process.env.NETOPIA_SANDBOX_API_KEY) {
  console.log("\n⚠️  WARNING: NETOPIA_SANDBOX_API_KEY not set!");
  console.log("   The test might fail without proper API key.");
  console.log("   Set it in your .env file or Netlify environment variables.");
}

console.log();

// Run the test
testNetopiaV2API().catch(console.error);
