// Test rapid pentru detectarea numelui "Dumitru"
const { extractInfoFromMessage } = require("./lib/firebase-user-profiles.cjs");

console.log('🧪 Test detectare nume "Dumitru"');
console.log("════════════════════════════════════════");

const testMessages = [
  "Ma numesc Dumitru",
  "ma numesc dumitru",
  "Mă numesc Dumitru",
  "numele meu este Dumitru",
  "sunt Dumitru",
  "eu sunt Dumitru",
  "Sunt Dumitru, cum te pot ajuta?",
];

testMessages.forEach((message, index) => {
  console.log(`\n${index + 1}. Mesaj: "${message}"`);
  const extracted = extractInfoFromMessage(message);
  console.log(`   Rezultat:`, extracted);

  if (extracted.name && extracted.name.toLowerCase() === "dumitru") {
    console.log(`   ✅ SUCCESS - Nume detectat corect: ${extracted.name}`);
  } else {
    console.log(`   ❌ FAIL - Nume nu a fost detectat sau este greșit`);
  }
});

console.log("\n🎯 Test conversație completă:");
console.log("══════════════════════════════════════");

// Test conversația exactă din exemplul tău
const conversation = ["ma numesc dumitru", "cum ma numesc ?"];

conversation.forEach((msg, i) => {
  console.log(`\nMesaj ${i + 1}: "${msg}"`);
  const result = extractInfoFromMessage(msg);
  console.log(`Extras:`, result);
});

console.log("\n💡 AI-ul ar trebui să răspundă:");
console.log('"Te numești Dumitru! Cum te pot ajuta?"');
