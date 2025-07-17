#!/usr/bin/env node
/**
 * Script de inițializare automată pentru sistemul medical AI
 * Rulează: npm run init-medical-system
 */

const {
  initializeMedicalSystem,
  testMedicalSystem,
} = require("./src/utils/systemInitialization");

async function main() {
  console.log("🏥 Starting Medical AI System Setup...\n");

  try {
    // 1. Inițializează sistemul
    console.log("Step 1: Initializing Medical System...");
    const initResult = await initializeMedicalSystem();

    if (initResult.success) {
      console.log("✅ Medical System initialized successfully!");
      console.log(
        `📊 Status: ${initResult.details.medicines} medicines, ${initResult.details.interactions} interactions, ${initResult.details.knowledgeEntries} knowledge entries`
      );
    } else {
      console.error(
        "❌ Medical System initialization failed:",
        initResult.message
      );
      process.exit(1);
    }

    // 2. Testează funcționalitățile
    console.log("\nStep 2: Testing System Functionality...");
    const testResult = await testMedicalSystem();

    if (testResult.success) {
      console.log("✅ All tests passed!");
      console.log(
        "📋 Test Results:",
        JSON.stringify(testResult.results, null, 2)
      );
    } else {
      console.log("⚠️ Some tests failed:");
      console.log(JSON.stringify(testResult.results, null, 2));
    }

    console.log("\n🎉 Medical AI System is ready to use!");
    console.log("🌐 Access the system at:");
    console.log(
      "   • Medical Assistant: http://localhost:5173/medical/assistant"
    );
    console.log(
      "   • Database Management: http://localhost:5173/medical/database"
    );
  } catch (error) {
    console.error("💥 Fatal error during setup:", error);
    process.exit(1);
  }
}

// Rulează scriptul dacă este executat direct
if (require.main === module) {
  main();
}

module.exports = { main };
