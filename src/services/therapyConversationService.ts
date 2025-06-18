// Therapy Conversation Service for managing user therapy chat history
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { conversationTitleService } from "./conversationTitleService";

export interface TherapyMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date | Timestamp;
}

export interface TherapyConversation {
  id: string;
  userId: string;
  therapyType: "psihica" | "fizica" | "general";
  title?: string; // Auto-generated conversation title
  messages: TherapyMessage[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  aiName?: string; // Name of the AI assistant for this conversation
}

export const therapyConversationService = {
  // Start a new conversation
  async startConversation(
    userId: string,
    therapyType: "psihica" | "fizica" | "general",
    aiName?: string
  ): Promise<string> {
    try {
      console.log(
        `[TherapyService] Creare conversație nouă pentru userId: ${userId}, therapyType: ${therapyType}, aiName: ${aiName}`
      );

      const conversationData = {
        userId,
        therapyType,
        messages: [],
        aiName: aiName || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log(`[TherapyService] Date conversație:`, conversationData);

      const conversationRef = await addDoc(
        collection(firestore, "therapyConversations"),
        conversationData
      );

      console.log(
        `[TherapyService] Conversație ${therapyType} creată cu succes pentru utilizatorul ${userId} cu ID: ${conversationRef.id}`
      );
      return conversationRef.id;
    } catch (error) {
      console.error("[TherapyService] Eroare la crearea conversației:", error);
      console.error("[TherapyService] Detalii eroare:", {
        userId,
        therapyType,
        aiName,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
  // Add a message to an existing conversation
  async addMessage(
    conversationId: string,
    message: TherapyMessage
  ): Promise<void> {
    try {
      const conversationRef = doc(
        firestore,
        "therapyConversations",
        conversationId
      );
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      const conversationData = conversationDoc.data();
      const updatedMessages = [
        ...(conversationData.messages || []),
        {
          ...message,
          timestamp: Timestamp.now(),
        },
      ];

      // Generate title if it doesn't exist and we have enough messages
      let updateData: any = {
        messages: updatedMessages,
        updatedAt: Timestamp.now(),
      };

      // Generate title if not exists and we have at least 2 user messages
      if (!conversationData.title) {
        const userMessages = updatedMessages.filter(
          (msg) => msg.role === "user"
        );
        if (userMessages.length >= 1) {
          try {
            const title =
              await conversationTitleService.generateConversationTitle(
                updatedMessages.map((msg) => ({
                  role: msg.role,
                  content: msg.content,
                })),
                conversationData.therapyType
              );
            updateData.title = title;
            console.log(
              `Generated title for conversation ${conversationId}: "${title}"`
            );
          } catch (titleError) {
            console.error("Error generating conversation title:", titleError);
            // Use default title if generation fails
            updateData.title = conversationTitleService.getDefaultTitle(
              conversationData.therapyType
            );
          }
        }
      }

      await updateDoc(conversationRef, updateData);

      console.log(`Added message to conversation ${conversationId}`);
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }, // Get conversation history for a user
  async getUserConversations(
    userId: string,
    therapyType?: "psihica" | "fizica" | "general"
  ): Promise<TherapyConversation[]> {
    try {
      console.log(
        `[TherapyService] Căutare conversații pentru userId: ${userId}, therapyType: ${therapyType}`
      );

      // Folosim doar filtrarea pe userId pentru a evita probleme cu indexurile
      let q = query(
        collection(firestore, "therapyConversations"),
        where("userId", "==", userId),
        limit(50) // Limit to last 50 conversations
      );

      console.log(
        `[TherapyService] Query creat pentru căutarea conversațiilor`
      );
      console.log(
        `[TherapyService] Query creat pentru căutarea conversațiilor`
      );
      const querySnapshot = await getDocs(q);
      console.log(
        `[TherapyService] Query executat cu succes, rezultate: ${querySnapshot.size}`
      );

      const conversations: TherapyConversation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Filtrăm local pe therapyType dacă este specificat
        if (therapyType && data.therapyType !== therapyType) {
          return; // Skip această conversație
        }
        conversations.push({
          id: doc.id,
          userId: data.userId,
          therapyType: data.therapyType,
          title: data.title,
          messages: data.messages || [],
          aiName: data.aiName,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }); // Sortăm local după updatedAt desc
      conversations.sort((a, b) => {
        const aTime =
          a.updatedAt instanceof Timestamp
            ? a.updatedAt.seconds
            : a.updatedAt instanceof Date
              ? a.updatedAt.getTime() / 1000
              : 0;
        const bTime =
          b.updatedAt instanceof Timestamp
            ? b.updatedAt.seconds
            : b.updatedAt instanceof Date
              ? b.updatedAt.getTime() / 1000
              : 0;
        return bTime - aTime;
      });

      console.log(
        `[TherapyService] Returnat ${conversations.length} conversații pentru user ${userId}, therapyType: ${therapyType}`
      );
      return conversations;
    } catch (error) {
      console.error("Error getting user conversations:", error);
      throw error;
    }
  },

  // Get a specific conversation by ID
  async getConversation(
    conversationId: string
  ): Promise<TherapyConversation | null> {
    try {
      const conversationRef = doc(
        firestore,
        "therapyConversations",
        conversationId
      );
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        console.log(`Conversation ${conversationId} not found`);
        return null;
      }

      const data = conversationDoc.data();
      return {
        id: conversationDoc.id,
        userId: data.userId,
        therapyType: data.therapyType,
        title: data.title,
        messages: data.messages || [],
        aiName: data.aiName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error("Error getting conversation:", error);
      throw error;
    }
  }, // Get the most recent conversation for a user and therapy type
  async getLatestConversation(
    userId: string,
    therapyType: "psihica" | "fizica" | "general"
  ): Promise<TherapyConversation | null> {
    try {
      console.log(
        `[TherapyService] Căutare conversație pentru userId: ${userId}, therapyType: ${therapyType}`
      );

      // Folosim doar filtrarea pe userId pentru a evita probleme cu indexurile
      const q = query(
        collection(firestore, "therapyConversations"),
        where("userId", "==", userId),
        limit(50) // Luăm mai multe și filtrăm local
      );

      console.log(
        `[TherapyService] Executare query Firestore (fără index compozit)...`
      );
      const querySnapshot = await getDocs(q);
      console.log(
        `[TherapyService] Query rezultat: ${querySnapshot.size} documente găsite`
      );

      if (querySnapshot.empty) {
        console.log(`[TherapyService] Nu există conversații pentru ${userId}`);
        return null;
      }

      // Filtrăm local pe therapyType și sortăm după updatedAt
      const conversations: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.therapyType === therapyType) {
          conversations.push({
            id: doc.id,
            data: data,
            updatedAt: data.updatedAt,
          });
        }
      });

      if (conversations.length === 0) {
        console.log(
          `[TherapyService] Nu există conversații pentru ${userId} de tipul ${therapyType}`
        );
        return null;
      }

      // Sortăm după updatedAt desc
      conversations.sort((a, b) => {
        const aTime =
          a.updatedAt instanceof Timestamp
            ? a.updatedAt.seconds
            : a.updatedAt instanceof Date
              ? a.updatedAt.getTime() / 1000
              : 0;
        const bTime =
          b.updatedAt instanceof Timestamp
            ? b.updatedAt.seconds
            : b.updatedAt instanceof Date
              ? b.updatedAt.getTime() / 1000
              : 0;
        return bTime - aTime;
      });

      const latestConversation = conversations[0];
      const data = latestConversation.data;

      console.log(
        `[TherapyService] Conversație găsită: ${latestConversation.id} cu ${data.messages?.length || 0} mesaje`
      );
      return {
        id: latestConversation.id,
        userId: data.userId,
        therapyType: data.therapyType,
        title: data.title,
        messages: data.messages || [],
        aiName: data.aiName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error("[TherapyService] Eroare la căutarea conversației:", error);
      console.error("[TherapyService] Detalii eroare:", {
        userId,
        therapyType,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
};
