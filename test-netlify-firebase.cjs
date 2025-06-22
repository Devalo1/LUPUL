// Test rapid pentru a verifica dacă funcția Netlify cu Firebase funcționează
const fetch = require("node-fetch");

async function testNetlifyFirebase() {
  console.log("🧪 Test Funcție Netlify cu Firebase");
  console.log("══════════════════════════════════════");

  const userId = "test_dumitru_" + Date.now();
  const endpoint = "http://localhost:8888/.netlify/functions/ai-chat";

  console.log(`👤 User ID: ${userId}`);
  console.log(`🔗 Endpoint: ${endpoint}`);

  // Test 1: Utilizatorul spune numele
  console.log('\n1️⃣ Test: "Ma numesc Dumitru"');
  console.log("────────────────────────────────────");

  try {
    const response1 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Ma numesc Dumitru",
        assistantName: "Aria",
        addressMode: "informal",
        userId: userId,
      }),
    });

    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}: ${response1.statusText}`);
    }

    const data1 = await response1.json();
    console.log(`🤖 Răspuns: "${data1.reply}"`);
    console.log(
      `📊 Info extrasă: ${JSON.stringify(data1.extractedInfo || {})}`
    );
    console.log(`✅ Profil actualizat: ${data1.profileUpdated}`);
  } catch (error) {
    console.log(`❌ Eroare Test 1: ${error.message}`);
    console.log("💡 Asigură-te că Netlify dev rulează pe port 8888");
    return;
  }

  // Pauză între teste
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Utilizatorul întreabă numele
  console.log('\n2️⃣ Test: "Cum ma numesc?"');
  console.log("────────────────────────────────────");

  try {
    const response2 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Cum ma numesc?",
        assistantName: "Aria",
        addressMode: "informal",
        userId: userId, // ACELAȘI userId
      }),
    });

    if (!response2.ok) {
      throw new Error(`HTTP ${response2.status}: ${response2.statusText}`);
    }

    const data2 = await response2.json();
    console.log(`🤖 Răspuns: "${data2.reply}"`);

    // Verifică dacă răspunsul conține numele
    if (data2.reply.toLowerCase().includes("dumitru")) {
      console.log("✅ SUCCESS: AI-ul își amintește numele!");
    } else {
      console.log("❌ FAIL: AI-ul nu își amintește numele!");
    }
  } catch (error) {
    console.log(`❌ Eroare Test 2: ${error.message}`);
  }

  console.log("\n🏁 Test complet!");
  console.log("══════════════════════════════════════");
}

// Test pentru un utilizator existent
async function testExistingUser() {
  console.log("\n🔄 Test Utilizator Existent");
  console.log("══════════════════════════════════════");

  const endpoint = "http://localhost:8888/.netlify/functions/ai-chat";
  const existingUserId = "dumitru_test_1750608147641"; // Din testul anterior

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Cum ma numesc?",
        assistantName: "Aria",
        addressMode: "informal",
        userId: existingUserId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🤖 Răspuns pentru utilizator existent: "${data.reply}"`);

    if (data.reply.toLowerCase().includes("dumitru")) {
      console.log("✅ SUCCESS: Memoria persistă între sesiuni!");
    } else {
      console.log("❌ Nu găsește utilizatorul în Firebase");
    }
  } catch (error) {
    console.log(`❌ Eroare test existent: ${error.message}`);
  }
}

async function runTests() {
  await testNetlifyFirebase();
  await testExistingUser();
}

if (require.main === module) {
  runTests();
}

module.exports = { testNetlifyFirebase };
