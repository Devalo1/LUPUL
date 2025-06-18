import {
  AIPersonalizedSettings,
  generatePersonalizedPrompt,
  loadPersonalizedAISettings,
  getPersonalizedAIName,
} from "./src/utils/personalizedAIUtils";

// Test that all imports are working correctly
const testSettings: AIPersonalizedSettings = {
  aiType: "general",
  aiName: "TestAI",
  character: "friendly",
  goal: "help with testing",
  addressMode: "Tu",
  responseLength: "short",
};

// Test function calls to ensure they work
async function testImports() {
  const testPrompt = generatePersonalizedPrompt(testSettings);
  const loadedSettings = await loadPersonalizedAISettings("test-user");
  const aiName = getPersonalizedAIName(testSettings);

  // Suppress console rule for test output
  // eslint-disable-next-line no-console
  console.log("Test import successful - all functions accessible:", {
    testPrompt: !!testPrompt,
    loadedSettings: !!loadedSettings,
    aiName: !!aiName,
  });
}

// Execute the test
testImports().catch(console.error);
