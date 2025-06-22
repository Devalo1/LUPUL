const { extractInfoFromMessage } = require("./lib/firebase-user-profiles.cjs");

console.log('🔍 Test specific pentru "Da, corect":');
const result = extractInfoFromMessage("Da, corect");
console.log('Rezultat pentru "Da, corect":', result);

console.log("\n🔍 Alte teste de confirmare:");
console.log("Da:", extractInfoFromMessage("Da"));
console.log("Corect:", extractInfoFromMessage("Corect"));
console.log("Nu:", extractInfoFromMessage("Nu"));
console.log("Exact!:", extractInfoFromMessage("Exact!"));
console.log("Yes, that's right:", extractInfoFromMessage("Yes, that's right"));
