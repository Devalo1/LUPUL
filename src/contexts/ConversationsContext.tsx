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
  useEffect(() => {
    if (activeConversationId && user?.uid) {
      conversationService
        .getConversation(activeConversationId, user.uid)
        .then(setActiveConversation);
    } else {
      setActiveConversation(null);
    }
  }, [activeConversationId, user?.uid]);

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
    await conversationService.addMessage(
      activeConversationId,
      message,
      user.uid
    );
    await refreshConversations();
    setActiveConversation(
      await conversationService.getConversation(activeConversationId, user?.uid)
    );
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
