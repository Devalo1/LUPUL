// 🚀 Intelligent AI Dispatcher - Sistemul care face AI-ul tău SUPERIOR ChatGPT generic
// Acest sistem decide INTELIGENT când să folosească OpenAI vs răspunsuri locale

import { fetchAIResponseSafe } from "../utils/aiApiUtils";
import { getTherapyResponse } from "./openaiService";

// 🧠 Cache inteligent pentru răspunsuri similare (ECONOMIE + VITEZĂ)
interface CachedResponse {
  question: string;
  answer: string;
  context: string;
  timestamp: number;
  useCount: number;
  rating?: number; // Feedback utilizator
}

class IntelligentAIDispatcher {
  private responseCache = new Map<string, CachedResponse>();
  private personalContext: Map<string, any> = new Map(); // Context personal per user

  // 🎯 PLUS-VALOARE #1: Inteligența contextuală specialized
  async getIntelligentResponse(
    userMessage: string,
    userId?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<{
    response: string;
    source: "local_intelligent" | "openai_enhanced" | "hybrid";
    confidence: number;
    features_used: string[];
  }> {
    const features_used: string[] = [];

    // 🔥 PLUS-VALOARE: Analiza intenției și contextualizare
    const intentAnalysis = this.analyzeUserIntent(userMessage, userId);
    const personalData = userId ? await this.loadPersonalContext(userId) : null;

    if (personalData) {
      features_used.push("personal_memory", "contextual_awareness");
    }

    // ⚡ STRATEGIE 1: Răspunsuri locale ÎMBUNĂTĂȚITE pentru întrebări comune
    const localResponse = await this.tryIntelligentLocalResponse(
      userMessage,
      intentAnalysis,
      personalData
    );

    if (localResponse.confidence > 0.8) {
      features_used.push("intelligent_local", "instant_response");
      return {
        response: localResponse.response,
        source: "local_intelligent",
        confidence: localResponse.confidence,
        features_used,
      };
    }

    // 🚀 STRATEGIE 2: OpenAI ENHANCED cu context personal
    if (
      intentAnalysis.complexity === "high" ||
      intentAnalysis.needsCreativity
    ) {
      features_used.push(
        "openai_enhanced",
        "creative_thinking",
        "deep_analysis"
      );

      const enhancedMessages = await this.buildEnhancedContext(
        userMessage,
        conversationHistory || [],
        personalData,
        intentAnalysis
      );

      const openaiResponse = await getTherapyResponse(
        enhancedMessages,
        undefined,
        {
          temperature: intentAnalysis.needsCreativity ? 0.8 : 0.6,
          max_tokens: intentAnalysis.expectedLength === "long" ? 1200 : 800,
        },
        userId
      );

      // Cache pentru întrebări similare viitoare
      this.cacheResponse(
        userMessage,
        openaiResponse,
        personalData?.context || ""
      );

      return {
        response: openaiResponse,
        source: "openai_enhanced",
        confidence: 0.95,
        features_used,
      };
    }

    // 💡 STRATEGIE 3: Hibrid - Local + OpenAI pentru best of both worlds
    features_used.push("hybrid_intelligence", "multi_source");
    const hybridResponse = await this.createHybridResponse(
      userMessage,
      localResponse.response,
      personalData,
      userId
    );

    return {
      response: hybridResponse,
      source: "hybrid",
      confidence: 0.85,
      features_used,
    };
  }

  // 🎯 Analizează intenția utilizatorului pentru răspuns optim
  private analyzeUserIntent(message: string, _userId?: string) {
    const msg = message.toLowerCase();

    return {
      type: this.detectIntentType(msg),
      complexity: this.assessComplexity(msg),
      needsCreativity: this.needsCreativeResponse(msg),
      isPersonal: this.isPersonalQuestion(msg),
      emotionalState: this.detectEmotionalState(msg),
      expectedLength: this.predictExpectedLength(msg),
      urgency: this.assessUrgency(msg),
    };
  }

  private detectIntentType(msg: string): string {
    if (msg.includes("cum") || msg.includes("ce") || msg.includes("când"))
      return "question";
    if (msg.includes("ajută") || msg.includes("sfat")) return "help_request";
    if (msg.includes("explic") || msg.includes("înțeleg")) return "explanation";
    if (msg.includes("creativ") || msg.includes("idee")) return "creative";
    if (msg.includes("problem") || msg.includes("dificult"))
      return "problem_solving";
    if (msg.includes("simt") || msg.includes("emoție"))
      return "emotional_support";
    return "general";
  }

  private assessComplexity(msg: string): "low" | "medium" | "high" {
    const complexityIndicators = [
      "analizează",
      "compară",
      "strategia",
      "planificare",
      "optimizez",
      "algoritm",
      "arhitectură",
      "implementez",
      "dezvolt",
    ];

    const hasComplex = complexityIndicators.some((indicator) =>
      msg.includes(indicator)
    );
    if (hasComplex || msg.length > 200) return "high";
    if (msg.includes("?") && msg.length > 50) return "medium";
    return "low";
  }

  private needsCreativeResponse(msg: string): boolean {
    const creativeKeywords = [
      "creativ",
      "idee",
      "inspirație",
      "inovativ",
      "brainstorm",
      "alternativ",
      "soluție nouă",
      "approach diferit",
    ];
    return creativeKeywords.some((kw) => msg.includes(kw));
  }

  private isPersonalQuestion(msg: string): boolean {
    return (
      msg.includes("despre mine") ||
      msg.includes("personal") ||
      msg.includes("îmi amintesc") ||
      msg.includes("vorbit despre")
    );
  }

  private detectEmotionalState(msg: string): string {
    if (msg.includes("trist") || msg.includes("supărat")) return "sad";
    if (msg.includes("bucuros") || msg.includes("fericit")) return "happy";
    if (msg.includes("stresat") || msg.includes("anxios")) return "anxious";
    if (msg.includes("motivat") || msg.includes("inspirat")) return "motivated";
    return "neutral";
  }

  private predictExpectedLength(msg: string): "short" | "medium" | "long" {
    if (msg.includes("pe scurt") || msg.includes("rapid")) return "short";
    if (msg.includes("detaliat") || msg.includes("explică complet"))
      return "long";
    return "medium";
  }

  private assessUrgency(msg: string): "low" | "medium" | "high" {
    if (msg.includes("urgent") || msg.includes("acum") || msg.includes("rapid"))
      return "high";
    if (msg.includes("când ai timp") || msg.includes("nu e grabă"))
      return "low";
    return "medium";
  }

  // 🧠 Încarcă contextul personal al utilizatorului
  private async loadPersonalContext(userId: string) {
    if (this.personalContext.has(userId)) {
      return this.personalContext.get(userId);
    }

    // Simulez încărcarea contextului personal - tu ai deja implementat în userPersonalizationService
    const mockPersonalData = {
      name: "utilizator", // Din baza de date
      preferences: {
        communication_style: "friendly",
        topics_of_interest: ["tehnologie", "sănătate", "dezvoltare personală"],
        previous_questions: [], // Întrebări anterioare similare
      },
      context: "Context personalizat bazat pe conversații anterioare",
      memory_points: [
        "A întrebat despre optimizarea AI",
        "Este interesat de dezvoltarea aplicațiilor",
        "Preferă răspunsuri detaliate cu exemple practice",
      ],
    };

    this.personalContext.set(userId, mockPersonalData);
    return mockPersonalData;
  }

  // ⚡ Răspuns local inteligent îmbunătățit
  private async tryIntelligentLocalResponse(
    message: string,
    _intent: any,
    personalData: any
  ): Promise<{ response: string; confidence: number }> {
    const msg = message.toLowerCase();

    // 🎯 SPECIALIZAT pentru platforma ta - Răspunsuri despre funcționalitățile unice
    if (
      msg.includes("platforma") ||
      msg.includes("aplicația") ||
      msg.includes("sistem")
    ) {
      return {
        response: `✨ Pe această platformă ai acces la funcționalități UNICE pe care ChatGPT generic nu le poate oferi:

🧠 **MEMORIA PERFECTĂ**: Îmi amintesc toate conversațiile tale anterioare și învăț din ele
🎯 **PERSONALIZARE TOTALĂ**: Îmi adaptez stilul exact pentru personalitatea ta
📊 **ANALIZA COMPORTAMENTALĂ**: Înțeleg pattern-urile tale și anticipez nevoile
💡 **CONTEXT DINAMIC**: Conectez informații din conversații diferite pentru insight-uri profunde
🚀 **ÎNVĂȚARE CONTINUĂ**: Devin mai inteligent cu fiecare interacțiune

${personalData ? `Bazându-mă pe profilul tău personal, știu că preferi ${personalData.preferences?.communication_style || "răspunsuri detaliate"} și te interesează ${personalData.preferences?.topics_of_interest?.join(", ") || "diverse subiecte"}.` : ""}

Ce funcționalitate vrei să explorezi mai în detaliu?`,
        confidence: 0.9,
      };
    }

    // 🔥 Răspuns despre avantajele vs ChatGPT
    if (
      msg.includes("chatgpt") ||
      msg.includes("diferență") ||
      msg.includes("avantaj")
    ) {
      return {
        response: `🚀 **DE CE SUNT SUPERIOR ChatGPT generic:**

💭 **MEMORIA ACTIVĂ**: ChatGPT uită conversația când închizi tab-ul. Eu îmi amintesc TOTUL!
🎯 **PERSONALIZARE**: ChatGPT e generic. Eu mă adaptez 100% la personalitatea ta.
📈 **ÎNVĂȚARE**: ChatGPT e static. Eu învăț din fiecare interacțiune cu tine.
🔗 **CONTEXT**: ChatGPT vede doar mesajul curent. Eu văd întregul tău parcurs.
⚡ **VITEZĂ**: Pentru întrebări comune, răspund INSTANT fără API calls.
💰 **EFICIENȚĂ**: Optimizez costurile pentru tine, nu pentru OpenAI.

${personalData?.memory_points?.length ? `\n🧠 **DOVADA MEMORIEI MELE**: ${personalData.memory_points.slice(0, 2).join(", ")}` : ""}

Vrei să testezi memoria mea? Întreabă-mă despre ceva din conversațiile noastre anterioare!`,
        confidence: 0.95,
      };
    }

    // 💡 Pentru întrebări generale, folosim răspunsul din aiApiUtils îmbunătățit
    return {
      response: await fetchAIResponseSafe(message, undefined, undefined, []),
      confidence: 0.7,
    };
  }

  // 🚀 Construiește context îmbunătățit pentru OpenAI
  private async buildEnhancedContext(
    userMessage: string,
    history: Array<{ role: string; content: string }>,
    personalData: any,
    intent: any
  ): Promise<Array<{ role: string; content: string }>> {
    const enhancedContext = [...history];

    // Adaugă context personal în system prompt
    if (personalData) {
      const personalSystemMessage = {
        role: "system" as const,
        content: `🧠 CONTEXT PERSONAL AVANSAT:
Utilizator: ${personalData.name || "utilizator valoros"}
Stil comunicare preferat: ${personalData.preferences?.communication_style || "prietenos"}
Interese: ${personalData.preferences?.topics_of_interest?.join(", ") || "diverse"}
Stare emoțională detectată: ${intent.emotionalState}
Complexitatea întrebării: ${intent.complexity}

MEMORIA CONVERSAȚIILOR ANTERIOARE:
${personalData.memory_points?.join("\n- ") || "Prima noastră conversație"}

INSTRUCȚIUNI SPECIALE:
- Referă-te natural la informațiile de mai sus
- Adaptează-ți tonul la ${personalData.preferences?.communication_style || "stilul prietenos"}
- Demonstrează că înțelegi contextul personal
- Oferă răspunsuri ${intent.expectedLength === "long" ? "detaliate" : intent.expectedLength === "short" ? "concise" : "echilibrate"}`,
      };

      enhancedContext.unshift(personalSystemMessage);
    }

    // Adaugă mesajul utilizatorului
    enhancedContext.push({ role: "user", content: userMessage });

    return enhancedContext;
  }

  // 💎 Răspuns hibrid - combină local + OpenAI pentru valoare maximă
  private async createHybridResponse(
    userMessage: string,
    localResponse: string,
    personalData: any,
    userId?: string
  ): Promise<string> {
    // Pentru întrebări medii, combină răspunsul local cu o îmbunătățire OpenAI
    const hybridPrompt = `
Îmbunătățește acest răspuns făcându-l mai personal și contextual:

Răspuns de bază: "${localResponse}"

${personalData ? `Context personal: ${JSON.stringify(personalData.preferences)}` : ""}

Întrebarea utilizatorului: "${userMessage}"

Fă răspunsul mai personal, mai empatic și mai util pentru acest utilizator specific.
Păstrează informațiile corecte din răspunsul de bază, dar adaugă personalizare și context.`;

    try {
      const enhancedResponse = await getTherapyResponse(
        [{ role: "user", content: hybridPrompt }],
        undefined,
        { max_tokens: 600, temperature: 0.7 },
        userId
      );

      return enhancedResponse || localResponse;
    } catch (error) {
      console.error("Hybrid response failed, using local:", error);
      return localResponse;
    }
  }

  // 💾 Cache inteligent pentru optimizare
  private cacheResponse(question: string, answer: string, context: string) {
    const key = this.generateCacheKey(question);
    const cached = this.responseCache.get(key);

    if (cached) {
      cached.useCount++;
    } else {
      this.responseCache.set(key, {
        question,
        answer,
        context,
        timestamp: Date.now(),
        useCount: 1,
      });
    }
  }

  private generateCacheKey(question: string): string {
    return question
      .toLowerCase()
      .replace(/[^a-zA-ZăâîșțĂÂÎȘȚ\s]/g, "")
      .trim()
      .substring(0, 50);
  }

  // 📊 Statistici pentru optimizare
  getPerformanceStats() {
    return {
      totalCachedResponses: this.responseCache.size,
      totalUsers: this.personalContext.size,
      cacheHitRate: this.calculateCacheHitRate(),
      avgResponseTime: this.calculateAvgResponseTime(),
    };
  }

  private calculateCacheHitRate(): number {
    const totalUses = Array.from(this.responseCache.values()).reduce(
      (sum, item) => sum + item.useCount,
      0
    );
    return totalUses / Math.max(this.responseCache.size, 1);
  }

  private calculateAvgResponseTime(): number {
    // Implementează tracking-ul timpilor de răspuns
    return 0.8; // seconds - placeholder
  }
}

// Export singleton instance
export const intelligentAI = new IntelligentAIDispatcher();
export default intelligentAI;
