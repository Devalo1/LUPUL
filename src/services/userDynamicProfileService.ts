// User Dynamic Profile Service - Colectează și analizează profilul utilizatorului din conversații
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { conversationService } from "./conversationService";
import { Conversation } from "../models/Conversation";

export interface UserDynamicProfile {
  userId: string;
  communicationStyle: {
    formality: "formal" | "informal" | "mixed";
    tone: "professional" | "friendly" | "casual" | "serious";
    responseLength: "short" | "medium" | "detailed";
  };
  topicsOfInterest: string[];
  problemSolvingApproach: {
    prefersStepByStep: boolean;
    likesExamples: boolean;
    needsExplanations: boolean;
  };
  personalityTraits: {
    patience: number; // 1-10
    curiosity: number; // 1-10
    directness: number; // 1-10
  };
  conversationPatterns: {
    averageSessionLength: number;
    preferredTimeOfDay: string;
    mostActiveTopics: string[];
  };
  learningPreferences: {
    visualLearner: boolean;
    practicalLearner: boolean;
    theoreticalLearner: boolean;
  };
  lastAnalyzed: Timestamp | Date;
  totalConversations: number;
  totalMessages: number;
}

export const userDynamicProfileService = {
  // Analizează toate conversațiile utilizatorului și creează/actualizează profilul dinamic
  async analyzeAndUpdateProfile(userId: string): Promise<UserDynamicProfile> {
    try {
      // Obține toate conversațiile utilizatorului
      const conversations =
        await conversationService.getUserConversations(userId);

      if (conversations.length === 0) {
        return this.createDefaultProfile(userId);
      }

      // Analizează conversațiile
      const profile = await this.analyzeConversations(userId, conversations);

      // Salvează profilul în Firestore
      await this.saveProfile(profile);

      return profile;
    } catch (error) {
      console.error("Eroare la analiza profilului utilizatorului:", error);
      return this.createDefaultProfile(userId);
    }
  },

  // Creează un profil implicit pentru utilizatori noi
  createDefaultProfile(userId: string): UserDynamicProfile {
    return {
      userId,
      communicationStyle: {
        formality: "mixed",
        tone: "friendly",
        responseLength: "medium",
      },
      topicsOfInterest: [],
      problemSolvingApproach: {
        prefersStepByStep: true,
        likesExamples: true,
        needsExplanations: true,
      },
      personalityTraits: {
        patience: 5,
        curiosity: 5,
        directness: 5,
      },
      conversationPatterns: {
        averageSessionLength: 0,
        preferredTimeOfDay: "unknown",
        mostActiveTopics: [],
      },
      learningPreferences: {
        visualLearner: false,
        practicalLearner: true,
        theoreticalLearner: false,
      },
      lastAnalyzed: Timestamp.now(),
      totalConversations: 0,
      totalMessages: 0,
    };
  },

  // Analizează conversațiile pentru a extrage profilul
  async analyzeConversations(
    userId: string,
    conversations: Conversation[]
  ): Promise<UserDynamicProfile> {
    const profile = this.createDefaultProfile(userId);
    let totalMessages = 0;
    let shortMessages = 0;
    let longMessages = 0;
    const topics: string[] = [];
    const timePatterns: number[] = [];

    // Analizează fiecare conversație
    conversations.forEach((conv) => {
      // Contorizează mesajele
      totalMessages += conv.messages.length;
      conv.messages.forEach((msg) => {
        if (msg.sender === "user") {
          // Analizează lungimea mesajelor
          if (msg.content.length < 50) shortMessages++;
          else if (msg.content.length > 200) longMessages++;

          // Extrage cuvinte cheie pentru subiecte
          const words = msg.content.toLowerCase().split(" ");
          topics.push(...words.filter((word) => word.length > 4));

          // Analizează timpul
          const msgTime =
            msg.timestamp instanceof Timestamp
              ? msg.timestamp.toDate()
              : msg.timestamp;
          timePatterns.push(msgTime.getHours());
        }
      });

      // Adaugă subiectul conversației
      topics.push(conv.subject.toLowerCase());
    });

    // Actualizează profilul bazat pe analiză
    profile.totalConversations = conversations.length;
    profile.totalMessages = totalMessages;

    // Determină stilul de comunicare
    if (shortMessages > longMessages) {
      profile.communicationStyle.responseLength = "short";
    } else if (longMessages > shortMessages) {
      profile.communicationStyle.responseLength = "detailed";
    }

    // Determină subiectele de interes
    const topicCounts = this.countTopics(topics);
    profile.topicsOfInterest = Object.keys(topicCounts)
      .sort((a, b) => topicCounts[b] - topicCounts[a])
      .slice(0, 10);

    // Determină timpul preferat
    if (timePatterns.length > 0) {
      const avgHour = Math.round(
        timePatterns.reduce((sum, hour) => sum + hour, 0) / timePatterns.length
      );

      if (avgHour >= 6 && avgHour < 12) {
        profile.conversationPatterns.preferredTimeOfDay = "morning";
      } else if (avgHour >= 12 && avgHour < 18) {
        profile.conversationPatterns.preferredTimeOfDay = "afternoon";
      } else if (avgHour >= 18 && avgHour < 22) {
        profile.conversationPatterns.preferredTimeOfDay = "evening";
      } else {
        profile.conversationPatterns.preferredTimeOfDay = "night";
      }
    }

    // Calculează lungimea medie a sesiunii
    profile.conversationPatterns.averageSessionLength =
      conversations.length > 0
        ? Math.round(totalMessages / conversations.length)
        : 0;

    // Estimează trăsăturile de personalitate bazate pe comportament
    profile.personalityTraits.patience = this.estimatePatience(conversations);
    profile.personalityTraits.curiosity = this.estimateCuriosity(topics);
    profile.personalityTraits.directness =
      this.estimateDirectness(conversations);

    profile.lastAnalyzed = Timestamp.now();

    return profile;
  },

  // Numără frecvența subiectelor
  countTopics(topics: string[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    topics.forEach((topic) => {
      if (topic.length > 3) {
        // Ignoră cuvintele foarte scurte
        counts[topic] = (counts[topic] || 0) + 1;
      }
    });
    return counts;
  },

  // Estimează răbdarea bazată pe lungimea conversațiilor
  estimatePatience(conversations: Conversation[]): number {
    const avgLength =
      conversations.reduce((sum, conv) => sum + conv.messages.length, 0) /
      conversations.length;
    return Math.min(10, Math.max(1, Math.round(avgLength / 2)));
  },

  // Estimează curiozitatea bazată pe diversitatea subiectelor
  estimateCuriosity(topics: string[]): number {
    const uniqueTopics = new Set(topics).size;
    return Math.min(10, Math.max(1, Math.round(uniqueTopics / 5)));
  },

  // Estimează directa bazată pe lungimea mesajelor
  estimateDirectness(conversations: Conversation[]): number {
    let totalLength = 0;
    let messageCount = 0;

    conversations.forEach((conv) => {
      conv.messages.forEach((msg) => {
        if (msg.sender === "user") {
          totalLength += msg.content.length;
          messageCount++;
        }
      });
    });

    const avgLength = messageCount > 0 ? totalLength / messageCount : 100;
    return avgLength < 50 ? 8 : avgLength > 200 ? 3 : 5;
  },

  // Salvează profilul în Firestore
  async saveProfile(profile: UserDynamicProfile): Promise<void> {
    const profileRef = doc(firestore, "userDynamicProfiles", profile.userId);
    await setDoc(profileRef, profile, { merge: true });
  },

  // Obține profilul utilizatorului
  async getUserProfile(userId: string): Promise<UserDynamicProfile | null> {
    try {
      const profileRef = doc(firestore, "userDynamicProfiles", userId);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        return profileDoc.data() as UserDynamicProfile;
      }

      // Dacă nu există profil, creează unul analizând conversațiile
      return await this.analyzeAndUpdateProfile(userId);
    } catch (error) {
      console.error("Eroare la obținerea profilului utilizatorului:", error);
      return this.createDefaultProfile(userId);
    }
  },

  // Generează un prompt personalizat pentru AI bazat pe profilul utilizatorului
  generatePersonalizedPrompt(profile: UserDynamicProfile): string {
    let prompt =
      "Îți vorbești cu un utilizator cu următoarele caracteristici:\n";

    // Stil de comunicare
    prompt += `- Stilul de comunicare preferat: ${profile.communicationStyle.tone}\n`;
    prompt += `- Preferă răspunsuri: ${profile.communicationStyle.responseLength}\n`;

    // Subiecte de interes
    if (profile.topicsOfInterest.length > 0) {
      prompt += `- Subiecte de interes: ${profile.topicsOfInterest.slice(0, 5).join(", ")}\n`;
    }

    // Abordarea problemelor
    if (profile.problemSolvingApproach.prefersStepByStep) {
      prompt += "- Preferă soluții pas cu pas\n";
    }
    if (profile.problemSolvingApproach.likesExamples) {
      prompt += "- Apreciază exemple practice\n";
    }
    if (profile.problemSolvingApproach.needsExplanations) {
      prompt += "- Are nevoie de explicații detaliate\n";
    }

    // Trăsături de personalitate
    if (profile.personalityTraits.patience < 4) {
      prompt += "- Utilizator impatient - fii concis și direct\n";
    } else if (profile.personalityTraits.patience > 7) {
      prompt += "- Utilizator răbdător - poți fi mai detaliat\n";
    }

    if (profile.personalityTraits.curiosity > 7) {
      prompt += "- Utilizator foarte curios - oferă informații suplimentare\n";
    }

    prompt +=
      "\nAdaptează-ți răspunsurile la aceste preferințe pentru o experiență personalizată.";

    return prompt;
  },
};
