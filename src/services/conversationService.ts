// ConversationService for managing user conversations in Firestore
import { firestore } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  addDoc,
  Timestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { Conversation, Message } from "../models/Conversation";

const COLLECTION = "conversations";

export const conversationService = {
  // Get all conversations for a user
  async getUserConversations(userId: string): Promise<Conversation[]> {
    console.log(
      `[ConversationService] Getting conversations for user: ${userId}`
    );
    try {
      // Try with orderBy first (when index is ready)
      const q = query(
        collection(firestore, COLLECTION),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Conversation
      );
      console.log(
        `[ConversationService] Found ${conversations.length} conversations for user ${userId}:`,
        conversations.map((c) => ({
          id: c.id,
          subject: c.subject,
          userId: c.userId,
        }))
      );
      return conversations;
    } catch (error: any) {
      // If index is not ready, fall back to simple query and sort manually
      if (
        error.code === "failed-precondition" ||
        error.message?.includes("index")
      ) {
        console.log("Index not ready, using fallback query...");
        const q = query(
          collection(firestore, COLLECTION),
          where("userId", "==", userId)
        );
        const snapshot = await getDocs(q);
        const conversations = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Conversation
        );
        console.log(
          `[ConversationService] Found ${conversations.length} conversations for user ${userId} (fallback):`,
          conversations.map((c) => ({
            id: c.id,
            subject: c.subject,
            userId: c.userId,
          }))
        );

        // Sort manually by updatedAt
        return conversations.sort((a, b) => {
          const aTime =
            a.updatedAt instanceof Timestamp
              ? a.updatedAt.toDate()
              : a.updatedAt || new Date(0);
          const bTime =
            b.updatedAt instanceof Timestamp
              ? b.updatedAt.toDate()
              : b.updatedAt || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
      }
      throw error; // Re-throw if it's a different error
    }
  },
  // Get a single conversation by ID (with userId validation)
  async getConversation(
    conversationId: string,
    userId?: string
  ): Promise<Conversation | null> {
    const ref = doc(firestore, COLLECTION, conversationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const conversation = { id: snap.id, ...snap.data() } as Conversation;

    // Validate that the conversation belongs to the user (if userId is provided)
    if (userId && conversation.userId !== userId) {
      console.warn(
        `[ConversationService] Conversation ${conversationId} does not belong to user ${userId}`
      );
      return null;
    }

    return conversation;
  },

  // Create a new conversation
  async createConversation(userId: string, subject: string): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(firestore, COLLECTION), {
      userId,
      subject,
      createdAt: now,
      updatedAt: now,
      messages: [],
    });
    return docRef.id;
  },
  // Add a message to a conversation (with userId validation)
  async addMessage(
    conversationId: string,
    message: Message,
    userId?: string
  ): Promise<void> {
    const ref = doc(firestore, COLLECTION, conversationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Conversation not found");

    const data = snap.data();

    // Validate that the conversation belongs to the user (if userId is provided)
    if (userId && data.userId !== userId) {
      throw new Error(
        "Access denied: This conversation does not belong to you"
      );
    }

    const messages = data.messages || [];
    messages.push(message);
    await updateDoc(ref, {
      messages,
      updatedAt: Timestamp.now(),
    });
  },
  // Rename a conversation (with userId validation)
  async renameConversation(
    conversationId: string,
    newSubject: string,
    userId?: string
  ): Promise<void> {
    const ref = doc(firestore, COLLECTION, conversationId);

    // Validate ownership if userId is provided
    if (userId) {
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Conversation not found");
      const data = snap.data();
      if (data.userId !== userId) {
        throw new Error(
          "Access denied: This conversation does not belong to you"
        );
      }
    }

    await updateDoc(ref, { subject: newSubject, updatedAt: Timestamp.now() });
  },
  // Delete a conversation (with userId validation)
  async deleteConversation(
    conversationId: string,
    userId?: string
  ): Promise<void> {
    const ref = doc(firestore, COLLECTION, conversationId);

    // Validate ownership if userId is provided
    if (userId) {
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Conversation not found");
      const data = snap.data();
      if (data.userId !== userId) {
        throw new Error(
          "Access denied: This conversation does not belong to you"
        );
      }
    }

    await setDoc(ref, {}, { merge: false });
  },
};
