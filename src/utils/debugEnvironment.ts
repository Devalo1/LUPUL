// Debug Environment - Verifică configurarea mediului de lucru

const debugEnvironment = () => {
  console.log("🔍 DEBUG ENVIRONMENT CONFIGURATION\n");

  // Environment info
  console.log("📊 Environment Info:");
  console.log("- NODE_ENV:", process.env.NODE_ENV || "undefined");
  console.log("- VITE_MODE:", import.meta.env.MODE);
  console.log("- VITE_DEV:", import.meta.env.DEV);
  console.log("- VITE_PROD:", import.meta.env.PROD);

  // API Keys
  console.log("\n🔑 API Keys:");
  console.log(
    "- VITE_OPENAI_API_KEY:",
    import.meta.env.VITE_OPENAI_API_KEY ? "✅ Există" : "❌ Lipsește"
  );
  console.log("- Length:", import.meta.env.VITE_OPENAI_API_KEY?.length || 0);
  console.log(
    "- Starts with sk-:",
    import.meta.env.VITE_OPENAI_API_KEY?.startsWith("sk-") ? "✅ Da" : "❌ Nu"
  );

  // AI Service info
  console.log("\n🤖 AI Service Configuration:");
  if (import.meta.env.DEV) {
    console.log("- Mode: 🏠 DEVELOPMENT (Direct OpenAI API)");
    console.log("- Uses: getTherapyResponse() direct");
  } else {
    console.log("- Mode: 🌐 PRODUCTION (Netlify Functions)");
    console.log("- Uses: /.netlify/functions/ai-chat");
  }

  // Firebase
  console.log("\n🔥 Firebase Configuration:");
  console.log(
    "- Project ID:",
    import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅" : "❌"
  );
  console.log(
    "- Auth Domain:",
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅" : "❌"
  );
  console.log(
    "- Use Emulators:",
    import.meta.env.VITE_USE_FIREBASE_EMULATORS || "false"
  );

  console.log("\n" + "=".repeat(50));
};

// Export pentru folosire în componente React
export { debugEnvironment };

// Auto-run când se importă
if (import.meta.env.DEV) {
  setTimeout(() => {
    debugEnvironment();
  }, 1000);
}
