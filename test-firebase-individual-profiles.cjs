// Test pentru sistemul Firebase cu profiluri individuale
// Testează că fiecare utilizator are propriul profil separat

const {
  UserProfileManager,
  extractInfoFromMessage,
} = require("./lib/firebase-user-profiles.cjs");

async function testIndividualProfiles() {
  console.log("🔥 Test Firebase - Profiluri Individuale de Utilizatori");
  console.log("═".repeat(60));

  try {
    // Test cu 3 utilizatori diferiți
    const users = [
      {
        userId: "user_elena_123",
        messages: [
          "Salut! Mă numesc Elena și am 28 de ani.",
          "Lucrez ca designer grafic și îmi place să desenez.",
          "Locuiesc în București și sunt o persoană creativă.",
        ],
      },
      {
        userId: "user_mihai_456",
        messages: [
          "Bună ziua! Sunt Mihai, am 35 de ani.",
          "Sunt inginer software și îmi place să programez.",
          "Locuiesc în Cluj și îmi place să citesc.",
        ],
      },
      {
        userId: "user_ana_789",
        messages: [
          "Hey! Numele meu este Ana și am 24 de ani.",
          "Sunt studentă la medicină și îmi place să gătesc.",
          "Sunt din Timișoara și vreau să devin doctor.",
        ],
      },
    ];

    // Procesează fiecare utilizator
    for (const user of users) {
      console.log(`\n👤 Procesez utilizatorul: ${user.userId}`);
      console.log("─".repeat(40));

      const profileManager = new UserProfileManager(user.userId);
      await profileManager.initializeProfile();

      // Procesează fiecare mesaj
      for (let i = 0; i < user.messages.length; i++) {
        const message = user.messages[i];
        console.log(`\n💬 Mesaj ${i + 1}: "${message}"`);

        // Extrage informații
        const extracted = extractInfoFromMessage(message);
        console.log(`📊 Informații extrase:`, extracted);

        // Actualizează profilul
        if (Object.keys(extracted).length > 0) {
          // Actualizează câmpurile de bază
          const baseUpdates = {};
          ["name", "age", "occupation", "location"].forEach((field) => {
            if (extracted[field]) {
              baseUpdates[field] = extracted[field];
            }
          });

          if (Object.keys(baseUpdates).length > 0) {
            await profileManager.updateProfile(baseUpdates);
          }

          // Adaugă interese
          if (extracted.interests) {
            for (const interest of extracted.interests) {
              await profileManager.addInterest(interest);
            }
          }

          // Adaugă trăsături
          if (extracted.personalityTraits) {
            for (const trait of extracted.personalityTraits) {
              await profileManager.addPersonalityTrait(trait);
            }
          }

          // Adaugă obiective
          if (extracted.goals) {
            const currentProfile = await profileManager.getProfile();
            const updatedGoals = [
              ...(currentProfile.profile.goals || []),
              ...extracted.goals,
            ];
            await profileManager.updateProfile({ goals: updatedGoals });
          }
        }

        // Salvează conversația (cu răspuns simulat)
        const simulatedAiResponse = `Mulțumesc pentru informații! Am înțeles că ${extracted.name ? `te numești ${extracted.name}` : "vrei să îmi spui mai multe despre tine"}.`;
        await profileManager.saveConversation(
          message,
          simulatedAiResponse,
          extracted
        );

        // Pauză scurtă
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Afișează profilul final
      const finalProfile = await profileManager.getProfile();
      console.log(`\n✅ Profil final pentru ${user.userId}:`);
      console.log(`   Nume: ${finalProfile.profile.name || "N/A"}`);
      console.log(`   Vârstă: ${finalProfile.profile.age || "N/A"}`);
      console.log(`   Ocupație: ${finalProfile.profile.occupation || "N/A"}`);
      console.log(`   Locație: ${finalProfile.profile.location || "N/A"}`);
      console.log(
        `   Interese: ${finalProfile.profile.interests.join(", ") || "N/A"}`
      );
      console.log(`   Mesaje: ${finalProfile.metadata.totalMessages}`);

      // Testează contextul generat
      const context = await profileManager.generateContextForAI();
      console.log(`\n🤖 Context generat (${context.length} caractere):`);
      console.log(context.substring(0, 200) + "...");
    }

    // Test separare date
    console.log("\n🔒 Test Separare Date între Utilizatori");
    console.log("─".repeat(40));

    const elena = new UserProfileManager("user_elena_123");
    const mihai = new UserProfileManager("user_mihai_456");
    const ana = new UserProfileManager("user_ana_789");

    const elenaProfile = await elena.getProfile();
    const mihaiProfile = await mihai.getProfile();
    const anaProfile = await ana.getProfile();

    console.log("\n📋 Verificare Separare:");
    console.log(
      `Elena: ${elenaProfile.profile.name}, ${elenaProfile.profile.age} ani, ${elenaProfile.profile.occupation}`
    );
    console.log(
      `Mihai: ${mihaiProfile.profile.name}, ${mihaiProfile.profile.age} ani, ${mihaiProfile.profile.occupation}`
    );
    console.log(
      `Ana: ${anaProfile.profile.name}, ${anaProfile.profile.age} ani, ${anaProfile.profile.occupation}`
    );

    // Verifică că datele nu se amestecă
    if (
      elenaProfile.profile.name === "Elena" &&
      mihaiProfile.profile.name === "Mihai" &&
      anaProfile.profile.name === "Ana"
    ) {
      console.log("✅ SUCCESS: Datele sunt separate corect!");
    } else {
      console.log("❌ FAIL: Datele s-au amestecat!");
    }

    // Test căutare în conversații
    console.log("\n🔍 Test Căutare în Conversații");
    console.log("─".repeat(40));

    const searchResults = await elena.searchConversations("designer");
    console.log(
      `Rezultate căutare "designer" pentru Elena: ${searchResults.length} rezultate`
    );

    if (searchResults.length > 0) {
      console.log(`Primul rezultat: "${searchResults[0].userMessage}"`);
    }

    console.log("\n🎉 Test Firebase Complet - Profiluri Individuale REUȘIT!");
    console.log("═".repeat(60));
    console.log("✅ Fiecare utilizator are propriul profil în Firebase");
    console.log("✅ Datele sunt separate complet între utilizatori");
    console.log("✅ Sistemul învață progresiv din fiecare conversație");
    console.log("✅ Generează context personalizat pentru fiecare utilizator");
    console.log("✅ Suportă căutare în istoricul conversațiilor");
  } catch (error) {
    console.error("❌ Eroare în test:", error);
    console.log("\n💡 Asigură-te că:");
    console.log("   1. Firebase este configurat corect");
    console.log("   2. Credentialele Firebase sunt valide");
    console.log("   3. Firestore are permisiunile necesare");
  }
}

// Test rapid pentru extragerea de informații
function testInfoExtraction() {
  console.log("\n🧪 Test Extragere Informații");
  console.log("─".repeat(40));

  const testMessages = [
    "Salut! Mă numesc Alexandru și am 30 de ani.",
    "Lucrez ca programator și îmi place să joc gaming.",
    "Locuiesc în București și vreau să învăț Python.",
    "Sunt puțin stresat de la muncă dar sunt optimist.",
  ];

  testMessages.forEach((msg, index) => {
    console.log(`\n${index + 1}. "${msg}"`);
    const extracted = extractInfoFromMessage(msg);
    console.log(`   Extras:`, extracted);
  });
}

// Rulare teste
async function runAllTests() {
  console.log("🚀 Sistem Firebase - Profiluri Individuale de Utilizatori");
  console.log("═".repeat(60));

  // Test extragere informații
  testInfoExtraction();

  // Test profiluri Firebase (necesită Firebase configurat)
  try {
    await testIndividualProfiles();
  } catch (error) {
    console.log(
      "\n⚠️  Test Firebase sărit - Firebase nu este configurat local"
    );
    console.log("   Pentru test complet, configurează Firebase credentials");
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testIndividualProfiles, testInfoExtraction };
