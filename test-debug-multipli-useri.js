// Test debugging pentru probleme cu utilizatori multipli
console.log("🔍 DEBUG TEST - UTILIZATORI MULTIPLI");
console.log("===================================");

const TIMESTAMP = Date.now();

async function debugSpecificUser(userName, userId, scenarios) {
  console.log(`\n🔍 === DEBUG ${userName.toUpperCase()} ===`);
  console.log(`📧 User ID: ${userId}`);

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    console.log(`\n📝 Step ${i + 1}: ${scenario.description}`);
    console.log(`💬 Sending: "${scenario.message}"`);

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
            assistantName: "Debug Assistant",
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
      const aiResponse = data.reply || data.response || "No response";

      console.log(`🤖 AI Response: ${aiResponse}`);

      // Analizăm răspunsul pentru debugging
      if (i === 2) {
        // Testul de memorie
        console.log(`\n🔍 ANALIZA MEMORIEI:`);
        console.log(
          `   - Conține numele "${userName}"? ${aiResponse.toLowerCase().includes(userName.toLowerCase()) ? "✅ DA" : "❌ NU"}`
        );

        // Verificăm dacă conține alte nume din test
        const otherNames = ["dumitru", "maria", "alex", "ana"];
        for (const name of otherNames) {
          if (name.toLowerCase() !== userName.toLowerCase()) {
            const contains = aiResponse.toLowerCase().includes(name);
            if (contains) {
              console.log(
                `   ⚠️ CROSS-CONTAMINATION: Conține "${name}" (PROBLEMĂ!)`
              );
            }
          }
        }
      }

      // Pauză între cereri
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.log(`❌ Eroare: ${error.message}`);
    }
  }
}

async function runDebugTest() {
  console.log("🚀 Început test debugging...\n");

  // Test cu Maria - cea care avea probleme
  await debugSpecificUser("Maria", `debug-maria-${TIMESTAMP}`, [
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
  ]);

  console.log("\n" + "=".repeat(50));

  // Test cu Alex - cel care avea probleme parțiale
  await debugSpecificUser("Alex", `debug-alex-${TIMESTAMP}`, [
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
  ]);

  // Test pentru a verifica regex-urile de extragere
  console.log("\n" + "=".repeat(50));
  console.log("🔍 TEST REGEX PATTERNS:");

  const testMessages = [
    "Bună! Sunt Maria și am 28 de ani.",
    "Sunt designer și îmi place să pictez",
    "Mă numesc Alex, am 42 de ani",
    "Sunt medic și îmi place să alerg",
  ];

  for (const msg of testMessages) {
    console.log(`\n📝 Testing: "${msg}"`);

    // Test nume
    const namePatterns = [
      /m[ăa] numesc ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]+)/,
      /numele meu (?:este|e) ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]+)/,
      /sunt ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]+)$/,
    ];

    for (let i = 0; i < namePatterns.length; i++) {
      const match = msg.toLowerCase().match(namePatterns[i]);
      if (match) {
        console.log(`   🎯 Name pattern ${i + 1} matched: "${match[1]}"`);
      }
    }

    // Test ocupație
    const jobPatterns = [
      /lucrez ca ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
      /sunt ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]+) de meserie/,
      /profesiunea mea (?:este|e) ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
    ];

    for (let i = 0; i < jobPatterns.length; i++) {
      const match = msg.toLowerCase().match(jobPatterns[i]);
      if (match) {
        console.log(`   💼 Job pattern ${i + 1} matched: "${match[1]}"`);
      }
    }
  }
}

runDebugTest().catch(console.error);
