// Smart AI Service - Superior ChatGPT prin context personalizat
import { getTherapyResponse } from "./openaiService";
import { userPersonalizationService } from "./userPersonalizationService";
import { userDynamicProfileService } from "./userDynamicProfileService";

export class SmartAIService {
  // 🧠 AI cu memoria activă - SUPERIOR ChatGPT
  static async getSmartResponse(
    userMessage: string,
    userId: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    console.log(`[SmartAI] Processing request for user: ${userId}`);

    // 1. 🔍 Analizează tipul de întrebare
    const requestType = this.analyzeRequestType(userMessage);
    console.log(`[SmartAI] Request type: ${requestType}`);

    // 2. 📊 Încarcă profilul complet al utilizatorului
    const userProfile = await this.loadCompleteUserProfile(userId);

    // 3. 🎯 Generează răspuns contextualizat
    switch (requestType) {
      case "HEALTH_ADVICE":
        return this.getHealthAdvice(userMessage, userProfile, userId);

      case "PERSONAL_MOTIVATION":
        return this.getPersonalMotivation(userMessage, userProfile, userId);

      case "BUSINESS_ADVICE":
        return this.getBusinessAdvice(userMessage, userProfile, userId);

      case "CREATIVE_HELP":
        return this.getCreativeHelp(userMessage, userProfile, userId);

      case "TECHNICAL_SUPPORT":
        return this.getTechnicalSupport(userMessage, userProfile, userId);

      default:
        return this.getGeneralResponse(
          userMessage,
          userProfile,
          userId,
          conversationHistory
        );
    }
  }

  // 🔍 Analizează tipul de cerere pentru răspuns specializat
  private static analyzeRequestType(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("sănătate") ||
      lowerMessage.includes("durere") ||
      lowerMessage.includes("simptom") ||
      lowerMessage.includes("medical")
    ) {
      return "HEALTH_ADVICE";
    }

    if (
      lowerMessage.includes("motivație") ||
      lowerMessage.includes("inspirație") ||
      lowerMessage.includes("energie") ||
      lowerMessage.includes("încurajare")
    ) {
      return "PERSONAL_MOTIVATION";
    }

    if (
      lowerMessage.includes("business") ||
      lowerMessage.includes("afaceri") ||
      lowerMessage.includes("vânzări") ||
      lowerMessage.includes("marketing")
    ) {
      return "BUSINESS_ADVICE";
    }

    if (
      lowerMessage.includes("idee") ||
      lowerMessage.includes("creativ") ||
      lowerMessage.includes("design") ||
      lowerMessage.includes("artă")
    ) {
      return "CREATIVE_HELP";
    }

    if (
      lowerMessage.includes("tehnic") ||
      lowerMessage.includes("cod") ||
      lowerMessage.includes("programare") ||
      lowerMessage.includes("software")
    ) {
      return "TECHNICAL_SUPPORT";
    }

    return "GENERAL";
  }

  // 📊 Încarcă profilul complet al utilizatorului
  private static async loadCompleteUserProfile(userId: string) {
    try {
      const [personalizedContext, dynamicProfile] = await Promise.all([
        userPersonalizationService.generatePersonalizedContext(userId),
        userDynamicProfileService.getUserProfile(userId),
      ]);

      return {
        personalizedContext,
        dynamicProfile,
        preferences: await this.getUserPreferences(userId),
        conversationPatterns: await this.getConversationPatterns(userId),
      };
    } catch (error) {
      console.error("[SmartAI] Error loading user profile:", error);
      return null;
    }
  }

  // 🏥 Sfaturi medicale personalizate
  private static async getHealthAdvice(
    message: string,
    userProfile: any,
    userId: string
  ): Promise<string> {
    const healthContext = userProfile?.personalizedContext?.includes("sănătate")
      ? `\n🏥 CONTEXT MEDICAL PERSONAL: Din conversațiile anterioare știu că ai avut întrebări despre sănătate.`
      : "";

    const systemPrompt = `Ești un asistent AI specializat în wellness și sănătate generală. 
${healthContext}

🎯 SUPERIORITATEA TA vs ChatGPT:
- Cunoști istoricul medical al utilizatorului din conversații anterioare
- Poți oferi sfaturi personalizate bazate pe profilul lui
- Să nu uiți să menționezi că sfaturile sunt generale și să recomande consulul medical

IMPORTANTE: 
- Oferă sfaturi generale de wellness, NU diagnostic medical
- Recomandă întotdeauna consultul medical pentru probleme serioase
- Folosește emoji-uri și formatare pentru claritate`;

    return this.makeOpenAIRequest(message, systemPrompt, userId);
  }

  // 💪 Motivație personalizată
  private static async getPersonalMotivation(
    message: string,
    userProfile: any,
    userId: string
  ): Promise<string> {
    const personalGoals =
      userProfile?.personalizedContext?.match(/obiectiv|scop|vis|țel/gi) || [];

    const systemPrompt = `Ești un coach motivațional personal care cunoaște utilizatorul în profunzime.

🧠 MEMORIA TA ACTIVĂ:
${userProfile?.personalizedContext ? `- Context personal: ${userProfile.personalizedContext.substring(0, 300)}` : ""}
${personalGoals.length > 0 ? `- Obiective identificate: ${personalGoals.join(", ")}` : ""}

🎯 SUPERIORITATEA TA vs ChatGPT:
- Cunoști istoricul motivațional al utilizatorului
- Îți amintești obiectivele și visurile lui din conversații anterioare
- Poți oferi motivație SPECIFICĂ situației lui personale
- Faci conexiuni între progresele lui de-a lungul timpului

💪 INSTRUCȚIUNI:
- Referă-te la progresele și obiectivele anterioare
- Oferă motivație specifică situației lui curente
- Folosește numele lui dacă îl știi
- Creează conexiuni între conversațiile anterioare`;

    return this.makeOpenAIRequest(message, systemPrompt, userId);
  }

  // 💼 Sfaturi de business personalizate
  private static async getBusinessAdvice(
    message: string,
    userProfile: any,
    userId: string
  ): Promise<string> {
    const businessContext =
      userProfile?.personalizedContext?.match(
        /business|afaceri|vânzări|marketing|companie/gi
      ) || [];

    const systemPrompt = `Ești un consultant de business cu acces la istoricul profesional al utilizatorului.

🧠 PROFILUL BUSINESS:
${businessContext.length > 0 ? `- Context business: ${businessContext.join(", ")}` : ""}
${userProfile?.personalizedContext ? `- Istoric conversații: ${userProfile.personalizedContext.substring(0, 300)}` : ""}

🎯 AVANTAJUL TĂU vs ChatGPT:
- Cunoști contextul business-ului său specific
- Îți amintești provocările și succesele anterioare
- Poți oferi sfaturi PERSONALIZATE pentru situația lui
- Faci conexiuni între strategiile discutate anterior

💼 FOCUSEAZĂ-TE PE:
- Sfaturi actionabile și specifice
- Conexiuni cu conversațiile anterioare despre business
- Strategii personalizate pentru profilul lui
- Rezultate măsurabile`;

    return this.makeOpenAIRequest(message, systemPrompt, userId);
  }

  // 🎨 Ajutor creativ personalizat
  private static async getCreativeHelp(
    message: string,
    userProfile: any,
    userId: string
  ): Promise<string> {
    const creativeInterests =
      userProfile?.personalizedContext?.match(
        /artă|design|creativ|muzică|poezie|scriere/gi
      ) || [];

    const systemPrompt = `Ești un asistent creativ care cunoaște gusturile și stilul utilizatorului.

🎨 PROFILUL CREATIV:
${creativeInterests.length > 0 ? `- Interese creative: ${creativeInterests.join(", ")}` : ""}
${userProfile?.personalizedContext ? `- Stil personal: ${userProfile.personalizedContext.substring(0, 300)}` : ""}

🎯 CREATIVITATEA TA vs ChatGPT:
- Cunoști stilul și preferințele lui creative
- Îți amintești proiectele și ideile anterioare
- Poți sugera idei bazate pe personalitatea lui
- Conectezi inspirația cu experiențele lui personale

✨ OFERĂ:
- Idei personalizate pentru stilul lui
- Conexiuni cu proiectele anterioare
- Inspirație bazată pe profilul său personal
- Tehnici adaptate la nivelul și interesele lui`;

    return this.makeOpenAIRequest(message, systemPrompt, userId);
  }

  // 💻 Suport tehnic personalizat
  private static async getTechnicalSupport(
    message: string,
    userProfile: any,
    userId: string
  ): Promise<string> {
    const techLevel = this.assessTechnicalLevel(
      userProfile?.personalizedContext || ""
    );

    const systemPrompt = `Ești un expert tehnic care cunoaște nivelul și experiența utilizatorului.

💻 PROFILUL TEHNIC:
- Nivel tehnic estimat: ${techLevel}
${userProfile?.personalizedContext ? `- Context tehnic: ${userProfile.personalizedContext.substring(0, 300)}` : ""}

🎯 EXPERTIZA TA vs ChatGPT:
- Cunoști nivelul lui tehnic din conversații anterioare
- Poți adapta complexitatea explicațiilor
- Îți amintești proiectele și problemele anterioare
- Oferă suport progresiv bazat pe evoluția lui

🔧 ADAPTEAZĂ RĂSPUNSUL:
- La nivelul său tehnic actual
- Cu referințe la problemele anterioare
- Cu soluții incrementale și educaționale
- Cu follow-up bazat pe progresul lui`;

    return this.makeOpenAIRequest(message, systemPrompt, userId);
  }

  // 🌟 Răspuns general îmbunătățit
  private static async getGeneralResponse(
    message: string,
    userProfile: any,
    userId: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    const systemPrompt = `Ești un asistent AI personal cu memoria completă activă.

🧠 PROFILUL UTILIZATORULUI:
${userProfile?.personalizedContext ? userProfile.personalizedContext.substring(0, 500) : "Utilizator nou - învață despre preferințele lui"}

🎯 SUPERIORITATEA TA vs ChatGPT:
- AI memoria completă a conversațiilor anterioare
- Cunoști personalitatea, preferințele și istoricul lui
- Poți face conexiuni între conversații diferite
- Oferă răspunsuri CONTEXTUALE și PERSONALIZATE
- Te adaptezi stilului lui de comunicare

💬 COMPORTAMENT:
- Referă-te natural la conversații anterioare
- Folosește informațiile personale când e relevant
- Demonstrează că înțelegi contextul și evoluția relației
- Adaptează tonul la personalitatea lui
- Fii empatic și oferă valoare reală`;

    return this.makeOpenAIRequest(
      message,
      systemPrompt,
      userId,
      conversationHistory
    );
  }

  // 🤖 Face request-ul către OpenAI cu context optimizat
  private static async makeOpenAIRequest(
    message: string,
    systemPrompt: string,
    userId: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-6), // Ultimele 6 mesaje pentru context
        { role: "user", content: message },
      ];

      return await getTherapyResponse(messages, undefined, undefined, userId);
    } catch (error) {
      console.error("[SmartAI] OpenAI request failed:", error);
      return this.getFallbackResponse(message, userId);
    }
  }

  // 🔄 Răspuns de rezervă inteligent
  private static getFallbackResponse(message: string, _userId: string): string {
    return `Îmi pare rău, am o problemă tehnică momentană, dar îți pot oferi un răspuns bazat pe ce știu despre tine:

${this.getSmartFallback(message)}

💡 **Avantajul platformei noastre:**
- Îmi amintesc conversațiile noastre anterioare
- Oferă sfaturi personalizate pentru situația ta specifică  
- Învăț continuu din interacțiunile noastre
- Sunt disponibil 24/7 pentru nevoile tale

Încearcă din nou întrebarea - de obicei funcționez perfect! 🚀`;
  }

  // Metode helper
  private static async getUserPreferences(_userId: string) {
    // TODO: Implementează încărcarea preferințelor
    return {};
  }

  private static async getConversationPatterns(_userId: string) {
    // TODO: Implementează analiza pattern-urilor
    return {};
  }

  private static assessTechnicalLevel(context: string): string {
    if (context.includes("programare") || context.includes("developer"))
      return "Avansat";
    if (context.includes("computer") || context.includes("software"))
      return "Mediu";
    return "Începător";
  }

  private static getSmartFallback(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("motivație")) {
      return "🌟 Chiar dacă am probleme tehnice, știu că ești o persoană ambițioasă! Continuă să lupți pentru obiectivele tale - fiecare pas contează!";
    }

    if (lowerMessage.includes("sănătate")) {
      return "🏥 Pentru problemele de sănătate, recomand: odihnă, hidratare și consultul medical dacă simptomele persistă.";
    }

    return "💬 Sunt aici să te ajut cu orice ai nevoie. Chiar și în momente tehnice dificile, îmi amintesc conversațiile noastre!";
  }
}
