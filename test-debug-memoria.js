// Test simplu pentru debug memoria AI
console.log("🔍 TEST DEBUG MEMORIA AI");
console.log("=======================");

const TEST_USER_ID = "debug-user-" + Date.now();

async function testMemoryDebug() {
  console.log(`📝 Testez cu userId: ${TEST_USER_ID}`);

  try {
    const response = await fetch(
      "http://localhost:8890/.netlify/functions/ai-chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Salut! Mă numesc Dumitru și am 30 de ani.",
          assistantName: "Asistent Debug",
          addressMode: "Tu",
          userId: TEST_USER_ID,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`💬 Răspuns AI: ${data.reply}`);

    // Așteaptă 3 secunde și testează din nou
    console.log("\n⏳ Aștept 3 secunde și testez memoria...");

    setTimeout(async () => {
      try {
        const response2 = await fetch(
          "http://localhost:8890/.netlify/functions/ai-chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: "Îți amintești cum mă cheamă?",
              assistantName: "Asistent Debug",
              addressMode: "Tu",
              userId: TEST_USER_ID,
            }),
          }
        );

        const data2 = await response2.json();
        console.log(`💬 Test memorie: ${data2.reply}`);

        // Verifică dacă AI-ul își amintește numele corect
        if (data2.reply.toLowerCase().includes("dumitru")) {
          console.log(
            "✅ SUCCESS: AI-ul își amintește numele corect (Dumitru)!"
          );
        } else if (data2.reply.toLowerCase().includes("alex")) {
          console.log(
            "❌ PROBLEMA: AI-ul folosește numele din test (Alex) în loc de Dumitru!"
          );
        } else {
          console.log("⚠️ ATENȚIE: AI-ul nu menționează niciun nume specific.");
        }
      } catch (error) {
        console.error("Eroare la testul de memorie:", error);
      }
    }, 3000);
  } catch (error) {
    console.error("Eroare la test:", error);
  }
}

testMemoryDebug();
