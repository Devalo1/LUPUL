// Test configurarea frontend-ului pentru live mode
console.log("=== TESTE CONFIGURARE FRONTEND LIVE MODE ===\n");

// Simulez exact aceleași variabile de mediu care sunt folosite în frontend
const VITE_NETOPIA_SIGNATURE_LIVE = "2ZOW-PJ5X-HYYC-IENE-APZO";
const VITE_PAYMENT_LIVE_KEY =
  "LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt";

// Simulez logica exactă din getNetopiaConfig()
const isProduction = process.env.NODE_ENV === "production";
console.log("1. NODE_ENV:", process.env.NODE_ENV);
console.log("2. isProduction:", isProduction);

// Simulez logica pentru liveSignature
const liveSignature = VITE_NETOPIA_SIGNATURE_LIVE || VITE_PAYMENT_LIVE_KEY;
console.log("3. VITE_NETOPIA_SIGNATURE_LIVE:", VITE_NETOPIA_SIGNATURE_LIVE);
console.log("4. VITE_PAYMENT_LIVE_KEY:", VITE_PAYMENT_LIVE_KEY);
console.log("5. liveSignature (fallback):", liveSignature);

// Simulez hasRealLiveCredentials
const hasRealLiveCredentials = Boolean(liveSignature) && isProduction;
console.log("6. Boolean(liveSignature):", Boolean(liveSignature));
console.log("7. hasRealLiveCredentials:", hasRealLiveCredentials);

// Simulez useLive
const useLive = isProduction && hasRealLiveCredentials;
console.log("8. useLive (final):", useLive);

console.log("\n=== REZULTAT FINAL ===");
console.log(`Frontend va trimite: { live: ${Boolean(useLive)} }`);
console.log(`Backend va folosi endpoint-ul: ${useLive ? "LIVE" : "SANDBOX"}`);

if (useLive) {
  console.log(
    "✅ LIVE MODE ACTIV - Plățile vor fi pe https://secure.netopia-payments.com"
  );
} else {
  console.log(
    "❌ SANDBOX MODE - Plățile vor fi pe https://secure-sandbox.netopia-payments.com"
  );
}
