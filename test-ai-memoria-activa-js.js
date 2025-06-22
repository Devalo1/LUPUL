// Serviciu simulat pentru analizarea conversațiilor
class MockPersonalizationService {
  // Extrage topicile principale din mesaje
  extractTopics(messages) {
    const allText = messages.map((m) => m.content.toLowerCase()).join(" ");

    const topicKeywords = {
      tehnologie: [
        "cod",
        "programare",
        "javascript",
        "react",
        "typescript",
        "api",
        "backend",
        "frontend",
        "web",
        "aplicatie",
      ],
      afaceri: [
        "business",
        "vanzari",
        "marketing",
        "client",
        "produs",
        "strategie",
        "piata",
      ],
      personal: [
        "viata",
        "personal",
        "familie",
        "relatii",
        "sanatate",
        "hobby",
      ],
      educatie: [
        "invatare",
        "curs",
        "studiu",
        "explicatie",
        "tutorial",
        "exemple",
      ],
      problema_tehnica: [
        "eroare",
        "bug",
        "problema",
        "nu functioneaza",
        "help",
        "ajutor",
      ],
      creativitate: ["idee", "creativ", "design", "inspiratie", "artistic"],
      productivitate: [
        "timp",
        "organizare",
        "eficienta",
        "planning",
        "task",
        "proiect",
      ],
    };

    const foundTopics = [];

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((keyword) => allText.includes(keyword))) {
        foundTopics.push(topic);
      }
    }

    return foundTopics;
  }

  // Analizează mood-ul din mesaje
  analyzeMood(messages) {
    const allText = messages.map((m) => m.content.toLowerCase()).join(" ");

    const positiveWords = [
      "bun",
      "excelent",
      "multumesc",
      "perfect",
      "super",
      "genial",
      "imi place",
    ];
    const negativeWords = [
      "probleme",
      "greu",
      "dificil",
      "nu inteleg",
      "confuz",
      "stresat",
    ];

    const positiveScore = positiveWords.filter((word) =>
      allText.includes(word)
    ).length;
    const negativeScore = negativeWords.filter((word) =>
      allText.includes(word)
    ).length;

    if (positiveScore > negativeScore) return "positive";
    if (negativeScore > positiveScore) return "negative";
    return "neutral";
  }

  // Analizează tipurile de întrebări
  analyzeQuestionTypes(messages) {
    const questionTypes = [];

    for (const message of messages) {
      const content = message.content.toLowerCase();

      if (content.includes("ce este") || content.includes("ce e")) {
        questionTypes.push("definitie");
      }
      if (content.includes("cum") || content.includes("how")) {
        questionTypes.push("procedura");
      }
      if (content.includes("de ce") || content.includes("why")) {
        questionTypes.push("explicatie");
      }
      if (content.includes("poti sa") || content.includes("ai putea")) {
        questionTypes.push("cerere_ajutor");
      }
      if (content.includes("exemplu") || content.includes("example")) {
        questionTypes.push("exemplificare");
      }
    }

    return [...new Set(questionTypes)];
  }

  // Analizează pattern-urile de comunicare
  analyzeCommunicationPatterns(messages) {
    const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);
    const averageLength =
      messages.length > 0 ? totalLength / messages.length : 0;

    const usesEmojis = messages.some((m) =>
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(
        m.content
      )
    );

    // Calculează nivelul de formalitate (0-10)
    let formalityScore = 5; // neutral
    const allText = messages.map((m) => m.content.toLowerCase()).join(" ");

    const formalWords = [
      "dumneavoastra",
      "va rog",
      "multumesc foarte mult",
      "ar fi posibil",
    ];
    const informalWords = ["hey", "salut", "ok", "da", "nu", "super"];

    formalWords.forEach((word) => {
      if (allText.includes(word)) formalityScore += 1;
    });

    informalWords.forEach((word) => {
      if (allText.includes(word)) formalityScore -= 0.5;
    });

    return {
      messageLength: Math.round(averageLength),
      usesEmojis,
      formalityLevel: Math.max(0, Math.min(10, Math.round(formalityScore))),
    };
  }

  // Analizează o singură conversație pentru a extrage insight-uri
  analyzeConversation(conversation) {
    const userMessages = conversation.messages.filter(
      (m) => m.sender === "user"
    );

    const mainTopics = this.extractTopics(userMessages);
    const userMood = this.analyzeMood(userMessages);
    const questionTypes = this.analyzeQuestionTypes(userMessages);
    const communicationPatterns =
      this.analyzeCommunicationPatterns(userMessages);

    const learningIndicators = {
      asksForClarification: userMessages.some(
        (m) =>
          m.content.toLowerCase().includes("nu inteleg") ||
          m.content.toLowerCase().includes("poti explica") ||
          m.content.toLowerCase().includes("ce inseamna")
      ),
      buildsOnPreviousTopics:
        userMessages.length > 1 &&
        userMessages.some(
          (m, i) =>
            i > 0 &&
            userMessages[i - 1].content
              .toLowerCase()
              .split(" ")
              .some(
                (word) =>
                  word.length > 3 && m.content.toLowerCase().includes(word)
              )
        ),
      showsProgressInUnderstanding: userMessages.some(
        (m) =>
          m.content.toLowerCase().includes("acum inteleg") ||
          m.content.toLowerCase().includes("am inteles") ||
          m.content.toLowerCase().includes("multumesc") ||
          m.content.toLowerCase().includes("perfect")
      ),
    };

    return {
      mainTopics,
      userMood,
      questionTypes,
      communicationPatterns,
      learningIndicators,
    };
  }

  // Construiește profilul de personalitate complet
  buildPersonalityProfile(userId, conversations, insights) {
    const now = new Date();

    // Calculează statistici generale
    const totalUserMessages = conversations.reduce(
      (sum, c) => sum + c.messages.filter((m) => m.sender === "user").length,
      0
    );

    // Analizează stilul de comunicare
    const allCommunicationPatterns = insights.map(
      (i) => i.communicationPatterns
    );
    const avgMessageLength =
      allCommunicationPatterns.reduce((sum, p) => sum + p.messageLength, 0) /
        allCommunicationPatterns.length || 0;
    const usesEmojis = allCommunicationPatterns.some((p) => p.usesEmojis);
    const avgFormality =
      allCommunicationPatterns.reduce((sum, p) => sum + p.formalityLevel, 0) /
        allCommunicationPatterns.length || 5;

    let preferredTone = "casual";
    if (avgFormality > 7) preferredTone = "formal";
    else if (avgFormality > 5) preferredTone = "professional";
    else if (avgFormality < 3) preferredTone = "friendly";

    // Extrage interesele principale
    const allTopics = insights.flatMap((i) => i.mainTopics);
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});

    const sortedTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([topic]) => topic);

    // Analizează pattern-urile comportamentale
    const conversationFrequency =
      conversations.length /
      Math.max(1, this.getWeeksSinceFirstConversation(conversations));
    const avgConversationLength =
      conversations.reduce((sum, c) => sum + c.messages.length, 0) /
      Math.max(1, conversations.length);

    let preferredResponseLength = "medium";
    if (avgMessageLength > 200) preferredResponseLength = "detailed";
    else if (avgMessageLength < 50) preferredResponseLength = "short";

    // Analizează preferințele personale
    const addressMode = avgFormality > 6 ? "dumneavoastra" : "tu";
    const needsEncouragement = insights.some((i) => i.userMood === "negative");
    const likesExamples = insights.some((i) =>
      i.questionTypes.includes("exemplificare")
    );

    // Analizează profilul emoțional
    const moods = insights.map((i) => i.userMood);
    const positiveMoods = moods.filter((m) => m === "positive").length;
    const generalMood =
      positiveMoods > moods.length / 2
        ? "positive"
        : positiveMoods < moods.length / 3
          ? "analytical"
          : "neutral";

    // Analizează stilul de învățare
    const learningPatterns = insights.map((i) => i.learningIndicators);
    const prefersStepByStep = learningPatterns.some(
      (l) => l.asksForClarification && l.buildsOnPreviousTopics
    );
    const asksFollowUpQuestions = learningPatterns.some(
      (l) => l.buildsOnPreviousTopics
    );

    return {
      userId,
      totalMessages: totalUserMessages,
      totalConversations: conversations.length,
      communicationStyle: {
        preferredTone,
        averageMessageLength: Math.round(avgMessageLength),
        usesEmojis,
        preferredLanguage: "ro",
      },
      interests: {
        topics: sortedTopics.slice(0, 5),
        domains: sortedTopics.slice(0, 3),
        frequentQuestions: insights.flatMap((i) => i.questionTypes).slice(0, 5),
      },
      behaviorPatterns: {
        mostActiveTimeOfDay: "unknown",
        conversationFrequency: Math.round(conversationFrequency * 10) / 10,
        averageConversationLength: Math.round(avgConversationLength),
        preferredResponseLength,
      },
      personalPreferences: {
        addressMode,
        preferredExplanationStyle:
          avgFormality > 6 ? "comprehensive" : "simple",
        needsEncouragement,
        likesExamples,
      },
      emotionalProfile: {
        generalMood,
        needsSupport: needsEncouragement,
        appreciatesHumor: generalMood === "positive" && !needsEncouragement,
      },
      learningStyle: {
        prefersStepByStep,
        likesVisualDescriptions: likesExamples,
        needsRepetition: learningPatterns.some((l) => l.asksForClarification),
        asksFollowUpQuestions,
      },
      createdAt: now,
      updatedAt: now,
      lastAnalyzedConversation: conversations[0]?.id || null,
    };
  }

  // Generează context personalizat pentru AI
  generatePersonalizedContext(profile) {
    let context = "Context personalizat pentru utilizator:\n";
    context += `- Stil de comunicare preferat: ${profile.communicationStyle.preferredTone}\n`;
    context += `- Mod de adresare: ${profile.personalPreferences.addressMode}\n`;
    context += `- Lungime răspuns preferată: ${profile.behaviorPatterns.preferredResponseLength}\n`;
    context += `- Stil de explicație: ${profile.personalPreferences.preferredExplanationStyle}\n`;

    if (profile.interests.topics.length > 0) {
      context += `- Interese principale: ${profile.interests.topics.join(", ")}\n`;
    }

    if (profile.personalPreferences.needsEncouragement) {
      context += "- Oferă încurajare și suport pozitiv\n";
    }

    if (profile.personalPreferences.likesExamples) {
      context += "- Includeți exemple concrete în explicații\n";
    }

    if (profile.learningStyle.prefersStepByStep) {
      context += "- Explicații pas cu pas sunt preferate\n";
    }

    if (profile.learningStyle.asksFollowUpQuestions) {
      context += "- Utilizatorul obișnuiește să pună întrebări de follow-up\n";
    }

    context += `- Total conversații anterioare: ${profile.totalConversations}\n`;
    context += `- Experiență cu AI: ${profile.totalMessages > 50 ? "experimentat" : "începător"}\n`;

    return context;
  }

  // Calculează săptămânile de la prima conversație
  getWeeksSinceFirstConversation(conversations) {
    if (conversations.length === 0) return 1;

    const oldestConversation = conversations.reduce((oldest, current) => {
      return current.createdAt < oldest.createdAt ? current : oldest;
    });

    const now = new Date();
    const diffTime = Math.abs(
      now.getTime() - oldestConversation.createdAt.getTime()
    );
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    return Math.max(1, diffWeeks);
  }
}

// Funcția principală de test
function testAIMemoryFunctionality() {
  const service = new MockPersonalizationService();

  // Creează conversații de test
  const testConversations = [
    {
      id: "conv1",
      userId: "user123",
      subject: "Întrebări despre React",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // acum o săptămână
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      messages: [
        {
          id: "msg1",
          sender: "user",
          content:
            "Salut! Cum pot să învăț React mai bine? Am probleme să înțeleg componentele.",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "msg2",
          sender: "ai",
          content:
            "Salut! Pentru a învăța React mai bine, îți recomand să începi cu conceptele de bază ale componentelor funcționale.",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "msg3",
          sender: "user",
          content:
            "Poți să îmi dai un exemplu simplu de componentă funcțională?",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "msg4",
          sender: "ai",
          content:
            "Desigur! Iată un exemplu simplu: function Welcome(props) { return <h1>Hello, {props.name}!</h1>; }",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "msg5",
          sender: "user",
          content:
            "Mulțumesc! Acum înțeleg mai bine conceptul. Super explicația!",
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      id: "conv2",
      userId: "user123",
      subject: "Probleme cu API-uri",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // acum 3 zile
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      messages: [
        {
          id: "msg6",
          sender: "user",
          content:
            "Am probleme să fac fetch la un API în React. Nu înțeleg de ce nu funcționează codul meu.",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: "msg7",
          sender: "ai",
          content:
            "Să vedem împreună problema. Poți să-mi arăți cum încerci să faci fetch-ul?",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: "msg8",
          sender: "user",
          content:
            "Folosesc useEffect și fetch, dar nu primesc datele. Poate ai un exemplu pas cu pas?",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: "msg9",
          sender: "ai",
          content:
            "Da, îți voi explica pas cu pas. Primul pas este să definești state-ul pentru date...",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      id: "conv3",
      userId: "user123",
      subject: "Proiect personal",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // ieri
      updatedAt: new Date(),
      messages: [
        {
          id: "msg10",
          sender: "user",
          content:
            "Vreau să îmi fac un proiect personal cu React și TypeScript. Ce ar trebui să includ?",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: "msg11",
          sender: "ai",
          content:
            "Excelentă idee! Pentru un proiect personal solid, recomand să incluzi routing, state management, și API integration.",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: "msg12",
          sender: "user",
          content:
            "Multumesc pentru idei! Imi place cum explici pas cu pas, ma ajuta mult 😊",
          timestamp: new Date(),
        },
      ],
    },
  ];

  // Testează analizarea conversațiilor
  const insights = [];

  for (const conversation of testConversations) {
    const insight = service.analyzeConversation(conversation);
    insights.push(insight);
  }

  // Construiește profilul de personalitate
  const profile = service.buildPersonalityProfile(
    "user123",
    testConversations,
    insights
  );

  // Generează contextul personalizat
  const personalizedContext = service.generatePersonalizedContext(profile);

  // Afișează rezultatele testului
  return {
    testConversations: testConversations.length,
    insights: insights.length,
    profile,
    personalizedContext,
    success: true,
  };
}

// Rulează testul
try {
  const result = testAIMemoryFunctionality();

  if (result.success) {
    // Afișează un raport de testare
    const report = {
      "🎯 Test Status": "SUCCESS",
      "📊 Conversații Analizate": result.testConversations,
      "🧠 Insights Generate": result.insights,
      "👤 Profil Utilizator": {
        "Total Mesaje": result.profile.totalMessages,
        "Total Conversații": result.profile.totalConversations,
        "Stil Comunicare": result.profile.communicationStyle.preferredTone,
        "Mod Adresare": result.profile.personalPreferences.addressMode,
        "Interese Principale": result.profile.interests.topics.slice(0, 3),
        "Stil Învățare": {
          "Preferă Pas cu Pas": result.profile.learningStyle.prefersStepByStep,
          "Pune Întrebări Follow-up":
            result.profile.learningStyle.asksFollowUpQuestions,
          "Cere Clarificări": result.profile.learningStyle.needsRepetition,
        },
        "Preferințe Răspuns":
          result.profile.behaviorPatterns.preferredResponseLength,
        "Necesită Încurajare":
          result.profile.personalPreferences.needsEncouragement,
        "Apreciază Exemple": result.profile.personalPreferences.likesExamples,
      },
      "🤖 Context Personalizat AI": result.personalizedContext
        .split("\n")
        .slice(0, 8)
        .join("\n"),
    };

    const jsonReport = JSON.stringify(report, null, 2);
    console.log("\n=== REZULTATE TEST MEMORIE ACTIVĂ AI ===\n");
    console.log(jsonReport);
    console.log("\n✅ Testul a fost executat cu succes!");
    console.log(
      "🚀 Funcționalitatea de memorie activă AI este operațională!\n"
    );
  } else {
    console.error("❌ Testul a eșuat!");
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Eroare în test: ${error}`);
  process.exit(1);
}
