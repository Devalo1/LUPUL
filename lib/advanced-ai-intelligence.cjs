// Modul de inteligență avansată pentru AI - superior ChatGPT
// Implementează context awareness, emotional intelligence, și predictive responses

const admin = require("firebase-admin");

class AdvancedAIIntelligence {
  constructor(userId) {
    this.userId = userId;
    this.db = admin.firestore();
    this.userRef = this.db.collection("userProfiles").doc(userId);
  }

  // 🧠 CONTEXT AWARENESS AVANSAT
  async analyzeConversationContext(currentMessage, conversationHistory) {
    const context = {
      emotional_state: this.detectEmotionalState(currentMessage),
      urgency_level: this.detectUrgency(currentMessage),
      topic_shift: this.detectTopicShift(currentMessage, conversationHistory),
      conversation_type: this.classifyConversationType(currentMessage),
      user_intent: await this.predictUserIntent(
        currentMessage,
        conversationHistory
      ),
      response_style_needed: this.determineOptimalResponseStyle(currentMessage),
      follow_up_opportunities:
        this.identifyFollowUpOpportunities(currentMessage),
    };

    return context;
  }

  // 🎭 EMOTIONAL INTELLIGENCE - Detectează starea emoțională
  detectEmotionalState(message) {
    const emotionalPatterns = {
      joyful: [
        /fericit/i,
        /bucuros/i,
        /minunat/i,
        /super/i,
        /genial/i,
        /❤️|😊|😄|🎉/,
      ],
      sad: [/trist/i, /supărat/i, /deprimat/i, /rău/i, /😢|😭|💔/],
      anxious: [/stresat/i, /anxios/i, /îngrijorat/i, /nervos/i, /😰|😨/],
      angry: [/supărat/i, /furios/i, /enervat/i, /😡|🤬/],
      confused: [/nu înțeleg/i, /confuz/i, /habar/i, /😕|🤔/],
      excited: [/entuziasmant/i, /wow/i, /incredibil/i, /🚀|⭐|✨/],
      tired: [/obosit/i, /epuizat/i, /fără energie/i, /😴|😪/],
      curious: [/interesant/i, /cum/i, /de ce/i, /🤔|❓/],
      grateful: [/mulțumesc/i, /recunoscător/i, /apreciez/i, /🙏|❤️/],
      frustrated: [/frustrat/i, /enervant/i, /nu merge/i, /😤|😠/],
    };

    const emotions = {};
    let dominantEmotion = "neutral";
    let maxScore = 0;

    for (const [emotion, patterns] of Object.entries(emotionalPatterns)) {
      let score = 0;
      patterns.forEach((pattern) => {
        const matches = message.match(pattern);
        if (matches) score += matches.length;
      });

      emotions[emotion] = score;
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    }

    return {
      dominant: dominantEmotion,
      intensity: Math.min(maxScore / 3, 1), // 0-1 scale
      all_emotions: emotions,
    };
  }

  // ⚡ DETECTEAZĂ URGENȚA
  detectUrgency(message) {
    const urgencyIndicators = [
      /urgent/i,
      /rapid/i,
      /acum/i,
      /imediat/i,
      /repede/i,
      /important/i,
      /necesar/i,
      /trebuie/i,
      /musai/i,
      /cât mai repede/i,
      /pe loc/i,
      /nu poate aștepta/i,
    ];

    let urgencyScore = 0;
    urgencyIndicators.forEach((pattern) => {
      if (pattern.test(message)) urgencyScore++;
    });

    if (urgencyScore >= 3) return "high";
    if (urgencyScore >= 1) return "medium";
    return "low";
  }

  // 🔄 DETECTEAZĂ SCHIMBAREA DE SUBIECT
  detectTopicShift(currentMessage, conversationHistory) {
    if (!conversationHistory || conversationHistory.length < 2) return false;

    const lastMessage = conversationHistory[conversationHistory.length - 1];

    // Keywords din mesajul anterior vs curent
    const extractKeywords = (text) => {
      return text
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .filter(
          (word) =>
            ![
              "sunt",
              "este",
              "foarte",
              "mult",
              "puțin",
              "aici",
              "acolo",
            ].includes(word)
        );
    };

    const currentKeywords = extractKeywords(currentMessage);
    const lastKeywords = extractKeywords(lastMessage.userMessage || "");

    const commonKeywords = currentKeywords.filter((word) =>
      lastKeywords.includes(word)
    );
    const similarity =
      commonKeywords.length / Math.max(currentKeywords.length, 1);

    return similarity < 0.3; // Dacă sub 30% similaritate, e schimbare de subiect
  }

  // 🎯 CLASIFICĂ TIPUL DE CONVERSAȚIE
  classifyConversationType(message) {
    const conversationTypes = {
      question: [/cum/i, /ce/i, /când/i, /unde/i, /de ce/i, /\?/],
      request: [/poți/i, /vrei/i, /ajută/i, /fă/i, /spune/i],
      emotional_support: [/mă simt/i, /sunt trist/i, /am nevoie/i, /îmi pare/i],
      casual_chat: [/bună/i, /salut/i, /ce mai faci/i, /cum merge/i],
      problem_solving: [/problemă/i, /nu merge/i, /eroare/i, /cum să/i],
      sharing: [
        /am fost/i,
        /am făcut/i,
        /mi s-a întâmplat/i,
        /vreau să îți spun/i,
      ],
      planning: [/plănuiesc/i, /vreau să fac/i, /o să/i, /mâine/i, /planuri/i],
    };

    for (const [type, patterns] of Object.entries(conversationTypes)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) return type;
      }
    }

    return "general";
  }

  // 🔮 PREDICTIVE INTENT ANALYSIS
  async predictUserIntent(currentMessage, conversationHistory) {
    const profile = await this.getUserProfile();

    const intents = {
      seeking_advice: this.calculateAdviceSeekingProbability(
        currentMessage,
        profile
      ),
      wanting_to_vent: this.calculateVentingProbability(currentMessage),
      looking_for_information:
        this.calculateInformationSeekingProbability(currentMessage),
      casual_conversation: this.calculateCasualChatProbability(currentMessage),
      problem_solving: this.calculateProblemSolvingProbability(currentMessage),
      emotional_support:
        this.calculateEmotionalSupportProbability(currentMessage),
      sharing_experience: this.calculateSharingProbability(currentMessage),
    };

    // Returnează intent-ul cu probabilitatea cea mai mare
    const topIntent = Object.entries(intents).reduce((a, b) =>
      intents[a[0]] > intents[b[0]] ? a : b
    );

    return {
      primary_intent: topIntent[0],
      confidence: topIntent[1],
      all_intents: intents,
    };
  }

  calculateAdviceSeekingProbability(message, profile) {
    const advicePatterns = [
      /ce să fac/i,
      /cum să procedez/i,
      /sfat/i,
      /recomand/i,
      /ce crezi/i,
      /părerea ta/i,
      /ai idee/i,
    ];

    let score = 0;
    advicePatterns.forEach((pattern) => {
      if (pattern.test(message)) score += 0.3;
    });

    // Personalizare pe baza profilului
    if (profile?.profile?.personalityTraits?.includes("indecisive"))
      score += 0.2;
    if (profile?.profile?.age && profile.profile.age < 25) score += 0.1;

    return Math.min(score, 1);
  }

  calculateVentingProbability(message) {
    const ventingPatterns = [
      /am avut o zi/i,
      /sunt frustrat/i,
      /nu pot să cred/i,
      /m-am săturat/i,
      /îmi vine să/i,
      /e nedrept/i,
    ];

    let score = 0;
    ventingPatterns.forEach((pattern) => {
      if (pattern.test(message)) score += 0.4;
    });

    return Math.min(score, 1);
  }

  calculateInformationSeekingProbability(message) {
    const infoPatterns = [
      /cum funcționează/i,
      /ce înseamnă/i,
      /explică/i,
      /informații despre/i,
      /vreau să știu/i,
      /detalii/i,
    ];

    let score = 0;
    infoPatterns.forEach((pattern) => {
      if (pattern.test(message)) score += 0.3;
    });

    return Math.min(score, 1);
  }

  calculateCasualChatProbability(message) {
    const casualPatterns = [
      /ce mai faci/i,
      /cum merge/i,
      /ce-i nou/i,
      /bună/i,
      /salut/i,
      /ce planuri/i,
    ];

    let score = 0;
    casualPatterns.forEach((pattern) => {
      if (pattern.test(message)) score += 0.4;
    });

    return Math.min(score, 1);
  }

  calculateProblemSolvingProbability(message) {
    const problemPatterns = [
      /nu merge/i,
      /problemă/i,
      /eroare/i,
      /nu funcționează/i,
      /cum să rezolv/i,
      /se strică/i,
      /nu pot/i,
    ];

    let score = 0;
    problemPatterns.forEach((pattern) => {
      if (pattern.test(message)) score += 0.4;
    });

    return Math.min(score, 1);
  }

  calculateEmotionalSupportProbability(message) {
    const supportPatterns = [
      /mă simt/i,
      /sunt trist/i,
      /îmi este greu/i,
      /am nevoie de/i,
      /mă înțelegi/i,
      /singur/i,
    ];

    let score = 0;
    supportPatterns.forEach((pattern) => {
      if (pattern.test(message)) score += 0.4;
    });

    return Math.min(score, 1);
  }

  calculateSharingProbability(message) {
    const sharingPatterns = [
      /am fost/i,
      /am făcut/i,
      /mi s-a întâmplat/i,
      /vreau să îți spun/i,
      /ghici ce/i,
      /să îți povestesc/i,
    ];

    let score = 0;
    sharingPatterns.forEach((pattern) => {
      if (pattern.test(message)) score += 0.3;
    });

    return Math.min(score, 1);
  }

  // 🎨 DETERMINĂ STILUL OPTIM DE RĂSPUNS
  determineOptimalResponseStyle(message) {
    const emotional = this.detectEmotionalState(message);
    const urgency = this.detectUrgency(message);

    let style = {
      tone: "friendly", // friendly, professional, casual, empathetic, encouraging
      length: "medium", // short, medium, detailed
      formality: "informal", // formal, informal, mixed
      approach: "supportive", // supportive, analytical, creative, direct
      include_questions: false,
      include_examples: false,
      include_humor: false,
    };

    // Adaptare pe baza emoției dominante
    switch (emotional.dominant) {
      case "sad":
      case "anxious":
        style.tone = "empathetic";
        style.approach = "supportive";
        style.length = "medium";
        break;

      case "angry":
      case "frustrated":
        style.tone = "calm";
        style.approach = "understanding";
        style.length = "short";
        break;

      case "joyful":
      case "excited":
        style.tone = "enthusiastic";
        style.include_humor = true;
        style.length = "medium";
        break;

      case "curious":
        style.approach = "analytical";
        style.include_examples = true;
        style.include_questions = true;
        style.length = "detailed";
        break;

      case "confused":
        style.approach = "educational";
        style.include_examples = true;
        style.length = "detailed";
        break;
    }

    // Adaptare pe baza urgenței
    if (urgency === "high") {
      style.length = "short";
      style.approach = "direct";
    }

    return style;
  }

  // 🔗 IDENTIFICĂ OPORTUNITĂȚI DE FOLLOW-UP
  identifyFollowUpOpportunities(message) {
    const opportunities = [];

    // Detectează subiecte incomplete
    if (/începe/i.test(message) && !/terminat|sfârșit/i.test(message)) {
      opportunities.push({
        type: "continuation",
        suggestion:
          "Pare că ai început să vorbești despre ceva. Vrei să continui?",
      });
    }

    // Detectează mențiuni de evenimente viitoare
    if (/mâine|săptămâna viitoare|luna viitoare/i.test(message)) {
      opportunities.push({
        type: "future_checkin",
        suggestion: "Să verific cu tine după aceea să văd cum a mers?",
      });
    }

    // Detectează nevoi de învățare
    if (/nu știu|nu înțeleg|habar n-am/i.test(message)) {
      opportunities.push({
        type: "learning_opportunity",
        suggestion: "Vrei să te ajut să înțelegi mai bine acest subiect?",
      });
    }

    // Detectează emoții negative repetate
    if (/probleme|dificil|greu/i.test(message)) {
      opportunities.push({
        type: "emotional_support",
        suggestion: "Vrei să vorbim mai mult despre cum te simți?",
      });
    }

    return opportunities;
  }

  // 📊 ANALIZĂ BEHAVIORALĂ AVANSATĂ
  async analyzeBehavioralPatterns() {
    const conversations = await this.userRef
      .collection("conversations")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const patterns = {
      active_hours: this.analyzeActiveHours(conversations.docs),
      message_length_preference: this.analyzeMessageLengthPreference(
        conversations.docs
      ),
      topic_interests: this.analyzeTopicInterests(conversations.docs),
      response_time_patterns: this.analyzeResponseTimePatterns(
        conversations.docs
      ),
      emotional_patterns: this.analyzeEmotionalPatterns(conversations.docs),
      conversation_starters: this.analyzeConversationStarters(
        conversations.docs
      ),
    };

    return patterns;
  }

  analyzeActiveHours(conversations) {
    const hourCounts = new Array(24).fill(0);

    conversations.forEach((conv) => {
      if (conv.data().timestamp) {
        const hour = conv.data().timestamp.toDate().getHours();
        hourCounts[hour]++;
      }
    });

    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));
    return {
      most_active_hour: mostActiveHour,
      activity_distribution: hourCounts,
      is_night_owl: mostActiveHour > 22 || mostActiveHour < 6,
      is_early_bird: mostActiveHour >= 6 && mostActiveHour <= 9,
    };
  }

  analyzeMessageLengthPreference(conversations) {
    const lengths = conversations
      .map((conv) => (conv.data().userMessage || "").length)
      .filter((len) => len > 0);

    const average = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    return {
      average_length: Math.round(average),
      prefers_short: average < 50,
      prefers_detailed: average > 200,
      range: {
        min: Math.min(...lengths),
        max: Math.max(...lengths),
      },
    };
  }

  analyzeTopicInterests(conversations) {
    const topics = {};
    const topicKeywords = {
      technology: [
        "tech",
        "computer",
        "software",
        "app",
        "internet",
        "telefon",
      ],
      relationships: ["prieten", "familie", "iubit", "căsători", "relație"],
      work: ["muncă", "job", "carieră", "birou", "șef", "coleg"],
      health: ["sănătate", "sport", "exerciții", "alergare", "dietă"],
      entertainment: ["film", "muzică", "jocuri", "carte", "serial"],
      travel: ["călătorie", "vacanță", "oraș", "țară", "vizit"],
      food: ["mâncare", "restaurant", "gătit", "rețetă", "masa"],
      learning: ["învăț", "curs", "studiu", "universitate", "școală"],
    };

    conversations.forEach((conv) => {
      const message = (conv.data().userMessage || "").toLowerCase();

      for (const [topic, keywords] of Object.entries(topicKeywords)) {
        const mentions = keywords.filter((keyword) =>
          message.includes(keyword)
        ).length;

        topics[topic] = (topics[topic] || 0) + mentions;
      }
    });

    const sortedTopics = Object.entries(topics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      top_interests: sortedTopics,
      primary_interest: sortedTopics[0]?.[0] || "general",
    };
  }

  analyzeEmotionalPatterns(conversations) {
    const emotions = [];

    conversations.forEach((conv) => {
      const message = conv.data().userMessage || "";
      const emotional = this.detectEmotionalState(message);
      if (emotional.dominant !== "neutral") {
        emotions.push({
          emotion: emotional.dominant,
          intensity: emotional.intensity,
          timestamp: conv.data().timestamp,
        });
      }
    });

    const emotionCounts = {};
    emotions.forEach((e) => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });

    return {
      dominant_emotions: Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3),
      emotional_volatility: this.calculateEmotionalVolatility(emotions),
      recent_emotional_trend: this.analyzeRecentEmotionalTrend(
        emotions.slice(0, 10)
      ),
    };
  }

  calculateEmotionalVolatility(emotions) {
    if (emotions.length < 5) return "stable";

    const intensities = emotions.slice(0, 10).map((e) => e.intensity);
    const average = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const variance =
      intensities.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) /
      intensities.length;

    if (variance > 0.3) return "volatile";
    if (variance > 0.1) return "moderate";
    return "stable";
  }

  analyzeRecentEmotionalTrend(recentEmotions) {
    if (recentEmotions.length < 3) return "neutral";

    const positiveEmotions = ["joyful", "excited", "grateful", "curious"];
    const negativeEmotions = ["sad", "angry", "anxious", "frustrated", "tired"];

    const recent = recentEmotions.slice(0, 5);
    const positiveCount = recent.filter((e) =>
      positiveEmotions.includes(e.emotion)
    ).length;
    const negativeCount = recent.filter((e) =>
      negativeEmotions.includes(e.emotion)
    ).length;

    if (positiveCount > negativeCount + 1) return "improving";
    if (negativeCount > positiveCount + 1) return "declining";
    return "stable";
  }

  analyzeConversationStarters(conversations) {
    const starters = conversations
      .map((conv) => conv.data().userMessage || "")
      .filter((msg) => msg.length > 0)
      .map((msg) => msg.split(".")[0].toLowerCase().trim())
      .slice(0, 20);

    const starterPatterns = {};
    starters.forEach((starter) => {
      const firstWords = starter.split(" ").slice(0, 3).join(" ");
      starterPatterns[firstWords] = (starterPatterns[firstWords] || 0) + 1;
    });

    const commonStarters = Object.entries(starterPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      common_patterns: commonStarters,
      typical_opener: commonStarters[0]?.[0] || "varied",
    };
  }

  // 🎯 GENEREAZĂ RĂSPUNS INTELIGENT PERSONALIZAT
  async generateIntelligentResponse(
    message,
    conversationHistory,
    philosophicalContext
  ) {
    // Analizează contextul complet
    const context = await this.analyzeConversationContext(
      message,
      conversationHistory
    );
    const behavioralPatterns = await this.analyzeBehavioralPatterns();
    const profile = await this.getUserProfile();

    // Construiește un prompt avansat pentru AI
    const enhancedPrompt = this.buildEnhancedPrompt(
      message,
      context,
      behavioralPatterns,
      profile,
      philosophicalContext
    );

    return enhancedPrompt;
  }

  buildEnhancedPrompt(
    message,
    context,
    patterns,
    profile,
    philosophicalContext
  ) {
    return `
🧠 ANALIZA AVANSATĂ A UTILIZATORULUI:

📊 CONTEXT ACTUAL:
- Stare emoțională: ${context.emotional_state.dominant} (intensitate: ${Math.round(context.emotional_state.intensity * 100)}%)
- Urgență: ${context.urgency_level}
- Tipul conversației: ${context.conversation_type}
- Intenția principală: ${context.user_intent.primary_intent} (${Math.round(context.user_intent.confidence * 100)}% certitudine)

🎯 PERSONALITATE & COMPORTAMENT:
- Ore active preferate: ${patterns.active_hours?.most_active_hour}:00 (${patterns.active_hours?.is_night_owl ? "nocturn" : patterns.active_hours?.is_early_bird ? "matinal" : "normal"})
- Preferință mesaje: ${patterns.message_length_preference?.prefers_short ? "scurte" : patterns.message_length_preference?.prefers_detailed ? "detaliate" : "medii"}
- Interes principal: ${patterns.topic_interests?.primary_interest}
- Stabilitate emotională: ${patterns.emotional_patterns?.emotional_volatility}
- Trend emoțional recent: ${patterns.emotional_patterns?.recent_emotional_trend}

🎨 STIL DE RĂSPUNS OPTIM:
- Ton: ${context.response_style_needed.tone}
- Lungime: ${context.response_style_needed.length}
- Abordare: ${context.response_style_needed.approach}
- Include întrebări: ${context.response_style_needed.include_questions ? "Da" : "Nu"}
- Include exemple: ${context.response_style_needed.include_examples ? "Da" : "Nu"}
- Include umor: ${context.response_style_needed.include_humor ? "Da" : "Nu"}

💡 OPORTUNITĂȚI FOLLOW-UP:
${context.follow_up_opportunities.map((opp) => `- ${opp.type}: ${opp.suggestion}`).join("\n")}

${philosophicalContext}

🔥 INSTRUCȚIUNI SPECIALE PENTRU RĂSPUNS SUPERIOR:
1. Folosește EXACT tonul și stilul identificat pentru această persoană
2. Referențiază subtil comportamentele și preferințele observate
3. Adaptează lungimea și complexitatea pe baza analizei
4. Anticipează nevoile neconstientizate ale utilizatorului
5. Oferă un răspuns care depășește așteptările prin personalizare profundă
6. Demonstrează că "înțelegi" utilizatorul la un nivel emoțional profund

IMPORTANT: Comportă-te ca cel mai empatic, intuitiv și inteligent prieten pe care îl poate avea - depășește ChatGPT prin personalizare extremă și înțelegere profundă!
`;
  }

  // Helper methods
  async getUserProfile() {
    const doc = await this.userRef.get();
    return doc.exists ? doc.data() : null;
  }

  analyzeResponseTimePatterns(conversations) {
    // Implementare pentru analiza timpului de răspuns
    return {
      average_response_time: "2-5 minute",
      prefers_quick_responses: true,
    };
  }
}

module.exports = { AdvancedAIIntelligence };
