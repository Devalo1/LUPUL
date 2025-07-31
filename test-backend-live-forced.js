// Test direct cu live: true forțat pentru a verifica backend-ul
console.log("=== TEST BACKEND CU LIVE MODE FORȚAT ===\n");

async function testBackendWithForcedLive() {
  try {
    console.log("🔧 Testez backend-ul cu live: true explicit...");

    const livePayload = {
      orderId: "FORCED_LIVE_" + Date.now(),
      amount: 5.0,
      currency: "RON",
      orderDescription: "Test backend live forțat",
      customerInfo: {
        email: "test@backend.com",
        firstName: "Backend",
        lastName: "Test",
      },
      live: true, // ← FORȚEZ LIVE MODE
    };

    console.log("📤 Payload cu live: true:");
    console.log(JSON.stringify(livePayload, null, 2));

    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://lupulsicorbul.com",
        },
        body: JSON.stringify(livePayload),
      }
    );

    console.log(`\n📥 Response: ${response.status} ${response.statusText}`);

    const result = await response.json();
    console.log("\n📋 Rezultat backend:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n=== ANALIZA BACKEND ===");

    if (result.success) {
      const isLiveUrl = result.paymentUrl?.includes(
        "secure.netopia-payments.com"
      );
      const isSandboxUrl = result.paymentUrl?.includes(
        "secure-sandbox.netopia-payments.com"
      );

      console.log(`Environment returnat: ${result.environment}`);
      console.log(
        `URL type: ${isLiveUrl ? "LIVE" : isSandboxUrl ? "SANDBOX" : "UNKNOWN"}`
      );

      if (isLiveUrl) {
        console.log("\n✅ BACKEND FUNCȚIONEAZĂ CORECT!");
        console.log("✅ Cu live: true → returnează URL live");
        console.log("✅ Problema este în frontend - nu trimite live: true");
      } else if (isSandboxUrl) {
        console.log("\n❌ PROBLEMĂ LA BACKEND!");
        console.log("❌ Chiar cu live: true → returnează URL sandbox");
        console.log("❌ Verifică configurația backend-ului");
      }
    } else {
      console.log("\n❌ EROARE în backend:");
      console.log(`Error: ${result.error}`);
    }

    // Test și cu live: false pentru comparație
    console.log("\n\n🔧 Test de comparație cu live: false...");

    const sandboxPayload = {
      ...livePayload,
      orderId: "FORCED_SANDBOX_" + Date.now(),
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
        body: JSON.stringify(sandboxPayload),
      }
    );

    const sandboxResult = await sandboxResponse.json();
    console.log("\n📋 Rezultat cu live: false:");
    console.log(`Environment: ${sandboxResult.environment}`);
    console.log(
      `URL type: ${sandboxResult.paymentUrl?.includes("sandbox") ? "SANDBOX" : "LIVE"}`
    );

    console.log("\n=== CONCLUZIE ===");
    if (
      result.environment === "live" &&
      sandboxResult.environment === "sandbox"
    ) {
      console.log("✅ Backend-ul funcționează PERFECT!");
      console.log("✅ live: true → environment: live");
      console.log("✅ live: false → environment: sandbox");
      console.log(
        "\n🎯 PROBLEMA: Frontend-ul nu trimite live: true în producție"
      );
    } else {
      console.log("❌ Problemă la backend - nu respectă parametrul live");
    }
  } catch (error) {
    console.log("❌ EROARE:", error.message);
  }
}

testBackendWithForcedLive();
