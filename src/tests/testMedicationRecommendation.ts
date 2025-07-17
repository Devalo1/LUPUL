import { getPersonalizedMedicationRecommendation } from "../utils/medicationRecommendation";

// Test rapid pentru funcția de recomandare personalizată
async function testRecommendation() {
  const testUserId = "test-user-123"; // Înlocuiește cu un userId valid din Firestore
  const result = await getPersonalizedMedicationRecommendation(testUserId);
  console.log("Rezultat recomandare:", result);
}

// Rulează testul
// Pentru rulare: node src/tests/testMedicationRecommendation.ts
if (require.main === module) {
  testRecommendation().catch(console.error);
}
