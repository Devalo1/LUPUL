/**
 * 🧪 SCRIPT DE TESTARE NETOPIA ÎN PRODUCȚIE
 *
 * Rulează acest cod în Console-ul browserului pe https://lupulsicorbul.com
 * pentru a verifica dacă funcția NETOPIA funcționează
 */

(async function testNetopiaProduction() {
  console.log("🧪 TESTARE NETOPIA PRODUCȚIE");
  console.log("============================");

  const testPayload = {
    orderId: `PROD-TEST-${Date.now()}`,
    amount: 1.0,
    currency: "RON",
    description: "Test funcție NETOPIA în producție",
    customerInfo: {
      firstName: "Test",
      lastName: "Production",
      email: "test@lupulsicorbul.com",
      phone: "0700000000",
      address: "Strada Test nr. 1",
      city: "Bucuresti",
      county: "Bucuresti",
      postalCode: "010000",
    },
    live: true,
    returnUrl: "https://lupulsicorbul.com/order-confirmation",
    confirmUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
  };

  console.log("📦 Payload de test:", {
    orderId: testPayload.orderId,
    amount: testPayload.amount,
    live: testPayload.live,
  });

  try {
    console.log("🌐 Testare endpoint: /.netlify/functions/netopia-v2-api");

    const response = await fetch("/.netlify/functions/netopia-v2-api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log("📊 Status răspuns:", response.status);
    console.log("📋 Headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("📄 Lungime răspuns:", responseText.length);
    console.log("🔍 Preview răspuns:", responseText.substring(0, 300));

    if (response.status === 404) {
      console.log("❌ EROARE 404: Funcția nu este găsită");
      console.log("🔧 CAUZE POSIBILE:");
      console.log("   1. Funcția nu este deploy-ată pe Netlify");
      console.log("   2. Numele funcției este greșit");
      console.log("   3. Problema cu redirect-urile SPA");
      return;
    }

    if (
      responseText.includes("<!DOCTYPE html>") ||
      responseText.includes("<html")
    ) {
      console.log("❌ PROBLEMA: Primit HTML în loc de JSON");
      console.log("🔧 CAUZA: Redirect SPA sau funcția nu este disponibilă");

      // Încearcă să detecteze ce pagină HTML a fost returnată
      const titleMatch = responseText.match(/<title>(.*?)<\/title>/);
      if (titleMatch) {
        console.log("📄 Titlu pagină:", titleMatch[1]);
      }
      return;
    }

    // Încearcă să parseze JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log("✅ RĂSPUNS JSON VALID:", jsonResponse);

      if (jsonResponse.success) {
        console.log("🎉 SUCCES: Funcția NETOPIA funcționează!");
        console.log(
          "🔗 Payment URL generat:",
          jsonResponse.paymentUrl ? "DA" : "NU"
        );
        console.log("🆔 Order ID:", jsonResponse.orderId);
        console.log("🌍 Environment:", jsonResponse.environment);
      } else {
        console.log("⚠️ FUNCȚIA RETURNEAZĂ EROARE:", jsonResponse.message);
        if (jsonResponse.message.includes("API KEY not configured")) {
          console.log(
            "🔧 SOLUȚIE: Configurează NETOPIA_LIVE_API_KEY în Netlify"
          );
        }
      }
    } catch (parseError) {
      console.log("❌ RĂSPUNS NU ESTE JSON VALID");
      console.log("📄 Răspuns complet:", responseText);
    }
  } catch (fetchError) {
    console.error("❌ EROARE LA FETCH:", fetchError.message);
    console.log("🔧 POSIBILE CAUZE:");
    console.log("   1. Problemă de rețea");
    console.log("   2. CORS blocking");
    console.log("   3. Funcția nu există");
  }

  // Verifică și variabilele de mediu disponibile
  console.log("\n🔍 VERIFICARE MEDIU:");
  console.log("Hostname:", window.location.hostname);
  console.log("Environment:", import.meta?.env?.MODE || "N/A");

  // Listează variabilele VITE disponibile
  try {
    console.log("Variabile NETOPIA: Se pot verifica manual în Network tab");
  } catch (e) {
    console.log("Nu pot accesa variabilele de mediu în browser");
  }

  console.log("\n💡 PENTRU DEBUGGING AVANSAT:");
  console.log("1. Verifică Netlify Functions Dashboard");
  console.log("2. Verifică Environment Variables în Netlify");
  console.log("3. Verifică Deploy Logs pentru erori");
  console.log("4. Testează funcția direct în Netlify Functions tab");
})();
