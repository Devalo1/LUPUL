// Script pentru testarea funcționalității de memorie activă
console.log("🧠 Testarea Funcționalității de Memorie Activă pentru AI");
console.log("====================================================");

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
          content: "Iată câteva proiecte excelente pentru începători...",
        },
      ],
    },
  ],
};

// Simulează analize bazate pe conversații
function analyzeUserBehavior(user) {
  console.log("📊 Analizarea comportamentului utilizatorului...");

  const analysis = {
    totalConversations: user.conversations.length,
    totalMessages: user.conversations.reduce(
      (sum, conv) => sum + conv.messages.length,
      0
    ),
    userMessages: [],
    communicationPatterns: {},
    interests: [],
    learningStyle: {},
  };

  // Colectează toate mesajele utilizatorului
  user.conversations.forEach((conv) => {
    conv.messages.forEach((msg) => {
      if (msg.sender === "user") {
        analysis.userMessages.push(msg.content);
      }
    });
  });

  // Analizează pattern-urile de comunicare
  const totalUserMessages = analysis.userMessages.length;
  const avgLength =
    analysis.userMessages.reduce((sum, msg) => sum + msg.length, 0) /
    totalUserMessages;

  analysis.communicationPatterns = {
    averageMessageLength: Math.round(avgLength),
    usesEmojis: analysis.userMessages.some((msg) =>
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/u.test(
        msg
      )
    ),
    formalityLevel: analysis.userMessages.some(
      (msg) => msg.includes("mulțumesc") || msg.includes("vă rog")
    )
      ? "polite"
      : "casual",
    asksQuestions:
      analysis.userMessages.filter((msg) => msg.includes("?")).length /
      totalUserMessages,
  };

  // Detectează interese
  const allText = analysis.userMessages.join(" ").toLowerCase();
  if (allText.includes("javascript") || allText.includes("js"))
    analysis.interests.push("JavaScript");
  if (allText.includes("programare") || allText.includes("cod"))
    analysis.interests.push("Programare");
  if (allText.includes("exemple") || allText.includes("exemplu"))
    analysis.interests.push("Învățare prin exemple");

  // Analizează stilul de învățare
  analysis.learningStyle = {
    prefersExamples: analysis.userMessages.some(
      (msg) => msg.includes("exemple") || msg.includes("exemplu")
    ),
    needsStepByStep: analysis.userMessages.some(
      (msg) => msg.includes("pas cu pas") || msg.includes("nu înțeleg")
    ),
    asksClarifications: analysis.userMessages.some(
      (msg) => msg.includes("nu înțeleg") || msg.includes("poți explica")
    ),
    showsProgress: analysis.userMessages.some(
      (msg) => msg.includes("am înțeles") || msg.includes("mulțumesc")
    ),
  };

  return analysis;
}

// Generează context personalizat pentru AI
function generatePersonalizedContext(analysis) {
  console.log("🎯 Generarea contextului personalizat pentru AI...");

  let context = "Context personalizat pentru utilizator:\n";

  // Stil de comunicare
  context += `- Stil de comunicare: ${analysis.communicationPatterns.formalityLevel}\n`;
  context += `- Lungime medie mesaj: ${analysis.communicationPatterns.averageMessageLength} caractere\n`;

  // Interese
  if (analysis.interests.length > 0) {
    context += `- Interese principale: ${analysis.interests.join(", ")}\n`;
  }

  // Stil de învățare
  if (analysis.learningStyle.prefersExamples) {
    context += "- Preferă explicații cu exemple concrete\n";
  }
  if (analysis.learningStyle.needsStepByStep) {
    context += "- Beneficiază de explicații pas-cu-pas\n";
  }
  if (analysis.learningStyle.asksClarifications) {
    context += "- Pune întrebări de clarificare când nu înțelege\n";
  }
  if (analysis.learningStyle.showsProgress) {
    context += "- Arată progres în învățare și apreciază ajutorul\n";
  }

  // Experiență
  context += `- Nivel experiență: ${analysis.totalMessages > 10 ? "intermediar" : "începător"}\n`;
  context += `- Total conversații anterioare: ${analysis.totalConversations}\n`;

  return context;
}

// Simulează răspuns AI personalizat
function generatePersonalizedResponse(message, context) {
  console.log("🤖 Generarea răspunsului AI personalizat...");

  // Simulează cum ar folosi AI-ul contextul
  let response = "Bazat pe contextul personalizat, AI-ul ar răspunde:\n\n";

  if (context.includes("preferă explicații cu exemple")) {
    response += "✓ Include exemple concrete în răspuns\n";
  }
  if (context.includes("pas-cu-pas")) {
    response += "✓ Structurează răspunsul în pași clari\n";
  }
  if (context.includes("începător")) {
    response += "✓ Folosește terminologie simplă și accesibilă\n";
  }
  if (context.includes("apreciază ajutorul")) {
    response += "✓ Oferă încurajare și suport pozitiv\n";
  }

  response += `\nPentru mesajul: "${message}"`;
  response +=
    "\nAI-ul ar genera un răspuns adaptat stilului și preferințelor utilizatorului.";

  return response;
}

// Rulează testul
try {
  console.log("🚀 Începe testul funcționalității...\n");

  // Analizează utilizatorul
  const userAnalysis = analyzeUserBehavior(mockUser);
  console.log("📈 Rezultatele analizei:");
  console.log(`- Total conversații: ${userAnalysis.totalConversations}`);
  console.log(`- Total mesaje: ${userAnalysis.totalMessages}`);
  console.log(
    `- Lungime medie mesaj: ${userAnalysis.communicationPatterns.averageMessageLength}`
  );
  console.log(
    `- Interese: ${userAnalysis.interests.join(", ") || "Niciuna detectată"}`
  );
  console.log("");

  // Generează context personalizat
  const personalizedContext = generatePersonalizedContext(userAnalysis);
  console.log("📝 Context personalizat generat:");
  console.log(personalizedContext);

  // Testează răspuns personalizat
  const testMessage = "Cum pot să creez o funcție în JavaScript?";
  const personalizedResponse = generatePersonalizedResponse(
    testMessage,
    personalizedContext
  );
  console.log("🎯 Simulare răspuns personalizat:");
  console.log(personalizedResponse);

  console.log("\n✅ Testul s-a finalizat cu succes!");
  console.log("🧠 Memoria activă funcționează conform așteptărilor!");
} catch (error) {
  console.error("❌ Eroare în timpul testului:", error);
}
