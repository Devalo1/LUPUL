import fetch from "node-fetch";

async function testLiveFullResponse() {
  console.log("🔍 Testing LIVE mode - Full response analysis...");

  const payload = {
    orderId: `TEST-LIVE-FULL-${Date.now()}`,
    amount: 29.99,
    currency: "RON",
    description: "Test live full response",
    live: true,
    customerInfo: {
      firstName: "Test",
      lastName: "Live",
      email: "test@live.com",
      phone: "+40712345678",
      address: "Test Address",
      city: "Bucuresti",
      county: "Bucuresti",
      postalCode: "010101",
    },
  };

  try {
    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    console.log("📋 FULL RESPONSE ANALYSIS:");
    console.log("Status:", response.status);
    console.log("Environment from response:", result.environment);
    console.log("Payment URL:", result.paymentUrl);
    console.log("NTPID:", result.ntpID);
    console.log("Error Code:", result.errorCode);
    console.log("Error Message:", result.errorMessage);

    console.log("\n🔍 URL ANALYSIS:");
    if (result.paymentUrl) {
      const url = new URL(result.paymentUrl);
      console.log("Host:", url.host);
      console.log("Protocol:", url.protocol);
      console.log("Pathname:", url.pathname);

      if (url.host.includes("sandbox")) {
        console.log("❌ PROBLEM: Payment URL is still pointing to SANDBOX!");
        console.log(
          "Expected live domain: secure.mobilpay.ro or secure.netopia-payments.com (live)"
        );
      } else if (url.host.includes("secure.netopia-payments.com")) {
        console.log("✅ GOOD: Payment URL is pointing to LIVE domain");
      } else {
        console.log("❓ UNKNOWN: Unexpected domain pattern");
      }
    }

    console.log("\n📋 COMPLETE RESPONSE:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testLiveFullResponse();
