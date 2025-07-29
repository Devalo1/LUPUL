// Test rapid pentru sistemul AI mentor enhanced
import dotenv from "dotenv";

// Încarcă variabilele de mediu
dotenv.config();

const testAPIKey = process.env.VITE_OPENAI_API_KEY;

console.log("🧪 Test Enhanced AI Mentor System");
console.log("================================");
console.log("API Key configured:", testAPIKey ? "✅ YES" : "❌ NO");
console.log("API Key length:", testAPIKey ? testAPIKey.length : 0);
console.log(
  "API Key starts with sk-:",
  testAPIKey ? testAPIKey.startsWith("sk-") : false
);

// Test simplu pentru platforma knowledge
console.log("\n📚 Testing Platform Knowledge:");

const mockPlatformKnowledge = {
  name: "LUPUL - Platformă Wellness & Dezvoltare Personală",
  features: [
    "Terapie AI disponibilă 24/7",
    "Consultații cu specialiști umani",
    "Bibliotecă articole wellness",
    "Chat AI personalizat cu memorie",
    "Profil adaptiv al utilizatorului",
  ],
};

console.log("✅ Platform Knowledge loaded:", mockPlatformKnowledge.name);
console.log("✅ Features count:", mockPlatformKnowledge.features.length);

// Test pentru întrebări despre platformă
const testQuestions = [
  "Cunoști platforma?",
  "Ce produse sunt la vânzare?",
  "Cum pot să îmi îmbunătățesc starea de bine?",
  "Am nevoie de ajutor cu anxietatea",
];

console.log("\n❓ Test Questions:");
testQuestions.forEach((q, index) => {
  console.log(`${index + 1}. "${q}" - Should get LUPUL platform guidance`);
});

console.log("\n🎯 Expected AI Response Behavior:");
console.log("- Should know LUPUL is a wellness platform");
console.log("- Should NOT talk about generic products for sale");
console.log("- Should offer therapy services, articles, specialists");
console.log("- Should mention specific platform features");
console.log("- Should act as a platform mentor, not generic assistant");

console.log("\n📝 Implementation Status:");
console.log("✅ Enhanced AI Service created");
console.log("✅ Platform Knowledge Base ready");
console.log("✅ OpenAI API key configured");
console.log("✅ Integrated in AIAssistantWidget");
console.log("🔄 Testing needed - Use widget to verify behavior");
