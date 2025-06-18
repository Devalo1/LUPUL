import { createContext } from "react";
import { Conversation, Message } from "../models/Conversation";

export interface ConversationsContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversationId: (id: string) => void;
  createConversation: (subject: string) => Promise<string | undefined>;
  addMessage: (message: Message) => Promise<void>;
  renameConversation: (id: string, newSubject: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export const ConversationsContext = createContext<
  ConversationsContextType | undefined
>(undefined);
