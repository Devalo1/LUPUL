// Test pentru a simula exact environment-ul din browser production
console.log('=== TEST SIMULARE BROWSER PRODUCTION ===\n');

// Simulez exact variabilele disponibile în browser după build
const mockImportMeta = {
  env: {
    MODE: 'production',
    VITE_NETOPIA_SIGNATURE_LIVE: '2ZOW-PJ5X-HYYC-IENE-APZO',
    VITE_PAYMENT_LIVE_KEY: 'LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt',
    VITE_NETOPIA_PUBLIC_KEY: '-----BEGIN CERTIFICATE-----...',
  }
};

// Simulez window.location din production
const mockWindow = {
  location: {
    hostname: 'lupulsicorbul.com',
    origin: 'https://lupulsicorbul.com'
  }
};

// Reproduc exact logica din getNetopiaConfig()
function simulateGetNetopiaConfig() {
  const isProduction =
    mockWindow.location.hostname === "lupulsicorbul.com" ||
    (mockWindow.location.hostname !== "localhost" &&
      !mockWindow.location.hostname.includes("netlify") &&
      !mockWindow.location.hostname.includes("preview"));

  const liveSignature =
    mockImportMeta.env.VITE_NETOPIA_SIGNATURE_LIVE ||
    mockImportMeta.env.VITE_PAYMENT_LIVE_KEY;
  const sandboxSignature =
    mockImportMeta.env.VITE_NETOPIA_SIGNATURE_SANDBOX ||
    mockImportMeta.env.VITE_PAYMENT_SANDBOX_KEY ||
    "SANDBOX_SIGNATURE_PLACEHOLDER";

  const hasRealLiveCredentials = Boolean(liveSignature) && isProduction;
  const useLive = isProduction && hasRealLiveCredentials;
  const useSandbox = !isProduction && Boolean(sandboxSignature);

  console.log("🔧 Simulare Netopia Config:", {
    hostname: mockWindow.location.hostname,
    isProduction,
    liveSignatureExists: Boolean(liveSignature),
    liveSignature: liveSignature?.substring(0, 10) + "...",
    hasRealLiveCredentials,
    useLive,
    useSandbox,
    environment: mockImportMeta.env.MODE,
  });

  return {
    posSignature: useLive ? liveSignature : "2ZOW-PJ5X-HYYC-IENE-APZO",
    baseUrl: useLive
      ? "https://secure.netopia-payments.com"
      : "https://secure.sandbox.netopia-payments.com",
    live: Boolean(useLive),
    publicKey: mockImportMeta.env.VITE_NETOPIA_PUBLIC_KEY,
  };
}

// Simulez createPaymentData
function simulateCreatePaymentData(config) {
  const forceSandbox = false; // localStorage.getItem("netopia_force_sandbox") === "true"
  const isProduction = config.live && !forceSandbox;

  console.log("💰 Simulare Payment Data:", {
    configLive: config.live,
    forceSandbox,
    isProduction,
    willSendLiveTrue: isProduction
  });

  return {
    orderId: 'SIMULATED_' + Date.now(),
    amount: 50.00,
    currency: 'RON',
    description: 'Test simulat production',
    live: isProduction, // AICI este cheia!
  };
}

// Rulează simularea
console.log('1. Simulez getNetopiaConfig()...');
const config = simulateGetNetopiaConfig();

console.log('\n2. Simulez createPaymentData()...');
const paymentData = simulateCreatePaymentData(config);

console.log('\n=== REZULTAT FINAL ===');
console.log('Config live:', config.live);
console.log('Payment data live:', paymentData.live);
console.log('Frontend va trimite către backend:', JSON.stringify({
  ...paymentData,
  live: paymentData.live
}, null, 2));

if (paymentData.live) {
  console.log('\n🎉 SUCCESS! Frontend va trimite live: true');
  console.log('✅ Backend va folosește LIVE endpoint');
} else {
  console.log('\n❌ Frontend va trimite live: false');
  console.log('⚠️  Backend va folosește SANDBOX endpoint');
}
