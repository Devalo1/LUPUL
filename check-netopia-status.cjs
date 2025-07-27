const { exec } = require("child_process");

console.log("🔍 Verificare rapida NETOPIA Live...\n");

// Simple check for required variables
exec("netlify env:list", (error, stdout) => {
  if (error) {
    console.log("❌ Nu pot accesa variabilele de environment");
    console.log("Asigura-te ca esti logat: netlify login");
    return;
  }

  const requiredVars = [
    "NETOPIA_LIVE_SIGNATURE",
    "NETOPIA_LIVE_PUBLIC_KEY", 
    "NETOPIA_LIVE_PRIVATE_KEY",
    "NETOPIA_LIVE_CERTIFICATE",
    "VITE_PAYMENT_LIVE_KEY"
  ];

  console.log("📋 Status variabile NETOPIA LIVE:");
  let allConfigured = true;
  
  requiredVars.forEach(varName => {
    if (stdout.includes(varName)) {
      console.log(`   ✅ ${varName}`);
    } else {
      console.log(`   ❌ ${varName} - LIPSESTE`);
      allConfigured = false;
    }
  });

  console.log(`\n${allConfigured ? '🎉' : '⚠️'} Status: ${allConfigured ? 'COMPLET configurat' : 'INCOMPLETE - vezi MANUAL_SETUP_NETOPIA_LIVE.md'}`);
  
  if (allConfigured) {
    console.log("✅ Toate variabilele NETOPIA Live sunt configurate!");
    console.log("🚀 Poti deploya cu: netlify deploy --prod");
  } else {
    console.log("📋 Urmatorul pas: adauga variabilele lipsa in Netlify Dashboard");
    console.log("🔗 https://app.netlify.com/projects/lupulsicorbul");
  }
});
