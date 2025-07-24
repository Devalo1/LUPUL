/**
 * Script de verificare pentru configurația de producție
 * Rulează în browser console pe site-ul live pentru a verifica configurațiile
 */

console.log("🔍 VERIFICARE CONFIGURAȚIE PRODUCȚIE");
console.log("====================================");

// 1. Verifică mediul de rulare
const isProduction = window.location.hostname !== "localhost";
console.log(`🌐 Mediu detectat: ${isProduction ? "PRODUCȚIE" : "DEZVOLTARE"}`);
console.log(`📍 Hostname: ${window.location.hostname}`);

// 2. Verifică variabilele frontend pentru Netopia
console.log("\n💳 CONFIGURAȚIE NETOPIA:");
const hasLiveSignature = import.meta.env?.VITE_PAYMENT_LIVE_KEY;
const hasPublicKey = import.meta.env?.VITE_NETOPIA_PUBLIC_KEY;

console.log(
  `✅ VITE_PAYMENT_LIVE_KEY: ${hasLiveSignature ? "SETAT" : "❌ LIPSEȘTE"}`
);
console.log(
  `✅ VITE_NETOPIA_PUBLIC_KEY: ${hasPublicKey ? "SETAT" : "❌ LIPSEȘTE"}`
);

if (hasLiveSignature) {
  const isRealLive = hasLiveSignature !== "2ZOW-PJ5X-HYYC-IENE-APZO";
  console.log(
    `🎯 Tip credențiale: ${isRealLive ? "LIVE REALE" : "SANDBOX/TEST"}`
  );
}

// 3. Test configurație Netopia service
if (typeof window !== "undefined") {
  try {
    import("./src/services/netopiaPayments.js")
      .then(({ netopiaService }) => {
        console.log("\n🔧 SERVICIU NETOPIA:");
        console.log(
          "Config încărcat:",
          netopiaService?.config || "Nu s-a putut încărca"
        );
      })
      .catch((err) => {
        console.log("⚠️ Nu s-a putut încărca serviciul Netopia:", err.message);
      });
  } catch (error) {
    console.log("⚠️ Import Netopia service failed:", error.message);
  }
}

// 4. Verificare backend endpoints
console.log("\n🔗 VERIFICARE ENDPOINTS BACKEND:");

// Test funcția Netopia debug
fetch("/.netlify/functions/netopia-debug")
  .then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(`HTTP ${response.status}`);
  })
  .then((data) => {
    console.log("✅ Netopia Debug Response:");
    console.log("   - Mode:", data.netopiaConfig?.mode || "NECUNOSCUT");
    console.log("   - Endpoint:", data.netopiaConfig?.endpoint || "NECUNOSCUT");
    console.log(
      "   - Has Live Signature:",
      data.environment?.NETOPIA_LIVE_SIGNATURE !== "NOT SET" ? "DA" : "NU"
    );
  })
  .catch((error) => {
    console.log("❌ Netopia Debug endpoint nu funcționează:", error.message);
  });

// Test funcția de email
fetch("/.netlify/functions/send-order-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderData: { email: "test@test.com", firstName: "Test", lastName: "User" },
    orderNumber: "TEST-" + Date.now(),
    totalAmount: 1000,
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Email System Status:");
    if (data.development) {
      console.log("   - Status: ❌ DEVELOPMENT MODE (emailuri simulate)");
      console.log("   - Fix: Setează SMTP_USER și SMTP_PASS în Netlify");
    } else {
      console.log("   - Status: ✅ PRODUCTION MODE (emailuri reale)");
    }
  })
  .catch((error) => {
    console.log("⚠️ Test email endpoint:", error.message);
  });

// 5. Instrucțiuni de remediere
setTimeout(() => {
  console.log("\n🔧 INSTRUCȚIUNI REMEDIERE:");
  console.log("========================");

  if (!hasLiveSignature) {
    console.log("❌ NETOPIA: Lipsesc variabilele VITE_PAYMENT_LIVE_KEY");
    console.log("   → Adaugă în Netlify Environment Variables");
  }

  console.log("\n📧 Pentru emailuri ramburs:");
  console.log("   → Setează SMTP_USER=lupulsicorbul@gmail.com");
  console.log("   → Setează SMTP_PASS=lraf ziyj xyii ssas");

  console.log("\n💳 Pentru plăți cu cardul:");
  console.log("   → Contactează Netopia: 021-304-7799");
  console.log("   → Solicită credențiale LIVE pentru producție");

  console.log("\n🔄 După orice modificare în Netlify:");
  console.log("   → Trigger new deploy pentru a aplica schimbările");
}, 2000);

console.log("\n⏳ Se rulează verificările...");
