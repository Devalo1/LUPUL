// Test file to verify exports
import * as PersonalizedUtils from "./src/utils/personalizedAIUtils";

// Test exports validation
function validateExports() {
  const exportCount = Object.keys(PersonalizedUtils).length;
  const hasMainFunctions =
    typeof PersonalizedUtils.generatePersonalizedPrompt === "function" &&
    typeof PersonalizedUtils.loadPersonalizedAISettings === "function";

  return {
    exportCount,
    hasMainFunctions,
    availableExports: Object.keys(PersonalizedUtils),
  };
}

// Suppress console rule for test output
// eslint-disable-next-line no-console
console.log("Export validation results:", validateExports());
