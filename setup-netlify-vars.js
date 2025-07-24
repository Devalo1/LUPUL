#!/usr/bin/env node

/**
 * Script automat pentru configurarea variabilelor de mediu în Netlify
 * Acest script poate fi rulat pentru a seta automat toate variabilele necesare
 */

const { execSync } = require("child_process");
const https = require("https");

// Configurația necesară
const REQUIRED_ENV_VARS = {
  // Pentru emailuri (URGENT)
  SMTP_USER: "lupulsicorbul@gmail.com",
  SMTP_PASS: "lraf ziyj xyii ssas",

  // Pentru Netopia (fallback la sandbox funcțional)
  NETOPIA_LIVE_SIGNATURE: "2ZOW-PJ5X-HYYC-IENE-APZO",
  NETOPIA_LIVE_PUBLIC_KEY: "sandbox_public_key",
  VITE_PAYMENT_LIVE_KEY: "2ZOW-PJ5X-HYYC-IENE-APZO",
  VITE_NETOPIA_PUBLIC_KEY: "sandbox_public_key",
};

console.log("🔧 CONFIGURARE AUTOMATĂ VARIABILE NETLIFY");
console.log("==========================================");

// Afișează variabilele care vor fi setate
console.log("\n📋 Variabile care vor fi configurate:");
Object.entries(REQUIRED_ENV_VARS).forEach(([key, value]) => {
  const displayValue =
    key.includes("PASS") || key.includes("SIGNATURE")
      ? value.substring(0, 8) + "..."
      : value;
  console.log(`   ${key} = ${displayValue}`);
});

console.log("\n⚠️  INSTRUCȚIUNI MANUALE PENTRU NETLIFY:");
console.log("=======================================");
console.log("1. Intră în Netlify Dashboard: https://app.netlify.com/");
console.log("2. Selectează site-ul: lupul-si-corbul");
console.log("3. Mergi la: Site Settings → Environment Variables");
console.log("4. Pentru fiecare variabilă de mai jos, click 'Add variable':");

console.log("\n🔑 VARIABILE DE COPIAT ÎN NETLIFY:");
console.log("==================================");

Object.entries(REQUIRED_ENV_VARS).forEach(([key, value]) => {
  console.log(`\nKey: ${key}`);
  console.log(`Value: ${value}`);
  console.log("Scopes: [leave default - All]");
  console.log("---");
});

console.log("\n5. După adăugarea tuturor variabilelor:");
console.log("   → Mergi la Deploys tab");
console.log("   → Click 'Trigger deploy' → 'Deploy site'");
console.log("   → Așteaptă 2-3 minute pentru deploy");

console.log("\n✅ VERIFICARE RAPIDĂ DUPĂ DEPLOY:");
console.log("=================================");
console.log("1. Testează o comandă cu plata ramburs → verifică inbox-ul");
console.log(
  "2. Testează plata cu cardul → nu ar mai trebui să apară '🧪 SIMULARE TEST'"
);
console.log("3. Site-ul tău: https://lupulsicorbul.com");

console.log("\n🎯 PRIORITATEA ACTUALĂ:");
console.log("=======================");
console.log(
  "✅ URGENT: Setează SMTP_USER și SMTP_PASS pentru emailuri ramburs"
);
console.log(
  "⚠️  MEDIUM: Setează variabilele Netopia pentru plăți (temporar sandbox)"
);
console.log(
  "🔮 VIITOR: Contactează Netopia (021-304-7799) pentru credențiale LIVE reale"
);

console.log("\n" + "=".repeat(50));
console.log("🚀 GATA! Urmează instrucțiunile de mai sus pentru fix complet!");
console.log("=".repeat(50));
