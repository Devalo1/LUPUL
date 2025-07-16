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
      const found = conversations.find((c) => c.id === activeConversationId) || null;
      setActiveConversation(found);
    } else {
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
    if (!activeConversationId || !user?.uid) return;
    // Optimistic update: adaugă mesajul local înainte de backend
    setActiveConversation((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        messages: [...(prev.messages || []), message],
      };
      console.log("[ConversationsContext] Optimistic update activeConversation:", updated);
      return updated;
    });
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...(conv.messages || []), message] }
          : conv
      );
      console.log("[ConversationsContext] Optimistic update conversations:", updated);
      return updated;
    });
    await conversationService.addMessage(
      activeConversationId,
      message,
      user.uid
    );
    // Nu reseta conversația imediat după, lăsăm mesajul optimist vizibil
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
