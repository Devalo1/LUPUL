#!/usr/bin/env node

// Test pentru a simula exact scenariul descris de utilizator:
// 1. "Cum îți place să-mi spui pe nume?" → "Dani"
// 2. Confirmarea AI-ului
// 3. Conversație nouă: "Cum mă numesc?"

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";

const fetch = require("node-fetch");

async function testRealConversationFlow() {
  console.log("\n🎭 === TEST FLUX CONVERSAȚIE REALĂ ===\n");

  const userId = `test_real_flow_${Date.now()}`;
  const endpoint =
    "http://localhost:8888/.netlify/functions/ai-chat-firebase-final";

  console.log(`👤 User ID: ${userId}\n`);

  try {
    // === CONVERSAȚIA 1: Detectare și confirmare nume ===
    console.log("🔸 === CONVERSAȚIA 1: Detectare și confirmare ===");

    // AI întreabă de nume
    console.log(
      '\n🤖 AI (simulat): "Apropo, cum îți place să-mi spui pe nume?"'
    );

    // Utilizatorul răspunde cu numele
    console.log('\n👤 User: "Dani"');
    const response1 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Dani",
        assistantName: "Asistentul",
        addressMode: "informal",
        userId: userId,
      }),
    });

    const data1 = await response1.json();
    console.log("🤖 AI:", data1.reply);
    console.log("📊 Debug - Info extrasă:", data1.extractedInfo);
    console.log(
      "📊 Debug - Confirmare necesară:",
      data1.nameConfirmationNeeded
    );

    // Pauză pentru a simula timpul real
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Dacă AI cere confirmare, utilizatorul confirmă
    if (
      data1.reply.toLowerCase().includes("corect") ||
      data1.reply.toLowerCase().includes("numele")
    ) {
      console.log('\n👤 User: "Da, corect"');
      const response2 = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Da, corect",
          assistantName: "Asistentul",
          addressMode: "informal",
          userId: userId,
        }),
      });

      const data2 = await response2.json();
      console.log("🤖 AI:", data2.reply);
      console.log("📊 Debug - Info extrasă:", data2.extractedInfo);
      console.log("📊 Debug - Profil actualizat:", data2.profileUpdated);
    }

    // Pauză pentru a simula trecerea timpului
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // === CONVERSAȚIA 2: Test amintire (simulează o conversație nouă) ===
    console.log("\n🔸 === CONVERSAȚIA 2: Test amintire (conversație nouă) ===");

    console.log('\n👤 User: "Cum mă numesc?"');
    const response3 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Cum mă numesc?",
        assistantName: "Asistentul",
        addressMode: "informal",
        userId: userId,
      }),
    });

    const data3 = await response3.json();
    console.log("🤖 AI:", data3.reply);
    console.log("📊 Debug - Din baza de date:", data3.fromDatabase);

    // === EVALUAREA REZULTATULUI ===
    console.log("\n🎯 === EVALUAREA REZULTATULUI ===");

    const mentionsDani = data3.reply.toLowerCase().includes("dani");
    const knowsName =
      !data3.reply.toLowerCase().includes("nu mi-ai spus") &&
      !data3.reply.toLowerCase().includes("nu știu numele");

    if (mentionsDani && knowsName) {
      console.log('✅ SUCCESS: AI își amintește numele "Dani"');
      console.log(`   Răspunsul conține "Dani": ${mentionsDani ? "DA" : "NU"}`);
      console.log(`   AI știe numele: ${knowsName ? "DA" : "NU"}`);
    } else {
      console.log("❌ FAIL: AI nu își amintește numele");
      console.log(`   Răspunsul conține "Dani": ${mentionsDani ? "DA" : "NU"}`);
      console.log(`   AI știe numele: ${knowsName ? "DA" : "NU"}`);
      console.log("   Răspuns AI:", data3.reply);
    }
  } catch (error) {
    console.error("❌ Eroare în test:", error.message);
  }
}

// Rulează testul
if (require.main === module) {
  testRealConversationFlow()
    .then(() => {
      console.log("\n✅ Test finalizat!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Eroare fatală:", error);
      process.exit(1);
    });
}

module.exports = { testRealConversationFlow };
