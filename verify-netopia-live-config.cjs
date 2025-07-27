#!/usr/bin/env node

/**
 * Script pentru verificarea configurației NETOPIA LIVE în Netlify
 * Testează dacă toate variabilele de environment necesare sunt setate corect
 */

const https = require("https");

console.log("🔍 Verificare configurație NETOPIA LIVE Netlify...\n");

// Testează dacă Netlify CLI este disponibil
async function checkNetlifyCLI() {
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    exec("netlify --version", (error, stdout) => {
      if (error) {
        console.log("❌ Netlify CLI nu este instalat");
        console.log("   Instalează cu: npm install -g netlify-cli\n");
        resolve(false);
      } else {
        console.log(`✅ Netlify CLI: ${stdout.trim()}`);
        resolve(true);
      }
    });
  });
}

// Testează conexiunea la Netlify
async function checkNetlifyAuth() {
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    exec("netlify status", (error, stdout) => {
      if (error) {
        console.log("❌ Nu ești autentificat în Netlify");
        console.log("   Loghează-te cu: netlify login\n");
        resolve(false);
      } else {
        console.log("✅ Conectat la Netlify");
        resolve(true);
      }
    });
  });
}

// Verifică variabilele de environment
async function checkEnvironmentVars() {
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    exec("netlify env:list", (error, stdout) => {
      if (error) {
        console.log("❌ Nu pot accesa variabilele de environment");
        resolve(false);
        return;
      }

      const requiredVars = [
        "NETOPIA_LIVE_SIGNATURE",
        "NETOPIA_LIVE_PUBLIC_KEY",
        "NETOPIA_LIVE_PRIVATE_KEY",
        "NETOPIA_LIVE_CERTIFICATE",
        "VITE_PAYMENT_LIVE_KEY",
      ];

      console.log("\n📋 Verificare variabile NETOPIA LIVE:");

      let allVarsSet = true;
      requiredVars.forEach((varName) => {
        if (stdout.includes(varName)) {
          console.log(`   ✅ ${varName}`);
        } else {
          console.log(`   ❌ ${varName} - LIPSEȘTE`);
          allVarsSet = false;
        }
      });

      console.log(
        `\n${allVarsSet ? "✅" : "❌"} Toate variabilele ${allVarsSet ? "sunt configurate" : "NU sunt configurate"}`
      );
      resolve(allVarsSet);
    });
  });
}

// Testează endpoint-ul Netlify function
async function testNetlifyFunction() {
  return new Promise((resolve) => {
    console.log("\n🧪 Test Netlify Function...");

    // Testează cu un payload simplu
    const testPayload = JSON.stringify({
      orderId: "TEST-VERIFY-" + Date.now(),
      amount: 100,
      currency: "RON",
      description: "Test verificare credențiale LIVE",
      live: true,
      customerInfo: {
        firstName: "Test",
        lastName: "Verificare",
        email: "test@lupulsicorbul.com",
        phone: "0700000000",
        address: "Test Address",
        city: "Bucuresti",
        county: "Bucuresti",
        postalCode: "123456",
      },
    });

    const options = {
      hostname: "lupulsicorbul.com",
      path: "/.netlify/functions/netopia-initiate",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(testPayload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("   ✅ Netlify Function răspunde corect");
          console.log(`   📊 Status: ${res.statusCode}`);

          // Verifică dacă răspunsul conține date NETOPIA
          if (
            data.includes("netopia") ||
            data.includes("NETOPIA") ||
            data.includes("3DS")
          ) {
            console.log("   ✅ Răspuns conține date NETOPIA valide");
          } else {
            console.log("   ⚠️  Răspuns nu pare să conțină date NETOPIA");
          }
          resolve(true);
        } else {
          console.log(`   ❌ Netlify Function eroare: ${res.statusCode}`);
          console.log(`   📄 Răspuns: ${data.substring(0, 200)}...`);
          resolve(false);
        }
      });
    });

    req.on("error", (error) => {
      console.log(`   ❌ Eroare conexiune: ${error.message}`);
      resolve(false);
    });

    req.write(testPayload);
    req.end();
  });
}

// Afișează ghidul de deployment
function showDeploymentGuide() {
  console.log("\n🚀 Ghid finalizare configurație:");
  console.log("   1. Rulează scriptul de configurare:");
  console.log("      ./setup-netopia-live-netlify.ps1");
  console.log("   2. Deploy site-ul cu noile variabile:");
  console.log("      netlify deploy --prod");
  console.log("   3. Testează plățile în production:");
  console.log("      https://lupulsicorbul.com/checkout");
  console.log(
    "\n⚠️  ATENȚIE: După deployment, sistemul va procesa plăți REALE!"
  );
}

// Rulează toate verificările
async function runAllChecks() {
  console.log("🏁 Începere verificări...\n");

  const hasNetlifyCLI = await checkNetlifyCLI();
  if (!hasNetlifyCLI) return;

  const isAuthenticated = await checkNetlifyAuth();
  if (!isAuthenticated) return;

  const varsConfigured = await checkEnvironmentVars();
  const functionWorks = await testNetlifyFunction();

  console.log("\n📊 REZULTATE FINALE:");
  console.log(`   Netlify CLI: ${hasNetlifyCLI ? "✅ OK" : "❌ EROARE"}`);
  console.log(`   Autentificare: ${isAuthenticated ? "✅ OK" : "❌ EROARE"}`);
  console.log(`   Variabile env: ${varsConfigured ? "✅ OK" : "❌ LIPSESC"}`);
  console.log(`   Function test: ${functionWorks ? "✅ OK" : "❌ EROARE"}`);

  if (hasNetlifyCLI && isAuthenticated && varsConfigured && functionWorks) {
    console.log("\n🎉 CONFIGURAȚIE COMPLETĂ! Sistemul NETOPIA LIVE este gata!");
  } else {
    console.log("\n⚠️  Configurația necesită încă lucrări...");
    showDeploymentGuide();
  }
}

// Rulează verificările
runAllChecks().catch(console.error);
