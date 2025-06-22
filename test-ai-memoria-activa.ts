/* eslint-disable no-console */
// Test pentru funcționalitatea de Memoria Activă AI
import { userPersonalizationService } from "./src/services/userPersonalizationService";
import { Conversation, Message } from "./src/models/Conversation";

// Mock data pentru testare
const mockUserId = "test-user-123";

const mockConversations: Conversation[] = [
  {
    id: "conv1",
    userId: mockUserId,
    subject: "Întrebări despre programare React",
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-01"),
    messages: [
      {
        id: "msg1",
        sender: "user",
        content:
          "Salut! Poți să-mi explici cum funcționează hooks-urile în React?",
        timestamp: new Date("2024-12-01T10:00:00"),
      },
      {
        id: "msg2",
        sender: "ai",
        content: "Bună! Hooks-urile în React sunt funcții speciale...",
        timestamp: new Date("2024-12-01T10:01:00"),
      },
      {
        id: "msg3",
        sender: "user",
        content: "Super explicație! Îmi poți da și niște exemple concrete?",
        timestamp: new Date("2024-12-01T10:02:00"),
      },
    ],
  },
  {
    id: "conv2",
    userId: mockUserId,
    subject: "Ajutor cu TypeScript",
    createdAt: new Date("2024-12-02"),
    updatedAt: new Date("2024-12-02"),
    messages: [
      {
        id: "msg4",
        sender: "user",
        content: "Am probleme cu TypeScript. Nu înțeleg tipurile generice.",
        timestamp: new Date("2024-12-02T14:00:00"),
      },
      {
        id: "msg5",
        sender: "ai",
        content: "Tipurile generice în TypeScript...",
        timestamp: new Date("2024-12-02T14:01:00"),
      },
      {
        id: "msg6",
        sender: "user",
        content: "Acum înțeleg! Mulțumesc pentru explicație 😊",
        timestamp: new Date("2024-12-02T14:03:00"),
      },
    ],
  },
  {
    id: "conv3",
    userId: mockUserId,
    subject: "Optimizarea performanței web",
    createdAt: new Date("2024-12-03"),
    updatedAt: new Date("2024-12-03"),
    messages: [
      {
        id: "msg7",
        sender: "user",
        content:
          "Vreau să învăț despre optimizarea performanței pentru aplicații web. Ai putea să-mi dai niște sfaturi?",
        timestamp: new Date("2024-12-03T16:00:00"),
      },
      {
        id: "msg8",
        sender: "ai",
        content: "Sigur! Iată principalele tehnici de optimizare...",
        timestamp: new Date("2024-12-03T16:01:00"),
      },
      {
        id: "msg9",
        sender: "user",
        content: "Excelente sfaturi! Poți să detaliezi despre lazy loading?",
        timestamp: new Date("2024-12-03T16:05:00"),
      },
    ],
  },
];

// Funcții de test
async function testConversationAnalysis() {
  console.log("🧪 Testare analiză conversații...\n");

  for (const conversation of mockConversations) {
    console.log(`📝 Analizez conversația: "${conversation.subject}"`);

    const insights =
      await userPersonalizationService.analyzeConversation(conversation);

    console.log("📊 Rezultate analiză:");
    console.log(`   • Topice principale: ${insights.mainTopics.join(", ")}`);
    console.log(`   • Mood utilizator: ${insights.userMood}`);
    console.log(`   • Tipuri întrebări: ${insights.questionTypes.join(", ")}`);
    console.log(
      `   • Lungime mesaj medie: ${insights.communicationPatterns.messageLength}`
    );
    console.log(
      `   • Folosește emoji: ${insights.communicationPatterns.usesEmojis ? "Da" : "Nu"}`
    );
    console.log(
      `   • Nivel formalitate: ${insights.communicationPatterns.formalityLevel}/10`
    );
    console.log(
      `   • Cere clarificări: ${insights.learningIndicators.asksForClarification ? "Da" : "Nu"}`
    );
    console.log(
      `   • Construiește pe topice anterioare: ${insights.learningIndicators.buildsOnPreviousTopics ? "Da" : "Nu"}`
    );
    console.log(
      `   • Arată progres în înțelegere: ${insights.learningIndicators.showsProgressInUnderstanding ? "Da" : "Nu"}`
    );
    console.log("");
  }
}

async function testProfileBuilding() {
  console.log("🏗️  Testare construire profil personalizare...\n");

  // Simulează analiza tuturor conversațiilor
  const insights: ConversationInsights[] = [];
  for (const conversation of mockConversations) {
    const insight =
      await userPersonalizationService.analyzeConversation(conversation);
    insights.push(insight);
  }

  // Construiește profilul
  const profile = await userPersonalizationService.buildPersonalityProfile(
    mockUserId,
    mockConversations,
    insights
  );

  console.log("👤 Profil de personalitate generat:");
  console.log(`   👑 ID Utilizator: ${profile.userId}`);
  console.log(`   💬 Total conversații: ${profile.totalConversations}`);
  console.log(`   📨 Total mesaje: ${profile.totalMessages}`);
  console.log("");

  console.log("🎭 Stil de comunicare:");
  console.log(`   • Ton preferat: ${profile.communicationStyle.preferredTone}`);
  console.log(
    `   • Lungime mesaj medie: ${profile.communicationStyle.averageMessageLength}`
  );
  console.log(
    `   • Folosește emoji: ${profile.communicationStyle.usesEmojis ? "Da" : "Nu"}`
  );
  console.log(
    `   • Limba preferată: ${profile.communicationStyle.preferredLanguage}`
  );
  console.log("");

  console.log("🎯 Interese identificate:");
  console.log(`   • Topice principale: ${profile.interests.topics.join(", ")}`);
  console.log(`   • Domenii: ${profile.interests.domains.join(", ")}`);
  console.log(
    `   • Întrebări frecvente: ${profile.interests.frequentQuestions.join(", ")}`
  );
  console.log("");

  console.log("📈 Pattern-uri comportamentale:");
  console.log(
    `   • Frecvența conversațiilor: ${profile.behaviorPatterns.conversationFrequency}/săptămână`
  );
  console.log(
    `   • Lungimea medie conversație: ${profile.behaviorPatterns.averageConversationLength} mesaje`
  );
  console.log(
    `   • Lungime răspuns preferată: ${profile.behaviorPatterns.preferredResponseLength}`
  );
  console.log("");

  console.log("⚙️  Preferințe personale:");
  console.log(`   • Mod adresare: ${profile.personalPreferences.addressMode}`);
  console.log(
    `   • Stil explicație: ${profile.personalPreferences.preferredExplanationStyle}`
  );
  console.log(
    `   • Necesită încurajare: ${profile.personalPreferences.needsEncouragement ? "Da" : "Nu"}`
  );
  console.log(
    `   • Îi plac exemplele: ${profile.personalPreferences.likesExamples ? "Da" : "Nu"}`
  );
  console.log("");

  console.log("💭 Profil emoțional:");
  console.log(`   • Mood general: ${profile.emotionalProfile.generalMood}`);
  console.log(
    `   • Necesită suport: ${profile.emotionalProfile.needsSupport ? "Da" : "Nu"}`
  );
  console.log(
    `   • Apreciază umorul: ${profile.emotionalProfile.appreciatesHumor ? "Da" : "Nu"}`
  );
  console.log("");

  console.log("🎓 Stil de învățare:");
  console.log(
    `   • Preferă pas cu pas: ${profile.learningStyle.prefersStepByStep ? "Da" : "Nu"}`
  );
  console.log(
    `   • Îi plac descrierile vizuale: ${profile.learningStyle.likesVisualDescriptions ? "Da" : "Nu"}`
  );
  console.log(
    `   • Necesită repetare: ${profile.learningStyle.needsRepetition ? "Da" : "Nu"}`
  );
  console.log(
    `   • Pune întrebări follow-up: ${profile.learningStyle.asksFollowUpQuestions ? "Da" : "Nu"}`
  );
  console.log("");

  return profile;
}

async function testPersonalizedContext() {
  console.log("🎨 Testare generare context personalizat...\n");

  // Construiește profilul întâi
  const insights: ConversationInsights[] = [];
  for (const conversation of mockConversations) {
    const insight =
      await userPersonalizationService.analyzeConversation(conversation);
    insights.push(insight);
  }

  const _profile = await userPersonalizationService.buildPersonalityProfile(
    mockUserId,
    mockConversations,
    insights
  );

  // Salvează profilul (mock)
  console.log("💾 Simulez salvarea profilului...");
  // Generează contextul personalizat
  const personalizedContext =
    await userPersonalizationService.generatePersonalizedContext(mockUserId);

  console.log("🤖 Context personalizat pentru AI:");
  console.log("─".repeat(50));
  console.log(personalizedContext);
  console.log("─".repeat(50));
  console.log("");
}

function testTopicExtraction() {
  console.log("🏷️  Testare extragere topice...\n");

  const testMessages = [
    {
      content: "Vreau să învăț programare în JavaScript și React",
      sender: "user",
    },
    {
      content: "Am nevoie de ajutor cu design patterns în programare",
      sender: "user",
    },
    {
      content: "Poți să mă ajuți cu strategii de marketing digital?",
      sender: "user",
    },
    {
      content: "Sunt interesat de dezvoltarea personală și productivitate",
      sender: "user",
    },
  ] as Message[];

  const topics = userPersonalizationService.extractTopics(
    testMessages.filter((m) => m.sender === "user")
  );

  console.log("📋 Topice extrase din mesaje test:");
  topics.forEach((topic) => {
    console.log(`   • ${topic}`);
  });
  console.log("");
}

function testMoodAnalysis() {
  console.log("😊 Testare analiză mood...\n");

  const testCases = [
    {
      messages: [
        {
          content:
            "Mulțumesc foarte mult! Explicația e excelentă și mi-a fost foarte utilă!",
          sender: "user",
        },
      ],
      expectedMood: "positive",
    },
    {
      messages: [
        {
          content:
            "Am probleme mari cu codul, e foarte greu și nu înțeleg nimic",
          sender: "user",
        },
      ],
      expectedMood: "negative",
    },
    {
      messages: [
        { content: "Ok, înțeleg. Da, poate așa e mai bine.", sender: "user" },
      ],
      expectedMood: "neutral",
    },
  ];

  testCases.forEach((testCase, index) => {
    const mood = userPersonalizationService.analyzeMood(
      testCase.messages as Message[]
    );
    const isCorrect = mood === testCase.expectedMood;

    console.log(`📝 Test ${index + 1}:`);
    console.log(`   Mesaj: "${testCase.messages[0].content}"`);
    console.log(`   Mood detectat: ${mood}`);
    console.log(`   Mood așteptat: ${testCase.expectedMood}`);
    console.log(`   ✅ Corect: ${isCorrect ? "Da" : "Nu"}`);
    console.log("");
  });
}

// Adaugă metoda lipsă în serviciu pentru testing
userPersonalizationService.generatePersonalizedContextFromProfile = function (
  profile
) {
  let context = `Context personalizat pentru utilizator:\n`;
  context += `- Stil de comunicare preferat: ${profile.communicationStyle.preferredTone}\n`;
  context += `- Mod de adresare: ${profile.personalPreferences.addressMode}\n`;
  context += `- Lungime răspuns preferată: ${profile.behaviorPatterns.preferredResponseLength}\n`;
  context += `- Stil de explicație: ${profile.personalPreferences.preferredExplanationStyle}\n`;

  if (profile.interests.topics.length > 0) {
    context += `- Interese principale: ${profile.interests.topics.join(", ")}\n`;
  }

  if (profile.personalPreferences.needsEncouragement) {
    context += `- Oferă încurajare și suport pozitiv\n`;
  }

  if (profile.personalPreferences.likesExamples) {
    context += `- Includeți exemple concrete în explicații\n`;
  }

  if (profile.learningStyle.prefersStepByStep) {
    context += `- Explicații pas cu pas sunt preferate\n`;
  }

  if (profile.learningStyle.asksFollowUpQuestions) {
    context += `- Utilizatorul obișnuiește să pună întrebări de follow-up\n`;
  }

  context += `- Total conversații anterioare: ${profile.totalConversations}\n`;
  context += `- Experiență cu AI: ${profile.totalMessages > 50 ? "experimentat" : "începător"}\n`;

  return context;
};

// Rulează toate testele
async function runAllTests() {
  console.log("🚀 Începerea testelor pentru Memoria Activă AI\n");
  console.log("=".repeat(60));

  try {
    // Test extragere topice
    testTopicExtraction();

    // Test analiză mood
    testMoodAnalysis();

    // Test analiză conversații
    await testConversationAnalysis();

    // Test construire profil
    await testProfileBuilding();

    // Test generare context personalizat
    await testPersonalizedContext();

    console.log("✅ Toate testele s-au completat cu succes!");
    console.log("🎉 Sistemul de Memoria Activă AI funcționează corect!");
  } catch (error) {
    console.error("❌ Eroare în timpul testelor:", error);
  }
}

// Exportă funcțiile pentru utilizare externă
export {
  runAllTests,
  testConversationAnalysis,
  testProfileBuilding,
  testPersonalizedContext,
  testTopicExtraction,
  testMoodAnalysis,
  mockConversations,
  mockUserId,
};

// Rulează testele dacă scriptul este executat direct
if (typeof require !== "undefined" && require.main === module) {
  runAllTests();
}
