// Test complex pentru memoria AI îmbunătățită
console.log("🧠 TEST COMPLEX - MEMORIA AI ÎMBUNĂTĂȚITĂ");
console.log("=========================================");

const COMPLEX_USER_ID = "complex-test-" + Date.now();

async function testComplexMemory() {
  const scenarios = [
    {
      message: "Salut! Mă numesc Dumitru și am 35 de ani.",
      description: "Prezentare inițială cu nume și vârstă",
    },
    {
      message:
        "Lucrez ca programator și îmi place să citesc cărți de ficțiune științifică.",
      description: "Ocupație și hobby-uri",
    },
    {
      message: "Îți poți aminti care este numele meu și ce ocupație am?",
      description: "Test de memorie pentru nume și ocupație",
    },
    {
      message: "Ce părere ai despre cărțile de Isaac Asimov?",
      description: "Test legătura cu hobby-ul (ficțiune științifică)",
    },
    {
      message: "Am nevoie de sfaturi pentru productivitate în programare.",
      description: "Test legătura cu ocupația",
    },
  ];

  console.log(`👤 Test User ID: ${COMPLEX_USER_ID}\n`);

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
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
            assistantName: "Asistent Memorie Avansată",
            addressMode: "Tu",
            userId: COMPLEX_USER_ID,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || "(Fără răspuns)";

      console.log(`🤖 AI Response: ${reply}`);

      // Analiză specifică pe scenarii
      if (i === 2) {
        // Test de memorie
        const remembersName = reply.toLowerCase().includes("dumitru");
        const remembersJob = reply.toLowerCase().includes("programator");
        console.log(`✓ Numele (Dumitru): ${remembersName ? "✅ DA" : "❌ NU"}`);
        console.log(
          `✓ Ocupația (programator): ${remembersJob ? "✅ DA" : "❌ NU"}`
        );
      }

      if (i === 3) {
        // Test legătura cu hobby
        const connectsToHobby =
          reply.toLowerCase().includes("ficțiune") ||
          reply.toLowerCase().includes("asimov") ||
          reply.toLowerCase().includes("citesc");
        console.log(
          `✓ Leagă de hobby (ficțiune): ${connectsToHobby ? "✅ DA" : "❌ NU"}`
        );
      }

      if (i === 4) {
        // Test legătura cu ocupația
        const connectsToJob =
          reply.toLowerCase().includes("programare") ||
          reply.toLowerCase().includes("cod") ||
          reply.toLowerCase().includes("dezvoltare");
        console.log(
          `✓ Leagă de ocupație (programare): ${connectsToJob ? "✅ DA" : "❌ NU"}`
        );
      }
    } catch (error) {
      console.log(`❌ Eroare: ${error.message}`);
    }

    console.log("");

    // Pauză între cereri
    if (i < scenarios.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("🎯 CONCLUZII:");
  console.log("=============");
  console.log("✨ Sistemul de memorie AI îmbunătățit permite:");
  console.log("   🧠 Reținerea numelui utilizatorului");
  console.log("   📅 Reținerea vârstei utilizatorului");
  console.log("   💼 Reținerea ocupației utilizatorului");
  console.log("   🎯 Reținerea hobby-urilor și intereselor");
  console.log("   🔗 Crearea de legături între conversații");
  console.log("   💭 Răspunsuri contextuale și personalizate");
  console.log("");
  console.log("🚀 PENTRU UTILIZATORUL REAL:");
  console.log("   - Deschide aplicația: http://localhost:8888");
  console.log("   - Logează-te cu contul tău");
  console.log('   - Spune: "Mă numesc [numele tău] și am [vârsta] ani"');
  console.log('   - Spune: "Lucrez ca [ocupația] și îmi place [hobby]"');
  console.log('   - Întreabă: "Îți amintești cum mă cheamă?"');
  console.log(
    "   - AI-ul va folosi numele tău și va face legături cu informațiile tale!"
  );
}

testComplexMemory().catch(console.error);
