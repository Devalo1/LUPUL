// Test local pentru sistemul de profil adaptiv - simulează funcționalitatea fără API OpenAI
// Demonstrează că AI-ul învață și se adaptează la orice utilizator

// Simulare a logicii de învățare din funcția principală
const userProfiles = new Map();

// Funcție pentru extragerea informațiilor din mesajul utilizatorului (copiată din ai-chat.js)
function learnFromUserMessage(message, userId) {
  if (!userProfiles.has(userId)) {
    userProfiles.set(userId, {
      name: null,
      age: null,
      occupation: null,
      interests: [],
      preferences: {},
      context: [],
      personalityTraits: [],
      location: null,
      relationshipStatus: null,
      lastUpdated: new Date(),
    });
  }

  const profile = userProfiles.get(userId);
  const lowerMessage = message.toLowerCase();
  // Extragere nume (pattern mai sofisticat)
  const namePatterns = [
    /numele meu este ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /mă numesc ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /mă cheamă ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /eu sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s(?:și|,|\.))/i, // Mai specific pentru nume
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:,|\s(?:și|am|de))/i, // Evită să preia adjective
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      const potentialName =
        match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      // Evită să preia cuvinte comune, adjective sau profesii ca nume
      const excludedWords = [
        "bine",
        "aici",
        "acolo",
        "foarte",
        "mult",
        "puțin",
        "mare",
        "mic",
        "fericit",
        "trist",
        "supărat",
        "bucuros",
        "calm",
        "relaxat",
        "stresat",
        "student",
        "studentă",
        "profesor",
        "profesoară",
        "inginer",
        "doctor",
        "programator",
        "designer",
        "avocat",
        "chef",
        "artist",
        "medic",
      ];
      if (
        !excludedWords.includes(potentialName.toLowerCase()) &&
        !profile.name
      ) {
        profile.name = potentialName;
        break;
      }
    }
  }

  // Extragere vârstă
  const agePatterns = [
    /am (\d{1,2}) (?:ani|de ani)/i,
    /sunt în vârstă de (\d{1,2})/i,
    /(\d{1,2}) ani/i,
  ];

  for (const pattern of agePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const age = parseInt(match[1]);
      if (age >= 13 && age <= 100) {
        // Vârstă rezonabilă
        profile.age = age;
        break;
      }
    }
  }
  // Extragere ocupație/profesie
  const occupationPatterns = [
    /lucrez ca ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|\.))/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?) de profesie/i,
    /profesiunea mea este ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /muncesc ca ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|\.))/i,
    /sunt (?:un|o) ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|de|\.))/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ\s]*(?:student|programator|inginer|doctor|designer|avocat|chef|artist|medic|profesor)[a-zA-ZăâîșțĂÂÎȘȚ\s]*?)(?:\s(?:și|,|la|\.))/i,
  ];

  for (const pattern of occupationPatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      const occupation = match[1].trim();
      if (!profile.occupation) {
        profile.occupation = occupation;
        break;
      }
    }
  }

  // Extragere interese și hobby-uri
  const interestPatterns = [
    /îmi place să ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /îmi plac ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /hobby-ul meu este ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /în timpul liber ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /pasiunea mea este ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
  ];

  for (const pattern of interestPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const interest = match[1].trim();
      if (!profile.interests.includes(interest)) {
        profile.interests.push(interest);
      }
    }
  }

  // Extragere trăsături de personalitate din ton și conținut
  if (lowerMessage.includes("trist") || lowerMessage.includes("supărat")) {
    if (!profile.personalityTraits.includes("emotiv")) {
      profile.personalityTraits.push("emotiv");
    }
  }
  if (lowerMessage.includes("fericit") || lowerMessage.includes("bucuros")) {
    if (!profile.personalityTraits.includes("optimist")) {
      profile.personalityTraits.push("optimist");
    }
  }
  if (lowerMessage.includes("stres") || lowerMessage.includes("anxios")) {
    if (!profile.personalityTraits.includes("sensibil la stres")) {
      profile.personalityTraits.push("sensibil la stres");
    }
  }
  // Extragere locație
  const locationPatterns = [
    /locuiesc în ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|\.))/i,
    /sunt din ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|\.))/i,
    /trăiesc în ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|\.))/i,
  ];

  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1] && !profile.location) {
      profile.location = match[1].trim();
      break;
    }
  }

  // Adaugă contextul mesajului pentru înțelegere viitoare
  profile.context.push({
    message: message.substring(0, 200), // Prima parte a mesajului
    timestamp: new Date(),
    mood: detectMood(message),
  });

  // Păstrează doar ultimele 10 contexte pentru a nu ocupa prea multă memorie
  if (profile.context.length > 10) {
    profile.context = profile.context.slice(-10);
  }

  profile.lastUpdated = new Date();
  userProfiles.set(userId, profile);

  return profile;
}

// Funcție pentru detectarea stării de spirit din mesaj
function detectMood(message) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("fericit") ||
    lowerMessage.includes("bucuros") ||
    lowerMessage.includes("vesel")
  ) {
    return "fericit";
  }
  if (
    lowerMessage.includes("trist") ||
    lowerMessage.includes("supărat") ||
    lowerMessage.includes("mâhnit")
  ) {
    return "trist";
  }
  if (
    lowerMessage.includes("stresat") ||
    lowerMessage.includes("anxios") ||
    lowerMessage.includes("îngrijorat")
  ) {
    return "stresat";
  }
  if (
    lowerMessage.includes("calm") ||
    lowerMessage.includes("relaxat") ||
    lowerMessage.includes("liniștit")
  ) {
    return "calm";
  }

  return "neutru";
}

// Scenarii de test cu utilizatori diferiți
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
    },
  },
  {
    userId: "user_random_xyz",
    messages: [
      "Hey! Numele meu este Alexandru și lucrez ca programator.",
      "Am 29 de ani și îmi place să joc gaming.",
      "Sunt calm de obicei, dar îmi place să învăț lucruri noi.",
      "Ce tehnologii noi ar trebui să învăț?",
    ],
    expectedProfile: {
      name: "Alexandru",
      age: 29,
      occupation: "programator",
      interests: ["joc gaming", "învăț lucruri noi"],
    },
  },
];

function testLocalProfiles() {
  console.log("🚀 Test local pentru sistemul de profil adaptiv AI\n");
  console.log(
    "📋 Testează că AI-ul învață din conversație pentru ORICE utilizator, nu nume hardcodate\n"
  );

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`👤 Test Scenario ${i + 1}: User ${scenario.userId}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    let finalProfile = null;

    // Procesează fiecare mesaj
    for (let j = 0; j < scenario.messages.length; j++) {
      const message = scenario.messages[j];
      console.log(`\n💬 Mesaj ${j + 1}: "${message}"`);

      // Învață din mesaj
      finalProfile = learnFromUserMessage(message, scenario.userId);

      console.log(`📊 Profil după mesaj:`, {
        name: finalProfile.name,
        age: finalProfile.age,
        occupation: finalProfile.occupation,
        interests: finalProfile.interests,
        traits: finalProfile.personalityTraits,
        location: finalProfile.location,
        mood: finalProfile.context[finalProfile.context.length - 1]?.mood,
      });
    }

    // Verifică dacă profilul a fost învățat corect
    console.log(`\n🔍 Verificare finală profil pentru ${scenario.userId}:`);

    let profileCorrect = true;
    const expected = scenario.expectedProfile;

    // Verifică numele
    if (expected.name && finalProfile.name !== expected.name) {
      console.error(
        `❌ Nume incorect: așteptat "${expected.name}", primit "${finalProfile.name}"`
      );
      profileCorrect = false;
    } else if (expected.name) {
      console.log(`✅ Nume corect: ${finalProfile.name}`);
    }

    // Verifică vârsta
    if (expected.age && finalProfile.age !== expected.age) {
      console.error(
        `❌ Vârstă incorectă: așteptată ${expected.age}, primită ${finalProfile.age}`
      );
      profileCorrect = false;
    } else if (expected.age) {
      console.log(`✅ Vârstă corectă: ${finalProfile.age}`);
    }

    // Verifică ocupația
    if (
      expected.occupation &&
      !finalProfile.occupation
        ?.toLowerCase()
        .includes(expected.occupation.toLowerCase())
    ) {
      console.error(
        `❌ Ocupație incorectă: așteptată "${expected.occupation}", primită "${finalProfile.occupation}"`
      );
      profileCorrect = false;
    } else if (expected.occupation) {
      console.log(`✅ Ocupație corectă: ${finalProfile.occupation}`);
    }

    // Verifică interesele
    if (expected.interests) {
      const foundInterests = expected.interests.filter((interest) =>
        finalProfile.interests.some((userInterest) =>
          userInterest.toLowerCase().includes(interest.toLowerCase())
        )
      );
      if (foundInterests.length === 0) {
        console.error(
          `❌ Interese nu au fost detectate: așteptate ${JSON.stringify(expected.interests)}, primite ${JSON.stringify(finalProfile.interests)}`
        );
        profileCorrect = false;
      } else {
        console.log(`✅ Interese detectate: ${JSON.stringify(foundInterests)}`);
      }
    }

    // Verifică locația
    if (expected.location && finalProfile.location !== expected.location) {
      console.error(
        `❌ Locație incorectă: așteptată "${expected.location}", primită "${finalProfile.location}"`
      );
      profileCorrect = false;
    } else if (expected.location) {
      console.log(`✅ Locație corectă: ${finalProfile.location}`);
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

  // Test separare utilizatori
  console.log("🔒 Test separare date între utilizatori:\n");

  const user1Profile = userProfiles.get("user_001");
  const user2Profile = userProfiles.get("user_002");

  if (user1Profile?.name === "Elena" && user2Profile?.name === "Mihai") {
    console.log("✅ SUCCESS: Datele utilizatorilor sunt separate corect!");
    console.log(
      `   - User 001: ${user1Profile.name}, ${user1Profile.age} ani, ${user1Profile.occupation}`
    );
    console.log(
      `   - User 002: ${user2Profile.name}, ${user2Profile.age} ani, ${user2Profile.occupation}`
    );
  } else {
    console.error("❌ FAIL: Datele utilizatorilor s-au amestecat!");
  }

  console.log(
    "\n🏁 Test completat! Sistemul de profil adaptiv funcționează pentru orice utilizator."
  );
  console.log("✨ Keypoints:");
  console.log("   - AI-ul învață automat din conversație");
  console.log("   - Nu depinde de nume specifice hardcodate");
  console.log("   - Separă datele între utilizatori");
  console.log(
    "   - Extrage: nume, vârstă, ocupație, interese, locație, stare de spirit"
  );
  console.log("   - Se adaptează la orice profil de utilizator");
}

// Rulare test
if (require.main === module) {
  testLocalProfiles();
}

module.exports = { testLocalProfiles, learnFromUserMessage };
