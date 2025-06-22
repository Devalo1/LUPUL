const fetch = require("node-fetch");

async function testMemoryAI() {
  console.log("🧠 Test Memoria AI - Dumitru");
  console.log("═══════════════════════════════");

  const userId = "test_dumitru_memory_" + Date.now();
  const endpoint =
    "http://localhost:8888/.netlify/functions/ai-chat-firebase-final";

  try {
    // Test 1: Îi spun numele
    console.log('\n1️⃣ Test: "Sunt Dumitru"');
    console.log("────────────────────────────");

    const response1 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Sunt Dumitru",
        assistantName: "Assistentul",
        addressMode: "informal",
        userId: userId,
      }),
    });

    const data1 = await response1.json();
    console.log("🤖 AI:", data1.reply);
    console.log("📊 Info extrasă:", data1.extractedInfo || "niciuna");
    console.log("✅ Profil actualizat:", data1.profileUpdated);

    // Test 2: Întreb cum mă numesc
    console.log('\n2️⃣ Test: "Cum mă numesc?"');
    console.log("─────────────────────────────");

    const response2 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Cum mă numesc?",
        assistantName: "Assistentul",
        addressMode: "informal",
        userId: userId,
      }),
    });

    const data2 = await response2.json();
    console.log("🤖 AI:", data2.reply);
    console.log("💾 Din baza de date:", data2.fromDatabase);

    console.log("\n🎉 Test finalizat cu succes!");
  } catch (error) {
    console.error("❌ Eroare test:", error.message);
  }
}

testMemoryAI();
