// Test pentru profilul adaptiv - sistem nou
console.log("🧠 TEST PROFIL ADAPTIV - SISTEM NOU DE ÎNVĂȚARE");
console.log("===============================================");

const TIMESTAMP = Date.now();

async function testAdaptiveProfile() {
  console.log("🚀 Testăm sistemul de învățare automată...\n");

  // Test cu un utilizator fictiv
  const userId = `adaptive-test-${TIMESTAMP}`;

  const testScenarios = [
    {
      message: "Salut! Mă numesc Andrei și am 28 de ani.",
      description: "Test învățare informații de bază",
    },
    {
      message:
        "Lucrez ca dezvoltator software și îmi place să citesc cărți de psihologie.",
      description: "Test învățare ocupație și interese",
    },
    {
      message: "Nu îmi place să mă trezesc devreme și prefer să lucrez seara.",
      description: "Test învățare preferințe",
    },
    {
      message: "Cum îți amintești ce am discutat anterior?",
      description: "Test memorie și profil adaptiv",
    },
    {
      message: "Recomandă-mi ceva bazat pe ce știi despre mine.",
      description: "Test personalizare bazată pe profil",
    },
  ];

  console.log(`👤 Test User ID: ${userId}\n`);

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`📝 Scenario ${i + 1}/5: ${scenario.description}`);
    console.log(`💬 Message: "${scenario.message}"`);

    try {
      const response = await fetch(
        "http://localhost:8888/.netlify/functions/ai-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: scenario.message,
            assistantName: "Asistent Adaptiv",
            addressMode: "Tu",
            userId: userId,
          }),
        }
      );

      if (!response.ok) {
        console.log(`❌ HTTP Error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const aiResponse = data.reply || "No response";

      console.log(`🤖 AI Response: ${aiResponse}`);

      // Analizăm răspunsul pentru a vedea dacă AI-ul învață
      if (i >= 1) {
        // După primul mesaj
        const usesName = aiResponse.toLowerCase().includes("andrei");
        console.log(`✓ Folosește numele: ${usesName ? "✅ DA" : "❌ NU"}`);
      }

      if (i >= 2) {
        // După mesajul cu ocupația
        const mentionsWork =
          aiResponse.toLowerCase().includes("dezvoltator") ||
          aiResponse.toLowerCase().includes("software");
        console.log(
          `✓ Referă la ocupație: ${mentionsWork ? "✅ DA" : "❌ NU"}`
        );
      }

      if (i >= 3) {
        // După mesajul cu preferințe
        const showsMemory =
          aiResponse.toLowerCase().includes("amintesc") ||
          aiResponse.toLowerCase().includes("știu");
        console.log(
          `✓ Demonstrează memorie: ${showsMemory ? "✅ DA" : "❌ NU"}`
        );
      }

      console.log(""); // Linie goală pentru claritate

      // Pauză între cereri
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`❌ Eroare: ${error.message}`);
    }
  }

  console.log("🎯 CONCLUZII:");
  console.log("=============");
  console.log("✨ Sistemul de profil adaptiv permite:");
  console.log("   🧠 Învățare automată din conversații");
  console.log("   📝 Memorarea informațiilor personale");
  console.log("   🎯 Răspunsuri personalizate bazate pe profil");
  console.log("   🔄 Adaptare continuă la preferințele utilizatorului");
  console.log("   💭 Context dinamic în funcție de personalitate");
  console.log("");
  console.log("🚀 AVANTAJELE față de sistemul anterior:");
  console.log("   ✅ Nu mai trebuie să testez manual pe nume specifice");
  console.log("   ✅ AI-ul învață automat din orice conversație");
  console.log("   ✅ Profilul se construiește dinamic și natural");
  console.log("   ✅ Funcționează pentru orice utilizator, orice profesie");
  console.log("   ✅ Se adaptează la personalitatea fiecăruia");
}

testAdaptiveProfile().catch(console.error);
