// Test DIRECT cu platforma LIVE - verificare flow complet
console.log("=== TEST DIRECT PLATFORMA LIVE ===\n");

async function testLivePlatformFlow() {
  try {
    console.log("1. Testez endpoint-ul live...");

    // Test direct cu endpoint-ul live
    const testPayload = {
      orderId: "TEST_LIVE_" + Date.now(),
      amount: 10.0,
      currency: "RON",
      orderDescription: "Test plata LIVE",
      customerInfo: {
        email: "test@lupulsicorbul.com",
        firstName: "Test",
        lastName: "User",
      },
      returnUrl: "https://lupulsicorbul.com/payment-return",
      notifyUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
      live: true, // FORȚEZ LIVE MODE
    };

    console.log(
      "2. Payload pentru test:",
      JSON.stringify(testPayload, null, 2)
    );

    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      }
    );

    console.log("3. Status răspuns:", response.status);
    console.log(
      "4. Headers răspuns:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ EROARE răspuns:", errorText);
      return;
    }

    const result = await response.json();
    console.log("5. Răspuns API:", JSON.stringify(result, null, 2));

    if (result.success && result.paymentUrl) {
      console.log("\n✅ SUCCESS! URL plată generat:");
      console.log("URL:", result.paymentUrl);

      // Verific dacă URL-ul este pentru LIVE sau SANDBOX
      if (result.paymentUrl.includes("secure.netopia-payments.com")) {
        console.log("🎉 LIVE MODE CONFIRMAT - URL-ul este pentru production!");
      } else if (
        result.paymentUrl.includes("secure-sandbox.netopia-payments.com")
      ) {
        console.log("⚠️  SANDBOX MODE - URL-ul este pentru testare");
      } else {
        console.log("❓ URL necunoscut:", result.paymentUrl);
      }
    } else {
      console.log("❌ EȘUAT - Nu s-a generat URL de plată");
    }
  } catch (error) {
    console.log("❌ EROARE în test:", error.message);
  }
}

// Rulează testul
testLivePlatformFlow();
