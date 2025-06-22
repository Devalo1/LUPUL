// Test comprehensiv pentru memoria AI cu utilizatori și profesii diverse
console.log("🧠 TEST COMPREHENSIV - UTILIZATORI ȘI PROFESII DIVERSE");
console.log("====================================================");

const TIMESTAMP = Date.now();

// Definim o gamă largă de utilizatori cu profesii și hobby-uri diverse
const DIVERSE_USERS = [
  {
    id: `user-ana-${TIMESTAMP}`,
    name: "Ana",
    age: 29,
    scenarios: [
      "Salut! Mă numesc Ana și am 29 de ani.",
      "Lucrez ca învățătoare și îmi place să gătesc.",
      "Îți amintești cum mă cheamă și ce profesie am?",
    ],
  },
  {
    id: `user-bogdan-${TIMESTAMP}`,
    name: "Bogdan",
    age: 33,
    scenarios: [
      "Bună! Sunt Bogdan, am 33 de ani.",
      "Sunt inginer și îmi place să fac drumeții.",
      "Poți să-mi spui numele și ocupația mea?",
    ],
  },
  {
    id: `user-cristina-${TIMESTAMP}`,
    name: "Cristina",
    age: 26,
    scenarios: [
      "Salut! Mă numesc Cristina și am 26 de ani.",
      "Sunt psiholog și îmi place să citesc și să meditez.",
      "Îți poți aminti care este numele meu și cu ce mă ocup?",
    ],
  },
  {
    id: `user-dan-${TIMESTAMP}`,
    name: "Dan",
    age: 45,
    scenarios: [
      "Bună ziua! Sunt Dan, am 45 de ani.",
      "Lucrez ca electrician și îmi place să pescuiesc.",
      "Știi cum mă cheamă și ce fac?",
    ],
  },
  {
    id: `user-elena-${TIMESTAMP}`,
    name: "Elena",
    age: 38,
    scenarios: [
      "Salut! Mă numesc Elena și am 38 de ani.",
      "Sunt avocat și îmi place să călătoresc.",
      "Te poți aminti de numele și profesia mea?",
    ],
  },
  {
    id: `user-florin-${TIMESTAMP}`,
    name: "Florin",
    age: 31,
    scenarios: [
      "Bună! Sunt Florin, am 31 de ani.",
      "Sunt bucătar și îmi place să joc fotbal.",
      "Îți amintești cum mă numesc și ce meserie am?",
    ],
  },
  {
    id: `user-georgiana-${TIMESTAMP}`,
    name: "Georgiana",
    age: 27,
    scenarios: [
      "Salut! Mă numesc Georgiana și am 27 de ani.",
      "Lucrez ca farmacist și îmi place să pictez.",
      "Poți să îmi spui numele și ocupația mea?",
    ],
  },
  {
    id: `user-horia-${TIMESTAMP}`,
    name: "Horia",
    age: 41,
    scenarios: [
      "Bună! Sunt Horia, am 41 de ani.",
      "Sunt arhitect și îmi place să ascult muzică.",
      "Știi care este numele meu și ce profesie am?",
    ],
  },
  {
    id: `user-ioana-${TIMESTAMP}`,
    name: "Ioana",
    age: 24,
    scenarios: [
      "Salut! Mă numesc Ioana și am 24 de ani.",
      "Sunt studentă la medicină și îmi place să dansez.",
      "Te poți aminti de mine și de ce studiez?",
    ],
  },
  {
    id: `user-victor-${TIMESTAMP}`,
    name: "Victor",
    age: 52,
    scenarios: [
      "Bună ziua! Mă numesc Victor și am 52 de ani.",
      "Lucrez ca contabil și îmi place să citesc istoria.",
      "Îți amintești numele meu și profesia?",
    ],
  },
];

async function testDiverseUsers() {
  console.log(
    `🚀 Testăm ${DIVERSE_USERS.length} utilizatori cu profesii diverse...\n`
  );

  const results = {
    total: DIVERSE_USERS.length,
    successful: 0,
    failed: 0,
    nameErrors: [],
    jobErrors: [],
    crossContamination: [],
  };

  // Testăm fiecare utilizator
  for (let i = 0; i < DIVERSE_USERS.length; i++) {
    const user = DIVERSE_USERS[i];
    console.log(
      `\n👤 === UTILIZATOR ${i + 1}/${DIVERSE_USERS.length}: ${user.name.toUpperCase()} ===`
    );
    console.log(`📧 User ID: ${user.id}`);

    let userSuccess = true;

    // Scenariul 1: Prezentare
    console.log(`📝 Step 1: Prezentare`);
    console.log(`💬 "${user.scenarios[0]}"`);

    try {
      const response1 = await fetch(
        "http://localhost:8888/.netlify/functions/ai-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: user.scenarios[0],
            assistantName: "Test Assistant",
            addressMode: "Tu",
            userId: user.id,
          }),
        }
      );

      if (response1.ok) {
        const data1 = await response1.json();
        console.log(
          `🤖 ${(data1.reply || "No response").substring(0, 150)}...`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Eroare Step 1: ${error.message}`);
      userSuccess = false;
    }

    // Scenariul 2: Profesie și hobby
    console.log(`📝 Step 2: Profesie și hobby`);
    console.log(`💬 "${user.scenarios[1]}"`);

    try {
      const response2 = await fetch(
        "http://localhost:8888/.netlify/functions/ai-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: user.scenarios[1],
            assistantName: "Test Assistant",
            addressMode: "Tu",
            userId: user.id,
          }),
        }
      );

      if (response2.ok) {
        const data2 = await response2.json();
        console.log(
          `🤖 ${(data2.reply || "No response").substring(0, 150)}...`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Eroare Step 2: ${error.message}`);
      userSuccess = false;
    }

    // Scenariul 3: Test de memorie
    console.log(`📝 Step 3: Test memorie`);
    console.log(`💬 "${user.scenarios[2]}"`);

    try {
      const response3 = await fetch(
        "http://localhost:8888/.netlify/functions/ai-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: user.scenarios[2],
            assistantName: "Test Assistant",
            addressMode: "Tu",
            userId: user.id,
          }),
        }
      );

      if (response3.ok) {
        const data3 = await response3.json();
        const aiResponse = data3.reply || "No response";
        console.log(`🤖 ${aiResponse}`);

        // Verificăm memoria
        const nameFound = aiResponse
          .toLowerCase()
          .includes(user.name.toLowerCase());
        console.log(`✓ Nume (${user.name}): ${nameFound ? "✅ DA" : "❌ NU"}`);

        if (!nameFound) {
          results.nameErrors.push(user.name);
          userSuccess = false;
        }

        // Extragem profesia din scenariul 2 pentru verificare
        const jobPattern =
          /(?:lucrez ca|sunt) ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+) [șs]i/i;
        const jobMatch = user.scenarios[1].match(jobPattern);

        if (jobMatch) {
          const expectedJob = jobMatch[1].trim();
          const jobFound = aiResponse
            .toLowerCase()
            .includes(expectedJob.toLowerCase());
          console.log(
            `✓ Profesie (${expectedJob}): ${jobFound ? "✅ DA" : "❌ NU"}`
          );

          if (!jobFound) {
            results.jobErrors.push({ name: user.name, job: expectedJob });
            userSuccess = false;
          }
        }

        // Verificăm cross-contamination cu alți utilizatori
        for (const otherUser of DIVERSE_USERS) {
          if (
            otherUser.name !== user.name &&
            aiResponse.toLowerCase().includes(otherUser.name.toLowerCase())
          ) {
            results.crossContamination.push({
              current: user.name,
              contaminated: otherUser.name,
            });
            console.log(
              `⚠️ CROSS-CONTAMINATION: Conține numele "${otherUser.name}"`
            );
            userSuccess = false;
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Eroare Step 3: ${error.message}`);
      userSuccess = false;
    }

    if (userSuccess) {
      results.successful++;
      console.log(`✅ ${user.name}: SUCCESS`);
    } else {
      results.failed++;
      console.log(`❌ ${user.name}: FAILED`);
    }
  }

  // Afișăm raportul final
  console.log(`\n\n📊 RAPORT FINAL - TEST COMPREHENSIV:`);
  console.log(`=======================================`);
  console.log(`👥 Total utilizatori testați: ${results.total}`);
  console.log(`✅ Utilizatori cu succes: ${results.successful}`);
  console.log(`❌ Utilizatori cu probleme: ${results.failed}`);
  console.log(
    `📈 Rata de succes: ${Math.round((results.successful / results.total) * 100)}%`
  );

  if (results.nameErrors.length > 0) {
    console.log(`\n❌ PROBLEME CU NUMELE:`);
    results.nameErrors.forEach((name) => console.log(`   - ${name}`));
  }

  if (results.jobErrors.length > 0) {
    console.log(`\n❌ PROBLEME CU PROFESIILE:`);
    results.jobErrors.forEach((error) =>
      console.log(`   - ${error.name}: ${error.job}`)
    );
  }

  if (results.crossContamination.length > 0) {
    console.log(`\n⚠️ PROBLEME CROSS-CONTAMINATION:`);
    results.crossContamination.forEach((error) =>
      console.log(
        `   - ${error.current} conține date de la ${error.contaminated}`
      )
    );
  }

  if (results.failed === 0) {
    console.log(`\n🎉 PERFECTA! Toate testele au trecut cu succes!`);
    console.log(
      `✨ Sistemul funcționează pentru orice utilizator cu orice profesie!`
    );
  } else {
    console.log(`\n🔧 ÎMBUNĂTĂȚIRI NECESARE:`);
    console.log(`   - Verifică regex-urile pentru extragerea informațiilor`);
    console.log(`   - Îmbunătățește separarea datelor între utilizatori`);
    console.log(`   - Testează manual cazurile problematice`);
  }

  console.log(`\n🚀 URMĂTORII PAȘI:`);
  console.log(`   1. Analizează erorile raportate mai sus`);
  console.log(`   2. Îmbunătățește regex-urile dacă e necesar`);
  console.log(`   3. Testează din nou până la 100% succes`);
  console.log(`   4. Implementează storage persistent (Firebase)`);
}

// Rulăm testul comprehensiv
testDiverseUsers().catch(console.error);
