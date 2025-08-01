/**
 * 🔍 DIAGNOSTIC NETOPIA PENTRU PRODUCȚIE
 *
 * Verifică configurația NETOPIA și identifică problema cu funcția
 * netopia-v2-api în producție
 */

console.log("🔍 DIAGNOSTIC NETOPIA PENTRU PRODUCȚIE");
console.log("=====================================");

// 1. Verifică endpoint-ul funcției Netlify
console.log("\n📡 1. TESTARE ENDPOINT NETOPIA FUNCTION");
console.log("----------------------------------------");

async function testNetopiaEndpoint() {
  try {
    const endpoint = "/.netlify/functions/netopia-v2-api";
    console.log("🌐 Testing endpoint:", `https://lupulsicorbul.com${endpoint}`);

    // Test simplu cu payload minimal
    const testPayload = {
      orderId: `TEST-${Date.now()}`,
      amount: 1.0,
      currency: "RON",
      description: "Test diagnostic",
      customerInfo: {
        firstName: "Test",
        lastName: "User",
        email: "test@lupulsicorbul.com",
        phone: "0700000000",
        address: "Test Address",
        city: "Bucuresti",
        county: "Bucuresti",
        postalCode: "010000",
      },
      live: true, // Pentru testare în producție
    };

    console.log("📦 Payload de test:", {
      orderId: testPayload.orderId,
      amount: testPayload.amount,
      live: testPayload.live,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log("📊 Răspuns primit:");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Content-Type:", response.headers.get("content-type"));

    const responseText = await response.text();
    console.log("Body length:", responseText.length);
    console.log("Body preview:", responseText.substring(0, 200));

    if (responseText.includes("<!DOCTYPE html>")) {
      console.log("❌ PROBLEMĂ: Funcția returnează HTML (404 sau redirect)");
      console.log(
        "🔧 CAUZA: Funcția Netlify nu este disponibilă sau nu se poate accesa"
      );

      // Verifică dacă este o problemă de redirectare SPA
      if (responseText.includes("<title>")) {
        const titleMatch = responseText.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
          console.log("📄 Titlu pagină returnată:", titleMatch[1]);
        }
      }
    } else {
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log("✅ Răspuns JSON valid:", jsonResponse);
      } catch (e) {
        console.log("⚠️ Răspuns text (nu JSON):", responseText);
      }
    }
  } catch (error) {
    console.error("❌ Eroare la testarea endpoint-ului:", error.message);
  }
}

// 2. Verifică configurația mediului
console.log("\n🔧 2. VERIFICARE CONFIGURAȚIE MEDIU");
console.log("-----------------------------------");

function checkEnvironmentConfig() {
  console.log("🌐 Hostname:", window.location.hostname);
  console.log("🌍 Origin:", window.location.origin);
  console.log("📍 Full URL:", window.location.href);

  // Verifică dacă suntem în producție
  const isProduction =
    window.location.hostname === "lupulsicorbul.com" ||
    window.location.hostname === "www.lupulsicorbul.com";
  console.log("🏭 Este producție:", isProduction);

  // Verifică variabilele disponibile în browser (care încep cu VITE_)
  console.log("\n📋 Variabile VITE disponibile:");
  const viteVars = Object.keys(import.meta.env).filter((key) =>
    key.startsWith("VITE_")
  );
  viteVars.forEach((key) => {
    const value = import.meta.env[key];
    if (key.includes("NETOPIA") || key.includes("PAYMENT")) {
      console.log(
        `${key}: ${value ? value.substring(0, 10) + "..." : "undefined"}`
      );
    } else {
      console.log(`${key}: ${value}`);
    }
  });

  // Verifică específic variabilele NETOPIA
  console.log("\n🔑 Credențiale NETOPIA:");
  const liveSignature = import.meta.env.VITE_NETOPIA_SIGNATURE_LIVE;
  const liveKey = import.meta.env.VITE_PAYMENT_LIVE_KEY;
  const sandboxSignature = import.meta.env.VITE_NETOPIA_SIGNATURE_SANDBOX;

  console.log(
    "VITE_NETOPIA_SIGNATURE_LIVE:",
    liveSignature ? "✅ SET" : "❌ NOT SET"
  );
  console.log("VITE_PAYMENT_LIVE_KEY:", liveKey ? "✅ SET" : "❌ NOT SET");
  console.log(
    "VITE_NETOPIA_SIGNATURE_SANDBOX:",
    sandboxSignature ? "✅ SET" : "❌ NOT SET"
  );

  if (!liveSignature && !liveKey && isProduction) {
    console.log(
      "❌ PROBLEMĂ CRITICĂ: Nu există credențiale NETOPIA Live în producție!"
    );
    console.log(
      "🔧 SOLUȚIE: Adaugă VITE_NETOPIA_SIGNATURE_LIVE și VITE_PAYMENT_LIVE_KEY în Netlify env vars"
    );
  }
}

// 3. Simulează logica de determinare a mediului din netopiaPayments.ts
console.log("\n🧠 3. SIMULARE LOGICĂ MEDIU NETOPIA");
console.log("----------------------------------");

function simulateNetopiaLogic() {
  const hostname = window.location.hostname;
  const isLupulSiCorbul =
    hostname === "lupulsicorbul.com" || hostname === "www.lupulsicorbul.com";
  const isProduction =
    isLupulSiCorbul ||
    (hostname !== "localhost" &&
      !hostname.includes("netlify") &&
      !hostname.includes("preview"));

  console.log("🌐 Hostname detection:", {
    hostname,
    isLupulSiCorbul,
    isProduction,
  });

  const liveSignature =
    import.meta.env.VITE_NETOPIA_SIGNATURE_LIVE ||
    import.meta.env.VITE_PAYMENT_LIVE_KEY;
  const hasLiveCredentials = Boolean(liveSignature) && isProduction;

  console.log("🔑 Credențiale live:", {
    hasLiveSignature: Boolean(liveSignature),
    isProduction,
    hasLiveCredentials,
    willUseLive: hasLiveCredentials,
  });

  const forceSandbox = localStorage.getItem("netopia_force_sandbox") === "true";
  console.log("🧪 Force sandbox flag:", forceSandbox);

  const finalUseLive = hasLiveCredentials && !forceSandbox;
  console.log("🎯 Final decision - Use LIVE mode:", finalUseLive);

  return {
    isProduction,
    hasLiveCredentials,
    finalUseLive,
    expectedEndpoint: finalUseLive
      ? "secure.netopia-payments.com"
      : "secure-sandbox.netopia-payments.com",
  };
}

// 4. Verifică rutele Netlify și redirectările
console.log("\n🛣️ 4. VERIFICARE RUTE NETLIFY");
console.log("-----------------------------");

function checkNetlifyRoutes() {
  // Verifică dacă ruta /api/* funcționează (din netlify.toml)
  console.log("📋 Rute configurate în netlify.toml:");
  console.log("- /api/* → /.netlify/functions/:splat");
  console.log("- /* → /index.html (SPA fallback)");

  console.log("\n🔍 Endpoint-uri de testat:");
  console.log("1. /.netlify/functions/netopia-v2-api (direct)");
  console.log("2. /api/netopia-v2-api (prin redirect)");
}

// Rulează toate testele
async function runAllDiagnostics() {
  checkEnvironmentConfig();
  const logic = simulateNetopiaLogic();
  checkNetlifyRoutes();

  console.log("\n📊 REZUMAT DIAGNOSTIC:");
  console.log("======================");
  console.log(`🌐 Mediu: ${logic.isProduction ? "PRODUCȚIE" : "DEZVOLTARE"}`);
  console.log(
    `🔑 Credențiale live: ${logic.hasLiveCredentials ? "✅ DA" : "❌ NU"}`
  );
  console.log(`🎯 Va folosi: ${logic.finalUseLive ? "LIVE" : "SANDBOX"}`);
  console.log(`🌍 Endpoint NETOPIA: ${logic.expectedEndpoint}`);

  // Rulează testul endpoint-ului
  await testNetopiaEndpoint();

  console.log("\n🔧 POSIBILE CAUZE PENTRU EROAREA 404:");
  console.log("1. ❌ Funcția netopia-v2-api.js nu este deploy-ată pe Netlify");
  console.log(
    "2. ❌ Variabilele de mediu NETOPIA nu sunt configurate în Netlify"
  );
  console.log("3. ❌ Problema cu redirectările în netlify.toml");
  console.log("4. ❌ Cache-ul browser sau CDN blochează funcția");

  console.log("\n💡 SOLUȚII RECOMANDATE:");
  console.log("1. ✅ Verifică Netlify Functions în dashboard");
  console.log(
    "2. ✅ Adaugă NETOPIA_LIVE_SIGNATURE și NETOPIA_LIVE_API_KEY în Netlify env vars"
  );
  console.log("3. ✅ Redeploy aplicația după configurarea variabilelor");
  console.log("4. ✅ Testează funcția în Netlify Dev local");
}

// Pornește diagnosticul
runAllDiagnostics().catch(console.error);
