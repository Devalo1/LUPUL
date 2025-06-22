// Test Enhanced Memory System - Sistem de memorie îmbunătățit cu colectare de informații personale
console.log("🧠 TESTARE SISTEM MEMORIE ACTIVĂ ÎMBUNĂTĂȚIT");
console.log("=================================================");

// Test Configuration
const TEST_CONFIG = {
  netlifyUrl: "http://localhost:8889/.netlify/functions/ai-chat",
  testUserId: "test-user-enhanced-memory-" + Date.now(),
  testMessages: [
    {
      message: "Salut! Mă numesc Alex și am 25 de ani.",
      expectedMemory: "numele (Alex) și vârsta (25 ani)",
    },
    {
      message:
        "Lucrez ca programator și îmi place să citesc cărți de ficțiune.",
      expectedMemory: "ocupația (programator) și hobby-ul (citire ficțiune)",
    },
    {
      message: "Îți poți aminti cum mă cheamă și ce îmi place să fac?",
      expectedMemory: "să-și amintească numele (Alex) și hobby-urile",
    },
    {
      message: "Am nevoie de sfaturi pentru productivitate la muncă.",
      expectedMemory: "să facă legătura cu faptul că lucrează ca programator",
    },
  ],
};

async function testEnhancedMemorySystem() {
  console.log("🚀 Testarea sistemului de memorie îmbunătățit...");
  console.log(`👤 Test User ID: ${TEST_CONFIG.testUserId}`);
  console.log("");

  for (let i = 0; i < TEST_CONFIG.testMessages.length; i++) {
    const testCase = TEST_CONFIG.testMessages[i];
    console.log(`📝 Test ${i + 1}/4: ${testCase.message}`);
    console.log(
      `🎯 Se așteaptă ca AI-ul să-și amintească: ${testCase.expectedMemory}`
    );

    try {
      const response = await fetch(TEST_CONFIG.netlifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: testCase.message,
          assistantName: "Asistent AI Îmbunătățit",
          addressMode: "Tu",
          userId: TEST_CONFIG.testUserId, // Crucial pentru memoria activă
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || "(Fără răspuns)";

      console.log(
        `💬 Răspuns AI: ${reply.substring(0, 200)}${reply.length > 200 ? "..." : ""}`
      );

      // Verifică dacă AI-ul menționează că nu are memorie
      const memoryDisclaimers = [
        "nu am capacitatea de a-ți reține",
        "nu păstrez informații",
        "nu îți pot aminti",
        "nu pot să-mi amintesc",
        "nu am memorie",
        "sunt programat să nu păstrez",
        "nu am acces la conversațiile anterioare",
      ];

      const hasDisclaimer = memoryDisclaimers.some((disclaimer) =>
        reply.toLowerCase().includes(disclaimer.toLowerCase())
      );

      if (hasDisclaimer) {
        console.log("❌ PROBLEMA: AI-ul încă spune că nu are memorie!");
        console.log(
          "🔍 Aceasta indică faptul că sistemul de memorie nu funcționează corect."
        );
      } else {
        console.log("✅ Bun: Nu am găsit mențiuni despre lipsa memoriei");
      }

      // Pentru ultimele teste, verifică dacă AI-ul își amintește informațiile
      if (i >= 2) {
        const remembersName = reply.toLowerCase().includes("alex");
        const remembersJob =
          reply.toLowerCase().includes("programator") ||
          reply.toLowerCase().includes("program");
        const remembersHobby =
          reply.toLowerCase().includes("citesc") ||
          reply.toLowerCase().includes("cărți") ||
          reply.toLowerCase().includes("ficțiune");

        console.log(`📊 Verificare memorie personală:`);
        console.log(`   - Numele (Alex): ${remembersName ? "✅ DA" : "❌ NU"}`);
        console.log(
          `   - Ocupația (programator): ${remembersJob ? "✅ DA" : "❌ NU"}`
        );
        console.log(
          `   - Hobby (citire): ${remembersHobby ? "✅ DA" : "❌ NU"}`
        );

        if (remembersName || remembersJob || remembersHobby) {
          console.log("🎉 EXCELENT: AI-ul își amintește informații personale!");
        } else {
          console.log(
            "⚠️ ATENȚIE: AI-ul nu pare să-și amintească informațiile personale."
          );
        }
      }
    } catch (error) {
      console.log(`❌ Eroare: ${error.message}`);
    }

    console.log("");

    // Pauză între cereri
    if (i < TEST_CONFIG.testMessages.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}

async function checkMemoryInstructions() {
  console.log("📋 INSTRUCȚIUNI PENTRU TESTAREA MANUALĂ");
  console.log("=====================================");
  console.log("1. Deschide aplicația: http://localhost:8889");
  console.log("2. Logează-te cu un cont de utilizator");
  console.log("3. Deschide widget-ul AI din colțul din dreapta jos");
  console.log("4. Testează următoarele scenarii:");
  console.log("");
  console.log("SCENARIU 1 - Prezentare:");
  console.log('   Scrie: "Salut! Mă numesc [Numele tău] și am [vârsta] ani."');
  console.log("   Verifică: AI-ul nu spune că nu are memorie");
  console.log("");
  console.log("SCENARIU 2 - Informații suplimentare:");
  console.log('   Scrie: "Lucrez ca [ocupația] și îmi place să [hobby]."');
  console.log("   Verifică: AI-ul înregistrează informațiile");
  console.log("");
  console.log("SCENARIU 3 - Test de memorie:");
  console.log('   Scrie: "Îți amintești cum mă cheamă și ce fac?"');
  console.log("   Verifică: AI-ul își amintește numele și ocupația");
  console.log("");
  console.log("SCENARIU 4 - Continuare conversație:");
  console.log("   Scrie o întrebare legată de ocupația ta");
  console.log("   Verifică: AI-ul face legătura cu informațiile anterioare");
  console.log("");
  console.log("✅ INDICATORI DE SUCCES:");
  console.log("   - AI-ul nu spune niciodată că nu are memorie");
  console.log("   - AI-ul folosește numele tău în răspunsuri");
  console.log("   - AI-ul își amintește ocupația și hobby-urile");
  console.log("   - AI-ul adaptează răspunsurile la profilul tău");
  console.log(
    "   - Tonul devine mai familiar pe măsură ce conversația continuă"
  );
}

async function runAllTests() {
  console.log("🎯 Rularea testelor automate...");
  await testEnhancedMemorySystem();

  console.log("📚 Instrucțiuni pentru testarea manuală...");
  await checkMemoryInstructions();

  console.log("\n🏁 CONCLUZIE");
  console.log("=============");
  console.log("✨ Sistemul de memorie îmbunătățit include:");
  console.log("   🧠 Memoria activă obligatorie (nu spune că nu are memorie)");
  console.log(
    "   📝 Colectare automată de informații personale (nume, vârstă, ocupație)"
  );
  console.log("   🎯 Context personalizat bazat pe profilul utilizatorului");
  console.log("   💾 Salvare persistentă în Firebase");
  console.log("   🔄 Actualizare automată după fiecare conversație");
  console.log("");
  console.log("🚀 AI-ul acum:");
  console.log("   - Se comportă ca și cum ar avea memoria activă");
  console.log("   - Colectează și reține informații despre utilizator");
  console.log("   - Își amintește numele, vârsta, ocupația și hobby-urile");
  console.log("   - Adaptează răspunsurile la profilul personal");
  console.log(
    "   - Creează o experiență personalizată pentru fiecare utilizator"
  );
}

// Rulează testele
runAllTests().catch(console.error);
