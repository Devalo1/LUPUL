#!/usr/bin/env node

/**
 * Test rapid pentru production cu API standard direct
 */

import { handler } from "./netlify/functions/netopia-initiate.mjs";

const testPayment = {
  orderId: "DIRECT_PROD_" + Date.now(),
  amount: 1.0,
  currency: "RON",
  description: "Test production API standard direct",
  customerInfo: {
    email: "lupulsicorbul@gmail.com",
    phone: "+40775346243",
    firstName: "Dumitru",
    lastName: "Popa",
    city: "Bucuresti",
  },
};

const testEvent = {
  httpMethod: "POST",
  body: JSON.stringify(testPayment),
  headers: {},
  isBase64Encoded: false,
};

console.log("🧪 Testing PRODUCTION with API standard direct...");
console.log("🎯 Should use: https://secure.netopia-payments.com/payment/card");
console.log("🔐 Should NOT use Authorization header");
console.log("");

try {
  const result = await handler(testEvent, {});

  console.log("✅ Function result:", {
    statusCode: result.statusCode,
    success: result.statusCode === 200,
    bodyLength: result.body?.length || 0,
    contentType: result.headers?.["Content-Type"],
  });

  if (result.statusCode === 200) {
    console.log("🎉 SUCCESS - Production API standard works!");
    if (result.headers?.["Content-Type"] === "text/html") {
      console.log("📄 HTML response (payment form)");
    } else {
      console.log("📡 JSON response:", result.body?.substring(0, 100));
    }
  } else {
    console.log("❌ Error:", result.body);
  }
} catch (error) {
  console.error("❌ Test failed:", error.message);
}
