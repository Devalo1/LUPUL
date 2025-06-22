// Test specific pentru a vedea ce se întâmplă cu "Ana"
console.log("🔍 TEST DEBUGGING SPECIFIC - PROBLEMA CU ANA");
console.log("============================================");

const TIMESTAMP = Date.now();

async function testAnaContamination() {
  console.log(
    "🔍 Testez doar utilizatorul Ana pentru a vedea de unde vine problema...\n"
  );

  const anaUserId = `debug-ana-${TIMESTAMP}`;

  // Test 1: Ana
  console.log("👤 === ANA ===");
  console.log(`📧 User ID: ${anaUserId}`);

  try {
    // Step 1: Prezentare Ana
    console.log(`📝 Step 1: Prezentare Ana`);
    const response1 = await fetch(
      "http://localhost:8888/.netlify/functions/ai-chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Salut! Mă numesc Ana și am 29 de ani.",
          assistantName: "Debug Assistant",
          addressMode: "Tu",
          userId: anaUserId,
        }),
      }
    );

    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`🤖 ${data1.reply}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 2: Profesie Ana
    console.log(`📝 Step 2: Profesie Ana`);
    const response2 = await fetch(
      "http://localhost:8888/.netlify/functions/ai-chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Lucrez ca învățătoare și îmi place să gătesc.",
          assistantName: "Debug Assistant",
          addressMode: "Tu",
          userId: anaUserId,
        }),
      }
    );

    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`🤖 ${data2.reply}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Acum testez un alt utilizator pentru a vedea dacă prinde "Ana"
    console.log("\n" + "=".repeat(50));
    console.log("👤 === TESTEZ ALT UTILIZATOR ===");

    const altUserId = `debug-alt-${TIMESTAMP}`;
    console.log(`📧 User ID: ${altUserId}`);

    const response3 = await fetch(
      "http://localhost:8888/.netlify/functions/ai-chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Salut! Mă numesc Radu și am 30 de ani.",
          assistantName: "Debug Assistant",
          addressMode: "Tu",
          userId: altUserId,
        }),
      }
    );

    if (response3.ok) {
      const data3 = await response3.json();
      const response = data3.reply;
      console.log(`🤖 ${response}`);

      // Verificăm dacă conține "Ana"
      if (response.toLowerCase().includes("ana")) {
        console.log(`⚠️ PROBLEM: Răspunsul pentru Radu conține "Ana"!`);
      } else {
        console.log(`✅ OK: Răspunsul pentru Radu NU conține "Ana"`);
      }
    }
  } catch (error) {
    console.log(`❌ Eroare: ${error.message}`);
  }
}

testAnaContamination().catch(console.error);
