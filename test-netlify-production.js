#!/usr/bin/env node

/**
 * Script pentru testarea variabilelor Netlify în producție
 * Testează LIVE pe lupulsicorbul.com dacă ai configurat corect variabilele
 */

import https from "https";
import http from "http";

console.log("🔍 TESTARE VARIABILE NETLIFY ÎN PRODUCȚIE");
console.log("=========================================");
console.log("🚨 PROBLEMA CERTIFICAT SSL DETECTATĂ pentru lupulsicorbul.com");
console.log("Testez multiple URL-uri pentru a găsi configurația corectă...");
console.log("");

// Funcție pentru a face request-uri HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const requestOptions = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Netlify-Test-Script/1.0",
        ...options.headers,
      },
    };

    const req = protocol.request(url, requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            rawData: data,
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: null, rawData: data });
        }
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testSiteAccess() {
  const testUrls = [
    "https://lupulsicorbul.com",
    "https://lupul-si-corbul.netlify.app",
    "https://lupulsicorbul.netlify.app",
  ];

  console.log("🌐 Test 1: Accesibilitate site (multiple URL-uri)...");

  for (const url of testUrls) {
    try {
      console.log(`   Testez: ${url}`);
      const response = await makeRequest(url);
      if (response.statusCode === 200) {
        console.log(`   ✅ FUNCȚIONEAZĂ: ${url}`);
        return url; // Returnam URL-ul care functioneaza
      } else {
        console.log(`   ⚠️  Status ${response.statusCode}: ${url}`);
      }
    } catch (error) {
      console.log(`   ❌ NU FUNCȚIONEAZĂ: ${url}`);
      console.log(`      Eroare: ${error.message}`);
    }
  }

  console.log("❌ NICIUN URL NU FUNCȚIONEAZĂ!");
  return null;
}

async function testEmailFunction(baseUrl) {
  console.log("\n📧 Test 2: Funcția de trimitere emailuri...");
  try {
    const testData = {
      orderData: {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        phone: "0123456789",
        address: "Test Address",
        city: "Test City",
        county: "Test County",
      },
      orderNumber: `TEST-${Date.now()}`,
      totalAmount: 1000,
      test: true, // Flag pentru test
    };

    const response = await makeRequest(
      `${baseUrl}/.netlify/functions/send-order-email`,
      {
        method: "POST",
        body: testData,
      }
    );

    if (response.statusCode === 200) {
      console.log("✅ Funcția email: ACCESIBILĂ");

      if (response.data) {
        if (response.data.development) {
          console.log("⚠️  Status: ÎN MOD DEZVOLTARE (emailuri simulate)");
          console.log(
            "   → Variabilele SMTP_USER și SMTP_PASS nu sunt setate în Netlify"
          );
          console.log("   → Soluție: Adaugă variabilele în Netlify Dashboard");
        } else if (response.data.success) {
          console.log("🎉 Status: EMAILURI FUNCȚIONEAZĂ ÎN PRODUCȚIE!");
          console.log("   → Variabilele SMTP sunt configurate corect");
        } else {
          console.log("❌ Status: EROARE LA TRIMITERE EMAIL");
          console.log(`   → Mesaj: ${response.data.message || "Necunoscut"}`);
        }
      }
    } else if (response.statusCode === 404) {
      console.log("❌ Funcția email: NU EXISTĂ sau NU ESTE DEPLOY-UITĂ");
      console.log("   → Verifică dacă ai făcut deploy nou după modificări");
    } else {
      console.log(`❌ Funcția email: Eroare ${response.statusCode}`);
    }
  } catch (error) {
    console.log("❌ Funcția email: NU POATE FI TESTATĂ");
    console.log(`   Eroare: ${error.message}`);
  }
}

async function testNetopiaFunction(baseUrl) {
  console.log("\n💳 Test 3: Funcția de inițiere plăți Netopia...");
  try {
    const testData = {
      amount: 1000,
      orderNumber: `TEST-${Date.now()}`,
      customerEmail: "test@example.com",
      test: true,
    };

    const response = await makeRequest(
      `${baseUrl}/.netlify/functions/netopia-initiate`,
      {
        method: "POST",
        body: testData,
      }
    );

    if (response.statusCode === 200) {
      console.log("✅ Funcția Netopia: ACCESIBILĂ");

      if (response.data) {
        if (response.data.development) {
          console.log("⚠️  Status: ÎN MOD DEZVOLTARE (plăți simulate)");
          console.log("   → Variabilele Netopia nu sunt setate în Netlify");
          console.log("   → Soluție: Adaugă NETOPIA_LIVE_SIGNATURE în Netlify");
        } else if (response.data.paymentUrl) {
          console.log("🎉 Status: PLĂȚI FUNCȚIONEAZĂ!");
          console.log("   → Variabilele Netopia sunt configurate");
          if (response.data.paymentUrl.includes("sandbox")) {
            console.log("   → Mod: SANDBOX (pentru testare)");
          } else {
            console.log("   → Mod: LIVE (producție reală)");
          }
        }
      }
    } else if (response.statusCode === 404) {
      console.log("❌ Funcția Netopia: NU EXISTĂ sau NU ESTE DEPLOY-UITĂ");
    } else {
      console.log(`❌ Funcția Netopia: Eroare ${response.statusCode}`);
    }
  } catch (error) {
    console.log("❌ Funcția Netopia: NU POATE FI TESTATĂ");
    console.log(`   Eroare: ${error.message}`);
  }
}

async function runAllTests() {
  const workingUrl = await testSiteAccess();

  if (!workingUrl) {
    console.log("\n🚨 PROBLEMA CRITICĂ: Niciun URL nu funcționează!");
    console.log("SOLUȚII:");
    console.log("1. Verifică în Netlify Dashboard dacă deploy-ul s-a terminat");
    console.log("2. Verifică Domain Management pentru certificatul SSL");
    console.log("3. Caută URL-ul corect .netlify.app în Dashboard");
    return;
  }

  console.log(`\n🎯 URL FUNCȚIONAL GĂSIT: ${workingUrl}`);

  await testEmailFunction(workingUrl);
  await testNetopiaFunction(workingUrl);

  console.log("\n📋 RAPORT FINAL:");
  console.log("================");
  console.log(
    '1. Dacă emailurile sunt în "mod dezvoltare" → Adaugă SMTP_USER și SMTP_PASS în Netlify'
  );
  console.log(
    '2. Dacă plățile sunt în "mod dezvoltare" → Adaugă NETOPIA_LIVE_SIGNATURE în Netlify'
  );
  console.log("3. După orice modificare în Netlify → Trigger deploy nou");
  console.log("4. Pentru credențiale Netopia reale → Sună 021-304-7799");

  console.log("\n🔗 LEGĂTURI UTILE:");
  console.log("==================");
  console.log("• Netlify Dashboard: https://app.netlify.com/");
  console.log("• Site-ul tău: https://lupulsicorbul.com");
  console.log(
    "• Test comandă reală: https://lupulsicorbul.com (încearcă să faci o comandă test)"
  );

  console.log("\n" + "=".repeat(50));
  console.log("🎯 TESTARE COMPLETĂ! Verifică rezultatele de mai sus.");
  console.log("=".repeat(50));
}

// Rulează testele
runAllTests().catch(console.error);
