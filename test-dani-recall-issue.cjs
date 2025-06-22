#!/usr/bin/env node

// Test pentru a reproduce problema cu amintirea numelui "Dani"
// Simulează scenariul: detectare → confirmare → conversație nouă → amintire

// Setează emulatorul Firebase înainte de import
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";

const {
  UserProfileManager,
  extractInfoFromMessage,
} = require("./lib/firebase-user-profiles.cjs");

// Testează scenario-ul complet de detectare și amintire nume
async function testDaniRecallIssue() {
  console.log('\n🔍 === TEST PROBLEMA AMINTIRE NUME "DANI" ===\n');

  const userId = `test_dani_recall_${Date.now()}`;
  const profileManager = new UserProfileManager(userId);

  try {
    // Inițializează profilul
    await profileManager.initializeProfile();
    console.log("✅ Profil inițializat pentru:", userId);

    // === PASUL 1: Detectarea numelui "Dani" ===
    console.log('\n--- PASUL 1: Detectare nume "Dani" ---');
    const message1 = "Salut! Sunt Dani și vreau să vorbesc cu tine.";
    console.log("Mesaj utilizator:", message1);

    const extractedInfo1 = extractInfoFromMessage(message1);
    console.log("Informații extrase:", extractedInfo1);

    // Simulează logica din Netlify function pentru detectarea cu confirmare
    if (extractedInfo1.needsNameConfirmation) {
      console.log(
        "⚠️  Nume detectat cu încredere scăzută - necesită confirmare"
      );
      await profileManager.updateProfile({
        pendingNameConfirmation: extractedInfo1.name,
      });
      console.log(
        "💾 Nume salvat ca pendingNameConfirmation:",
        extractedInfo1.name
      );
    } else if (extractedInfo1.name) {
      console.log("✅ Nume detectat cu încredere înaltă - salvat direct");
      await profileManager.updateProfile({ name: extractedInfo1.name });
    }

    // Verifică profilul după detectare
    let profile = await profileManager.getProfile();
    console.log("📋 Profil după detectare:", {
      name: profile.profile.name,
      pendingNameConfirmation: profile.profile.pendingNameConfirmation,
    });

    // === PASUL 2: Confirmarea numelui ===
    console.log("\n--- PASUL 2: Confirmare nume ---");
    const message2 = "Da, corect!";
    console.log("Mesaj utilizator:", message2);

    const extractedInfo2 = extractInfoFromMessage(message2);
    console.log("Informații extrase:", extractedInfo2);

    // Simulează logica de confirmare din Netlify function
    if (
      extractedInfo2.confirmation &&
      profile?.profile?.pendingNameConfirmation
    ) {
      if (extractedInfo2.confirmation === "yes") {
        console.log("✅ Nume confirmat de utilizator");
        await profileManager.updateProfile({
          name: profile.profile.pendingNameConfirmation,
        });
        console.log(
          "💾 Nume salvat în profil:",
          profile.profile.pendingNameConfirmation
        );

        // Șterge confirmarea în așteptare
        await profileManager.updateProfile({ pendingNameConfirmation: null });
        console.log("🗑️ pendingNameConfirmation șters");
      } else {
        console.log("❌ Nume respins de utilizator");
        await profileManager.updateProfile({ pendingNameConfirmation: null });
      }
    }

    // Verifică profilul după confirmare
    profile = await profileManager.getProfile();
    console.log("📋 Profil după confirmare:", {
      name: profile.profile.name,
      pendingNameConfirmation: profile.profile.pendingNameConfirmation,
    });

    // === PASUL 3: Conversație nouă (simulează restart) ===
    console.log("\n--- PASUL 3: Conversație nouă - test amintire ---");
    const message3 = "Cum mă numesc?";
    console.log("Mesaj utilizator:", message3);

    // Verifică dacă este o întrebare personală
    const isPersonalQuestion =
      /cum m[ăa] numesc|care (?:e|este) numele meu/i.test(message3);
    console.log("Este întrebare personală?", isPersonalQuestion);

    if (isPersonalQuestion) {
      // Simulează răspunsul personal
      const currentProfile = await profileManager.getProfile();
      console.log("📋 Profil curent pentru răspuns:", {
        name: currentProfile.profile.name,
        pendingNameConfirmation: currentProfile.profile.pendingNameConfirmation,
      });

      if (currentProfile.profile.name) {
        console.log(
          "✅ AI ar trebui să răspundă: Te numești",
          currentProfile.profile.name
        );
      } else {
        console.log("❌ AI nu știe numele - ar trebui să întrebe din nou");
      }
    }

    // === PASUL 4: Test context pentru AI ===
    console.log("\n--- PASUL 4: Context pentru AI ---");
    const personalContext = await profileManager.generateContextForAI();
    console.log("📝 Context generat pentru AI:");
    console.log(personalContext);

    console.log("\n🎯 === CONCLUZIA TESTULUI ===");

    const finalProfile = await profileManager.getProfile();
    if (finalProfile.profile.name === "Dani") {
      console.log(
        '✅ SUCCESS: Numele "Dani" a fost salvat și poate fi amintit'
      );
    } else {
      console.log('❌ FAIL: Numele "Dani" nu a fost salvat corect');
      console.log("Profil final:", finalProfile.profile);
    }
  } catch (error) {
    console.error("❌ Eroare în test:", error);
  }
}

// Rulează testul
if (require.main === module) {
  testDaniRecallIssue()
    .then(() => {
      console.log("\n✅ Test finalizat!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Eroare fatală:", error);
      process.exit(1);
    });
}

module.exports = { testDaniRecallIssue };
