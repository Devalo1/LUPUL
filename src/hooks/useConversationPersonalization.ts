// Serviciu pentru integrarea personalizării AI cu contextul de conversații existente
import { useConversations } from "./useConversations";
import { userPersonalizationService } from "../services/userPersonalizationService";
import { useAuth } from "../contexts/AuthContext";
import { useCallback } from "react";

// Hook pentru integrarea cu contextul de conversații
export const useConversationPersonalization = () => {
  const { user } = useAuth();
  const { conversations, activeConversation, addMessage } = useConversations();

  // Actualizează profilul după fiecare mesaj nou
  const enhancedAddMessage = useCallback(
    async (message: any) => {
      // Adaugă mesajul normal
      await addMessage(message);

      // Actualizează profilul în background dacă este un mesaj de la utilizator
      if (message.sender === "user" && activeConversation && user?.uid) {
        try {
          await userPersonalizationService.updateProfileAfterConversation(
            user.uid,
            activeConversation.id
          );
        } catch (error) {
          console.error("Eroare la actualizarea profilului după mesaj:", error);
        }
      }
    },
    [addMessage, activeConversation, user?.uid]
  );

  // Obține contextul personalizat pentru AI
  const getPersonalizedPrompt = useCallback(async (): Promise<string> => {
    if (!user?.uid) return "";

    try {
      return await userPersonalizationService.generatePersonalizedContext(
        user.uid
      );
    } catch (error) {
      console.error("Eroare la generarea contextului personalizat:", error);
      return "";
    }
  }, [user?.uid]);

  // Analizează toate conversațiile utilizatorului
  const analyzeUserConversations = useCallback(async () => {
    if (!user?.uid) return null;

    try {
      return await userPersonalizationService.analyzeAndUpdateUserProfile(
        user.uid
      );
    } catch (error) {
      console.error("Eroare la analizarea conversațiilor:", error);
      return null;
    }
  }, [user?.uid]);

  return {
    enhancedAddMessage,
    getPersonalizedPrompt,
    analyzeUserConversations,
    hasConversations: conversations.length > 0,
  };
};

// Serviciu pentru integrarea personalizării cu API-ul de chat
export const enhancedChatService = {
  // Trimite mesaj cu context personalizat
  async sendMessageWithPersonalization(
    prompt: string,
    assistantName: string,
    addressMode: string,
    userId?: string,
    conversationHistory?: any[]
  ) {
    try {
      // Obține contextul personalizat
      let personalizedContext = "";
      if (userId) {
        personalizedContext =
          await userPersonalizationService.generatePersonalizedContext(userId);
      }

      // Trimite cererea la API cu contextul personalizat
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          assistantName,
          addressMode,
          personalizedContext,
          conversationHistory: conversationHistory?.slice(-10), // Ultimele 10 mesaje pentru context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error("Eroare la trimiterea mesajului personalizat:", error);
      throw error;
    }
  },

  // Verifică dacă utilizatorul are un profil de personalizare
  async hasPersonalizationProfile(userId: string): Promise<boolean> {
    try {
      const profile = await userPersonalizationService.getUserProfile(userId);
      return profile !== null;
    } catch (error) {
      console.error("Eroare la verificarea profilului:", error);
      return false;
    }
  },

  // Obține statistici despre personalizare
  async getPersonalizationStats(userId: string) {
    try {
      const profile = await userPersonalizationService.getUserProfile(userId);
      if (!profile) return null;

      return {
        totalConversations: profile.totalConversations,
        totalMessages: profile.totalMessages,
        mainInterests: profile.interests.topics.slice(0, 3),
        communicationStyle: profile.communicationStyle.preferredTone,
        experienceLevel:
          profile.totalMessages > 100
            ? "expert"
            : profile.totalMessages > 50
              ? "intermediate"
              : "beginner",
        lastUpdated: profile.updatedAt,
      };
    } catch (error) {
      console.error("Eroare la obținerea statisticilor:", error);
      return null;
    }
  },
};
