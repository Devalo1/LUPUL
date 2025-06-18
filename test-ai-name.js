// Test rapid pentru funcția getAIAssistantName
console.log("=== Test getAIAssistantName ===");

// Simulez localStorage pentru teste
global.localStorage = {
  getItem: (key) => {
    if (key === "ai_name") return "NumePersonalizat";
    if (key === "ai_type") return "general";
    return null;
  },
};

// Funcția getAIAssistantName (copiată pentru test)
function getAIAssistantName(settings, userProfile) {
  if (settings?.aiName && settings.aiName.trim()) {
    return settings.aiName.trim();
  }

  const savedAIName = localStorage.getItem("ai_name");
  if (savedAIName && savedAIName.trim()) {
    return savedAIName.trim();
  }

  if (userProfile?.name) {
    return userProfile.name;
  }

  const aiType =
    settings?.aiType || localStorage.getItem("ai_type") || "general";

  switch (aiType) {
    case "psihica":
      return "Terapeut Psihic";
    case "fizica":
      return "Terapeut Fizic";
    case "general":
    default:
      return "Asistent AI";
  }
}

// Teste
console.log(
  "1. Cu settings.aiName:",
  getAIAssistantName({ aiName: "TestBot" })
);
console.log("2. Cu localStorage ai_name:", getAIAssistantName());
console.log(
  "3. Cu userProfile.name:",
  getAIAssistantName(undefined, { name: "UserBot" })
);
console.log("4. Default general:", getAIAssistantName({}, undefined));

// Test cu localStorage gol
global.localStorage = { getItem: () => null };
console.log(
  "5. Fără localStorage, default:",
  getAIAssistantName({}, undefined)
);
