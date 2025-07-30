import fetch from "node-fetch";

// Simulez o plată reală de pe platformă
async function testRealPlatformPayment() {
  console.log("🌐 Testing REAL platform payment flow (not just API test)...");

  // Simulez exact același payload pe care îl trimite frontend-ul
  const realPayload = {
    orderId: `LC-${Date.now()}`, // Formatul folosit de generateOrderId()
    amount: 25.99, // Amount in RON
    currency: "RON",
    description: "Comanda LC-1753898744615",
    customerInfo: {
      firstName: "Ion",
      lastName: "Popescu",
      email: "ion.popescu@test.com",
      phone: "+40712345678",
      address: "Str. Test nr. 1",
      city: "Bucuresti",
      county: "Bucuresti",
      postalCode: "010101",
    },
    live: true, // Acest parametru determină sandbox vs live
    language: "ro",
    returnUrl: "https://lupulsicorbul.com/order-confirmation",
    confirmUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
  };

  console.log("📤 Sending REAL platform payload:", {
    orderId: realPayload.orderId,
    amount: realPayload.amount,
    live: realPayload.live,
    customerEmail: realPayload.customerInfo.email,
  });

  try {
    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "text/html,application/json,*/*",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(realPayload),
        credentials: "same-origin",
      }
    );

    const result = await response.json();

    console.log("\n📋 REAL PLATFORM RESPONSE:");
    console.log("Status:", response.status);
    console.log("Environment:", result.environment);
    console.log("PaymentURL:", result.paymentUrl);

    if (result.paymentUrl) {
      const url = new URL(result.paymentUrl);
      console.log("\n🔍 URL ANALYSIS:");
      console.log("Host:", url.host);

      if (url.host === "secure-sandbox.netopia-payments.com") {
        console.log(
          "❌ STILL SANDBOX: Frontend is still sending live:false or backend ignoring live:true"
        );
      } else if (url.host === "secure.netopia-payments.com") {
        console.log("✅ SUCCESS: Finally going to LIVE system!");
      } else {
        console.log("❓ UNKNOWN HOST:", url.host);
      }
    }

    console.log("\n📋 COMPLETE RESPONSE:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testRealPlatformPayment();
