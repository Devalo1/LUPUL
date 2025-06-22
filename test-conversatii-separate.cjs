const fetch = require("node-fetch");

async function testConversatiiSeparate() {
  console.log("🔍 Test Conversații Separate - Același User");
  console.log("═══════════════════════════════════════════");

  // Folosesc același userId pentru ambele conversații
  const userId = "user_dumitru_test_persistent";
  const endpoint =
    "http://localhost:8888/.netlify/functions/ai-chat-firebase-final";

  try {
    console.log(`👤 User ID: ${userId}`);
    console.log("");

    // ====== CONVERSAȚIA 1 ======
    console.log("💬 CONVERSAȚIA 1");
    console.log("─────────────────");

    console.log('User: "Dumitru"');
    const response1 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Dumitru",
        assistantName: "Assistentul",
        addressMode: "informal",
        userId: userId,
      }),
    });

    const data1 = await response1.json();
    console.log("AI:", data1.reply);
    console.log("Info extrasă:", data1.extractedInfo);
    console.log("Profil actualizat:", data1.profileUpdated);
    console.log("");

    // Pauză între conversații
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // ====== CONVERSAȚIA 2 (NOUĂ) ======
    console.log("💬 CONVERSAȚIA 2 (NOUĂ)");
    console.log("────────────────────────");

    console.log('User: "Cum mă numesc?"');
    const response2 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Cum mă numesc?",
        assistantName: "Assistentul",
        addressMode: "informal",
        userId: userId, // ACELAȘI USER ID!
      }),
    });

    const data2 = await response2.json();
    console.log("AI:", data2.reply);
    console.log("Din baza de date:", data2.fromDatabase);
    console.log("");

    // ====== CONVERSAȚIA 3 - Test din nou ======
    console.log("💬 CONVERSAȚIA 3 (CONTROL)");
    console.log("──────────────────────────");

    console.log(
      'User: "Nu mi-ai spus încă numele tău. Cum îți place să-ți spun?"'
    );
    const response3 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Nu mi-ai spus încă numele tău. Cum îți place să-ți spun?",
        assistantName: "Assistentul",
        addressMode: "informal",
        userId: userId,
      }),
    });

    const data3 = await response3.json();
    console.log("AI:", data3.reply);
    console.log("Context folosit:", data3.contextGenerated || "N/A");

    console.log("\n🏁 Test finalizat!");
  } catch (error) {
    console.error("❌ Eroare test:", error.message);
  }
}

testConversatiiSeparate();
