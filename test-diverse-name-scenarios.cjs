#!/usr/bin/env node

// Test pentru diverse scenarii de nume cu diferite nivele de încredere

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";

const fetch = require("node-fetch");

async function testDiverseNameScenarios() {
  console.log("\n🧪 === TEST SCENARII DIVERSE NUME ===\n");

  const endpoint =
    "http://localhost:8888/.netlify/functions/ai-chat-firebase-final";

  const testCases = [
    {
      name: "Test 1: Nume comun cu confirmare",
      userId: `test_common_${Date.now()}`,
      messages: ["Sunt Maria", "Da"],
      expectConfirmation: false, // Nume comun nu trebuie să ceară confirmare
    },
    {
      name: "Test 2: Nume în conversație naturală",
      userId: `test_natural_${Date.now()}`,
      messages: ["Salut! Sunt Alex și vreau să vorbesc cu tine.", ""],
      expectConfirmation: false,
    },
    {
      name: "Test 3: Nume scurt cu confirmare",
      userId: `test_short_${Date.now()}`,
      messages: ["Jo", "Nu, mă numesc Johanna"],
      expectConfirmation: true,
    },
    {
      name: "Test 4: Nume respins apoi corect",
      userId: `test_reject_${Date.now()}`,
      messages: ["Xyz", "Nu", "Mă numesc Ana"],
      expectConfirmation: true,
    },
  ];

  for (const testCase of testCases) {
    console.log(`🔸 ${testCase.name}`);
    console.log(`👤 User ID: ${testCase.userId}\n`);

    try {
      for (let i = 0; i < testCase.messages.length; i++) {
        const message = testCase.messages[i];
        if (!message) continue;

        console.log(`👤 Mesaj ${i + 1}: "${message}"`);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: message,
            assistantName: "Asistentul",
            addressMode: "informal",
            userId: testCase.userId,
          }),
        });

        const data = await response.json();
        console.log(`🤖 AI: ${data.reply}`);

        if (data.extractedInfo) {
          console.log(`📊 Info extrasă: ${JSON.stringify(data.extractedInfo)}`);
        }

        // Pauză între mesaje
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Test final - întreabă numele
      console.log(`👤 Test final: "Cum mă numesc?"`);

      const finalResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Cum mă numesc?",
          assistantName: "Asistentul",
          addressMode: "informal",
          userId: testCase.userId,
        }),
      });

      const finalData = await finalResponse.json();
      console.log(`🤖 AI: ${finalData.reply}`);

      // Evaluare
      const hasName =
        !finalData.reply.toLowerCase().includes("nu mi-ai spus") &&
        !finalData.reply.toLowerCase().includes("nu știu");

      console.log(
        `🎯 Rezultat: ${hasName ? "✅ SUCCESS" : "❌ FAIL"} - AI ${hasName ? "știe" : "nu știe"} numele`
      );
    } catch (error) {
      console.error(`❌ Eroare în ${testCase.name}:`, error.message);
    }

    console.log("\n" + "─".repeat(60) + "\n");
  }
}

// Rulează testul
if (require.main === module) {
  testDiverseNameScenarios()
    .then(() => {
      console.log("\n✅ Teste finalizate!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Eroare fatală:", error);
      process.exit(1);
    });
}

module.exports = { testDiverseNameScenarios };
