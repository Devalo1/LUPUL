// Test script for AI personalization system
import {
  getPersonalizedAIName,
  generatePersonalizedSystemPrompt,
} from "./src/utils/personalizedAIUtils.js";

console.log("🧪 Testing AI Personalization System...\n");

// Test 1: Default name generation
console.log("Test 1: Default name generation");
console.log("Masculin default:", getPersonalizedAIName({ sex: "masculin" }));
console.log("Feminin default:", getPersonalizedAIName({ sex: "feminin" }));
console.log("Neutru default:", getPersonalizedAIName({ sex: "neutru" }));
console.log("");

// Test 2: Custom name
console.log("Test 2: Custom name");
const customSettings = {
  aiName: "Alex",
  sex: "masculin",
  character: "prietenos",
  goal: "să îți oferă sfaturi utile",
  addressMode: "Tu",
  conversationStyle: "casual",
};
console.log("Custom name:", getPersonalizedAIName(customSettings));
console.log("");

// Test 3: System prompt generation
console.log("Test 3: System prompt generation");
const basePrompt = "Ești un asistent AI util și empatic.";
const personalizedPrompt = generatePersonalizedSystemPrompt(
  basePrompt,
  customSettings
);
console.log("Personalized prompt:\n", personalizedPrompt);
console.log("");

// Test 4: Different conversation styles
console.log("Test 4: Different conversation styles");
const formalSettings = { ...customSettings, conversationStyle: "formal" };
const friendlySettings = { ...customSettings, conversationStyle: "prietenos" };
const professionalSettings = {
  ...customSettings,
  conversationStyle: "profesional",
};

console.log(
  "Formal style prompt:\n",
  generatePersonalizedSystemPrompt(basePrompt, formalSettings)
);
console.log(
  "\nFriendly style prompt:\n",
  generatePersonalizedSystemPrompt(basePrompt, friendlySettings)
);
console.log(
  "\nProfessional style prompt:\n",
  generatePersonalizedSystemPrompt(basePrompt, professionalSettings)
);

console.log("\n✅ Personalization tests completed!");
