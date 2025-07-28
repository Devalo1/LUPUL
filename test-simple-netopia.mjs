#!/usr/bin/env node

/**
 * Test rapid pentru funcția NETOPIA simplificată
 */

import { handler } from "./netlify/functions/netopia-initiate.mjs";

const testPayment = {
  orderId: "TEST" + Date.now(),
  amount: 25.5,
  currency: "RON",
  description: "Test plată simplificată",
  customerInfo: {
    email: "test@lupulsicorbul.com",
    phone: "+40712345678",
    firstName: "Test",
    lastName: "User",
    city: "Bucuresti",
  },
};

const testEvent = {
  httpMethod: "POST",
  body: JSON.stringify(testPayment),
  headers: {},
  isBase64Encoded: false,
};

console.log("🧪 Testing NETOPIA simple function...");
console.log("📋 Test payload:", testPayment);

try {
  const result = await handler(testEvent, {});
  console.log("✅ Function result:", {
    statusCode: result.statusCode,
    bodyLength: result.body?.length || 0,
    contentType: result.headers?.["Content-Type"],
    success:
      result.body?.includes("success") || result.body?.includes("netopia"),
  });

  if (result.statusCode === 200) {
    console.log("🎉 SUCCESS - Function works!");
    if (result.headers?.["Content-Type"] === "text/html") {
      console.log("📄 HTML response received (payment form)");
    } else {
      console.log("📡 JSON response:", result.body?.substring(0, 100));
    }
  } else {
    console.log("❌ Error response:", result.body);
  }
} catch (error) {
  console.error("❌ Test failed:", error.message);
}
