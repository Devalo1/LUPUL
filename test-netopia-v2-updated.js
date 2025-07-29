/**
 * Test pentru implementarea NETOPIA v2.x actualizată
 * Folosind endpoint-ul și metoda corectă
 */

import fetch from "node-fetch";

const testPaymentData = {
  orderId: "TEST_V2_UPDATED_" + Date.now(),
  amount: 1,
  currency: "RON",
  description: "Test payment Netopia v2.x - Updated Implementation",
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

console.log("🧪 Testing UPDATED NETOPIA v2.x Implementation");
console.log("===============================================");

async function testUpdatedNetopiaV2() {
  try {
    console.log("📋 Test payload:", JSON.stringify(testPaymentData, null, 2));

    // Start the dev server if not running
    console.log("🚀 Testing with local Netlify function...");

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

          if (result.errorCode === "101") {
            console.log(
              "✅ Code 101 = 'Redirect user to payment page' - This is NORMAL!"
            );
          }
        }

        if (result.isHtmlForm) {
          console.log("📄 Received HTML form response (3DS)");
        }

        // If we got a payment URL, let's analyze it
        if (result.paymentUrl && result.paymentUrl.includes("secure-sandbox")) {
          console.log("✅ Correctly using SANDBOX environment");

          // Check if it matches your successful response format
          if (result.paymentUrl.includes("/ui/card?p=")) {
            console.log("🎯 Payment URL format matches expected pattern!");
          }
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
testUpdatedNetopiaV2();
