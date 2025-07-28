/**
 * Test de integrare pentru NETOPIA v3 API
 * Testează funcția netlify în mod real
 */

const testPayment = async () => {
  console.log("🧪 Testing NETOPIA v3 Integration...");

  const testPaymentData = {
    orderId: "INT-TEST-" + Date.now(),
    amount: 1000, // 10 RON în bani
    currency: "RON",
    description: "Test integrare NETOPIA v3",
    customerInfo: {
      firstName: "Test",
      lastName: "User",
      email: "test@lupulsicorbul.com",
      phone: "0712345678",
      address: "Strada Test 456",
      city: "București",
      county: "București",
      postalCode: "010001",
    },
    posSignature: "SANDBOX_TEST_SIGNATURE",
    live: false, // Forțăm sandbox mode
  };

  try {
    // Testează endpoint-ul local
    const response = await fetch(
      "http://localhost:8888/.netlify/functions/netopia-initiate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPaymentData),
      }
    );

    console.log("📡 Response Status:", response.status);

    const contentType = response.headers.get("content-type") || "";
    console.log("📋 Content-Type:", contentType);

    if (contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      console.log("✅ JSON Response received:", jsonResponse);

      if (jsonResponse.success) {
        console.log("🎉 Payment initiation successful!");
        console.log(
          "💳 Payment URL:",
          jsonResponse.paymentUrl?.substring(0, 100) + "..."
        );
        console.log("🏷️ Order ID:", jsonResponse.orderId);
      } else {
        console.error("❌ Payment initiation failed:", jsonResponse.error);
      }
    } else if (contentType.includes("text/html")) {
      const htmlResponse = await response.text();
      console.log("📄 HTML Response received (3DS form)");
      console.log("📋 HTML length:", htmlResponse.length);

      // Verifică dacă contine form pentru 3DS
      if (htmlResponse.includes("<form") && htmlResponse.includes("netopia")) {
        console.log(
          "✅ 3DS form detected - this indicates successful payment initiation"
        );

        // Extrage action URL din form
        const actionMatch = htmlResponse.match(/action="([^"]+)"/);
        if (actionMatch) {
          console.log("🎯 Form action URL:", actionMatch[1]);

          if (actionMatch[1].includes("secure.sandbox.netopia-payments.com")) {
            console.log("✅ Correctly using SANDBOX endpoint");
          } else if (actionMatch[1].includes("secure.netopia-payments.com")) {
            console.log("✅ Using LIVE endpoint (as configured)");
          } else {
            console.log("⚠️ Unknown endpoint:", actionMatch[1]);
          }
        }
      } else {
        console.log("❌ Invalid HTML response - not a proper 3DS form");
      }
    } else {
      const textResponse = await response.text();
      console.error(
        "❌ Unexpected response format:",
        textResponse.substring(0, 200)
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("🔍 Error details:", error);
  }
};

// Rulează testul
testPayment();
