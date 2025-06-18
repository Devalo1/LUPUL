// Conversation Manager Service - Gestionează conversațiile cu titluri automate și istoric
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs, 
  Timestamp
} from "firebase/firestore";
import { firestore } from "../firebase";

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Timestamp | Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string; // Titlu generat automat
  aiType: "psihica" | "fizica" | "general";
  messages: ConversationMessage[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  isActive: boolean;
  backgroundImage?: string;
}

export const conversationManagerService = {
  // Creează o conversație nouă
  async createConversation(
    userId: string, 
    aiType: "psihica" | "fizica" | "general" = "general",
    backgroundImage?: string
  ): Promise<string> {
    try {
      const conversationId = `${userId}_${Date.now()}`;
      const conversation: Conversation = {
        id: conversationId,
        userId,
        title: "Conversație nouă", // Va fi actualizat automat
        aiType,
        messages: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,
        backgroundImage
      };

      const conversationRef = doc(firestore, "conversations", conversationId);
      await setDoc(conversationRef, conversation);

      return conversationId;
    } catch (error) {
      console.error("Eroare la crearea conversației:", error);
      throw error;
    }
  },

  // Adaugă un mesaj la conversație și actualizează titlul dacă e necesar
  async addMessage(
    conversationId: string,
    message: Omit<ConversationMessage, "id" | "timestamp">
  ): Promise<void> {
    try {
      const conversationRef = doc(firestore, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        throw new Error("Conversația nu există");
      }

      const conversation = conversationDoc.data() as Conversation;
      const messageId = `msg_${Date.now()}`;
      
      const newMessage: ConversationMessage = {
        ...message,
        id: messageId,
        timestamp: Timestamp.now()
      };

      conversation.messages.push(newMessage);
      conversation.updatedAt = Timestamp.now();

      // Generează titlul automat dacă e prima interacțiune reală
      if (conversation.messages.length === 2 && message.role === "user") { // user + assistant
        conversation.title = await this.generateConversationTitle(conversation.messages);
      }

      await updateDoc(conversationRef, {
        messages: conversation.messages,
        updatedAt: conversation.updatedAt,
        title: conversation.title
      });
    } catch (error) {
      console.error("Eroare la adăugarea mesajului:", error);
      throw error;
    }
  },

  // Generează un titlu pentru conversație bazat pe primul mesaj al utilizatorului
  async generateConversationTitle(messages: ConversationMessage[]): Promise<string> {
    try {
      const userMessage = messages.find(msg => msg.role === "user");
      if (!userMessage) return "Conversație nouă";

      const content = userMessage.content.toLowerCase();
      
      // Identifică subiectul principal din primul mesaj
      if (content.includes("anxietate") || content.includes("anxios") || content.includes("stres")) {
        return "💭 Discuție despre anxietate";
      } else if (content.includes("depresie") || content.includes("trist") || content.includes("deprimat")) {
        return "🌧️ Suport pentru depresie";
      } else if (content.includes("relație") || content.includes("iubire") || content.includes("partener")) {
        return "❤️ Consiliere relațională";
      } else if (content.includes("somn") || content.includes("insomnie") || content.includes("dorm")) {
        return "😴 Probleme de somn";
      } else if (content.includes("mâncare") || content.includes("dietă") || content.includes("greutate")) {
        return "🍎 Nutriție și sănătate";
      } else if (content.includes("exercițiu") || content.includes("sport") || content.includes("fitness")) {
        return "💪 Fitness și exerciții";
      } else if (content.includes("durere") || content.includes("doare") || content.includes("medicament")) {
        return "🩺 Probleme fizice";
      } else if (content.includes("lucru") || content.includes("carieră") || content.includes("job")) {
        return "💼 Consiliere profesională";
      } else if (content.includes("familie") || content.includes("părinte") || content.includes("copil")) {
        return "👨‍👩‍👧‍👦 Relații familiale";
      } else if (content.includes("bună") || content.includes("salut") || content.includes("hello")) {
        return "👋 Conversație generală";
      } else {
        // Folosește primele cuvinte semnificative
        const words = content.split(" ").filter(word => word.length > 3).slice(0, 3);
        if (words.length > 0) {
          return `💬 ${words.join(" ").charAt(0).toUpperCase() + words.join(" ").slice(1)}`;
        }
      }

      return "💬 Conversație nouă";
    } catch (error) {
      console.error("Eroare la generarea titlului:", error);
      return "💬 Conversație nouă";
    }
  },

  // Obține toate conversațiile unui utilizator
  async getUserConversations(userId: string, limitCount: number = 50): Promise<Conversation[]> {
    try {
      const conversationsQuery = query(
        collection(firestore, "conversations"),
        where("userId", "==", userId),
        where("isActive", "==", true),
        orderBy("updatedAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(conversationsQuery);
      const conversations: Conversation[] = [];

      querySnapshot.forEach((doc) => {
        conversations.push(doc.data() as Conversation);
      });

      return conversations;
    } catch (error) {
      console.error("Eroare la obținerea conversațiilor:", error);
      return [];
    }
  },

  // Obține o conversație specifică
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationRef = doc(firestore, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        return null;
      }

      return conversationDoc.data() as Conversation;
    } catch (error) {
      console.error("Eroare la obținerea conversației:", error);
      return null;
    }
  },

  // Actualizează poza de fundal pentru o conversație
  async updateBackgroundImage(conversationId: string, backgroundImage: string): Promise<void> {
    try {
      const conversationRef = doc(firestore, "conversations", conversationId);
      await updateDoc(conversationRef, {
        backgroundImage,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Eroare la actualizarea pozei de fundal:", error);
      throw error;
    }
  },

  // Șterge o conversație (soft delete)
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(firestore, "conversations", conversationId);
      await updateDoc(conversationRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Eroare la ștergerea conversației:", error);
      throw error;
    }
  },

  // Redenumește o conversație
  async renameConversation(conversationId: string, newTitle: string): Promise<void> {
    try {
      const conversationRef = doc(firestore, "conversations", conversationId);
      await updateDoc(conversationRef, {
        title: newTitle,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Eroare la redenumirea conversației:", error);
      throw error;
    }
  }
};
