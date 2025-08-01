/**
 * Debug pentru environment detection logic
 */

// Simulăm variabilele de mediu
const mockEnv = {
  URL: "https://lupulsicorbul.com",
  NETOPIA_LIVE_SIGNATURE: "2ZOW-PJ5X-HYYC-IENE-APZO",
  NETOPIA_LIVE_API_KEY:
    "VfjsAdVjct7hQkMXRHKlimzmGGUHztw1e-C1PmvUoBlxkHs05BeWPpx0SXgV",
};

function debugEnvironmentDetection() {
  console.log("🔍 Environment Detection Debug\n");

  const baseUrl = mockEnv.URL || "https://lupulsicorbul.com";
  const isProduction =
    baseUrl.includes("lupulsicorbul.com") && !baseUrl.includes("localhost");
  const hasLiveSignature = Boolean(mockEnv.NETOPIA_LIVE_SIGNATURE);

  console.log("Variables:");
  console.log("baseUrl:", baseUrl);
  console.log("isProduction:", isProduction);
  console.log("hasLiveSignature:", hasLiveSignature);
  console.log(
    "NETOPIA_LIVE_SIGNATURE present:",
    !!mockEnv.NETOPIA_LIVE_SIGNATURE
  );
  console.log("NETOPIA_LIVE_API_KEY present:", !!mockEnv.NETOPIA_LIVE_API_KEY);

  // Test cu paymentData.live = undefined (default)
  const paymentData1 = {};
  const useLive1 =
    paymentData1.live === true || (isProduction && hasLiveSignature);

  console.log("\n🧪 Test 1 - No explicit live flag:");
  console.log("paymentData.live:", paymentData1.live);
  console.log("paymentData.live === true:", paymentData1.live === true);
  console.log(
    "(isProduction && hasLiveSignature):",
    isProduction && hasLiveSignature
  );
  console.log("useLive:", useLive1);

  // Test cu paymentData.live = true
  const paymentData2 = { live: true };
  const useLive2 =
    paymentData2.live === true || (isProduction && hasLiveSignature);

  console.log("\n🧪 Test 2 - With explicit live=true:");
  console.log("paymentData.live:", paymentData2.live);
  console.log("paymentData.live === true:", paymentData2.live === true);
  console.log("useLive:", useLive2);

  console.log("\n📋 Expected Result:");
  console.log(
    "Should use LIVE in production:",
    isProduction && hasLiveSignature
  );
}

debugEnvironmentDetection();
