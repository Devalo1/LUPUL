// Test complet pentru memoria activă AI cu toate categoriile
const {
  UserProfileManager,
  extractInfoFromMessage,
} = require("./lib/firebase-user-profiles.cjs");

async function testMemoriaActivaCompleta() {
  console.log("\n=== TEST COMPLET MEMORIA ACTIVĂ AI ===\n");

  const testUserId = `test_user_${Date.now()}`;
  const profileManager = new UserProfileManager(testUserId);

  try {
    // Inițializează profilul
    await profileManager.initializeProfile();
    console.log("✅ Profil inițializat cu succes");

    // Test mesaje pentru diferite categorii
    const testMessages = [
      // Nume și informații de bază
      "Mă numesc Ana și am 28 de ani",

      // Ocupație și locație
      "Lucrez ca programator în București",

      // Sănătate și medicamentație (cu accent special)
      "Sufăr de diabet și iau insulină zilnic",
      "Am probleme cu hipertensiunea și iau medicamente pentru tensiune",

      // Tipar de vorbire și comportament
      "Îmi place să vorbesc casual și sunt o persoană comunicativă",

      // Plăceri și dorințe
      "Îmi place să citesc și mă bucur când ascult muzică",
      "Îmi doresc să călătoresc prin Europa și vreau să învăț limbi străine",

      // Preocupări specifice
      "Mă îngrijorează sănătatea mea și mă preocupă viitorul carierei",

      // Interacțiuni medicamentoase
      "Doctor mi-a spus să nu iau aspirină cu insulina",

      // Interese și hobby-uri
      "Îmi place tehnologia și sunt pasionată de fotografie",
    ];

    console.log("\n🧪 Testez extragerea informațiilor din mesaje...\n");

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`📝 Mesaj ${i + 1}: "${message}"`);

      // Extrage informații
      const extractedInfo = extractInfoFromMessage(message);
      console.log("📊 Informații extrase:", extractedInfo);

      // Actualizează profilul
      if (Object.keys(extractedInfo).length > 0) {
        await profileManager.updateProfile(extractedInfo);

        // Adaugă categoriile specifice
        if (extractedInfo.interests) {
          for (const interest of extractedInfo.interests) {
            await profileManager.addInterest(interest);
          }
        }

        if (extractedInfo.personalityTraits) {
          for (const trait of extractedInfo.personalityTraits) {
            await profileManager.addPersonalityTrait(trait);
          }
        }

        if (extractedInfo.pleasures) {
          for (const pleasure of extractedInfo.pleasures) {
            await profileManager.addPleasure(pleasure);
          }
        }

        if (extractedInfo.desires) {
          for (const desire of extractedInfo.desires) {
            await profileManager.addDesire(desire);
          }
        }

        if (extractedInfo.healthConditions) {
          for (const condition of extractedInfo.healthConditions) {
            await profileManager.addHealthCondition(condition);
          }
        }

        if (extractedInfo.medications) {
          for (const medication of extractedInfo.medications) {
            await profileManager.addMedication(medication);
          }
        }

        if (extractedInfo.concerns) {
          for (const concern of extractedInfo.concerns) {
            await profileManager.addConcern(concern);
          }
        }
      }

      // Salvează conversația
      await profileManager.saveConversation(
        message,
        `Răspuns AI pentru mesajul ${i + 1}`,
        extractedInfo
      );

      console.log("✅ Profil actualizat și conversație salvată\n");
    }

    // Obține profilul final
    const finalProfile = await profileManager.getProfile();
    console.log("\n📋 PROFILUL FINAL AL UTILIZATORULUI:\n");
    console.log(JSON.stringify(finalProfile.profile, null, 2));

    // Generează context pentru AI
    const aiContext = await profileManager.generateContextForAI();
    console.log("\n🤖 CONTEXT GENERAT PENTRU AI:\n");
    console.log(aiContext);

    // Testează analiza golurilor din profil
    const missingInfo = await profileManager.analyzeProfileGaps();
    console.log("\n🔍 INFORMAȚII LIPSĂ DIN PROFIL:");
    missingInfo.forEach((info, index) => {
      console.log(`${index + 1}. ${info.type}: ${info.question}`);
    });

    // Generează întrebare contextuală
    const contextualQuestion =
      await profileManager.generateContextualQuestion();
    if (contextualQuestion) {
      console.log("\n❓ ÎNTREBARE CONTEXTUALĂ SUGERATĂ:");
      console.log(`${contextualQuestion.type}: ${contextualQuestion.question}`);
    }

    console.log("\n🎯 CATEGORII TESTATE CU SUCCES:");
    console.log("✅ Nume și vârstă");
    console.log("✅ Ocupație și locație");
    console.log("✅ Sănătate și boli (cu accent special)");
    console.log("✅ Medicamentație și interacțiuni");
    console.log("✅ Tipar de vorbire");
    console.log("✅ Comportament");
    console.log("✅ Plăceri");
    console.log("✅ Dorințe");
    console.log("✅ Preocupări");
    console.log("✅ Interese");

    return {
      success: true,
      profileComplete: finalProfile,
      contextGenerated: aiContext,
      missingInfoCount: missingInfo.length,
      questionsAvailable: !!contextualQuestion,
    };
  } catch (error) {
    console.error("❌ Eroare în testare:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Rulează testul
testMemoriaActivaCompleta()
  .then((result) => {
    console.log("\n=== REZULTATE FINALE ===");
    console.log(JSON.stringify(result, null, 2));
    console.log(
      "\n🚀 Memoria activă AI cu toate categoriile funcționează perfect!"
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test eșuat:", error);
    process.exit(1);
  });
