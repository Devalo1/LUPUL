/**
 * Test script pentru implementarea NETOPIA API v2.x
 * Testează payload-ul și configurația conform exemplului din documentație
 */

import fetch from "node-fetch";

const testPaymentData = {
  orderId: "TEST_V2_" + Date.now(),
  amount: 1,
  currency: "RON",
  description: "Test payment Netopia v2.x",
  live: false, // Forțează sandbox
  customerInfo: {
    firstName: "Test",
    lastName: "Customer",
    email: "test@lupulsicorbul.com",
    phone: "+40712345678",
    address: "Strada Test 123",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010001",
  },
};

console.log("🧪 Testing NETOPIA API v2.x Implementation");
console.log("===========================================");

async function testNetopiaV2() {
  try {
    console.log("📋 Test payload:", JSON.stringify(testPaymentData, null, 2));

    const response = await fetch(
      "http://localhost:8888/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPaymentData),
      }
    );

    console.log("\n📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers));

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const result = await response.json();
      console.log("\n✅ JSON Response received:");
      console.log(JSON.stringify(result, null, 2));

      if (result.success) {
        console.log("\n🎉 SUCCESS! Payment v2.x initiated");
        console.log("💳 Payment URL:", result.paymentUrl);
        console.log("🏷️ Order ID:", result.orderId);
        console.log("🔢 NETOPIA ID:", result.ntpID);
        console.log("🎯 Status:", result.status);
        console.log("🌍 Environment:", result.environment);
        console.log("📋 API Version:", result.apiVersion);

        if (result.errorCode) {
          console.log("ℹ️ Error Code:", result.errorCode);
          console.log("ℹ️ Error Message:", result.errorMessage);
        }
      } else {
        console.error("\n❌ Payment initiation failed");
        console.error("Error:", result.error);
        console.error("Message:", result.message);
      }
    } else {
      const text = await response.text();
      console.log("\n📄 Non-JSON response received:");
      console.log(text.substring(0, 500) + (text.length > 500 ? "..." : ""));
    }
  } catch (error) {
    console.error("\n🚨 Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Rulează testul
testNetopiaV2();
