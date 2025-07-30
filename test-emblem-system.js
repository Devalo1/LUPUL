/**
 * 🔮 SCRIPT DE TEST PENTRU SISTEMUL DE EMBLEME
 * Acest script testează întregul flux de cumpărare embleme
 */

import axios from "axios";

// Configurare pentru teste
const BASE_URL = "http://localhost:8888";
const TEST_USER_ID = "testuser" + Date.now(); // Fără underscore în userId

// Funcții de testare
async function testEmblemSystem() {
  console.log("🔮 ÎNCEPE TESTAREA SISTEMULUI DE EMBLEME\n");

  // Test 1: Verifică că pagina de mint se încarcă
  console.log("📄 Test 1: Verifică că pagina de embleme se încarcă...");
  try {
    const response = await axios.get(`${BASE_URL}/emblems/mint`);
    if (response.status === 200) {
      console.log("✅ Pagina de embleme se încarcă cu succes");
    }
  } catch (error) {
    console.log("❌ Eroare la încărcarea paginii:", error.message);
  }

  // Test 2: Testează funcția Netlify pentru inițierea plății
  console.log("\n💳 Test 2: Testează inițierea plății emblemelor...");

  const paymentData = {
    orderId: `emblem_cautatorul_lumina_${TEST_USER_ID}_${Date.now()}`,
    amount: 5000, // 50 RON în bani (RON * 100)
    currency: "RON",
    description: "Emblema NFT: Căutătorul de Lumină",
    emblemType: "cautatorul_lumina",
    userId: TEST_USER_ID,
    customerInfo: {
      firstName: "Test",
      lastName: "User",
      email: "test@lupulsicorbul.com",
      phone: "0700000000",
      address: "Strada Test 1",
      city: "Bucuresti",
      county: "Bucuresti",
      postalCode: "010000",
    },
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/.netlify/functions/netopia-initiate-emblem`,
      paymentData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.status === 200) {
      console.log("✅ Funcția de inițiere plată funcționează");

      // Verifică că răspunsul conține HTML pentru redirect
      if (
        response.data &&
        typeof response.data === "string" &&
        response.data.includes("netopia")
      ) {
        console.log("✅ HTML-ul de redirect Netopia este generat corect");
      } else {
        console.log("⚠️  Răspunsul nu pare să conțină HTML-ul așteptat");
      }
    }
  } catch (error) {
    console.log("❌ Eroare la inițierea plății:", error.message);
    if (error.response) {
      console.log("📄 Detalii eroare:", error.response.data);
    }
  }

  // Test 3: Verifică configurația Netopia
  console.log("\n🔧 Test 3: Verifică configurația Netopia...");

  const netopiaConfig = {
    sandboxSignature:
      process.env.NETOPIA_SANDBOX_SIGNATURE || "2ZOW-PJ5X-HYYC-IENE-APZO",
    hasLiveSignature:
      process.env.NETOPIA_LIVE_SIGNATURE &&
      process.env.NETOPIA_LIVE_SIGNATURE !== "2ZOW-PJ5X-HYYC-IENE-APZO",
  };

  console.log("📊 Configurație Netopia:");
  console.log(`   Sandbox Signature: ${netopiaConfig.sandboxSignature}`);
  console.log(
    `   Are Live Credentials: ${netopiaConfig.hasLiveSignature ? "DA" : "NU (folosește sandbox)"}`
  );

  // Test 4: Simulează o notificare de plată reușită
  console.log("\n🔔 Test 4: Simulează confirmarea plății...");

  const notificationData = {
    orderId: paymentData.orderId,
    status: "confirmed",
    amount: paymentData.amount,
    signature: "test_signature_123",
    data: "test_data_payload",
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/.netlify/functions/netopia-notify-emblem`,
      notificationData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.status === 200) {
      console.log("✅ Funcția de notificare funcționează");
      console.log("📊 Răspuns:", response.data);
    }
  } catch (error) {
    console.log("❌ Eroare la notificarea plății:", error.message);
    if (error.response) {
      console.log("📄 Detalii eroare:", error.response.data);
    }
  }

  console.log("\n🎉 TESTARE FINALIZATĂ!");
  console.log("\n📋 REZUMAT:");
  console.log("Pentru a testa sistemul complet:");
  console.log("1. 🌐 Deschide: http://localhost:8888/emblems/mint");
  console.log("2. 🔐 Autentifică-te cu un cont Firebase");
  console.log("3. 🛒 Încearcă să cumperi o emblemă");
  console.log("4. 💳 Vei fi redirectat către Netopia (sandbox)");
  console.log("5. 🎯 Completează plata cu un card de test");
  console.log("\n💡 CARDURI DE TEST NETOPIA:");
  console.log("   Card: 4111 1111 1111 1111");
  console.log("   Exp: 12/25, CVV: 123");
  console.log("   Sau: 5555 5555 5555 4444");
  console.log("   Exp: 12/25, CVV: 123");
}

// Rulează testele
testEmblemSystem().catch(console.error);
