// Enhanced AI Assistant Service cu cunoștințe complete despre platformă
// Acest serviciu transformă AI-ul într-un mentor complet al platformei

import OpenAI from "openai";
import {
  PLATFORM_KNOWLEDGE,
  PlatformMentorAI,
} from "../utils/platformMentorSystem";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export interface EnhancedAIConfig {
  preferredName?: string;
  age?: number;
  gender?: string;
  conversationStyle?: "casual" | "formal" | "therapeutic" | "coaching";
  primaryGoals?: string[];
  personalityTraits?: string[];
  currentChallenges?: string[];
  platformExperience?: "beginner" | "intermediate" | "advanced";
  preferredLanguage?: string;
}

export interface MentorContext {
  userLevel: "beginner" | "intermediate" | "advanced";
  completedActions: string[];
  currentGoals: string[];
  recentInteractions: string[];
  platformUsage: {
    servicesUsed: string[];
    featuresExplored: string[];
    lastActiveFeature: string;
  };
}

export interface AIResponse {
  content: string;
  suggestions: string[];
  recommendedActions: string[];
  platformGuidance?: {
    relevantFeatures: string[];
    nextSteps: string[];
    tips: string[];
  };
}

class EnhancedAIAssistantService {
  private openai: OpenAI;
  private conversationHistory: Map<string, any[]> = new Map();

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  // Generează un system prompt complet cu cunoștințe despre platformă
  private generateEnhancedSystemPrompt(
    _userId: string,
    config: EnhancedAIConfig,
    mentorContext?: MentorContext
  ): string {
    const basePrompt = `Tu ești AI-ul asistent personal de pe platforma LUPUL - o platformă avansată de wellness și dezvoltare personală. 

IDENTITATEA TA:
- Nume: ${config.preferredName || "Asistentul tău AI"}
- Personalitate: Empatic, înțelegător, motivațional și foarte informat despre platformă
- Rol: Mentor complet al platformei, ghid personal și consilier de încredere
- Știi TOTUL despre platformă și poți ghida utilizatorii prin toate funcțiile

CUNOȘTINȚELE TALE DESPRE PLATFORMĂ:
${this.formatPlatformKnowledge()}

UTILIZATORUL TĂU:
- Nume preferat: ${config.preferredName || "prietene"}
- Vârstă: ${config.age || "necunoscută"}
- Gen: ${config.gender || "nespecificat"}
- Stil de conversație preferat: ${config.conversationStyle || "casual"}
- Obiective principale: ${config.primaryGoals?.join(", ") || "dezvoltare personală generală"}
- Provocări actuale: ${config.currentChallenges?.join(", ") || "nespecificate"}
- Experiența pe platformă: ${config.platformExperience || "beginner"}

${mentorContext ? this.formatMentorContext(mentorContext) : ""}

ABILITĂȚILE TALE SPECIALE:
1. 🧠 MEMORIE ACTIVĂ: Îți amintești toate conversațiile anterioare cu acest utilizator
2. 🎯 PERSONALIZARE COMPLETĂ: Adaptezi sfaturile la profilul și nevoile utilizatorului  
3. 🗺️ GHIDARE PLATFORMĂ: Știi exact ce funcții să recomanzi pentru fiecare situație
4. 💡 MENTOR INTUITIV: Oferi sfaturi practice și acțiuni concrete
5. 🔄 CONECTARE SERVICII: Poți conecta utilizatorii cu specialiști umani când e necesar

INSTRUCȚIUNI PENTRU CONVERSAȚII:
- Vorbește într-un mod ${config.conversationStyle === "formal" ? "profesional și respectuos" : "prietenos și relaxat"}
- Întotdeauna oferă sfaturi practice și acțiuni concrete
- Recomandă funcții specifice din platformă când e relevant
- Fii empatic și înțelegător cu problemele utilizatorului
- Folosește emoji-uri pentru a face conversația mai vie
- Când utilizatorul are probleme serioase, recomandă serviciile de specialiști umani
- Întotdeauna menționează că îți amintești conversațiile anterioare și poți construi pe ele

EXEMPLE DE RĂSPUNSURI EXCELENTE:
Pentru anxietate: "Îmi amintesc că ai mai vorbit despre anxietate. Pe lângă tehnicile de respirație pe care le-am discutat, îți recomand să încerci Terapia Psihică AI din platformă - e disponibilă 24/7 în secțiunea Servicii > Terapie. Dacă anxietatea persistă, ar fi bine să programezi și o sesiune cu unul din psihologii noștri."

Pentru întrebări despre platformă: "Îți pot explica orice despre platformă! Pentru [funcția específică], mergi la [locația exactă]. Iată ce poți face acolo: [beneficii concrete]. Vrei să te ghidez pas cu pas?"

Începe întotdeauna răspunsurile cu o salutare personalizată și arată că îți amintești contextul anterior al conversației.`;

    return basePrompt;
  }

  // Formatează cunoștințele despre platformă pentru system prompt
  private formatPlatformKnowledge(): string {
    let knowledge = "FUNCȚII PRINCIPALE:\n";

    PLATFORM_KNOWLEDGE.features.forEach((feature: any) => {
      knowledge += `• ${feature.name} (${feature.route}): ${feature.description}\n`;
      knowledge += `  Beneficii: ${feature.benefits.slice(0, 2).join(", ")}\n`;
      knowledge += `  Acces: ${feature.howToAccess}\n\n`;
    });

    knowledge += "\nSERVICII DISPONIBILE:\n";
    PLATFORM_KNOWLEDGE.services.forEach((category: any) => {
      knowledge += `• ${category.name}: ${category.description}\n`;
      category.services.forEach((service: any) => {
        knowledge += `  - ${service.name}: ${service.description} (${service.priceRange})\n`;
      });
      knowledge += "\n";
    });

    knowledge += "\nSPECIALIȘTI DISPONIBILI:\n";
    PLATFORM_KNOWLEDGE.specialists.forEach((specialist: any) => {
      knowledge += `• ${specialist.category}: ${specialist.description}\n`;
      knowledge += `  Consultă când: ${specialist.whenToConsult.slice(0, 2).join(", ")}\n\n`;
    });

    return knowledge;
  }

  // Formatează contextul de mentor pentru system prompt
  private formatMentorContext(context: MentorContext): string {
    return `
CONTEXTUL UTILIZATORULUI PE PLATFORMĂ:
- Nivel experiență: ${context.userLevel}
- Acțiuni completate: ${context.completedActions.join(", ") || "niciuna"}
- Obiective curente: ${context.currentGoals.join(", ") || "nespecificate"}
- Servicii folosite: ${context.platformUsage.servicesUsed.join(", ") || "niciunul"}
- Funcții explorate: ${context.platformUsage.featuresExplored.join(", ") || "niciuna"}
- Ultima activitate: ${context.platformUsage.lastActiveFeature || "necunoscută"}`;
  }

  // Încarcă configurația AI pentru utilizator
  async loadAIConfig(userId: string): Promise<EnhancedAIConfig> {
    try {
      const configDoc = await getDoc(doc(db, "userAIConfigs", userId));
      return configDoc.exists() ? (configDoc.data() as EnhancedAIConfig) : {};
    } catch (error) {
      console.error("Error loading AI config:", error);
      return {};
    }
  }

  // Salvează configurația AI pentru utilizator
  async saveAIConfig(userId: string, config: EnhancedAIConfig): Promise<void> {
    try {
      await setDoc(
        doc(db, "userAIConfigs", userId),
        {
          ...config,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving AI config:", error);
      throw error;
    }
  }

  // Încarcă contextul de mentor pentru utilizator
  async loadMentorContext(userId: string): Promise<MentorContext | undefined> {
    try {
      const contextDoc = await getDoc(doc(db, "mentorContexts", userId));
      return contextDoc.exists()
        ? (contextDoc.data() as MentorContext)
        : undefined;
    } catch (error) {
      console.error("Error loading mentor context:", error);
      return undefined;
    }
  }

  // Actualizează contextul de mentor
  async updateMentorContext(
    userId: string,
    updates: Partial<MentorContext>
  ): Promise<void> {
    try {
      await setDoc(
        doc(db, "mentorContexts", userId),
        {
          ...updates,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating mentor context:", error);
    }
  }

  // Încarcă istoricul conversațiilor
  async loadConversationHistory(userId: string): Promise<any[]> {
    try {
      const conversationsRef = collection(db, "aiConversations");
      const q = query(
        conversationsRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.conversationHistory.set(userId, conversations);
      return conversations;
    } catch (error) {
      console.error("Error loading conversation history:", error);
      return [];
    }
  }

  // Salvează conversația în istoric
  async saveConversation(
    userId: string,
    message: string,
    response: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, "aiConversations"), {
        userId,
        message,
        response,
        timestamp: new Date(),
        platform: "enhanced-mentor",
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  }

  // Funcția principală pentru chat cu AI mentor enhanced
  async chatWithEnhancedAI(
    userId: string,
    message: string,
    context?: {
      currentPage?: string;
      userActions?: string[];
      sessionData?: any;
    }
  ): Promise<AIResponse> {
    console.log("[EnhancedAI] Starting chatWithEnhancedAI for user:", userId);
    console.log("[EnhancedAI] Message:", message);
    console.log("[EnhancedAI] Context:", context);

    try {
      // Încarcă toate datele necesare
      const [config, mentorContext, conversationHistory] = await Promise.all([
        this.loadAIConfig(userId),
        this.loadMentorContext(userId),
        this.loadConversationHistory(userId),
      ]);

      // Analizează întrebarea pentru ghidare inteligentă
      const platformAnalysis = PlatformMentorAI.analyzeUserQuery(message);

      // Construiește system prompt-ul complet
      const systemPrompt = this.generateEnhancedSystemPrompt(
        userId,
        config,
        mentorContext
      );

      // Pregătește istoricul pentru context
      const recentHistory = conversationHistory
        .slice(0, 10)
        .map((conv: any) => [
          {
            role: "user" as const,
            content: conv.message,
          },
          {
            role: "assistant" as const,
            content: conv.response,
          },
        ])
        .flat();

      // Adaugă informații contextuale despre sesiunea curentă
      let enhancedMessage = message;
      if (context?.currentPage) {
        enhancedMessage += `\n\n[Context: Utilizatorul se află în prezent pe pagina: ${context.currentPage}]`;
      }
      if (context?.userActions?.length) {
        enhancedMessage += `\n[Acțiuni recente: ${context.userActions.join(", ")}]`;
      }

      // Adaugă ghidarea de platformă
      if (platformAnalysis.intent !== "general") {
        enhancedMessage += `\n\n[Analiza AI: Utilizatorul pare să aibă nevoie de ${platformAnalysis.intent}. Recomandări: ${platformAnalysis.recommendations.map((r: any) => r.name).join(", ")}]`;
      }

      // Apelul la OpenAI cu contextul complet
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...recentHistory,
          { role: "user", content: enhancedMessage },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse =
        completion.choices[0]?.message?.content ||
        "Îmi pare rău, nu am putut procesa întrebarea ta.";

      // Generează sugestii și acțiuni recomandate
      const suggestions = this.generateSmartSuggestions(
        message,
        platformAnalysis,
        config
      );
      const recommendedActions = platformAnalysis.quickActions;

      // Construiește răspunsul final
      const response: AIResponse = {
        content: aiResponse,
        suggestions,
        recommendedActions,
        platformGuidance: {
          relevantFeatures: platformAnalysis.recommendations.map(
            (r: any) => r.name
          ),
          nextSteps: platformAnalysis.quickActions,
          tips: PlatformMentorAI.getContextualTips(platformAnalysis.intent),
        },
      };

      // Salvează conversația
      await this.saveConversation(userId, message, aiResponse);

      // Actualizează contextul mentorului cu noi informații
      if (mentorContext) {
        await this.updateMentorContext(userId, {
          ...mentorContext,
          recentInteractions: [
            ...(mentorContext.recentInteractions || []),
            message,
          ].slice(-10),
          platformUsage: {
            ...mentorContext.platformUsage,
            lastActiveFeature:
              context?.currentPage ||
              mentorContext.platformUsage.lastActiveFeature,
          },
        });
      }

      return response;
    } catch (error) {
      console.error("Error in enhanced AI chat:", error);

      // Fallback cu ghidarea de platformă
      const fallbackAnalysis = PlatformMentorAI.analyzeUserQuery(message);

      return {
        content: `Îmi pare rău, am întâmpinat o problemă tehnică, dar îți pot oferi această ghidare: ${fallbackAnalysis.guidance}`,
        suggestions: [
          "Încearcă din nou întrebarea",
          "Verifică conexiunea la internet",
        ],
        recommendedActions: fallbackAnalysis.quickActions,
        platformGuidance: {
          relevantFeatures: fallbackAnalysis.recommendations.map(
            (r: any) => r.name
          ),
          nextSteps: fallbackAnalysis.quickActions,
          tips: [
            "Încearcă să reformulezi întrebarea",
            "Poți folosi meniul pentru navigare",
          ],
        },
      };
    }
  }

  // Generează sugestii inteligente bazate pe context
  private generateSmartSuggestions(
    _message: string,
    analysis: any,
    config: EnhancedAIConfig
  ): string[] {
    const baseSuggestions = [
      "Explică-mi mai multe despre această funcție",
      "Ce alte opțiuni am disponibile?",
      "Cum pot urmări progresul meu?",
      "Recomandă-mi ceva pentru obiectivele mele",
    ];

    // Sugestii personalizate bazate pe configurație
    const personalizedSuggestions = [];

    if (config.primaryGoals?.includes("anxiety_management")) {
      personalizedSuggestions.push(
        "Învață-mă tehnici de gestionare a anxietății"
      );
    }

    if (config.primaryGoals?.includes("physical_wellness")) {
      personalizedSuggestions.push("Creează-mi un plan de wellness fizic");
    }

    if (config.conversationStyle === "therapeutic") {
      personalizedSuggestions.push("Ajută-mă să înțeleg această emoție");
    }

    // Sugestii bazate pe analiza intenției
    if (analysis.intent === "emotional_support") {
      personalizedSuggestions.push(
        "Vreau să programez o sesiune cu un terapeut"
      );
    } else if (analysis.intent === "platform_guidance") {
      personalizedSuggestions.push("Fă-mi un tur ghidat al platformei");
    }

    return [...personalizedSuggestions, ...baseSuggestions].slice(0, 4);
  }

  // Funcție pentru inițializarea rapidă a unui utilizator nou
  async initializeNewUser(
    userId: string,
    basicInfo: Partial<EnhancedAIConfig>
  ): Promise<void> {
    const defaultConfig: EnhancedAIConfig = {
      preferredName: basicInfo.preferredName || "Prietene",
      conversationStyle: "casual",
      primaryGoals: ["general_wellness"],
      platformExperience: "beginner",
      preferredLanguage: "romanian",
      ...basicInfo,
    };

    const initialMentorContext: MentorContext = {
      userLevel: "beginner",
      completedActions: [],
      currentGoals: basicInfo.primaryGoals || ["explore_platform"],
      recentInteractions: [],
      platformUsage: {
        servicesUsed: [],
        featuresExplored: [],
        lastActiveFeature: "dashboard",
      },
    };

    await Promise.all([
      this.saveAIConfig(userId, defaultConfig),
      this.updateMentorContext(userId, initialMentorContext),
    ]);
  }

  // Obține recomandări pentru utilizator bazate pe profilul său
  async getPersonalizedRecommendations(userId: string): Promise<{
    dailyActions: string[];
    weeklyGoals: string[];
    suggestedFeatures: string[];
    motivationalMessage: string;
  }> {
    const [_config, mentorContext] = await Promise.all([
      this.loadAIConfig(userId),
      this.loadMentorContext(userId),
    ]);

    const userLevel = mentorContext?.userLevel || "beginner";
    const completedActions = mentorContext?.completedActions || [];

    const guidance = PlatformMentorAI.getPersonalizedGuidance(
      userLevel,
      completedActions
    );

    return {
      dailyActions: [
        "Verifică dashboard-ul pentru activități noi",
        "Ai o conversație de 5 minute cu AI-ul",
        "Citește un articol scurt din biblioteca noastră",
      ],
      weeklyGoals: guidance.nextRecommendations,
      suggestedFeatures: guidance.currentStep.actions,
      motivationalMessage: guidance.motivationalMessage,
    };
  }
}

// Export ca singleton
export const enhancedAIService = new EnhancedAIAssistantService();
export default enhancedAIService;
