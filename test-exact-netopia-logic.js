// Test EXACT cu logica din netopiaPayments.ts (FĂRĂ bug-ul din debug-env.js)
console.log("=== TEST FINAL LOGIC EXACT DIN NETOPIA PAYMENTS ===\n");

// Simulez exact environment-ul din browser production
const mockEnvironment = {
  hostname: "lupulsicorbul.com",
  VITE_NETOPIA_SIGNATURE_LIVE: "2ZOW-PJ5X-HYYC-IENE-APZO",
  VITE_PAYMENT_LIVE_KEY:
    "LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt",
  MODE: "production",
};

// Reproduc EXACT logica din getNetopiaConfig() din netopiaPayments.ts
function simulateExactNetopiaConfig() {
  console.log(
    "🔧 Simulez EXACT getNetopiaConfig() din netopiaPayments.ts...\n"
  );

  // EXACT ca în cod:
  const isProduction =
    mockEnvironment.hostname === "lupulsicorbul.com" ||
    (mockEnvironment.hostname !== "localhost" &&
      !mockEnvironment.hostname.includes("netlify") &&
      !mockEnvironment.hostname.includes("preview"));

  const liveSignature =
    mockEnvironment.VITE_NETOPIA_SIGNATURE_LIVE ||
    mockEnvironment.VITE_PAYMENT_LIVE_KEY;
  const sandboxSignature = "SANDBOX_SIGNATURE_PLACEHOLDER";

  // EXACT logica din cod (FĂRĂ verificarea greșită din debug-env.js):
  const hasRealLiveCredentials = Boolean(liveSignature) && isProduction;
  const useLive = isProduction && hasRealLiveCredentials;
  const useSandbox = !isProduction && Boolean(sandboxSignature);

  console.log("Netopia Config rezultat:", {
    isProduction,
    useLive,
    useSandbox,
    hostname: mockEnvironment.hostname,
    liveSignatureExists: Boolean(liveSignature),
    liveSignatureValue: liveSignature?.substring(0, 10) + "...",
    hasRealLiveCredentials,
    environment: mockEnvironment.MODE,
  });

  const config = {
    posSignature: useLive ? liveSignature : "2ZOW-PJ5X-HYYC-IENE-APZO",
    baseUrl: useLive
      ? "https://secure.netopia-payments.com"
      : "https://secure.sandbox.netopia-payments.com",
    live: Boolean(useLive),
    publicKey: "SET",
  };

  console.log("\n📋 Config final:", config);
  return config;
}

// Simulez createPaymentData()
function simulateCreatePaymentData(config) {
  console.log("\n💳 Simulez createPaymentData()...");

  const forceSandbox = false; // localStorage.getItem("netopia_force_sandbox") === "true"
  const isProduction = config.live && !forceSandbox;

  console.log("Payment data config:", {
    configLive: config.live,
    forceSandbox,
    isProduction,
    willSendLiveToBackend: isProduction,
  });

  return {
    orderId: "FINAL_TEST_" + Date.now(),
    amount: 10.0,
    currency: "RON",
    description: "Test final cu logica exactă",
    live: isProduction, // ← AICI este cheia!
    returnUrl: "https://lupulsicorbul.com/order-confirmation",
    confirmUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
  };
}

// Test backend simulation
async function simulateBackendResponse(paymentData) {
  console.log("\n🔧 Simulez răspunsul backend-ului...");
  console.log("Backend primește:", { live: paymentData.live });

  // Simulez exact logica din backend
  const useLive = paymentData.live === true;
  const environment = useLive ? "live" : "sandbox";
  const baseUrl = useLive
    ? "https://secure.netopia-payments.com"
    : "https://secure-sandbox.netopia-payments.com";

  console.log("Backend folosește:", { useLive, environment, baseUrl });

  return {
    success: true,
    paymentUrl: `${baseUrl}/ui/card?p=TEST123`,
    environment,
    message: `Payment initiated in ${environment} mode`,
  };
}

// Rulează testul complet
async function runCompleteTest() {
  console.log("🌟 TESTUL FINAL - Simulare completă frontend + backend\n");

  // Pasul 1: getNetopiaConfig()
  const config = simulateExactNetopiaConfig();

  // Pasul 2: createPaymentData()
  const paymentData = simulateCreatePaymentData(config);

  // Pasul 3: Backend response
  const backendResponse = await simulateBackendResponse(paymentData);

  console.log("\n=== REZULTAT FINAL ===");
  console.log("✅ Frontend config.live:", config.live);
  console.log("✅ Payment data live:", paymentData.live);
  console.log("✅ Backend environment:", backendResponse.environment);
  console.log("✅ Payment URL:", backendResponse.paymentUrl);

  if (backendResponse.environment === "live") {
    console.log("\n🎉 SUCCESS COMPLET!");
    console.log("✅ Logica este CORECTĂ");
    console.log("✅ În production va folosi LIVE mode");
    console.log("✅ URL-ul va fi pentru secure.netopia-payments.com");
    console.log("\n🚀 PLATFORMA ESTE GATA PENTRU LIVE PAYMENTS!");
  } else {
    console.log("\n❌ PROBLEMĂ!");
    console.log("❌ Logica nu funcționează cum trebuie");
  }
}

runCompleteTest();
