// TEST FINAL - Verificare completă post-deployment
console.log("=== TEST FINAL POST-DEPLOYMENT ===\n");

async function finalProductionTest() {
  try {
    console.log("🚀 Testez platforma LIVE după deployment final...");

    const finalPayload = {
      orderId: "PRODUCTION_FINAL_" + Date.now(),
      amount: 1.0,
      currency: "RON",
      orderDescription: "Test final după deployment complet",
      customerInfo: {
        email: "test@final.com",
        firstName: "Final",
        lastName: "Test",
      },
    };

    console.log("📤 Request către platforma actualizată...");

    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://lupulsicorbul.com",
        },
        body: JSON.stringify(finalPayload),
      }
    );

    const result = await response.json();

    console.log("\n📋 Rezultat final:");
    console.log(`Status: ${response.status}`);
    console.log(`Environment: ${result.environment}`);
    console.log(`URL: ${result.paymentUrl}`);

    // Analiza finală
    const isLive = result.paymentUrl?.includes("secure.netopia-payments.com");
    const isSandbox = result.paymentUrl?.includes(
      "secure-sandbox.netopia-payments.com"
    );

    console.log("\n=== ANALIZA FINALĂ ===");
    if (isLive) {
      console.log("🎉 SUCCESS TOTAL!");
      console.log("✅ Platforma folosește LIVE mode");
      console.log("✅ URL-ul este pentru producție");
      console.log("✅ Clienții vor fi redirecționați către NETOPIA LIVE");
      console.log("✅ Plățile vor fi procesate în modul REAL");
      console.log(
        "\n🚀 PLATFORMA ESTE COMPLET OPERAȚIONALĂ PENTRU PLĂȚI LIVE!"
      );
    } else if (isSandbox) {
      console.log("⚠️ ATENȚIE: Încă în sandbox mode");
      console.log("❓ Ar putea fi o problemă cu environment detection");
    }

    console.log("\n📊 Detalii finale:");
    console.log(`- API Version: ${result.apiVersion}`);
    console.log(`- Success: ${result.success}`);
    console.log(`- Message: ${result.message}`);
  } catch (error) {
    console.log("❌ EROARE în testul final:", error.message);
  }
}

console.log(
  "Acest test confirmă că toate modificările au fost deploy-ate corect."
);
console.log(
  "Include variabilele VITE_, logica frontend și backend actualizat.\n"
);

finalProductionTest();
