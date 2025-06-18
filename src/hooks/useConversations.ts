import { useContext } from "react";
import {
  ConversationsContext,
  ConversationsContextType,
} from "../contexts/ConversationsContextDefinition";

export const useConversations = (): ConversationsContextType => {
  const ctx = useContext(ConversationsContext);
  if (!ctx)
    throw new Error(
      "useConversations must be used within ConversationsProvider"
    );
  return ctx;
};
