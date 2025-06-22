// Test pentru funcția Netlify AI Chat
// Rulează acest script pentru a testa funcția în mediul de dezvoltare

import fetch from "node-fetch";

const testNetlifyFunction = async () => {
  console.log("🧪 Testare funcție Netlify AI Chat...\n");

  try {
    // URL pentru dezvoltare locală (Netlify Dev)
    const functionUrl = "http://localhost:8888/.netlify/functions/ai-chat";

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

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Eroare HTTP:", errorText);
      return;
    }

    const data = await response.json();
    console.log("✅ Răspuns AI:", data.reply);
    console.log("\n🎉 Test reușit! Funcția Netlify funcționează corect.");
  } catch (error) {
    console.error("❌ Eroare la testarea funcției:", error.message);
    console.log("\n💡 Asigurați-vă că:");
    console.log("   1. Aveți Netlify Dev pornit: npm run dev");
    console.log("   2. Cheia OPENAI_API_KEY este setată în .env.local");
    console.log("   3. Funcția există în netlify/functions/ai-chat.js");
  }
};

// Rulează testul
testNetlifyFunction();
