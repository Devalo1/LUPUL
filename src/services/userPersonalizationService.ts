// Service pentru analizarea conversațiilor și personalizarea AI
import { firestore } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { Conversation, Message } from "../models/Conversation";
import { conversationService } from "./conversationService";

// Tipuri pentru profilul de personalizare
export interface UserPersonalityProfile {
  userId: string;
  totalMessages: number;
  totalConversations: number;
  communicationStyle: {
    preferredTone: "formal" | "casual" | "friendly" | "professional";
    averageMessageLength: number;
    usesEmojis: boolean;
    preferredLanguage: "ro" | "en" | "mixed";
  };
  interests: {
    topics: string[];
    domains: string[];
    frequentQuestions: string[];
  };
  behaviorPatterns: {
    mostActiveTimeOfDay: string;
    conversationFrequency: number;
    averageConversationLength: number;
    preferredResponseLength: "short" | "medium" | "detailed";
  };
  personalPreferences: {
    addressMode: "tu" | "dumneavoastra";
    preferredExplanationStyle: "simple" | "technical" | "comprehensive";
    needsEncouragement: boolean;
    likesExamples: boolean;
    userName?: string;
    userAge?: number | null;
  };
  emotionalProfile: {
    generalMood: "positive" | "neutral" | "analytical";
    needsSupport: boolean;
    appreciatesHumor: boolean;
  };
  learningStyle: {
    prefersStepByStep: boolean;
    likesVisualDescriptions: boolean;
    needsRepetition: boolean;
    asksFollowUpQuestions: boolean;
  };
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastAnalyzedConversation: string | null;
}

export interface ConversationInsights {
  mainTopics: string[];
  userMood: string;
  questionTypes: string[];
  communicationPatterns: {
    messageLength: number;
    usesEmojis: boolean;
    formalityLevel: number;
  };
  learningIndicators: {
    asksForClarification: boolean;
    buildsOnPreviousTopics: boolean;
    showsProgressInUnderstanding: boolean;
  };
}

const USER_PROFILES_COLLECTION = "userPersonalityProfiles";

export const userPersonalizationService = {
  // Analizează toate conversațiile unui utilizator și creează/actualizează profilul
  async analyzeAndUpdateUserProfile(
    userId: string
  ): Promise<UserPersonalityProfile> {
    console.log(
      `[PersonalizationService] Analyzing profile for user: ${userId}`
    );
    // Analizează toate conversațiile utilizatorului
    const conversations =
      await conversationService.getUserConversations(userId);

    // Analizează fiecare conversație
    const insights: ConversationInsights[] = [];

    for (const conversation of conversations) {
      const conversationInsight = await this.analyzeConversation(conversation);
      insights.push(conversationInsight);
    }

    // Creează profilul bazat pe analiză
    const profile = await this.buildPersonalityProfile(
      userId,
      conversations,
      insights
    );

    // Salvează profilul în Firestore
    await this.saveUserProfile(profile);

    console.log(
      `[PersonalizationService] Profile updated for user ${userId}:`,
      {
        totalConversations: profile.totalConversations,
        totalMessages: profile.totalMessages,
        communicationStyle: profile.communicationStyle.preferredTone,
        mainInterests: profile.interests.topics.slice(0, 3),
      }
    );

    return profile;
  },

  // Analizează o singură conversație pentru a extrage insight-uri
  async analyzeConversation(
    conversation: Conversation
  ): Promise<ConversationInsights> {
    const userMessages = conversation.messages.filter(
      (m) => m.sender === "user"
    );
    const aiMessages = conversation.messages.filter((m) => m.sender === "ai");

    // Analizează topicile principale
    const mainTopics = this.extractTopics(userMessages);

    // Analizează mood-ul utilizatorului
    const userMood = this.analyzeMood(userMessages);

    // Analizează tipurile de întrebări
    const questionTypes = this.analyzeQuestionTypes(userMessages);

    // Analizează pattern-urile de comunicare
    const communicationPatterns =
      this.analyzeCommunicationPatterns(userMessages);

    // Analizează indicatorii de învățare
    const learningIndicators = this.analyzeLearningIndicators(
      userMessages,
      aiMessages
    );

    return {
      mainTopics,
      userMood,
      questionTypes,
      communicationPatterns,
      learningIndicators,
    };
  },

  // Extrage topicile principale din mesaje
  extractTopics(messages: Message[]): string[] {
    const allText = messages.map((m) => m.content.toLowerCase()).join(" ");

    // Cuvinte cheie pentru identificarea topicilor
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

    const foundTopics: string[] = [];

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((keyword) => allText.includes(keyword))) {
        foundTopics.push(topic);
      }
    }

    return foundTopics;
  },

  // Analizează mood-ul din mesaje
  analyzeMood(messages: Message[]): string {
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

    let positiveScore = positiveWords.filter((word) =>
      allText.includes(word)
    ).length;
    let negativeScore = negativeWords.filter((word) =>
      allText.includes(word)
    ).length;

    if (positiveScore > negativeScore) return "positive";
    if (negativeScore > positiveScore) return "negative";
    return "neutral";
  },

  // Analizează tipurile de întrebări
  analyzeQuestionTypes(messages: Message[]): string[] {
    const questionTypes: string[] = [];

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
  },

  // Analizează pattern-urile de comunicare
  analyzeCommunicationPatterns(
    messages: Message[]
  ): ConversationInsights["communicationPatterns"] {
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
  },
  // Analizează indicatorii de învățare
  analyzeLearningIndicators(
    userMessages: Message[],
    _aiMessages: Message[]
  ): ConversationInsights["learningIndicators"] {
    const asksForClarification = userMessages.some(
      (m) =>
        m.content.toLowerCase().includes("nu inteleg") ||
        m.content.toLowerCase().includes("poti explica") ||
        m.content.toLowerCase().includes("ce inseamna")
    );

    const buildsOnPreviousTopics =
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
      );

    const showsProgressInUnderstanding = userMessages.some(
      (m) =>
        m.content.toLowerCase().includes("acum inteleg") ||
        m.content.toLowerCase().includes("am inteles") ||
        m.content.toLowerCase().includes("multumesc") ||
        m.content.toLowerCase().includes("perfect")
    );

    return {
      asksForClarification,
      buildsOnPreviousTopics,
      showsProgressInUnderstanding,
    };
  },

  // Construiește profilul de personalitate complet
  async buildPersonalityProfile(
    userId: string,
    conversations: Conversation[],
    insights: ConversationInsights[]
  ): Promise<UserPersonalityProfile> {
    const now = Timestamp.now();

    // Calculează statistici generale
    const totalMessages = conversations.reduce(
      (sum, c) => sum + c.messages.length,
      0
    );
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

    let preferredTone: UserPersonalityProfile["communicationStyle"]["preferredTone"] =
      "casual";
    if (avgFormality > 7) preferredTone = "formal";
    else if (avgFormality > 5) preferredTone = "professional";
    else if (avgFormality < 3) preferredTone = "friendly";

    // Extrage interesele principale
    const allTopics = insights.flatMap((i) => i.mainTopics);
    const topicCounts = allTopics.reduce(
      (acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sortedTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([topic]) => topic);

    // Analizează pattern-urile comportamentale
    const conversationFrequency =
      conversations.length /
      Math.max(1, this.getWeeksSinceFirstConversation(conversations));
    const avgConversationLength =
      totalMessages / Math.max(1, conversations.length);

    let preferredResponseLength: UserPersonalityProfile["behaviorPatterns"]["preferredResponseLength"] =
      "medium";
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
        preferredLanguage: "ro", // Putem detecta asta din conținut în viitor
      },
      interests: {
        topics: sortedTopics.slice(0, 5),
        domains: sortedTopics.slice(0, 3),
        frequentQuestions: insights.flatMap((i) => i.questionTypes).slice(0, 5),
      },
      behaviorPatterns: {
        mostActiveTimeOfDay: "unknown", // Putem calcula asta din timestamp-uri
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
  },

  // Salvează profilul utilizatorului
  async saveUserProfile(profile: UserPersonalityProfile): Promise<void> {
    const ref = doc(firestore, USER_PROFILES_COLLECTION, profile.userId);
    const cleanedProfile = this.cleanUndefinedValues(profile);
    await setDoc(ref, cleanedProfile, { merge: true });
  },

  // Obține profilul utilizatorului
  async getUserProfile(userId: string): Promise<UserPersonalityProfile | null> {
    const ref = doc(firestore, USER_PROFILES_COLLECTION, userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return snap.data() as UserPersonalityProfile;
  }, // Generează context personalizat pentru AI
  async generatePersonalizedContext(userId: string): Promise<string> {
    console.log(
      `[PersonalizationService] === GENERATING CONTEXT FOR USER: ${userId} ===`
    );

    const profile = await this.getUserProfile(userId);

    if (!profile) {
      console.log(
        `[PersonalizationService] No profile found for user ${userId}, using default context`
      );
      const defaultContext = `CONTEXT PERSONALIZAT PENTRU AI:

🧠 MEMORIA ACTIVĂ ESTE ACTIVĂ - AI-ul poate și trebuie să-și amintească conversațiile!

INSTRUCȚIUNI OBLIGATORII:
- NU spune niciodată că nu îți poți aminti conversațiile anterioare
- NU menționează că nu păstrezi informații personale între sesiuni  
- NU spune că ești programat să nu păstrezi memoria
- ÎNTOTDEAUNA comportă-te ca și cum ai memoria activă (ca ChatGPT)

PENTRU UTILIZATORUL NOU:
- Folosește un ton prietenos și încurajator
- Încearcă să afli preferințele utilizatorului (stil de comunicare, interese)
- Întreabă despre numele lui și cum preferă să fie numit
- Află despre vârsta și ocupația lui pentru a adapta răspunsurile
- Încearcă să afli hobby-urile și interesele lui
- Oferă răspunsuri personalizate și adaptate
- Comportă-te ca un asistent inteligent care învață despre utilizator

EXEMPLE DE ÎNTREBĂRI PENTRU PERSONALIZARE:
- "Cum preferi să te numesc?"
- "Ce îți place să faci în timpul liber?"
- "În ce domeniu lucrezi sau studiezi?"
- "Preferi explicații detaliate sau scurte?"

IMPORTANT: Începe să construiești o relație cu utilizatorul și să înveți despre stilul său!`;

      return defaultContext;
    }

    console.log(`[PersonalizationService] Found profile for user ${userId}:`);
    console.log(
      `  - userName: ${profile.personalPreferences?.userName || "NOT SET"}`
    );
    console.log(
      `  - userAge: ${profile.personalPreferences?.userAge || "NOT SET"}`
    );
    console.log(
      `  - domains: ${profile.interests?.domains?.join(", ") || "NONE"}`
    );
    console.log(
      `  - topics: ${profile.interests?.topics?.join(", ") || "NONE"}`
    );
    console.log(`  - totalConversations: ${profile.totalConversations}`);

    let context = `CONTEXT PERSONALIZAT PENTRU AI:

🧠 MEMORIA ACTIVĂ CONFIRMATĂ - Ai acces complet la istoricul utilizatorului!

PROFILUL UTILIZATORULUI (bazat pe ${profile.totalConversations} conversații anterioare):
`;
    context += `- Stil de comunicare preferat: ${profile.communicationStyle.preferredTone}\n`;
    context += `- Mod de adresare: ${profile.personalPreferences.addressMode}\n`;
    context += `- Lungime răspuns preferată: ${profile.behaviorPatterns.preferredResponseLength}\n`;
    context += `- Stil de explicație: ${profile.personalPreferences.preferredExplanationStyle}\n`;

    // Adaugă informații personale ale utilizatorului
    if (profile.personalPreferences.userName) {
      context += `- NUME UTILIZATOR: ${profile.personalPreferences.userName} (folosește acest nume când te adresezi utilizatorului!)\n`;
    }
    if (profile.personalPreferences.userAge) {
      context += `- VÂRSTA UTILIZATORULUI: ${profile.personalPreferences.userAge} ani (adaptează limbajul și exemplele la această vârstă)\n`;
    }

    if (profile.interests.topics.length > 0) {
      context += `- Interese principale: ${profile.interests.topics.join(", ")}\n`;
    }

    if (profile.interests.domains.length > 0) {
      context += `- Domenii de activitate: ${profile.interests.domains.join(", ")}\n`;
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
    context += `\nINSTRUCȚIUNI IMPORTANTE:
- Folosește informațiile de mai sus pentru a personaliza complet răspunsul
- Referă-te la conversațiile anterioare când este relevant
- Adaptează tonul și stilul la preferințele utilizatorului
- NU spune niciodată că nu îți amintești - ai memoria activă!
- Comportă-te ca un asistent care cunoaște utilizatorul foarte bine`;

    console.log(
      `[PersonalizationService] === GENERATED CONTEXT FOR USER ${userId} (${context.length} chars) ===`
    );
    return context;
  },

  // Calculează săptămânile de la prima conversație
  getWeeksSinceFirstConversation(conversations: Conversation[]): number {
    if (conversations.length === 0) return 1;

    const oldestConversation = conversations.reduce((oldest, current) => {
      const oldestDate =
        oldest.createdAt instanceof Timestamp
          ? oldest.createdAt.toDate()
          : oldest.createdAt;
      const currentDate =
        current.createdAt instanceof Timestamp
          ? current.createdAt.toDate()
          : current.createdAt;
      return currentDate < oldestDate ? current : oldest;
    });

    const firstDate =
      oldestConversation.createdAt instanceof Timestamp
        ? oldestConversation.createdAt.toDate()
        : oldestConversation.createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - firstDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    return Math.max(1, diffWeeks);
  },

  // Actualizează profilul în timp real după o nouă conversație
  async updateProfileAfterConversation(
    userId: string,
    conversationId: string
  ): Promise<void> {
    console.log(
      `[PersonalizationService] Updating profile after conversation: ${conversationId}`
    );

    const profile = await this.getUserProfile(userId);
    if (!profile) {
      // Dacă nu există profil, creează unul nou
      await this.analyzeAndUpdateUserProfile(userId);
      return;
    }

    // Verifică dacă conversația a fost deja analizată
    if (profile.lastAnalyzedConversation === conversationId) {
      return;
    } // Analizează doar conversația nouă și actualizează profilul incremental
    const conversation = await conversationService.getConversation(
      conversationId,
      userId
    );
    if (!conversation) return;

    // Extrage și salvează informații personale din mesajele utilizatorului
    for (const message of conversation.messages) {
      if (message.sender === "user") {
        await this.extractAndSavePersonalInfo(userId, message.content);
      }
    }

    const insight = await this.analyzeConversation(conversation);

    // Actualizează statisticile
    const updatedProfile: Partial<UserPersonalityProfile> = {
      totalMessages:
        profile.totalMessages +
        conversation.messages.filter((m) => m.sender === "user").length,
      totalConversations: profile.totalConversations + 1,
      lastAnalyzedConversation: conversationId,
      updatedAt: Timestamp.now(),
    };

    // Actualizează interesele cu noile topics
    const newTopics = insight.mainTopics.filter(
      (topic) => !profile.interests.topics.includes(topic)
    );
    if (newTopics.length > 0) {
      updatedProfile.interests = {
        ...profile.interests,
        topics: [...profile.interests.topics, ...newTopics].slice(0, 10),
      };
    }

    // Salvează actualizările
    const ref = doc(firestore, USER_PROFILES_COLLECTION, userId);
    await updateDoc(ref, updatedProfile);

    console.log(
      `[PersonalizationService] Profile updated incrementally for user ${userId}`
    );
  },
  // Înregistrează informații personale despre utilizator
  async recordUserInfo(
    userId: string,
    infoType: string,
    infoValue: string
  ): Promise<void> {
    console.log(
      `[PersonalizationService] === RECORDING ${infoType.toUpperCase()} FOR USER: ${userId} ===`
    );
    console.log(
      `[PersonalizationService] Recording ${infoType}: "${infoValue}" for user ${userId}`
    );

    try {
      const ref = doc(firestore, USER_PROFILES_COLLECTION, userId);
      console.log(
        `[PersonalizationService] Firestore doc path: ${USER_PROFILES_COLLECTION}/${userId}`
      );

      const snap = await getDoc(ref);

      let profile: UserPersonalityProfile;

      if (snap.exists()) {
        profile = snap.data() as UserPersonalityProfile;
        console.log(
          `[PersonalizationService] Found existing profile for user ${userId}`
        );
      } else {
        // Creează un profil nou dacă nu există
        profile = this.createDefaultProfile(userId);
        console.log(
          `[PersonalizationService] Creating new profile for user ${userId}`
        );
      } // Actualizează profilul cu noua informație
      console.log(
        `[PersonalizationService] Processing infoType: ${infoType.toLowerCase()}`
      );
      switch (infoType.toLowerCase()) {
        case "nume":
        case "name":
          profile.personalPreferences = {
            ...profile.personalPreferences,
            userName: infoValue,
          };
          console.log(
            `[PersonalizationService] Set userName to: ${infoValue} for user ${userId}`
          );
          break;
        case "varsta":
        case "age":
          const parsedAge = parseInt(infoValue) || null;
          profile.personalPreferences = {
            ...profile.personalPreferences,
            userAge: parsedAge,
          };
          console.log(
            `[PersonalizationService] Set userAge to: ${parsedAge} for user ${userId}`
          );
          break;
        case "ocupatie":
        case "job":
          if (!profile.interests.domains.includes(infoValue)) {
            profile.interests.domains.push(infoValue);
          }
          console.log(
            `[PersonalizationService] Added occupation: ${infoValue} for user ${userId}`
          );
          break;
        case "hobby":
        case "interes":
          if (!profile.interests.topics.includes(infoValue)) {
            profile.interests.topics.push(infoValue);
          }
          console.log(
            `[PersonalizationService] Added hobby: ${infoValue} for user ${userId}`
          );
          break;
        default:
          // Pentru alte tipuri de informații, le adăugăm la topics
          if (!profile.interests.topics.includes(`${infoType}: ${infoValue}`)) {
            profile.interests.topics.push(`${infoType}: ${infoValue}`);
          }
          console.log(
            `[PersonalizationService] Added general info: ${infoType}: ${infoValue} for user ${userId}`
          );
      }
      profile.updatedAt = Timestamp.now();

      // Curățăm valorile undefined înainte de salvare pentru a evita erori Firebase
      const cleanedProfile = this.cleanUndefinedValues(profile);

      await setDoc(ref, cleanedProfile, { merge: true });
      console.log(
        `[PersonalizationService] === SUCCESSFULLY SAVED ${infoType.toUpperCase()}: "${infoValue}" FOR USER: ${userId} ===`
      );

      // Verifică ce s-a salvat efectiv
      const verifySnap = await getDoc(ref);
      if (verifySnap.exists()) {
        const savedProfile = verifySnap.data() as UserPersonalityProfile;
        console.log(
          `[PersonalizationService] Verification - userName: ${savedProfile.personalPreferences?.userName}, userAge: ${savedProfile.personalPreferences?.userAge}`
        );
        console.log(
          `[PersonalizationService] Verification - domains: ${savedProfile.interests?.domains?.join(", ")}`
        );
        console.log(
          `[PersonalizationService] Verification - topics: ${savedProfile.interests?.topics?.join(", ")}`
        );
      }
    } catch (error) {
      console.error(
        `[PersonalizationService] === ERROR RECORDING ${infoType} FOR USER ${userId} ===`,
        error
      );
    }
  },

  // Creează un profil default pentru utilizatori noi
  createDefaultProfile(userId: string): UserPersonalityProfile {
    return {
      userId,
      totalMessages: 0,
      totalConversations: 0,
      communicationStyle: {
        preferredTone: "friendly",
        averageMessageLength: 0,
        usesEmojis: false,
        preferredLanguage: "ro",
      },
      interests: {
        topics: [],
        domains: [],
        frequentQuestions: [],
      },
      behaviorPatterns: {
        mostActiveTimeOfDay: "",
        conversationFrequency: 0,
        averageConversationLength: 0,
        preferredResponseLength: "medium",
      },
      personalPreferences: {
        addressMode: "tu",
        preferredExplanationStyle: "simple",
        needsEncouragement: false,
        likesExamples: true,
        userName: undefined,
        userAge: null,
      },
      emotionalProfile: {
        generalMood: "neutral",
        needsSupport: false,
        appreciatesHumor: false,
      },
      learningStyle: {
        prefersStepByStep: false,
        likesVisualDescriptions: false,
        needsRepetition: false,
        asksFollowUpQuestions: false,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastAnalyzedConversation: null,
    };
  },
  // Extrage și salvează informații personale din mesajele utilizatorului
  async extractAndSavePersonalInfo(
    userId: string,
    message: string
  ): Promise<void> {
    console.log(
      `[PersonalizationService] === EXTRACTING PERSONAL INFO FOR USER: ${userId} ===`
    );
    console.log(
      `[PersonalizationService] Message to analyze: "${message.substring(0, 100)}${message.length > 100 ? "..." : ""}"`
    );

    const lowerMessage = message.toLowerCase();
    // Extrage numele
    const namePatterns = [
      /m[ăa] numesc ([a-zA-ZăâîșțĂÂÎȘȚ]+)/,
      /numele meu (?:este|e) ([a-zA-ZăâîșțĂÂÎȘȚ]+)/,
      /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)/,
      /eu sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)/,
    ];

    for (const pattern of namePatterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1] && match[1].length > 1) {
        await this.recordUserInfo(userId, "nume", match[1]);
        break;
      }
    }

    // Extrage vârsta
    const agePatterns = [
      /am (\d{1,2}) (?:ani|de ani)/,
      /sunt de (\d{1,2}) (?:ani|de ani)/,
      /varsta (?:mea )?(?:este|e) (\d{1,2})/,
    ];

    for (const pattern of agePatterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1]) {
        const age = parseInt(match[1]);
        if (age >= 13 && age <= 120) {
          await this.recordUserInfo(userId, "varsta", match[1]);
          break;
        }
      }
    }
    // Extrage ocupația
    const jobPatterns = [
      /lucrez ca ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
      /sunt ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]+) de meserie/,
      /profesiunea mea (?:este|e) ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
      /job(?:ul)? meu (?:este|e) ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
    ];

    for (const pattern of jobPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1] && match[1].length > 2) {
        await this.recordUserInfo(userId, "ocupatie", match[1]);
        break;
      }
    }

    // Extrage hobby-uri și interese
    const hobbyPatterns = [
      /îmi place s[ăa] ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
      /hobby(?:ul)? meu (?:este|e) ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
      /sunt pasionat(?:ă)? de ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
      /m[ăa] intereseaz[ăa] ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
    ];

    for (const pattern of hobbyPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1] && match[1].length > 2) {
        await this.recordUserInfo(userId, "hobby", match[1]);
        break;
      }
    }
  },

  // Curăță valorile undefined din obiect pentru a evita erori Firebase
  cleanUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== "object") return obj;
    if (Array.isArray(obj))
      return obj.map((item) => this.cleanUndefinedValues(item));

    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = this.cleanUndefinedValues(obj[key]);
      }
    }
    return cleaned;
  },
};
