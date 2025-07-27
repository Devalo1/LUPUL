#!/usr/bin/env node
/**
 * Script de testare rapidă pentru fix-ul Netopia SVG redirect
 * Rulează acest script pentru a verifica că problema a fost reparată
 */

const https = require("https");

console.log("🔧 Testing Netopia SVG redirect fix...\n");

// Test 1: Debug endpoint
function testDebugEndpoint() {
  return new Promise((resolve, reject) => {
    const url =
      "https://lupul-si-corbul.netlify.app/.netlify/functions/netopia-debug";

    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            console.log("✅ Debug endpoint response:");
            console.log(
              `   Mode: ${jsonData.netopiaConfig?.mode || "Unknown"}`
            );
            console.log(
              `   Endpoint: ${jsonData.netopiaConfig?.endpoint || "Unknown"}`
            );
            console.log(`   Message: ${jsonData.message || "No message"}\n`);

            if (jsonData.netopiaConfig?.mode === "LIVE") {
              console.log(
                "✅ LIVE mode is active - SVG redirect should be fixed!"
              );
            } else {
              console.log("⚠️  Not in LIVE mode - may still have issues");
            }

            resolve(jsonData);
          } catch (e) {
            console.error("❌ Failed to parse debug response:", e.message);
            reject(e);
          }
        });
      })
      .on("error", (err) => {
        console.error("❌ Debug endpoint failed:", err.message);
        reject(err);
      });
  });
}

// Test 2: Payment initialization
function testPaymentInit() {
  return new Promise((resolve, reject) => {
    const testPayload = JSON.stringify({
      orderId: "FIX_TEST_" + Date.now(),
      amount: 1,
      currency: "RON",
      description: "SVG fix test payment",
      customerInfo: {
        firstName: "Test",
        lastName: "Fix",
        email: "test@lupulsicorbul.com",
        phone: "0700000000",
        address: "Test Address",
        city: "Bucuresti",
        county: "Bucuresti",
        postalCode: "010000",
      },
      live: true,
    });

    const options = {
      hostname: "lupul-si-corbul.netlify.app",
      path: "/.netlify/functions/netopia-initiate",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(testPayload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("\n🧪 Payment initialization test:");

        if (data.includes("<html") || data.includes("<!doctype")) {
          console.log("✅ Received HTML form (3DS form)");

          // Check for correct endpoint
          if (data.includes("secure.netopia-payments.com")) {
            console.log("✅ Using LIVE Netopia endpoint - SVG redirect FIXED!");
          } else if (data.includes("secure-sandbox.netopia-payments.com")) {
            console.log("⚠️  Using sandbox endpoint - but should still work");
          } else {
            console.log("❌ Unknown endpoint in form");
          }

          // Check for SVG redirect
          if (data.includes("card.svg") || data.includes("wp-content")) {
            console.log(
              "❌ Still contains SVG references - fix may not be complete"
            );
          } else {
            console.log(
              "✅ No SVG references found - redirect issue resolved!"
            );
          }
        } else {
          try {
            const jsonData = JSON.parse(data);
            console.log("📋 JSON response received:", jsonData);
          } catch (e) {
            console.log(
              "❌ Unexpected response format:",
              data.substring(0, 200) + "..."
            );
          }
        }

        resolve(data);
      });
    });

    req.on("error", (err) => {
      console.error("❌ Payment test failed:", err.message);
      reject(err);
    });

    req.write(testPayload);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    await testDebugEndpoint();
    await testPaymentInit();

    console.log("\n🎉 Test completed!");
    console.log("\n📋 Summary:");
    console.log(
      '   - If you see "LIVE mode is active" and "LIVE Netopia endpoint"'
    );
    console.log("   - Then the SVG redirect issue is FIXED!");
    console.log("   - Payments will now go to 3DS instead of the SVG file");
  } catch (error) {
    console.error("\n❌ Tests failed:", error.message);
    console.log("\n🔧 If tests fail, the fix may need more time to deploy.");
    console.log("   Try running this script again in a few minutes.");
  }
}

runTests();
