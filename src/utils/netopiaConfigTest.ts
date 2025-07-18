/**
 * Test pentru configurația NETOPIA
 * Verifică dacă toate variabilele de mediu sunt configurate corect
 */

console.log("🔍 NETOPIA Configuration Test");
console.log("============================");

// Frontend Environment Variables
console.log("\n📱 Frontend Environment:");
console.log(
  "- REACT_APP_NETOPIA_SIGNATURE_LIVE:",
  process.env.REACT_APP_NETOPIA_SIGNATURE_LIVE ? "✅ Set" : "❌ Missing"
);
console.log(
  "- REACT_APP_NETOPIA_PUBLIC_KEY:",
  process.env.REACT_APP_NETOPIA_PUBLIC_KEY ? "✅ Set" : "❌ Missing"
);

// Detect environment
const isProduction =
  typeof window !== "undefined"
    ? window.location.hostname !== "localhost"
    : process.env.NODE_ENV === "production";
console.log("\n🌐 Environment Detection:");
console.log(
  "- Current environment:",
  isProduction ? "PRODUCTION" : "DEVELOPMENT"
);
console.log(
  "- Hostname:",
  typeof window !== "undefined" ? window.location.hostname : "N/A (Node.js)"
);

// Backend Environment Variables (pentru Netlify Functions)
console.log("\n⚙️ Backend Environment (Expected):");
console.log("- NETOPIA_LIVE_SIGNATURE: Should be set in Netlify");
console.log("- NETOPIA_LIVE_PUBLIC_KEY: Should be set in Netlify");

// Configuration Logic Test
const hasLiveCredentials =
  process.env.REACT_APP_NETOPIA_SIGNATURE_LIVE &&
  process.env.REACT_APP_NETOPIA_SIGNATURE_LIVE !== "2ZOW-PJ5X-HYYC-IENE-APZO";

const useLive = isProduction && hasLiveCredentials;

console.log("\n🎯 Configuration Result:");
console.log("- Has live credentials:", hasLiveCredentials ? "✅ Yes" : "❌ No");
console.log(
  "- Will use LIVE mode:",
  useLive ? "✅ Yes" : "❌ No (Fallback to Sandbox)"
);
console.log(
  "- Expected behavior:",
  useLive ? "LIVE Netopia payments" : "SANDBOX Netopia payments"
);

// Recommendations
console.log("\n💡 Recommendations:");
if (isProduction && !hasLiveCredentials) {
  console.log(
    "⚠️  IMPORTANT: You are in PRODUCTION but missing live credentials!"
  );
  console.log("   - All payments will use SANDBOX mode");
  console.log(
    "   - To enable LIVE payments, configure these variables in Netlify:"
  );
  console.log("     * NETOPIA_LIVE_SIGNATURE");
  console.log("     * NETOPIA_LIVE_PUBLIC_KEY");
  console.log("     * REACT_APP_NETOPIA_SIGNATURE_LIVE");
  console.log("     * REACT_APP_NETOPIA_PUBLIC_KEY");
} else if (useLive) {
  console.log("✅ Configuration looks good for LIVE payments!");
} else {
  console.log("ℹ️  Development mode - using SANDBOX is expected");
}

export const netopiaConfigTest = {
  isProduction,
  hasLiveCredentials,
  useLive,
  fallbackToSandbox: isProduction && !hasLiveCredentials,
};
