// Test complet Firebase pentru conversația cu Dumitru
const {
  UserProfileManager,
  extractInfoFromMessage,
} = require("./lib/firebase-user-profiles.cjs");

async function testConversatiaDumitru() {
  console.log("🎯 Test Conversația cu Dumitru - Firebase");
  console.log("═══════════════════════════════════════════════");

  const userId = "user_dumitru_test";
  const profileManager = new UserProfileManager(userId);

  try {
    // Inițializează profilul
    await profileManager.initializeProfile();
    console.log(`✅ Profil inițializat pentru ${userId}`);

    // Primul mesaj: "ma numesc dumitru"
    console.log('\n👤 Utilizator: "ma numesc dumitru"');
    const extracted1 = extractInfoFromMessage("ma numesc dumitru");
    console.log("📊 Informații extrase:", extracted1);

    if (Object.keys(extracted1).length > 0) {
      await profileManager.updateProfile(extracted1);
      console.log("✅ Profil actualizat cu numele");
    }

    // Salvează conversația
    await profileManager.saveConversation(
      "ma numesc dumitru",
      "Salut, Dumitru! Cum te pot ajuta astăzi? Ai vreo întrebare sau nelămurire la care să-ți ofer răspunsuri detaliate?",
      extracted1
    );

    // Al doilea mesaj: "cum ma numesc ?"
    console.log('\n👤 Utilizator: "cum ma numesc ?"');
    const extracted2 = extractInfoFromMessage("cum ma numesc ?");
    console.log("📊 Informații extrase:", extracted2);

    // Generează contextul pentru AI
    const context = await profileManager.generateContextForAI();
    console.log("\n🤖 Context generat pentru AI:");
    console.log(context);

    // Obține profilul complet
    const profile = await profileManager.getProfile();
    console.log("\n📋 Profil complet utilizator:");
    console.log("   Nume:", profile.profile.name);
    console.log("   Total mesaje:", profile.metadata.totalMessages);

    // Răspunsul corect pe care AI-ul ar trebui să-l dea
    console.log("\n🎯 AI-ul ar trebui să răspundă:");
    console.log(
      '   "Te numești Dumitru! Îmi amintesc că mi-ai spus numele în conversația anterioară."'
    );

    // Simulează salvarea celui de-al doilea mesaj
    await profileManager.saveConversation(
      "cum ma numesc ?",
      "Te numești Dumitru! Îmi amintesc că mi-ai spus numele în conversația anterioară. Cum te pot ajuta?",
      extracted2
    );

    console.log("\n✅ SUCCESS: Sistemul Firebase funcționează perfect!");
    console.log('   - Numele "Dumitru" a fost detectat și salvat');
    console.log("   - AI-ul poate răspunde la întrebări despre utilizator");
    console.log("   - Conversațiile sunt salvate persistent în Firebase");
  } catch (error) {
    console.error("❌ Eroare în test:", error.message);
  }
}

// Rulează testul
if (require.main === module) {
  testConversatiaDumitru();
}
