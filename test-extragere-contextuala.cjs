const { extractInfoFromMessage } = require("./lib/firebase-user-profiles.cjs");

console.log("🔍 Test Extragere Contextuală Nume");
console.log("═══════════════════════════════════");

// Test diferite tipuri de nume
const testCases = [
  // Nume comune românești
  { message: "Andreea", expectName: "Andreea", expectConfirmation: false },
  { message: "Maria", expectName: "Maria", expectConfirmation: false },
  { message: "Alexandru", expectName: "Alexandru", expectConfirmation: false },
  { message: "Dumitru", expectName: "Dumitru", expectConfirmation: false },

  // Nume mai puțin comune
  { message: "Xerxes", expectName: "Xerxes", expectConfirmation: true },
  {
    message: "Bartholomew",
    expectName: "Bartholomew",
    expectConfirmation: true,
  },
  { message: "Zinaida", expectName: "Zinaida", expectConfirmation: true },

  // Nume compuse
  { message: "Ana Maria", expectName: "Ana Maria", expectConfirmation: false },
  {
    message: "Ion Popescu",
    expectName: "Ion Popescu",
    expectConfirmation: false,
  },

  // Cuvinte care NU sunt nume
  { message: "Bine", expectName: null, expectConfirmation: false },
  { message: "Mulțumesc", expectName: null, expectConfirmation: false },
  { message: "Perfect", expectName: null, expectConfirmation: false },

  // Confirmări
  { message: "Da", expectConfirmation: false, expectConfirm: "yes" },
  { message: "Nu", expectConfirmation: false, expectConfirm: "no" },
  { message: "Corect", expectConfirmation: false, expectConfirm: "yes" },
  { message: "Greșit", expectConfirmation: false, expectConfirm: "no" },

  // Pattern-uri explicite
  { message: "Sunt Diana", expectName: "Diana", expectConfirmation: false },
  {
    message: "Mă numesc Cristina",
    expectName: "Cristina",
    expectConfirmation: false,
  },
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. "${testCase.message}"`);

  const extracted = extractInfoFromMessage(testCase.message);

  // Verifică numele
  if (testCase.expectName) {
    if (extracted.name === testCase.expectName) {
      console.log(`   ✅ Nume corect: ${extracted.name}`);
    } else {
      console.log(
        `   ❌ Nume greșit. Așteptat: ${testCase.expectName}, Găsit: ${extracted.name || "NIMIC"}`
      );
    }

    // Verifică confirmarea
    const needsConfirmation = extracted.needsNameConfirmation || false;
    if (needsConfirmation === testCase.expectConfirmation) {
      console.log(`   ✅ Confirmare: ${needsConfirmation ? "DA" : "NU"}`);
    } else {
      console.log(
        `   ❌ Confirmare greșită. Așteptat: ${testCase.expectConfirmation}, Găsit: ${needsConfirmation}`
      );
    }

    console.log(`   📊 Încredere: ${extracted.nameConfidence || "N/A"}`);
  } else if (testCase.expectConfirm) {
    // Test pentru confirmări
    if (extracted.confirmation === testCase.expectConfirm) {
      console.log(`   ✅ Confirmare corectă: ${extracted.confirmation}`);
    } else {
      console.log(
        `   ❌ Confirmare greșită. Așteptat: ${testCase.expectConfirm}, Găsit: ${extracted.confirmation || "NIMIC"}`
      );
    }
  } else {
    // Ar trebui să nu găsească nimic
    if (!extracted.name) {
      console.log(`   ✅ Nu a găsit nume (corect)`);
    } else {
      console.log(`   ❌ A găsit nume incorect: ${extracted.name}`);
    }
  }
});
