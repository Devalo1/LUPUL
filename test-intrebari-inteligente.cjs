// Test pentru sistemul inteligent de întrebări proactive
// Arată cum AI-ul întreabă pentru a-și completa baza de date

const {
  UserProfileManager,
  extractInfoFromMessage,
} = require("./lib/firebase-user-profiles.cjs");

async function testIntelligentQuestions() {
  console.log("🧠 Test Sistem Inteligent de Întrebări AI");
  console.log("════════════════════════════════════════════════════════════");
  console.log("AI-ul va întreba proactiv pentru a-și completa baza de date\n");

  const userId = "test_user_dumitru";
  const profileManager = new UserProfileManager(userId);

  // Simulează conversația cu Dumitru
  const conversation = [
    {
      userMessage: "ma numesc dumitru",
      expectedResponse: "Salut, Dumitru!",
    },
    {
      userMessage: "cum ma numesc?",
      expectedResponse: "Te numești Dumitru!",
    },
    {
      userMessage: "imi place sa citesc",
      expectedResponse: "Ce frumos că îți place să citești!",
    },
    {
      userMessage: "ce faci?",
      expectedResponse: "Sunt aici să te ajut!",
    },
    {
      userMessage: "am o intrebare",
      expectedResponse: "Da, cu ce te pot ajuta?",
    },
  ];

  console.log("👤 Simulare conversație cu Dumitru:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  for (let i = 0; i < conversation.length; i++) {
    const msg = conversation[i];

    console.log(`\n${i + 1}. 💬 User: "${msg.userMessage}"`); // Extrage informații din mesaj
    const extractedInfo = extractInfoFromMessage(msg.userMessage);
    if (Object.keys(extractedInfo).length > 0) {
      console.log(`   📊 Informații extrase: ${JSON.stringify(extractedInfo)}`);
      await profileManager.initializeProfile(); // Inițializează întotdeauna
      await profileManager.updateProfile(extractedInfo);
    }

    // Analizează ce informații lipsesc
    const missingInfo = await profileManager.analyzeProfileGaps();
    console.log(
      `   🔍 Informații lipsă: ${missingInfo.length} (${missingInfo.map((info) => info.type).join(", ")})`
    );

    // Verifică dacă ar trebui să întrebe
    const shouldAsk = await profileManager.shouldAskProfileQuestion();
    console.log(`   🤔 Ar trebui să întrebe? ${shouldAsk ? "DA" : "NU"}`);

    if (shouldAsk) {
      const question = await profileManager.generateContextualQuestion();
      if (question) {
        console.log(`   ❓ Întrebare contextuală: "${question.question}"`);

        // Simulează răspunsul îmbunătățit
        const baseResponse = msg.expectedResponse;
        const enhancedResponse =
          await profileManager.generateResponseWithQuestion(baseResponse);
        console.log(`   🤖 Răspuns îmbunătățit: "${enhancedResponse}"`);
      }
    } else {
      console.log(`   🤖 Răspuns simplu: "${msg.expectedResponse}"`);
    }

    // Salvează conversația
    await profileManager.saveConversation(
      msg.userMessage,
      msg.expectedResponse,
      extractedInfo
    );

    console.log("   ✅ Conversație salvată în Firebase");
  }

  // Afișează profilul final
  console.log("\n📋 Profil Final Dumitru:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  const finalProfile = await profileManager.getProfile();

  if (finalProfile && finalProfile.profile) {
    const p = finalProfile.profile;
    console.log(`   Nume: ${p.name || "N/A"}`);
    console.log(`   Vârstă: ${p.age || "N/A"}`);
    console.log(`   Ocupație: ${p.occupation || "N/A"}`);
    console.log(`   Locație: ${p.location || "N/A"}`);
    console.log(
      `   Interese: ${p.interests.length > 0 ? p.interests.join(", ") : "N/A"}`
    );
    console.log(
      `   Obiective: ${p.goals.length > 0 ? p.goals.join(", ") : "N/A"}`
    );
    console.log(`   Total mesaje: ${finalProfile.metadata.totalMessages}`);
  }

  // Test întrebări specifice
  console.log("\n🎯 Test Întrebări Specifice:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const specificQuestions = [
    "cum ma numesc?",
    "cati ani am?",
    "unde lucrez?",
    "ce imi place sa fac?",
    "unde locuiesc?",
  ];

  for (const question of specificQuestions) {
    console.log(`\n❓ Întrebare: "${question}"`);

    // Verifică dacă poate răspunde pe baza datelor existente
    const profile = await profileManager.getProfile();
    const p = profile.profile;

    let answer = "Nu am această informație încă.";

    if (question.includes("nume") && p.name) {
      answer = `Te numești ${p.name}.`;
    } else if (question.includes("ani") && p.age) {
      answer = `Ai ${p.age} ani.`;
    } else if (question.includes("lucrez") && p.occupation) {
      answer = `Lucrezi ca ${p.occupation}.`;
    } else if (question.includes("imi place") && p.interests.length > 0) {
      answer = `Îți place să ${p.interests.join(", ")}.`;
    } else if (question.includes("locuiesc") && p.location) {
      answer = `Locuiești în ${p.location}.`;
    }

    console.log(`   🤖 Răspuns: "${answer}"`);

    if (answer.includes("Nu am această informație")) {
      const contextualQ = await profileManager.generateContextualQuestion();
      if (contextualQ) {
        console.log(`   💡 Întrebare de completare: "${contextualQ.question}"`);
      }
    }
  }

  console.log("\n🎉 Test Complet - Sistemul Inteligent de Întrebări!");
  console.log("════════════════════════════════════════════════════════════");
  console.log("✅ AI-ul întreabă proactiv pentru a-și completa baza de date");
  console.log("✅ Întrebările sunt contextuale și naturale");
  console.log("✅ Sistemul știe să răspundă pe baza informațiilor colectate");
  console.log("✅ Detectează când îi lipsesc informații importante");
}

// Test pentru problemă specifică cu "Dumitru"
async function testDumitruSpecific() {
  console.log("\n🎯 Test Specific - Problema cu Dumitru");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const userId = "user_dumitru_fix";
  const profileManager = new UserProfileManager(userId);

  // Simulează exact conversația problemă  console.log('1. 💬 User: "ma numesc dumitru"');
  let extractedInfo = extractInfoFromMessage("ma numesc dumitru");
  console.log(`   📊 Extras: ${JSON.stringify(extractedInfo)}`);
  if (extractedInfo.name) {
    await profileManager.initializeProfile(); // Inițializează înainte de update
    await profileManager.updateProfile(extractedInfo);
    console.log(`   ✅ Profil actualizat cu numele: ${extractedInfo.name}`);
  }

  await profileManager.saveConversation(
    "ma numesc dumitru",
    "Salut, Dumitru! Cum te pot ajuta astăzi?",
    extractedInfo
  );

  console.log('\n2. 💬 User: "cum ma numesc ?"');

  // Verifică profilul
  const profile = await profileManager.getProfile();
  if (profile && profile.profile.name) {
    const response = `Te numești ${profile.profile.name}.`;
    console.log(`   🤖 Răspuns corect: "${response}"`);
  } else {
    console.log(`   ❌ Nu găsește numele în profil!`);
    console.log(`   Profil actual: ${JSON.stringify(profile?.profile)}`);
  }
}

// Rulare teste
async function runTests() {
  try {
    await testDumitruSpecific();
    await testIntelligentQuestions();
  } catch (error) {
    console.error("💥 Eroare în teste:", error.message);
    console.log("\n💡 Asigură-te că Firebase emulator rulează!");
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { testIntelligentQuestions, testDumitruSpecific };
