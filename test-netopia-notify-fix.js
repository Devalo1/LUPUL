/**
 * Test pentru funcția netopia-notify.js fixată
 * Testează că returnează întotdeauna status 200
 */

// Simulează environment Netlify
const mockEvent = {
  httpMethod: "POST",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({
    order: {
      orderId: "test_order_123",
    },
    payment: {
      paymentId: "test_payment_456",
      status: "confirmed",
    },
    live: false,
  }),
};

const mockContext = {};

// Importă funcția (simulăm environment variables)
process.env.SMTP_USER = "test@example.com";
process.env.SMTP_PASS = "test_pass";
process.env.NETOPIA_SANDBOX_SIGNATURE = "test_signature";

async function testNetopiaNotify() {
  console.log("🧪 Testing NETOPIA notify function...");

  try {
    // Importă funcția handler
    const { handler } = await import("./netlify/functions/netopia-notify.js");

    // Test 1: Request POST valid
    console.log("\n📋 Test 1: Valid POST request");
    const result1 = await handler(mockEvent, mockContext);

    console.log("Status Code:", result1.statusCode);
    const response1 = JSON.parse(result1.body);
    console.log("Response:", response1);

    if (result1.statusCode === 200 && response1.errorCode === 0) {
      console.log("✅ Test 1 PASSED: Returns status 200 with NETOPIA format");
    } else {
      console.log("❌ Test 1 FAILED: Expected status 200 with errorCode 0");
    }

    // Test 2: Request cu eroare în body
    console.log("\n📋 Test 2: Invalid JSON body");
    const invalidEvent = {
      ...mockEvent,
      body: "invalid json{{",
    };

    const result2 = await handler(invalidEvent, mockContext);
    console.log("Status Code:", result2.statusCode);
    const response2 = JSON.parse(result2.body);
    console.log("Response:", response2);

    if (result2.statusCode === 200 && response2.errorCode === 0) {
      console.log(
        "✅ Test 2 PASSED: Returns NETOPIA format even with invalid JSON"
      );
    } else {
      console.log("❌ Test 2 FAILED: Expected NETOPIA format");
    }

    // Test 3: Request OPTIONS
    console.log("\n📋 Test 3: OPTIONS request");
    const optionsEvent = {
      ...mockEvent,
      httpMethod: "OPTIONS",
    };

    const result3 = await handler(optionsEvent, mockContext);
    console.log("Status Code:", result3.statusCode);

    if (result3.statusCode === 200) {
      console.log("✅ Test 3 PASSED: OPTIONS returns status 200");
    } else {
      console.log(
        "❌ Test 3 FAILED: Expected status 200, got",
        result3.statusCode
      );
    }

    // Test 4: Request GET (method not allowed)
    console.log("\n📋 Test 4: GET request (method not allowed)");
    const getEvent = {
      ...mockEvent,
      httpMethod: "GET",
    };

    const result4 = await handler(getEvent, mockContext);
    console.log("Status Code:", result4.statusCode);
    const response4 = JSON.parse(result4.body);
    console.log("Response:", response4);

    if (result4.statusCode === 200 && response4.errorCode === 0) {
      console.log(
        "✅ Test 4 PASSED: GET returns NETOPIA format (safe for NETOPIA)"
      );
    } else {
      console.log("❌ Test 4 FAILED: Expected NETOPIA format");
    }

    // Simulează eroare în procesare
    console.log("\n📋 Test 5: Forțare eroare în procesare");
    const errorEvent = {
      ...mockEvent,
      body: JSON.stringify({
        order: null, // Va cauza eroare în procesare
        payment: null,
      }),
    };

    const result5 = await handler(errorEvent, mockContext);
    console.log("Status Code:", result5.statusCode);
    const response5 = JSON.parse(result5.body);
    console.log("Response:", response5);

    if (result5.statusCode === 200 && response5.errorCode === 0) {
      console.log(
        "✅ Test 5 PASSED: Returns NETOPIA format even with processing errors"
      );
    } else {
      console.log("❌ Test 5 FAILED: Expected NETOPIA format");
    }

    console.log("\n🎉 ALL TESTS COMPLETED!");
    console.log(
      '📊 Summary: All tests should return status 200 with NETOPIA format {"errorCode": 0}'
    );
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Rulează testele
testNetopiaNotify();
