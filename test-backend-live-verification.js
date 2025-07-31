// Test pentru a confirma că backend-ul primește live: true corect
console.log("=== VERIFICARE BACKEND CU live: true FORȚAT ===\n");

async function testBackendWithLiveTrue() {
  try {
    console.log("🔍 Testez backend-ul cu live: true explicit...");

    const payloadCuLive = {
      orderId: "BACKEND_LIVE_TEST_" + Date.now(),
      amount: 1.0,
      currency: "RON",
      orderDescription: "Test backend cu live forțat",
      customerInfo: {
        email: "test@backend.com",
        firstName: "Backend",
        lastName: "Test",
      },
      live: true, // FORȚEZ EXPLICIT LIVE MODE
    };

    console.log("📤 Trimit cu live: true explicit...");
    console.log(
      "Payload:",
      JSON.stringify({ ...payloadCuLive, live: payloadCuLive.live }, null, 2)
    );

    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://lupulsicorbul.com",
        },
        body: JSON.stringify(payloadCuLive),
      }
    );

    const result = await response.json();

    console.log("\n📋 Rezultat cu live: true:");
    console.log(`Environment: ${result.environment}`);
    console.log(`URL: ${result.paymentUrl}`);

    if (result.environment === "live") {
      console.log("\n✅ BACKEND FUNCȚIONEAZĂ CORECT!");
      console.log("✅ Cu live: true → returnează environment: live");
      console.log("✅ Problema este că frontend-ul NU trimite live: true");
    } else {
      console.log("\n❌ PROBLEMĂ LA BACKEND!");
      console.log("❌ Chiar cu live: true → returnează sandbox");
    }

    // Test comparativ cu live: false
    console.log("\n🔄 Test comparativ cu live: false...");

    const payloadCuSandbox = {
      ...payloadCuLive,
      orderId: "BACKEND_SANDBOX_TEST_" + Date.now(),
      live: false,
    };

    const sandboxResponse = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://lupulsicorbul.com",
        },
        body: JSON.stringify(payloadCuSandbox),
      }
    );

    const sandboxResult = await sandboxResponse.json();

    console.log("\n📋 Rezultat cu live: false:");
    console.log(`Environment: ${sandboxResult.environment}`);

    console.log("\n=== CONCLUZIE ===");
    if (
      result.environment === "live" &&
      sandboxResult.environment === "sandbox"
    ) {
      console.log("✅ Backend-ul funcționează PERFECT!");
      console.log("✅ live: true → live environment");
      console.log("✅ live: false → sandbox environment");
      console.log(
        "\n🎯 PROBLEMA: Frontend-ul nu trimite live: true în requests-urile reale"
      );
      console.log(
        "📝 Trebuie să verific de ce frontend-ul nu detectează production mode"
      );
    } else {
      console.log("❌ Backend-ul nu procesează corect parametrul live");
    }
  } catch (error) {
    console.log("❌ EROARE:", error.message);
  }
}

testBackendWithLiveTrue();
