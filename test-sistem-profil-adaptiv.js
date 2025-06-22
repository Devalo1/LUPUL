// Test pentru sistemul de profil adaptiv AI - funcționează cu orice utilizator
// Testează că AI-ul învață și se adaptează la orice profil de utilizator

const fetch = require("node-fetch");

// Configurare pentru testare locală - înlocuiește cu URL-ul tău Netlify
const AI_ENDPOINT = "http://localhost:8888/.netlify/functions/ai-chat";

// Scenarii de test cu utilizatori diferiți - niciun nume hardcodat
const testScenarios = [
  {
    userId: "user_001",
    messages: [
      "Salut! Mă numesc Elena și am 28 de ani.",
      "Lucrez ca designer grafic și îmi place să desenez.",
      "Am fost puțin stresată la muncă săptămâna aceasta.",
      "Poți să îmi dai niște sfaturi pentru relaxare?",
    ],
    expectedProfile: {
      name: "Elena",
      age: 28,
      occupation: "designer grafic",
      interests: ["desenez"],
      personalityTraits: ["sensibil la stres"],
    },
  },
  {
    userId: "user_002",
    messages: [
      "Bună ziua! Sunt Mihai, am 35 de ani și sunt inginer.",
      "Îmi place să citesc și să fac drumeții în timpul liber.",
      "Locuiesc în București și sunt foarte fericit astăzi.",
      "Ce cărți îmi recomanzi pentru weekend?",
    ],
    expectedProfile: {
      name: "Mihai",
      age: 35,
      occupation: "inginer",
      interests: ["citesc", "fac drumeții"],
      location: "București",
    },
  },
  {
    userId: "user_003",
    messages: [
      "Salut, sunt Maria și am 22 de ani.",
      "Sunt studentă la medicină și îmi place să gătesc.",
      "Am fost puțin tristă azi pentru că am avut un examen greu.",
      "Poți să mă ajuți să mă simt mai bine?",
    ],
    expectedProfile: {
      name: "Maria",
      age: 22,
      occupation: "studentă la medicină",
      interests: ["gătesc"],
      personalityTraits: ["emotiv"],
    },
  },
  {
    userId: "user_004",
    messages: [
      "Hey! Numele meu este Alex și lucrez ca programator.",
      "Am 29 de ani și îmi place să joc gaming.",
      "Sunt calm de obicei, dar îmi place să învăț lucruri noi.",
      "Ce tehnologii noi ar trebui să învăț?",
    ],
    expectedProfile: {
      name: "Alex",
      age: 29,
      occupation: "programator",
      interests: ["joc gaming", "învăț lucruri noi"],
    },
  },
];

async function testAdaptiveProfiles() {
  console.log("🚀 Începe testarea sistemului de profil adaptiv AI...\n");

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`📋 Test Scenario ${i + 1}: User ${scenario.userId}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    let userProfile = null;

    // Trimite fiecare mesaj în scenariul de test
    for (let j = 0; j < scenario.messages.length; j++) {
      const message = scenario.messages[j];
      console.log(`\n💬 Mesaj ${j + 1}: "${message}"`);

      try {
        const response = await fetch(AI_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: message,
            assistantName: "Aria",
            addressMode: "informal",
            userId: scenario.userId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        console.log(`🤖 Răspuns AI: "${data.reply}"`);

        // Salvează profilul utilizatorului din ultimul răspuns
        if (data.userProfile) {
          userProfile = data.userProfile;
          console.log(`📊 Profil actualizat:`, {
            name: userProfile.name,
            age: userProfile.age,
            occupation: userProfile.occupation,
            interests: userProfile.interests,
            traits: userProfile.personalityTraits,
            location: userProfile.location,
          });
        }

        // Pauză scurtă între mesaje pentru a simula conversația reală
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Eroare la mesajul ${j + 1}:`, error.message);
        return false;
      }
    }

    // Verifică dacă profilul a fost învățat corect
    console.log(`\n🔍 Verificare finală profil pentru ${scenario.userId}:`);

    if (!userProfile) {
      console.error("❌ Nu s-a primit profilul utilizatorului!");
      continue;
    }

    let profileCorrect = true;
    const expected = scenario.expectedProfile;

    // Verifică numele
    if (expected.name && userProfile.name !== expected.name) {
      console.error(
        `❌ Nume incorect: așteptat "${expected.name}", primit "${userProfile.name}"`
      );
      profileCorrect = false;
    } else if (expected.name) {
      console.log(`✅ Nume corect: ${userProfile.name}`);
    }

    // Verifică vârsta
    if (expected.age && userProfile.age !== expected.age) {
      console.error(
        `❌ Vârstă incorectă: așteptată ${expected.age}, primită ${userProfile.age}`
      );
      profileCorrect = false;
    } else if (expected.age) {
      console.log(`✅ Vârstă corectă: ${userProfile.age}`);
    }

    // Verifică ocupația
    if (
      expected.occupation &&
      !userProfile.occupation
        ?.toLowerCase()
        .includes(expected.occupation.toLowerCase())
    ) {
      console.error(
        `❌ Ocupație incorectă: așteptată "${expected.occupation}", primită "${userProfile.occupation}"`
      );
      profileCorrect = false;
    } else if (expected.occupation) {
      console.log(`✅ Ocupație corectă: ${userProfile.occupation}`);
    }

    // Verifică interesele
    if (expected.interests) {
      const foundInterests = expected.interests.filter((interest) =>
        userProfile.interests.some((userInterest) =>
          userInterest.toLowerCase().includes(interest.toLowerCase())
        )
      );
      if (foundInterests.length === 0) {
        console.error(
          `❌ Interese nu au fost detectate: așteptate ${JSON.stringify(expected.interests)}, primite ${JSON.stringify(userProfile.interests)}`
        );
        profileCorrect = false;
      } else {
        console.log(`✅ Interese detectate: ${JSON.stringify(foundInterests)}`);
      }
    }

    // Verifică trăsăturile de personalitate
    if (expected.personalityTraits) {
      const foundTraits = expected.personalityTraits.filter((trait) =>
        userProfile.personalityTraits.some((userTrait) =>
          userTrait.toLowerCase().includes(trait.toLowerCase())
        )
      );
      if (foundTraits.length === 0) {
        console.error(
          `❌ Trăsături de personalitate nu au fost detectate: așteptate ${JSON.stringify(expected.personalityTraits)}, primite ${JSON.stringify(userProfile.personalityTraits)}`
        );
      } else {
        console.log(`✅ Trăsături detectate: ${JSON.stringify(foundTraits)}`);
      }
    }

    // Verifică locația
    if (expected.location && userProfile.location !== expected.location) {
      console.error(
        `❌ Locație incorectă: așteptată "${expected.location}", primită "${userProfile.location}"`
      );
      profileCorrect = false;
    } else if (expected.location) {
      console.log(`✅ Locație corectă: ${userProfile.location}`);
    }

    if (profileCorrect) {
      console.log(
        `\n🎉 SUCCESS: Profilul pentru ${scenario.userId} a fost învățat corect!`
      );
    } else {
      console.log(
        `\n❌ FAIL: Profilul pentru ${scenario.userId} nu a fost învățat complet.`
      );
    }

    console.log("\n" + "═".repeat(80) + "\n");
  }

  console.log(
    "🏁 Test completat! Sistemul de profil adaptiv a fost testat pe utilizatori diferiți."
  );
}

// Test pentru separarea datelor între utilizatori
async function testUserDataSeparation() {
  console.log("🔒 Test separare date utilizatori...\n");

  const user1Id = "separation_test_1";
  const user2Id = "separation_test_2";

  // Utilizatorul 1
  console.log("👤 Utilizatorul 1 se prezintă...");
  const response1 = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Salut, sunt Ana și am 25 de ani, lucrez ca avocat.",
      assistantName: "Aria",
      addressMode: "formal",
      userId: user1Id,
    }),
  });

  const data1 = await response1.json();
  console.log(`🤖 Răspuns pentru Ana: "${data1.reply}"`);

  // Utilizatorul 2
  console.log("\n👤 Utilizatorul 2 se prezintă...");
  const response2 = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Hey, sunt Bogdan și am 30 de ani, sunt chef.",
      assistantName: "Aria",
      addressMode: "informal",
      userId: user2Id,
    }),
  });

  const data2 = await response2.json();
  console.log(`🤖 Răspuns pentru Bogdan: "${data2.reply}"`);

  // Verifică că datele nu se amestecă
  console.log("\n🔍 Verificare separare date:");

  if (
    data1.userProfile?.name === "Ana" &&
    data2.userProfile?.name === "Bogdan"
  ) {
    console.log("✅ SUCCESS: Datele utilizatorilor sunt separate corect!");
  } else {
    console.error("❌ FAIL: Datele utilizatorilor s-au amestecat!");
    console.log("Data1 profile:", data1.userProfile);
    console.log("Data2 profile:", data2.userProfile);
  }
}

// Rulare teste
async function runAllTests() {
  try {
    await testAdaptiveProfiles();
    await testUserDataSeparation();
  } catch (error) {
    console.error("💥 Eroare în teste:", error.message);
    console.log("\n💡 Asigură-te că:");
    console.log("   1. Serverul Netlify Dev rulează (netlify dev)");
    console.log("   2. Variabila OPENAI_API_KEY este setată corect");
    console.log("   3. Endpoint-ul AI_ENDPOINT este corect");
  }
}

// Pornește testele
if (require.main === module) {
  runAllTests();
}

module.exports = { testAdaptiveProfiles, testUserDataSeparation };
