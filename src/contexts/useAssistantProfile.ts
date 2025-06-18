import { useContext } from "react";
import { AssistantProfileContext } from "./AssistantProfileContextDef";

export const useAssistantProfile = () => {
  const ctx = useContext(AssistantProfileContext);
  if (!ctx)
    throw new Error(
      "useAssistantProfile must be used within AssistantProfileProvider"
    );
  return ctx;
};
