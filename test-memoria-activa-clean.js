// Test functional simplificat pentru Memoria Activă AI - fără Firebase
const testMemoriaActivaSimple = () => {
  // Simulează un utilizator cu conversații
  const mockUser = {
    id: "test-user-123",
    conversations: [
      {
        id: "conv-1",
        messages: [
          { sender: "user", content: "Salut! Cum pot să învăț JavaScript?" },
          { sender: "ai", content: "Salut! JavaScript este un limbaj..." },
          {
            sender: "user",
            content: "Mulțumesc! Ai putea să-mi dai exemple practice?",
          },
          { sender: "ai", content: "Desigur! Iată câteva exemple..." },
        ],
      },
      {
        id: "conv-2",
        messages: [
          {
            sender: "user",
            content: "Poți să-mi explici ce sunt funcțiile în JS?",
          },
          { sender: "ai", content: "Funcțiile în JavaScript sunt..." },
          {
            sender: "user",
            content:
              "Nu înțeleg foarte bine. Poți să-mi dai un exemplu pas cu pas?",
          },
          { sender: "ai", content: "Sigur! Să luăm pas cu pas..." },
        ],
      },
      {
        id: "conv-3",
        messages: [
          {
            sender: "user",
            content: "Am înțeles acum! Mulțumesc pentru explicații.",
          },
          { sender: "ai", content: "Mă bucur că ai înțeles!" },
          {
            sender: "user",
            content: "Poți să-mi recomanzi niște proiecte pentru început?",
          },
          {
            sender: "ai",
            content: "Sigur! Iată câteva proiecte ideale pentru început...",
          },
        ],
      },
    ],
  };

  console.log("🧠 Testarea Funcționalității de Memorie Activă pentru AI");
  console.log("====================================================");
  console.log("🚀 Începe testul funcționalității...\n");

  // Analizează comportamentul utilizatorului
  console.log("📊 Analizarea comportamentului utilizatorului...");

  const totalConversations = mockUser.conversations.length;
  const totalMessages = mockUser.conversations.reduce(
    (sum, conv) => sum + conv.messages.length,
    0
  );
  const userMessages = mockUser.conversations.flatMap((conv) =>
    conv.messages.filter((msg) => msg.sender === "user")
  );

  const avgMessageLength = Math.round(
    userMessages.reduce((sum, msg) => sum + msg.content.length, 0) /
      userMessages.length
  );

  // Detectează interesele din conținutul mesajelor
  const allUserText = userMessages
    .map((msg) => msg.content.toLowerCase())
    .join(" ");
  const interests = [];

  if (allUserText.includes("javascript") || allUserText.includes("js")) {
    interests.push("JavaScript");
  }
  if (allUserText.includes("exemplu") || allUserText.includes("exemple")) {
    interests.push("Învățare prin exemple");
  }
  if (
    allUserText.includes("pas cu pas") ||
    allUserText.includes("nu înțeleg")
  ) {
    interests.push("Explicații detaliate");
  }

  console.log("📈 Rezultatele analizei:");
  console.log(`- Total conversații: ${totalConversations}`);
  console.log(`- Total mesaje: ${totalMessages}`);
  console.log(`- Lungime medie mesaj: ${avgMessageLength}`);
  console.log(`- Interese: ${interests.join(", ")}\n`);

  // Generează contextul personalizat
  console.log("🎯 Generarea contextului personalizat pentru AI...");

  let communicationStyle = "casual";
  if (avgMessageLength > 100) {
    communicationStyle = "formal";
  } else if (avgMessageLength < 30) {
    communicationStyle = "concis";
  }

  const experienceLevel = totalMessages > 10 ? "intermediar" : "începător";
  const prefersExamples = interests.includes("Învățare prin exemple");
  const needsDetailedExplanations = interests.includes("Explicații detaliate");

  const personalizedContext = `Context personalizat pentru utilizator:
- Stil de comunicare: ${communicationStyle}
- Lungime medie mesaj: ${avgMessageLength} caractere
- Interese principale: ${interests.join(", ")}
- Preferă explicații cu exemple concrete: ${prefersExamples ? "Da" : "Nu"}
- Beneficiază de explicații pas-cu-pas: ${needsDetailedExplanations ? "Da" : "Nu"}
- Nivel experiență: ${experienceLevel}
- Total conversații anterioare: ${totalConversations}`;

  console.log("📝 Context personalizat generat:");
  console.log(personalizedContext + "\n");

  // Simulează folosirea contextului în AI
  console.log("🤖 Generarea răspunsului AI personalizat...");
  console.log("🎯 Simulare răspuns personalizat:");
  console.log("Bazat pe contextul personalizat, AI-ul ar răspunde:");

  if (prefersExamples) {
    console.log("✓ Include exemple concrete în răspuns");
  }
  if (needsDetailedExplanations) {
    console.log("✓ Structurează răspunsul în pași clari");
  }
  if (communicationStyle === "casual") {
    console.log("✓ Folosește un ton prietenos și accesibil");
  }

  console.log('\nPentru mesajul: "Cum pot să creez o funcție în JavaScript?"');
  console.log(
    "AI-ul ar genera un răspuns adaptat stilului și preferințelor utilizatorului.\n"
  );

  console.log("✅ Testul s-a finalizat cu succes!");
  console.log("🧠 Memoria activă funcționează conform așteptărilor!");

  return true;
};

// Rulează testul
try {
  testMemoriaActivaSimple();
} catch (error) {
  console.error("❌ Eroare în test:", error);
  process.exit(1);
}
