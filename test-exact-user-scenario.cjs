#!/usr/bin/env node

// Test final care simulează exact scenariul descris de utilizator

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";

const fetch = require("node-fetch");

async function testExactUserScenario() {
  console.log("\n🎯 === TEST SCENARIUL EXACT AL UTILIZATORULUI ===\n");
  console.log(
    'Simulez:\n1. AI: "cum îți place să-mi spui pe nume?"\n2. User: "Dani"\n3. AI: confirmare\n4. User: confirmare\n5. CONVERSAȚIE NOUĂ: "Cum mă numesc?"\n'
  );

  const userId = `test_exact_scenario_${Date.now()}`;
  const endpoint =
    "http://localhost:8888/.netlify/functions/ai-chat-firebase-final";

  console.log(`👤 User ID: ${userId}\n`);

  try {
    // === SIMULEZ PRIMA CONVERSAȚIE ===
    console.log("🔸 === PRIMA CONVERSAȚIE ===");

    console.log('🤖 AI (simulat): "Apropo, cum îți place să-mi spui pe nume?"');

    console.log('👤 User: "Dani"');
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

    // Pauză
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Confirmarea dacă este solicitată
    if (
      data1.reply.toLowerCase().includes("numele tău") ||
      data1.reply.toLowerCase().includes("corect")
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
    }

    // Pauză pentru a simula trecerea timpului / închiderea conversației
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // === SIMULEZ A DOUA CONVERSAȚIE (NOUĂ) ===
    console.log("\n🔸 === A DOUA CONVERSAȚIE (NOUĂ) ===");
    console.log("(simulez că utilizatorul deschide o conversație nouă)\n");

    console.log('👤 User: "Cum mă numesc?"');
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

    // === EVALUARE FINALĂ ===
    console.log("\n🎯 === EVALUAREA FINALĂ ===");

    const mentionsDani = data3.reply.toLowerCase().includes("dani");
    const forgetsName =
      data3.reply.toLowerCase().includes("nu mi-ai spus") ||
      data3.reply.toLowerCase().includes("nu știu numele");

    if (mentionsDani && !forgetsName) {
      console.log("✅ PROBLEMA REZOLVATĂ!");
      console.log(
        '   AI își amintește corect numele "Dani" în conversația nouă'
      );
      console.log(`   Răspuns: "${data3.reply}"`);
    } else {
      console.log("❌ PROBLEMA PERSISTĂ!");
      console.log(`   AI nu își amintește numele. Răspuns: "${data3.reply}"`);
    }
  } catch (error) {
    console.error("❌ Eroare în test:", error.message);
  }
}

// Rulează testul
if (require.main === module) {
  testExactUserScenario()
    .then(() => {
      console.log("\n✅ Test finalizat!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Eroare fatală:", error);
      process.exit(1);
    });
}

module.exports = { testExactUserScenario };
