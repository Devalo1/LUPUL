#!/usr/bin/env node

// Test specific pentru a verifica why regex patterns nu funcționează pentru "Dani"

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";
const { extractInfoFromMessage } = require("./lib/firebase-user-profiles.cjs");

function testNameExtraction() {
  console.log('🧪 === TEST EXTRAGERE NUME "DANI" ===\n');

  const testMessages = [
    "Salut! Sunt Dani și vreau să vorbesc cu tine.",
    "Mă numesc Dani",
    "Numele meu este Dani",
    "Sunt Dani",
    "Dani",
    "Da, sunt Dani și am 25 de ani",
    "Eu sunt Dani",
  ];

  // Testează pattern-urile manual
  const explicitNamePatterns = [
    /numele meu este ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /mă numesc ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /ma numesc ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /mă cheamă ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /ma cheama ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s*[,\.])/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s+am\s+\d)/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s*$)/i,
    /eu sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
  ];

  testMessages.forEach((message, index) => {
    console.log(`\n--- TEST ${index + 1}: "${message}" ---`);

    // Test cu functia completa
    const extracted = extractInfoFromMessage(message);
    console.log("✨ Rezultat extractInfoFromMessage:", extracted);

    // Test pattern-uri individual
    explicitNamePatterns.forEach((pattern, i) => {
      const match = message.match(pattern);
      if (match) {
        console.log(`✅ Pattern ${i + 1} match:`, match[1]);
      }
    });

    // Test contextual patterns
    const contextualPatterns = [
      /^([A-ZĂÂÎȘȚ][a-zăâîșț]{2,20})\.?!?\s*$/,
      /^([A-ZĂÂÎȘȚ][a-zăâîșț]{2,20})\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{2,20})\.?!?\s*$/,
    ];

    contextualPatterns.forEach((pattern, i) => {
      const match = message.match(pattern);
      if (match) {
        console.log(`✅ Contextual pattern ${i + 1} match:`, match[1]);
      }
    });
  });
}

testNameExtraction();
