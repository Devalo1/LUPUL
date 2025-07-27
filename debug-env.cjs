require("dotenv").config({ path: ".env.local" });

console.log("🔍 Environment Variables Check:");
console.log("================================");

// Frontend vars (VITE_)
console.log("Frontend vars:");
console.log(
  "VITE_NETOPIA_SIGNATURE_LIVE:",
  process.env.VITE_NETOPIA_SIGNATURE_LIVE
);
console.log(
  "VITE_NETOPIA_SIGNATURE_SANDBOX:",
  process.env.VITE_NETOPIA_SIGNATURE_SANDBOX
);

// Backend vars
console.log("\nBackend vars:");
console.log("NETOPIA_LIVE_SIGNATURE:", process.env.NETOPIA_LIVE_SIGNATURE);
console.log(
  "NETOPIA_SANDBOX_SIGNATURE:",
  process.env.NETOPIA_SANDBOX_SIGNATURE
);

console.log("\n🎯 Expected behavior:");
console.log(
  "- Frontend should detect live mode:",
  process.env.VITE_NETOPIA_SIGNATURE_LIVE === "2ZOW-PJ5X-HYYC-IENE-APZO"
);
console.log(
  "- Backend should use live config:",
  process.env.NETOPIA_LIVE_SIGNATURE === "2ZOW-PJ5X-HYYC-IENE-APZO"
);
