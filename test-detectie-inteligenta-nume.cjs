const fetch = require("node-fetch");

async function testDetectieInteligentaNume() {
  console.log("🧠 Test Detecție Inteligentă Nume - Contextuală");
  console.log("═══════════════════════════════════════════════════");

  const baseUserId = "test_contextual_names_" + Date.now();
  const endpoint =
    "http://localhost:8888/.netlify/functions/ai-chat-firebase-final";

  // Test pentru diferite tipuri de nume
  const testCases = [
    {
      name: "Nume comun românesc",
      messages: ["Andreea"],
      expectedName: "Andreea",
      expectConfirmation: false,
    },
    {
      name: "Nume mai puțin comun",
      messages: ["Xerxes"],
      expectedName: "Xerxes",
      expectConfirmation: true,
    },
    {
      name: "Nume compus",
      messages: ["Ana Maria"],
      expectedName: "Ana Maria",
      expectConfirmation: false,
    },
    {
      name: "Conversație normală apoi nume",
      messages: ["Salut! Cum ești?", "Mă numesc Diana"],
      expectedName: "Diana",
      expectConfirmation: false,
    },
    {
      name: "Nume cu confirmare",
      messages: ["Bartholomew", "Da, corect"],
      expectedName: "Bartholomew",
      expectConfirmation: true,
      confirmationTest: true,
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const userId = `${baseUserId}_test${i}`;

    console.log(`\n🧪 Test ${i + 1}: ${testCase.name}`);
    console.log("─".repeat(40));
    console.log(`👤 User ID: ${userId}`);

    try {
      let lastResponse = null;

      for (let j = 0; j < testCase.messages.length; j++) {
        const message = testCase.messages[j];
        console.log(`\n📝 Mesaj ${j + 1}: "${message}"`);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: message,
            assistantName: "Asistentul",
            addressMode: "informal",
            userId: userId,
          }),
        });

        const data = await response.json();
        lastResponse = data;

        console.log(
          `🤖 AI: ${data.reply.substring(0, 100)}${data.reply.length > 100 ? "..." : ""}`
        );
        console.log(`📊 Info extrasă:`, data.extractedInfo);
        console.log(`✅ Profil actualizat: ${data.profileUpdated}`);

        if (data.nameConfirmationNeeded) {
          console.log(
            `❓ Confirmarea numelui este necesară: ${data.nameConfirmationNeeded}`
          );
        }

        // Pauză între mesaje
        if (j < testCase.messages.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Verifică rezultatul final
      if (testCase.confirmationTest) {
        console.log(`\n🔍 Test confirmare finalizat`);
      } else {
        // Test final: întreabă cum se numește
        console.log(`\n🔍 Test final: "Cum mă numesc?"`);

        const finalResponse = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: "Cum mă numesc?",
            assistantName: "Asistentul",
            addressMode: "informal",
            userId: userId,
          }),
        });

        const finalData = await finalResponse.json();
        console.log(`🤖 AI: ${finalData.reply}`);

        const containsExpectedName = finalData.reply
          .toLowerCase()
          .includes(testCase.expectedName.toLowerCase());
        console.log(
          `✅ Conține numele așteptat (${testCase.expectedName}): ${containsExpectedName ? "DA" : "NU"}`
        );
      }
    } catch (error) {
      console.error(`❌ Eroare în testul "${testCase.name}":`, error.message);
    }
  }

  console.log("\n🏁 Toate testele finalizate!");
}

testDetectieInteligentaNume();
