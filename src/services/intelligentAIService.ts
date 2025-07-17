import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import {
  AIAssistant,
  ConversationContext,
  ConversationEntry,
  ConversationIntent,
  ExtractedEntity,
  SentimentAnalysis,
  CapabilityType,
  IntentType,
  EntityType,
  EmotionType,
  UserFeedback,
  MemoryEntry,
  MemoryCategory,
} from "../models/AIAssistant";
import { medicineService } from "./medicineService";
import { Medicine } from "../models/Medicine";
import logger from "../utils/logger";

const COLLECTIONS = {
  AI_ASSISTANTS: "aiAssistants",
  CONVERSATIONS: "conversations",
  CONVERSATION_ENTRIES: "conversationEntries",
  USER_FEEDBACK: "userFeedback",
  LEARNING_DATA: "learningData",
};

export class IntelligentAIService {
  private assistantId: string;
  private currentContext: ConversationContext | null = null;

  constructor(assistantId: string = "main_assistant") {
    this.assistantId = assistantId;
  }

  // ===== ASSISTANT INITIALIZATION =====

  async initializeAssistant(): Promise<void> {
    try {
      const assistant = await this.getAssistant();
      if (!assistant) {
        await this.createDefaultAssistant();
        logger.info("Default AI Assistant created");
      }
    } catch (error) {
      logger.error("Error initializing assistant:", error);
      throw error;
    }
  }

  private async createDefaultAssistant(): Promise<void> {
    const defaultAssistant: Omit<AIAssistant, "id"> = {
      name: "Dr. Lupul - Asistent Medical Inteligent",
      version: "1.0.0",
      capabilities: [
        {
          type: CapabilityType.MEDICAL_CONSULTATION,
          description: "Consultații medicale virtuale cu analiză de simptome",
          proficiencyLevel: 5,
          enabled: true,
        },
        {
          type: CapabilityType.MEDICATION_ADVICE,
          description: "Sfaturi despre medicamente și interacțiuni",
          proficiencyLevel: 5,
          enabled: true,
        },
        {
          type: CapabilityType.SYMPTOM_ANALYSIS,
          description: "Analiză inteligentă a simptomelor",
          proficiencyLevel: 4,
          enabled: true,
        },
        {
          type: CapabilityType.GENERAL_CONVERSATION,
          description: "Conversații generale și suport emoțional",
          proficiencyLevel: 5,
          enabled: true,
        },
        {
          type: CapabilityType.EMERGENCY_GUIDANCE,
          description: "Ghidare în situații de urgență",
          proficiencyLevel: 4,
          enabled: true,
        },
        {
          type: CapabilityType.LIFESTYLE_ADVICE,
          description: "Sfaturi pentru un stil de viață sănătos",
          proficiencyLevel: 4,
          enabled: true,
        },
      ],
      knowledgeDomains: [
        {
          domain: "Medicină Generală",
          subDomains: ["Diagnostic", "Tratament", "Prevenție"],
          expertiseLevel: 5,
          lastUpdated: Timestamp.now(),
          sources: [
            {
              type: "medical_database",
              name: "Romanian Medical Database",
              credibility: 95,
              lastVerified: Timestamp.now(),
            },
          ],
          confidence: 90,
        },
        {
          domain: "Farmacologie",
          subDomains: ["Medicamente", "Interacțiuni", "Dozare"],
          expertiseLevel: 5,
          lastUpdated: Timestamp.now(),
          sources: [
            {
              type: "medical_database",
              name: "Drug Interaction Database",
              credibility: 98,
              lastVerified: Timestamp.now(),
            },
          ],
          confidence: 95,
        },
      ],
      personalityTraits: [
        {
          trait: "empathetic" as any,
          intensity: 5,
          description: "Foarte empatic și înțelegător",
          manifestation: [
            "Ascultă cu atenție",
            "Oferă suport emoțional",
            "Validează sentimentele",
          ],
        },
        {
          trait: "professional" as any,
          intensity: 5,
          description: "Menține un nivel profesional înalt",
          manifestation: [
            "Informații precise",
            "Terminologie medicală corectă",
            "Recomandări bazate pe evidențe",
          ],
        },
        {
          trait: "cautious" as any,
          intensity: 4,
          description: "Prudent în recomandări medicale",
          manifestation: [
            "Recomandă consultarea medicului",
            "Avertizează despre riscuri",
            "Nu înlocuiește consultul medical",
          ],
        },
      ],
      conversationContext: {} as ConversationContext,
      learningData: {
        userFeedback: [],
        performanceMetrics: {
          averageResponseTime: 2000,
          accuracyRate: 92,
          userSatisfactionScore: 4.5,
          resolutionRate: 85,
          escalationRate: 8,
          retentionRate: 78,
          engagementLevel: 87,
          lastCalculated: Timestamp.now(),
        },
        adaptationRules: [],
        continuousLearning: {
          newKnowledgeAcquired: [],
          behavioralPatterns: [],
          optimizationPoints: [],
          modelVersions: [],
        },
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await addDoc(collection(firestore, COLLECTIONS.AI_ASSISTANTS), {
      ...defaultAssistant,
      id: this.assistantId,
    });
  }

  private async getAssistant(): Promise<AIAssistant | null> {
    try {
      const q = query(
        collection(firestore, COLLECTIONS.AI_ASSISTANTS),
        where("id", "==", this.assistantId)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as AIAssistant;
      }
      return null;
    } catch (error) {
      logger.error("Error getting assistant:", error);
      return null;
    }
  }

  // ===== CONVERSATION MANAGEMENT =====

  async startConversation(userId: string): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.currentContext = {
        userId,
        sessionId,
        conversationHistory: [],
        currentTopic: "general",
        userPreferences: {
          communicationStyle: "casual",
          responseLength: "detailed",
          languagePreference: "ro",
          explanationLevel: "intermediate",
          emotionalSupport: true,
          urgencyThreshold: "medium",
          reminderFrequency: "weekly",
        },
        contextualMemory: {
          shortTermMemory: [],
          longTermMemory: [],
          userProfile: {
            communicationPatterns: [],
            preferredTopics: [],
            avoidedTopics: [],
            knowledgeLevel: {},
            interactionHistory: {
              totalConversations: 0,
              averageSessionLength: 0,
              mostActiveTimeOfDay: "evening",
              preferredCapabilities: [CapabilityType.GENERAL_CONVERSATION],
              satisfactionRating: 0,
              lastInteraction: Timestamp.now(),
            },
            personalMilestones: [],
          },
          conversationPatterns: [],
          learningPoints: [],
        },
        activeCapabilities: [
          CapabilityType.GENERAL_CONVERSATION,
          CapabilityType.MEDICAL_CONSULTATION,
          CapabilityType.MEDICATION_ADVICE,
        ],
      };

      await this.saveConversationContext();
      return sessionId;
    } catch (error) {
      logger.error("Error starting conversation:", error);
      throw error;
    }
  }

  async processMessage(
    userId: string,
    message: string,
    sessionId?: string
  ): Promise<string> {
    try {
      if (!this.currentContext || this.currentContext.sessionId !== sessionId) {
        await this.loadConversationContext(userId, sessionId);
      }

      // Analizează mesajul utilizatorului
      const analysis = await this.analyzeMessage(message);

      // Adaugă mesajul în istoric
      const userEntry: ConversationEntry = {
        id: `entry_${Date.now()}_user`,
        timestamp: Timestamp.now(),
        speaker: "user",
        message,
        intent: analysis.intent,
        entities: analysis.entities,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
      };

      this.currentContext!.conversationHistory.push(userEntry);

      // Generează răspunsul AI
      const response = await this.generateResponse(analysis);

      // Adaugă răspunsul în istoric
      const aiEntry: ConversationEntry = {
        id: `entry_${Date.now()}_ai`,
        timestamp: Timestamp.now(),
        speaker: "ai",
        message: response.text,
        intent: {
          primary: IntentType.QUESTION, // This should be response type
          confidence: response.confidence,
          parameters: {},
        },
        entities: [],
        sentiment: {
          polarity: "positive",
          intensity: 0.8,
          emotions: [{ emotion: EmotionType.HOPE, intensity: 0.7 }],
          confidence: 0.9,
        },
        confidence: response.confidence,
        responseTime: response.responseTime,
      };

      this.currentContext!.conversationHistory.push(aiEntry);

      // Actualizează memoria contextuală
      await this.updateContextualMemory(analysis, response);

      // Salvează contextul
      await this.saveConversationContext();

      return response.text;
    } catch (error) {
      logger.error("Error processing message:", error);
      return "Îmi pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou.";
    }
  }

  // ===== MESSAGE ANALYSIS =====

  private async analyzeMessage(message: string): Promise<{
    intent: ConversationIntent;
    entities: ExtractedEntity[];
    sentiment: SentimentAnalysis;
    confidence: number;
  }> {
    const messageText = message.toLowerCase();

    // Analiză intent simplistă
    let primaryIntent = IntentType.QUESTION;
    const parameters: Record<string, any> = {};

    if (messageText.includes("salut") || messageText.includes("bună")) {
      primaryIntent = IntentType.GREETING;
    } else if (
      messageText.includes("mă doare") ||
      messageText.includes("am dureri")
    ) {
      primaryIntent = IntentType.SYMPTOM_REPORT;
    } else if (
      messageText.includes("medicament") ||
      messageText.includes("pastil")
    ) {
      primaryIntent = IntentType.MEDICATION_INQUIRY;
    } else if (
      messageText.includes("urgență") ||
      messageText.includes("urgent")
    ) {
      primaryIntent = IntentType.EMERGENCY;
    } else if (
      messageText.includes("programare") ||
      messageText.includes("consultație")
    ) {
      primaryIntent = IntentType.APPOINTMENT_REQUEST;
    }

    // Extragere entități simple
    const entities: ExtractedEntity[] = [];

    // Simptome comune
    const symptoms = [
      "durere de cap",
      "febră",
      "tuse",
      "durere de gât",
      "greață",
      "amețeală",
    ];
    symptoms.forEach((symptom) => {
      if (messageText.includes(symptom)) {
        entities.push({
          type: EntityType.SYMPTOM,
          value: symptom,
          confidence: 0.9,
          startIndex: messageText.indexOf(symptom),
          endIndex: messageText.indexOf(symptom) + symptom.length,
        });
      }
    });

    // Analiză sentiment simplă
    const sentiment: SentimentAnalysis = {
      polarity: "neutral",
      intensity: 0.5,
      emotions: [],
      confidence: 0.8,
    };

    if (
      messageText.includes("rău") ||
      messageText.includes("durere") ||
      messageText.includes("problemă")
    ) {
      sentiment.polarity = "negative";
      sentiment.emotions.push({ emotion: EmotionType.SADNESS, intensity: 0.6 });
    } else if (
      messageText.includes("bine") ||
      messageText.includes("mulțumesc") ||
      messageText.includes("excelent")
    ) {
      sentiment.polarity = "positive";
      sentiment.emotions.push({ emotion: EmotionType.JOY, intensity: 0.7 });
    }

    return {
      intent: {
        primary: primaryIntent,
        confidence: 0.85,
        parameters,
      },
      entities,
      sentiment,
      confidence: 0.82,
    };
  }

  // ===== RESPONSE GENERATION =====

  private async generateResponse(analysis: {
    intent: ConversationIntent;
    entities: ExtractedEntity[];
    sentiment: SentimentAnalysis;
    confidence: number;
  }): Promise<{
    text: string;
    confidence: number;
    responseTime: number;
    suggestions?: string[];
  }> {
    const startTime = Date.now();
    let response = "";
    const suggestions: string[] = [];

    try {
      switch (analysis.intent.primary) {
        case IntentType.GREETING:
          response = await this.generateGreetingResponse();
          break;

        case IntentType.SYMPTOM_REPORT:
          response = await this.generateSymptomResponse(analysis.entities);
          suggestions.push(
            "Vrei să afli despre medicamente pentru aceste simptome?"
          );
          suggestions.push("Să programez o consultație cu un medic?");
          break;

        case IntentType.MEDICATION_INQUIRY:
          response = await this.generateMedicationResponse(analysis.entities);
          suggestions.push(
            "Vrei să verific interacțiunile cu alte medicamente?"
          );
          break;

        case IntentType.EMERGENCY:
          response = await this.generateEmergencyResponse();
          break;

        case IntentType.APPOINTMENT_REQUEST:
          response = await this.generateAppointmentResponse();
          break;

        default:
          response = await this.generateGeneralResponse(analysis);
          break;
      }

      // Adaptează răspunsul la preferințele utilizatorului
      if (this.currentContext?.userPreferences) {
        response = this.adaptResponseToPreferences(
          response,
          this.currentContext.userPreferences
        );
      }
    } catch (error) {
      logger.error("Error generating response:", error);
      response =
        "Îmi pare rău, am întâmpinat o dificultate în procesarea solicitării tale. Poți să reformulezi întrebarea?";
    }

    const responseTime = Date.now() - startTime;

    return {
      text: response,
      confidence: 0.87,
      responseTime,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  private async generateGreetingResponse(): Promise<string> {
    const greetings = [
      "Salut! Sunt Dr. Lupul, asistentul tău medical inteligent. Cu ce te pot ajuta astăzi?",
      "Bună ziua! Mă bucur să te văd din nou. Ce te preocupă astăzi din punct de vedere medical?",
      "Salut! Sunt aici să te ajut cu întrebări medicale și să îți ofer sfaturi pentru sănătate. Cum te simți astăzi?",
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private async generateSymptomResponse(
    entities: ExtractedEntity[]
  ): Promise<string> {
    const symptoms = entities
      .filter((e) => e.type === EntityType.SYMPTOM)
      .map((e) => e.value);

    if (symptoms.length === 0) {
      return "Înțeleg că nu te simți bine. Poți să îmi descrii mai detaliat simptomele pe care le ai?";
    }

    let response = `Înțeleg că ai următoarele simptome: ${symptoms.join(", ")}. `;

    // Analiza riscului bazată pe simptome
    const highRiskSymptoms = [
      "durere în piept",
      "dificultăți de respirație",
      "durere de cap severă",
    ];
    const hasHighRisk = symptoms.some((symptom) =>
      highRiskSymptoms.some((risk) => symptom.includes(risk))
    );

    if (hasHighRisk) {
      response +=
        "Aceste simptome pot indica o situație care necesită atenție medicală urgentă. Te sfătuiesc să contactezi imediat un medic sau să mergi la cea mai apropiată unitate medicală.";
    } else {
      response += "În general, aceste simptome pot avea diverse cauze. ";

      // Oferă sfaturi generale bazate pe simptome
      if (symptoms.some((s) => s.includes("durere de cap"))) {
        response +=
          "Pentru durerea de cap, poți încerca să te odihnești într-un loc liniștit și să bei suficientă apă. ";
      }

      if (symptoms.some((s) => s.includes("febră"))) {
        response +=
          "Pentru febră, este important să te hidratezi și să te odihnești. ";
      }

      response +=
        "Dacă simptomele persistă sau se agravează, te sfătuiesc să consulți un medic.";
    }

    return response;
  }

  private async generateMedicationResponse(
    entities: ExtractedEntity[]
  ): Promise<string> {
    try {
      // Încearcă să identifice medicamentele menționate
      const message = entities.map((e) => e.value).join(" ");
      const medicines = await medicineService.searchMedicines(message);

      if (medicines.length > 0) {
        const medicine = medicines[0];
        return (
          `Despre ${medicine.name}: Acesta este un ${medicine.category} care conține ${medicine.activeSubstance}. ` +
          `Se folosește pentru: ${medicine.indications.join(", ")}. ` +
          `Dozajul recomandat pentru adulți: ${medicine.dosage.adults}. ` +
          `${medicine.prescription ? "Necesită prescripție medicală." : "Este disponibil fără prescripție."} ` +
          `Te sfătuiesc să consulți un farmacist sau medic înainte de administrare.`
        );
      } else {
        return (
          "Nu am găsit informații specifice despre medicamentul menționat. " +
          "Te sfătuiesc să consulți un farmacist sau să verifici prospectul medicamentului. " +
          "Pot să te ajut cu informații despre alte medicamente sau simptome?"
        );
      }
    } catch (error) {
      return (
        "Momentan nu pot accesa baza de date cu medicamente. " +
        "Pentru informații sigure despre medicamente, te sfătuiesc să consulți un farmacist sau medicul de familie."
      );
    }
  }

  private async generateEmergencyResponse(): Promise<string> {
    return (
      "⚠️ ATENȚIE: Dacă te afli într-o situație de urgență medicală, te rog să contactezi imediat:\n\n" +
      "🚨 112 - Serviciul de Urgență\n" +
      "🏥 Cea mai apropiată unitate de primiri urgențe\n\n" +
      "Nu întârzia să cauți ajutor medical profesional în situații de urgență. " +
      "Sunt aici să te ajut cu întrebări generale medicale, dar nu pot înlocui îngrijirea medicală de urgență."
    );
  }

  private async generateAppointmentResponse(): Promise<string> {
    return (
      "Pentru programarea unei consultații medicale, îți recomand să:\n\n" +
      "📞 Contactezi direct cabinetul medical dorit\n" +
      "💻 Folosești platformele online de programări (ex: DocBook, Medicul.ro)\n" +
      "🏥 Te adresezi centrului medical local\n\n" +
      "Pot să te ajut să identifici ce tip de specialist ai nevoie să consulți, " +
      "bazându-mă pe simptomele sau preocupările pe care le ai."
    );
  }

  private async generateGeneralResponse(analysis: any): Promise<string> {
    // Răspuns general inteligent
    if (analysis.sentiment.polarity === "negative") {
      return (
        "Înțeleg că poate treci printr-o perioadă dificilă. Sunt aici să te ajut și să te sprijin. " +
        "Poți să îmi spui mai multe despre ceea ce te preocupă?"
      );
    } else if (analysis.sentiment.polarity === "positive") {
      return (
        "Mă bucur să aud că te simți bine! Sunt aici dacă ai nevoie de sfaturi pentru menținerea sănătății " +
        "sau dacă ai întrebări medicale."
      );
    } else {
      return (
        "Sunt aici să te ajut cu întrebări medicale, sfaturi despre sănătate sau pur și simplu să vorbim. " +
        "Cu ce te pot ajuta astăzi?"
      );
    }
  }

  private adaptResponseToPreferences(
    response: string,
    preferences: any
  ): string {
    // Adaptează stilul de comunicare
    if (preferences.communicationStyle === "formal") {
      response = response.replace(/salut/gi, "Bună ziua");
      response = response.replace(/te /gi, "vă ");
      response = response.replace(/tu /gi, "dumneavoastră ");
    }

    // Adaptează lungimea răspunsului
    if (preferences.responseLength === "brief") {
      // Prescurtează răspunsul la prima propoziție principală
      const sentences = response.split(". ");
      response = sentences[0] + (sentences.length > 1 ? "." : "");
    }

    return response;
  }

  // ===== CONTEXT MANAGEMENT =====

  private async saveConversationContext(): Promise<void> {
    try {
      if (!this.currentContext) return;

      const contextData = {
        ...this.currentContext,
        lastUpdated: Timestamp.now(),
      };

      await addDoc(
        collection(firestore, COLLECTIONS.CONVERSATIONS),
        contextData
      );
    } catch (error) {
      logger.error("Error saving conversation context:", error);
    }
  }

  private async loadConversationContext(
    userId: string,
    sessionId?: string
  ): Promise<void> {
    try {
      if (sessionId) {
        const q = query(
          collection(firestore, COLLECTIONS.CONVERSATIONS),
          where("sessionId", "==", sessionId),
          where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          this.currentContext =
            querySnapshot.docs[0].data() as ConversationContext;
          return;
        }
      }

      // Dacă nu găsește contextul sau nu e specificat sessionId, creează unul nou
      await this.startConversation(userId);
    } catch (error) {
      logger.error("Error loading conversation context:", error);
      await this.startConversation(userId);
    }
  }

  private async updateContextualMemory(
    analysis: any,
    _response: any
  ): Promise<void> {
    if (!this.currentContext) return;

    // Adaugă în memoria pe termen scurt
    const memoryEntry: MemoryEntry = {
      id: `memory_${Date.now()}`,
      content: `User expressed ${analysis.intent.primary} with sentiment ${analysis.sentiment.polarity}`,
      category: MemoryCategory.CONVERSATION_CONTEXT,
      importance: 3,
      timestamp: Timestamp.now(),
      associatedEntities: analysis.entities.map(
        (e: ExtractedEntity) => e.value
      ),
      contextTags: [analysis.intent.primary, analysis.sentiment.polarity],
    };

    this.currentContext.contextualMemory.shortTermMemory.push(memoryEntry);

    // Limitează memoria pe termen scurt la ultimele 20 de intrări
    if (this.currentContext.contextualMemory.shortTermMemory.length > 20) {
      this.currentContext.contextualMemory.shortTermMemory =
        this.currentContext.contextualMemory.shortTermMemory.slice(-20);
    }
  }

  // ===== LEARNING AND FEEDBACK =====

  async submitFeedback(
    userId: string,
    conversationId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    category: string,
    comment?: string
  ): Promise<void> {
    try {
      const feedback: UserFeedback = {
        id: `feedback_${Date.now()}`,
        conversationId,
        rating,
        category: category as any,
        comment,
        timestamp: Timestamp.now(),
        improvementSuggestions: comment ? [comment] : undefined,
      };

      await addDoc(collection(firestore, COLLECTIONS.USER_FEEDBACK), {
        ...feedback,
        userId,
      });

      logger.info(
        `Feedback submitted: ${rating}/5 for conversation ${conversationId}`
      );
    } catch (error) {
      logger.error("Error submitting feedback:", error);
      throw error;
    }
  }

  async getPerformanceMetrics(): Promise<any> {
    try {
      const assistant = await this.getAssistant();
      return assistant?.learningData.performanceMetrics || null;
    } catch (error) {
      logger.error("Error getting performance metrics:", error);
      return null;
    }
  }

  // ===== MEDICAL INTEGRATION =====

  async analyzeSymptoms(
    symptoms: string[],
    userId: string
  ): Promise<{
    recommendations: Medicine[];
    riskLevel: string;
    suggestedActions: string[];
  }> {
    try {
      // Obține profilul medical al utilizatorului
      const userProfile = await medicineService.getUserMedicalProfile(userId);

      if (!userProfile) {
        return {
          recommendations: [],
          riskLevel: "unknown",
          suggestedActions: [
            "Creează un profil medical pentru recomandări personalizate",
          ],
        };
      }

      // Generează recomandări de medicamente
      const recommendations =
        await medicineService.generateMedicineRecommendations(
          symptoms,
          userProfile
        );

      // Evaluează nivelul de risc
      const riskLevel = this.evaluateRiskLevel(symptoms);

      // Sugerează acțiuni
      const suggestedActions = this.generateSuggestedActions(
        symptoms,
        riskLevel
      );

      return {
        recommendations,
        riskLevel,
        suggestedActions,
      };
    } catch (error) {
      logger.error("Error analyzing symptoms:", error);
      throw error;
    }
  }

  private evaluateRiskLevel(symptoms: string[]): string {
    const highRiskSymptoms = [
      "durere în piept",
      "dificultăți de respirație",
      "durere de cap severă",
      "convulsii",
      "pierdere de cunoștință",
      "sângerare abundentă",
    ];

    const mediumRiskSymptoms = [
      "febră peste 39°C",
      "durere abdominală severă",
      "voma persistentă",
    ];

    if (
      symptoms.some((symptom) =>
        highRiskSymptoms.some((risk) => symptom.toLowerCase().includes(risk))
      )
    ) {
      return "high";
    } else if (
      symptoms.some((symptom) =>
        mediumRiskSymptoms.some((risk) => symptom.toLowerCase().includes(risk))
      )
    ) {
      return "medium";
    } else {
      return "low";
    }
  }

  private generateSuggestedActions(
    _symptoms: string[],
    riskLevel: string
  ): string[] {
    const actions: string[] = [];

    switch (riskLevel) {
      case "high":
        actions.push("Contactează imediat serviciul de urgență 112");
        actions.push("Mergi la cea mai apropiată unitate de primiri urgențe");
        break;
      case "medium":
        actions.push(
          "Programează o consultație medicală în următoarele 24 de ore"
        );
        actions.push(
          "Monitorizează simptomele și contactează medicul dacă se agravează"
        );
        break;
      case "low":
        actions.push("Odihnește-te și hidratează-te corespunzător");
        actions.push(
          "Dacă simptomele persistă mai mult de 2-3 zile, consultă un medic"
        );
        break;
    }

    return actions;
  }
}

export const intelligentAIService = new IntelligentAIService();
