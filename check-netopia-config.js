/**
 * Script de verificare pentru configurația NETOPIA în producție
 * Rulează acest script pentru a verifica dacă variabilele de mediu sunt setate corect
 */

// Simulează mediul de producție
const mockWindow = {
  location: {
    hostname: "lupul-si-corbul.netlify.app",
  },
};

// Simulează variabilele de mediu Vite
const mockEnv = {
  VITE_PAYMENT_LIVE_KEY: process.env.VITE_PAYMENT_LIVE_KEY || null,
  MODE: "production",
};

console.log("🔍 VERIFICARE CONFIGURAȚIE NETOPIA PRODUCȚIE");
console.log("=".repeat(50));

// Verifică configurația frontend
const isProduction = mockWindow.location.hostname !== "localhost";
const liveSignature = mockEnv.VITE_PAYMENT_LIVE_KEY;
const hasLiveCredentials =
  liveSignature && liveSignature !== "NETOPIA_SANDBOX_TEST_SIGNATURE";
const useLive = isProduction && hasLiveCredentials;

console.log("📱 FRONTEND CONFIG:");
console.log(`   isProduction: ${isProduction}`);
console.log(
  `   liveSignature: ${liveSignature ? "SET (" + liveSignature.length + " chars)" : "NOT SET"}`
);
console.log(`   hasLiveCredentials: ${hasLiveCredentials}`);
console.log(`   useLive: ${useLive}`);
console.log("");

// Verifică configurația backend
console.log("⚙️  BACKEND CONFIG:");
console.log(
  `   NETOPIA_LIVE_SIGNATURE: ${process.env.NETOPIA_LIVE_SIGNATURE ? "SET (" + process.env.NETOPIA_LIVE_SIGNATURE.length + " chars)" : "NOT SET"}`
);
console.log(
  `   NETOPIA_LIVE_PUBLIC_KEY: ${process.env.NETOPIA_LIVE_PUBLIC_KEY ? "SET" : "NOT SET"}`
);
console.log("");

// Rezultatul final
console.log("🎯 REZULTAT:");
if (useLive && process.env.NETOPIA_LIVE_SIGNATURE) {
  console.log("✅ CONFIGURAȚIA ESTE CORECTĂ - va folosi NETOPIA LIVE");
  console.log("   Plățile vor fi procesate în modul LIVE (fără simulare)");
} else {
  console.log("❌ CONFIGURAȚIA ESTE INCORECTĂ - va folosi SANDBOX");
  console.log('   Plățile vor afișa "🧪 SIMULARE TEST"');

  console.log("");
  console.log("🔧 ACȚIUNI NECESARE:");

  if (!liveSignature) {
    console.log("   1. Setează VITE_PAYMENT_LIVE_KEY în Netlify env vars");
  }

  if (!process.env.NETOPIA_LIVE_SIGNATURE) {
    console.log("   2. Setează NETOPIA_LIVE_SIGNATURE în Netlify env vars");
  }

  if (!process.env.NETOPIA_LIVE_PUBLIC_KEY) {
    console.log("   3. Setează NETOPIA_LIVE_PUBLIC_KEY în Netlify env vars");
  }

  console.log("   4. Redeploy aplicația după setarea variabilelor");
}

console.log("");
console.log("📋 VARIABILE DE MEDIU NECESARE:");
console.log("   VITE_PAYMENT_LIVE_KEY=your_live_signature");
console.log("   NETOPIA_LIVE_SIGNATURE=your_live_signature");
console.log("   NETOPIA_LIVE_PUBLIC_KEY=your_live_public_key");
