// Scrip de inițializare pentru sistemul medical AI
import { databaseInitializationService } from "../services/databaseInitializationService";
import { intelligentAIService } from "../services/intelligentAIService";
import { medicineService } from "../services/medicineService";
import logger from "../utils/logger";

/**
 * Inițializează complet sistemul medical AI
 * Această funcție ar trebui apelată o singură dată, la prima configurare
 */
export const initializeMedicalSystem = async (): Promise<{
  success: boolean;
  message: string;
  details: any;
}> => {
  try {
    logger.info("🚀 Starting Medical AI System Initialization...");

    // 1. Verifică statusul actual
    logger.info("📊 Checking current database status...");
    const currentStatus =
      await databaseInitializationService.checkDatabaseStatus();

    logger.info("Current status:", currentStatus);

    // 2. Inițializează bazele de date dacă e necesar
    if (
      currentStatus.medicines === 0 ||
      currentStatus.interactions === 0 ||
      currentStatus.knowledgeEntries === 0
    ) {
      logger.info("🔧 Initializing databases...");
      await databaseInitializationService.initializeAllDatabases();
      logger.info("✅ Databases initialized successfully");
    } else {
      logger.info("ℹ️ Databases already initialized");
    }

    // 3. Inițializează asistentul AI
    logger.info("🤖 Initializing AI Assistant...");
    await intelligentAIService.initializeAssistant();
    logger.info("✅ AI Assistant initialized successfully");

    // 4. Verifică din nou statusul după inițializare
    const finalStatus =
      await databaseInitializationService.checkDatabaseStatus();
    logger.info("Final status:", finalStatus);

    // 5. Testează funcționalitatea de bază
    logger.info("🧪 Testing basic functionality...");

    // Test medicine search
    const testMedicines = await medicineService.searchMedicines("Paracetamol");
    logger.info(`Found ${testMedicines.length} medicines in test search`);

    // Test drug interactions (dacă sunt medicamente disponibile)
    if (testMedicines.length > 0) {
      const interactions = await medicineService.checkDrugInteractions([
        testMedicines[0].id,
      ]);
      logger.info(`Found ${interactions.length} interactions in test`);
    }

    logger.info("🎉 Medical AI System initialization completed successfully!");

    return {
      success: true,
      message: "Sistemul medical AI a fost inițializat cu succes!",
      details: {
        medicines: finalStatus.medicines,
        interactions: finalStatus.interactions,
        knowledgeEntries: finalStatus.knowledgeEntries,
        testResults: {
          medicineSearchCount: testMedicines.length,
          interactionCheckWorking: true,
        },
      },
    };
  } catch (error) {
    logger.error("❌ Error during Medical AI System initialization:", error);
    return {
      success: false,
      message: `Eroare la inițializarea sistemului: ${error instanceof Error ? error.message : "Eroare necunoscută"}`,
      details: { error: error instanceof Error ? error.message : error },
    };
  }
};

/**
 * Testează toate funcționalitățile sistemului medical
 */
export const testMedicalSystem = async (): Promise<{
  success: boolean;
  results: any;
}> => {
  try {
    logger.info("🔍 Starting Medical System Tests...");

    const testResults: any = {
      databaseStatus: {},
      medicineSearch: {},
      drugInteractions: {},
      aiAssistant: {},
      userFlow: {},
    };

    // 1. Test database status
    testResults.databaseStatus =
      await databaseInitializationService.checkDatabaseStatus();

    // 2. Test medicine search functionality
    try {
      const searchResults = await medicineService.searchMedicines("Ibuprofen");
      testResults.medicineSearch = {
        success: true,
        resultsCount: searchResults.length,
        firstResult: searchResults[0]?.name || "No results",
      };
    } catch (error) {
      testResults.medicineSearch = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // 3. Test drug interactions
    try {
      const allMedicines = await medicineService.getAllMedicines();
      if (allMedicines.length >= 2) {
        const interactions = await medicineService.checkDrugInteractions([
          allMedicines[0].id,
          allMedicines[1].id,
        ]);
        testResults.drugInteractions = {
          success: true,
          interactionsChecked: 2,
          interactionsFound: interactions.length,
        };
      } else {
        testResults.drugInteractions = {
          success: false,
          error: "Not enough medicines to test interactions",
        };
      }
    } catch (error) {
      testResults.drugInteractions = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // 4. Test AI Assistant basic functionality
    try {
      await intelligentAIService.initializeAssistant();
      testResults.aiAssistant = {
        success: true,
        message: "AI Assistant initialized successfully",
      };
    } catch (error) {
      testResults.aiAssistant = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // 5. Test complete user flow simulation
    try {
      // Simulează un utilizator test
      const testUserId = "test_user_" + Date.now();
      const sessionId =
        await intelligentAIService.startConversation(testUserId);
      const response = await intelligentAIService.processMessage(
        testUserId,
        "Am durere de cap și febră",
        sessionId
      );

      testResults.userFlow = {
        success: true,
        sessionCreated: !!sessionId,
        responseReceived: !!response,
        responseLength: response.length,
      };
    } catch (error) {
      testResults.userFlow = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    const overallSuccess = Object.values(testResults).every(
      (test: any) => test.success !== false
    );

    logger.info("✅ Medical System Tests completed");
    logger.info("Test Results:", testResults);

    return {
      success: overallSuccess,
      results: testResults,
    };
  } catch (error) {
    logger.error("❌ Error during Medical System testing:", error);
    return {
      success: false,
      results: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

/**
 * Funcție helper pentru verificarea rapidă a sistemului
 */
export const quickHealthCheck = async (): Promise<{
  status: "healthy" | "warning" | "error";
  message: string;
  details: any;
}> => {
  try {
    const dbStatus = await databaseInitializationService.checkDatabaseStatus();

    const totalEntries =
      dbStatus.medicines + dbStatus.interactions + dbStatus.knowledgeEntries;

    if (totalEntries === 0) {
      return {
        status: "error",
        message: "Sistemul nu este inițializat",
        details: dbStatus,
      };
    } else if (
      dbStatus.medicines === 0 ||
      dbStatus.interactions === 0 ||
      dbStatus.knowledgeEntries === 0
    ) {
      return {
        status: "warning",
        message: "Sistemul este parțial inițializat",
        details: dbStatus,
      };
    } else {
      return {
        status: "healthy",
        message: "Sistemul funcționează normal",
        details: dbStatus,
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Eroare la verificarea sistemului",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};
