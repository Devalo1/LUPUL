const { extractInfoFromMessage } = require("./lib/firebase-user-profiles.cjs");

console.log("🔍 Test Extragere Nume - Dumitru");
console.log("═══════════════════════════════");

// Test diferite variante de mesaje
const testMessages = [
  "Dumitru",
  "Sunt Dumitru",
  "Mă numesc Dumitru",
  "Ma numesc Dumitru",
  "Mă cheamă Dumitru",
  "Ma cheama Dumitru",
  "Numele meu este Dumitru",
];

testMessages.forEach((message, index) => {
  console.log(`\n${index + 1}. Mesaj: "${message}"`);
  const extracted = extractInfoFromMessage(message);
  console.log("   Extras:", extracted);
  console.log("   Nume găsit:", extracted.name || "NEGĂSIT");
});

console.log("\n🔍 Test cazuri speciale:");
console.log("──────────────────────────");

const specialCases = [
  "sunt foarte bine",
  "sunt Dumitru.",
  "sunt Dumitru,",
  "sunt Dumitru și",
  "sunt Dumitru am 30",
  "bună ziua, sunt Dumitru",
];

specialCases.forEach((message, index) => {
  console.log(`\n${index + 1}. Mesaj: "${message}"`);
  const extracted = extractInfoFromMessage(message);
  console.log("   Nume găsit:", extracted.name || "NEGĂSIT");
});
