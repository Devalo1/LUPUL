// Test pentru AI în producție pe lupulsicorbul.com

const testProductionAI = async () => {
  console.log("🌐 Testare AI în producție pe lupulsicorbul.com...\n");

  try {
    // URL pentru producție
    const functionUrl = "https://lupulsicorbul.com/.netlify/functions/ai-chat";

    const testData = {
      prompt: "Salut! Cum mă poți ajuta?",
      assistantName: "Emma",
      addressMode: "pe tu",
    };

    console.log("📤 Trimit request la:", functionUrl);
    console.log("📝 Date test:", testData);

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("📊 Status HTTP:", response.status);
    console.log("📋 Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Eroare HTTP:", errorText);
      return;
    }

    const data = await response.json();
    console.log("✅ Răspuns AI:", data.reply);
    console.log("\n🎉 Test reușit! AI funcționează în producție!");
  } catch (error) {
    console.error("❌ Eroare la testarea AI în producție:", error.message);
    console.log("\n💡 Posibile cauze:");
    console.log("   1. Funcția ai-chat nu a fost deployed corect");
    console.log("   2. Cheia OPENAI_API_KEY nu este setată în Netlify");
    console.log("   3. CORS issues sau configurări de securitate");
  }
};

// Verifică dacă rulează în Node.js
if (typeof window === "undefined") {
  // Node.js environment cu ES modules
  import("node-fetch").then((nodeFetch) => {
    global.fetch = nodeFetch.default;
    testProductionAI();
  });
} else {
  // Browser environment
  console.log("Execută din consolă: testProductionAI()");
  window.testProductionAI = testProductionAI;
}
