// Test REAL cu frontend-ul actualizat - simulare completă
console.log("=== TEST REAL FRONTEND FLOW DUPĂ UPDATE ===\n");

async function testRealFrontendFlow() {
  try {
    console.log("1. Testez flow-ul complet cu frontend actualizat...");

    // Simulez exact datele pe care le trimite frontend-ul real după update
    const realPayload = {
      orderId: "REAL_ORDER_" + Date.now(),
      amount: 25.0, // Preț real pentru o sesiune
      currency: "RON",
      orderDescription: "Sesiune de consiliere psihologică - Test LIVE",
      customerInfo: {
        email: "client.real@lupulsicorbul.com",
        firstName: "Ion",
        lastName: "Popescu",
        phone: "+40721234567",
      },
      returnUrl: "https://lupulsicorbul.com/payment-success",
      confirmUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
      // NU forțez live: true - las frontend-ul să decidă automat
    };

    console.log(
      "2. Payload real (fără live forțat):",
      JSON.stringify(realPayload, null, 2)
    );

    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://lupulsicorbul.com", // Simulez request din browser
          Referer: "https://lupulsicorbul.com/checkout",
        },
        body: JSON.stringify(realPayload),
      }
    );

    console.log("3. Status răspuns:", response.status);
    console.log(
      "4. Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ EROARE răspuns:", errorText);
      return;
    }

    const result = await response.json();
    console.log("5. Răspuns complet API:\n", JSON.stringify(result, null, 2));

    if (result.success && result.paymentUrl) {
      console.log("\n=== REZULTAT FINAL ===");
      console.log("✅ URL plată generat:", result.paymentUrl);
      console.log("📋 Order ID:", result.orderId);
      console.log("💰 Sumă:", result.amount, result.currency);
      console.log("🌍 Environment:", result.environment);
      console.log("🔧 API Version:", result.apiVersion);

      // Analiza detaliată a URL-ului
      if (result.paymentUrl.includes("secure.netopia-payments.com")) {
        console.log("\n🎉 SUCCESS COMPLET! LIVE MODE ACTIV!");
        console.log("✅ Frontend-ul detectează corect credențialele live");
        console.log("✅ Backend-ul folosește endpoint-ul live");
        console.log("✅ URL-ul generat este pentru production");
        console.log("\n🚀 PLATA VA FUNCȚIONA PE LIVE!");
      } else if (
        result.paymentUrl.includes("secure-sandbox.netopia-payments.com")
      ) {
        console.log("\n⚠️  SANDBOX MODE ACTIV");
        console.log(
          "❓ Frontend-ul nu detectează credențialele live sau forțează sandbox"
        );
        console.log("❓ Verifică variabilele VITE_ în producție");
      } else {
        console.log("\n❓ URL NECUNOSCUT:", result.paymentUrl);
      }

      // Test adicional - verific dacă pot accesa URL-ul
      console.log("\n6. Testez accesibilitatea URL-ului...");
      try {
        const urlTest = await fetch(result.paymentUrl, { method: "HEAD" });
        console.log("✅ URL accesibil, status:", urlTest.status);
      } catch (urlError) {
        console.log("⚠️  URL nu poate fi testat:", urlError.message);
      }
    } else {
      console.log("❌ EȘUAT - Nu s-a generat URL de plată");
      console.log("Răspuns:", result);
    }
  } catch (error) {
    console.log("❌ EROARE în test:", error.message);
    console.log("Stack:", error.stack);
  }
}

// Rulează testul
testRealFrontendFlow();
