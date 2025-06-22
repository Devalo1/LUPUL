const fetch = require("node-fetch");

async function testConfirmareCompleta() {
  console.log("🧪 Test Confirmare Completă - Bartholomew");
  console.log("═══════════════════════════════════════════");

  const userId = "test_confirmare_" + Date.now();
  const endpoint =
    "http://localhost:8888/.netlify/functions/ai-chat-firebase-final";

  try {
    console.log(`👤 User ID: ${userId}\n`);

    // Mesaj 1: Nume necunoscut
    console.log('📝 Mesaj 1: "Bartholomew"');
    const response1 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Bartholomew",
        assistantName: "Asistentul",
        addressMode: "informal",
        userId: userId,
      }),
    });

    const data1 = await response1.json();
    console.log("🤖 AI:", data1.reply);
    console.log("📊 Info extrasă:", data1.extractedInfo);
    console.log("❓ Confirmarea necesară:", data1.nameConfirmationNeeded);
    console.log("✅ Profil actualizat:", data1.profileUpdated);

    // Pauză
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mesaj 2: Confirmare pozitivă
    console.log('\n📝 Mesaj 2: "Da, corect"');
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
    console.log("📊 Info extrasă:", data2.extractedInfo);
    console.log("✅ Profil actualizat:", data2.profileUpdated);

    // Pauză
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mesaj 3: Test final
    console.log('\n📝 Mesaj 3: "Cum mă numesc?"');
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

    const containsBartholomew = data3.reply
      .toLowerCase()
      .includes("bartholomew");
    console.log(
      `\n🎯 Rezultat: ${containsBartholomew ? "✅ SUCCESS" : "❌ FAIL"}`
    );
    console.log(
      `   Numele "Bartholomew" este menționat: ${containsBartholomew ? "DA" : "NU"}`
    );
  } catch (error) {
    console.error("❌ Eroare test:", error.message);
  }
}

testConfirmareCompleta();
