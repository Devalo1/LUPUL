// Test direct pentru variabilele de mediu
console.log("🔍 Environment Variables Test:");
console.log("import.meta.env:", import.meta.env);
console.log(
  "VITE_NETOPIA_SIGNATURE_LIVE:",
  import.meta.env.VITE_NETOPIA_SIGNATURE_LIVE
);
console.log(
  "VITE_NETOPIA_PUBLIC_KEY exists:",
  !!import.meta.env.VITE_NETOPIA_PUBLIC_KEY
);

// Test direct pentru getNetopiaConfig
const isProduction = window.location.hostname === "lupulsicorbul.com";
const liveSignature = import.meta.env.VITE_NETOPIA_SIGNATURE_LIVE;
const sandboxSignature = "2ZOW-PJ5X-HYYC-IENE-APZO";

const hasRealLiveCredentials =
  Boolean(liveSignature) &&
  liveSignature !== "2ZOW-PJ5X-HYYC-IENE-APZO" &&
  liveSignature !== sandboxSignature;

const useLive = isProduction && hasRealLiveCredentials;

console.log("🧪 Config Test Result:", {
  hostname: window.location.hostname,
  isProduction,
  liveSignature: liveSignature
    ? liveSignature.substring(0, 10) + "..."
    : "NOT SET",
  hasRealLiveCredentials,
  useLive,
  problem: liveSignature === sandboxSignature ? "SAME AS SANDBOX!" : "ok",
});

export {}; // Make this a module
