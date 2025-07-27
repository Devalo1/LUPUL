import { useState, useEffect, ReactNode } from "react";
import { Conversation, Message } from "../models/Conversation";
import { conversationService } from "../services/conversationService";
import { useAuth } from "./AuthContext";
import { ConversationsContext } from "./ConversationsContextDefinition";

export const ConversationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  useEffect(() => {
    if (user?.uid) {
      console.log(
        `[ConversationsContext] Loading conversations for user: ${user.uid}`
      );
      conversationService.getUserConversations(user.uid).then((convs) => {
        console.log(
          `[ConversationsContext] Loaded ${convs.length} conversations:`,
          convs.map((c) => ({ id: c.id, subject: c.subject, userId: c.userId }))
        );
        setConversations(convs);
      });
    }
  }, [user]);

  // Sincronizează mereu activeConversation cu obiectul actualizat din conversations
  useEffect(() => {
    if (activeConversationId) {
      const found =
        conversations.find((c) => c.id === activeConversationId) || null;
      console.log(
        `[ConversationsContext] Setting activeConversation for ID ${activeConversationId}:`,
        found ? `${found.messages?.length || 0} messages` : "not found"
      );

      // Folosim flushSync pentru update sincron
      setActiveConversation(found);
    } else {
      console.log("[ConversationsContext] Clearing activeConversation");
      setActiveConversation(null);
    }
  }, [activeConversationId, conversations]);

  const createConversation = async (
    subject: string
  ): Promise<string | undefined> => {
    console.log("[ConversationsContext] createConversation, user:", user?.uid);
    if (!user?.uid) return undefined;
    const id = await conversationService.createConversation(user.uid, subject);
    console.log("[ConversationsContext] id creat:", id);
    await refreshConversations();
    setActiveConversationId(id);
    return id;
  };
  const addMessage = async (message: Message) => {
    if (!activeConversationId || !user?.uid) {
      console.error(
        "[ConversationsContext] No activeConversationId or user.uid"
      );
      return;
    }

    console.log("[ConversationsContext] Adding message INSTANTLY:", message);
    console.log(
      "[ConversationsContext] Active conversation ID:",
      activeConversationId
    );

    // PRIORITATE MAXIMĂ: Update SINCRON pentru afișare instantanee
    setActiveConversation((prev) => {
      if (!prev) {
        console.log(
          "[ConversationsContext] No activeConversation, creating temporary one for instant display"
        );
        // Creează conversație temporară pentru afișarea imediată
        return {
          id: activeConversationId,
          userId: user.uid!,
          subject: "",
          messages: [message],
          createdAt: message.timestamp,
          updatedAt: message.timestamp,
        };
      }

      const updated = {
        ...prev,
        messages: [...(prev.messages || []), message],
        updatedAt: message.timestamp,
      };

      console.log(
        "[ConversationsContext] INSTANT UI UPDATE - activeConversation now has:",
        updated.messages.length,
        "messages"
      );
      return updated;
    });

    // Actualizează și lista de conversații SINCRON pentru consistență
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...(conv.messages || []), message],
              updatedAt: message.timestamp,
            }
          : conv
      );
      console.log(
        "[ConversationsContext] INSTANT conversations list update:",
        updated.find((c) => c.id === activeConversationId)?.messages?.length,
        "messages in active conversation"
      );
      return updated;
    });

    // Salvează în backend ASYNC (nu blochează UI-ul pentru afișare instantanee)
    conversationService
      .addMessage(activeConversationId, message, user.uid)
      .then(() => {
        console.log(
          "[ConversationsContext] Message successfully saved to backend"
        );
      })
      .catch((error) => {
        console.error("[ConversationsContext] Backend save error:", error);
        // În caz de eroare, mesajul rămâne în UI dar nu e salvat în backend
        // Poți adăuga logică de retry aici dacă este necesar
      });
  };
  const renameConversation = async (id: string, newSubject: string) => {
    if (!user?.uid) return;
    await conversationService.renameConversation(id, newSubject, user.uid);
    await refreshConversations();
  };
  const deleteConversation = async (id: string) => {
    if (!user?.uid) return;
    await conversationService.deleteConversation(id, user.uid);
    await refreshConversations();
    if (activeConversationId === id) setActiveConversationId(null);
  };

  const refreshConversations = async () => {
    if (user?.uid) {
      const convs = await conversationService.getUserConversations(user.uid);
      setConversations(convs);
    }
  };

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversationId,
        createConversation,
        addMessage,
        renameConversation,
        deleteConversation,
        refreshConversations,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
};
