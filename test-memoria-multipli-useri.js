// Test pentru memoria AI cu utilizatori multipli
console.log("🧠 TEST UTILIZATORI MULTIPLI - MEMORIA AI");
console.log("=========================================");

const TIMESTAMP = Date.now();

// Definim utilizatorii pentru test
const USERS = [
  {
    id: `user-dumitru-${TIMESTAMP}`,
    name: "Dumitru",
    age: 35,
    occupation: "programator",
    hobby: "citesc cărți de ficțiune științifică",
    scenarios: [
      {
        message: "Salut! Mă numesc Dumitru și am 35 de ani.",
        description: "Prezentare inițială - Dumitru",
      },
      {
        message:
          "Lucrez ca programator și îmi place să citesc cărți de ficțiune științifică.",
        description: "Ocupație și hobby - Dumitru",
      },
      {
        message: "Îți poți aminti cum mă cheamă și ce fac?",
        description: "Test memorie - Dumitru",
      },
    ],
  },
  {
    id: `user-maria-${TIMESTAMP}`,
    name: "Maria",
    age: 28,
    occupation: "designer",
    hobby: "pictez și fac yoga",
    scenarios: [
      {
        message: "Bună! Sunt Maria și am 28 de ani.",
        description: "Prezentare inițială - Maria",
      },
      {
        message: "Sunt designer și îmi place să pictez și să fac yoga.",
        description: "Ocupație și hobby - Maria",
      },
      {
        message: "Îți amintești care este numele meu și cu ce mă ocup?",
        description: "Test memorie - Maria",
      },
    ],
  },
  {
    id: `user-alex-${TIMESTAMP}`,
    name: "Alex",
    age: 42,
    occupation: "medic",
    hobby: "alerg și citesc romane",
    scenarios: [
      {
        message: "Salut! Mă numesc Alex, am 42 de ani.",
        description: "Prezentare inițială - Alex",
      },
      {
        message: "Sunt medic și îmi place să alerg și să citesc romane.",
        description: "Ocupație și hobby - Alex",
      },
      {
        message: "Poți să-mi spui cum mă cheamă și ce profesie am?",
        description: "Test memorie - Alex",
      },
    ],
  },
];

async function testMultipleUsers() {
  console.log("🚀 Începem testarea cu utilizatori multipli...\n");

  // Testăm fiecare utilizator în parte
  for (let userIndex = 0; userIndex < USERS.length; userIndex++) {
    const user = USERS[userIndex];
    console.log(
      `\n👤 === UTILIZATOR ${userIndex + 1}: ${user.name.toUpperCase()} ===`
    );
    console.log(`📧 User ID: ${user.id}`);

    // Rulăm scenariile pentru utilizatorul curent
    for (
      let scenarioIndex = 0;
      scenarioIndex < user.scenarios.length;
      scenarioIndex++
    ) {
      const scenario = user.scenarios[scenarioIndex];
      console.log(`\n📝 ${scenario.description}`);
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
              assistantName: "Asistent Memorie Multiplu",
              addressMode: "Tu",
              userId: user.id,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse =
          data.reply || data.response || "Răspuns indisponibil";

        console.log(
          `🤖 AI Response: ${aiResponse.substring(0, 200)}${aiResponse.length > 200 ? "..." : ""}`
        );

        // Verificăm dacă AI-ul folosește numele corect
        if (scenarioIndex === 2) {
          // Testul de memorie
          const nameFound = aiResponse
            .toLowerCase()
            .includes(user.name.toLowerCase());
          const occupationFound = aiResponse
            .toLowerCase()
            .includes(user.occupation.toLowerCase());

          console.log(
            `✓ Numele (${user.name}): ${nameFound ? "✅ DA" : "❌ NU"}`
          );
          console.log(
            `✓ Ocupația (${user.occupation}): ${occupationFound ? "✅ DA" : "❌ NU"}`
          );

          if (!nameFound || !occupationFound) {
            console.log(
              `⚠️  PROBLEMĂ: AI-ul nu și-a amintit corect datele pentru ${user.name}!`
            );
          }
        }

        // Pauză între cereri
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`❌ Eroare: ${error.message}`);
      }
    }

    console.log(`\n✅ Finalizat testarea pentru ${user.name}`);
  }

  // Test de cross-contamination - verificăm din nou primul utilizator
  console.log(`\n\n🔄 === TEST CROSS-CONTAMINATION ===`);
  console.log(
    `Testăm din nou primul utilizator (${USERS[0].name}) să vedem dacă datele au rămas intacte...`
  );

  try {
    const response = await fetch(
      "http://localhost:8888/.netlify/functions/ai-chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Îți amintești cum mă cheamă și ce ocupație am?",
          assistantName: "Asistent Memorie Test Final",
          addressMode: "Tu",
          userId: USERS[0].id,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.reply || data.response || "Răspuns indisponibil";

      console.log(
        `💬 Message: "Îți amintești cum mă cheamă și ce ocupație am?"`
      );
      console.log(`🤖 AI Response: ${aiResponse}`);

      const nameFound = aiResponse
        .toLowerCase()
        .includes(USERS[0].name.toLowerCase());
      const occupationFound = aiResponse
        .toLowerCase()
        .includes(USERS[0].occupation.toLowerCase());

      console.log(
        `✓ Numele corect (${USERS[0].name}): ${nameFound ? "✅ DA" : "❌ NU"}`
      );
      console.log(
        `✓ Ocupația corectă (${USERS[0].occupation}): ${occupationFound ? "✅ DA" : "❌ NU"}`
      );

      // Verificăm să nu conțină datele altor utilizatori
      const containsMaria = aiResponse.toLowerCase().includes("maria");
      const containsAlex = aiResponse.toLowerCase().includes("alex");
      const containsDesigner = aiResponse.toLowerCase().includes("designer");
      const containsMedic = aiResponse.toLowerCase().includes("medic");

      console.log(
        `❌ Conține date Maria: ${containsMaria ? "⚠️ DA (PROBLEMĂ!)" : "✅ NU"}`
      );
      console.log(
        `❌ Conține date Alex: ${containsAlex ? "⚠️ DA (PROBLEMĂ!)" : "✅ NU"}`
      );
      console.log(
        `❌ Conține ocupație designer: ${containsDesigner ? "⚠️ DA (PROBLEMĂ!)" : "✅ NU"}`
      );
      console.log(
        `❌ Conține ocupație medic: ${containsMedic ? "⚠️ DA (PROBLEMĂ!)" : "✅ NU"}`
      );
    }
  } catch (error) {
    console.log(`❌ Eroare test final: ${error.message}`);
  }
}

// Funcție pentru afișarea concluziilor
function showConclusions() {
  console.log(`\n\n🎯 CONCLUZII TEST UTILIZATORI MULTIPLI:`);
  console.log(`=====================================`);
  console.log(`✨ Testul verifică următoarele aspecte:`);
  console.log(`   👥 Separarea datelor între utilizatori diferiți`);
  console.log(`   🧠 Reținerea informațiilor personale pentru fiecare user ID`);
  console.log(`   🔒 Evitarea cross-contamination (amestecul datelor)`);
  console.log(`   💾 Persistența memoriei pentru fiecare utilizator`);
  console.log(`   🎯 Răspunsuri personalizate bazate pe profilul fiecăruia`);
  console.log(`\n🚀 URMĂTORII PAȘI:`);
  console.log(`   1. Verifică log-urile pentru eventuale probleme`);
  console.log(`   2. Testează în aplicația reală cu cont diferit`);
  console.log(`   3. Implementează storage persistent (Firebase)`);
  console.log(`   4. Adaugă opțiuni de ștergere a memoriei`);
  console.log(`\n📱 TESTARE MANUALĂ:`);
  console.log(`   - Deschide: http://localhost:8888`);
  console.log(`   - Logează-te cu conturi diferite`);
  console.log(`   - Verifică că fiecare cont își păstrează datele separate`);
}

// Rulăm testele
async function main() {
  try {
    await testMultipleUsers();
    showConclusions();
  } catch (error) {
    console.error("❌ Eroare în testul principal:", error);
  }
}

main();
