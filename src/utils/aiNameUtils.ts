// Utilități pentru gestionarea numelor asistentului AI
import { getPersonalizedAIName } from "./personalizedAIUtilsNew";

export interface UserAISettings {
  aiType?: string;
  aiName?: string;
  character?: string;
  goal?: string;
  addressMode?: string;
}

export function getAIAssistantName(
  settings?: UserAISettings,
  userProfile?: { name?: string },
  userId?: string
): string {
  // Dacă avem userId, folosește setările specifice utilizatorului
  if (userId) {
    const userPrefix = `user_${userId}_`;
    const aiName =
      localStorage.getItem(`${userPrefix}ai_name`) ||
      localStorage.getItem("ai_name") ||
      settings?.aiName ||
      "";
    const aiType =
      localStorage.getItem(`${userPrefix}ai_type`) ||
      localStorage.getItem("ai_type") ||
      settings?.aiType ||
      "general";

    if (aiName && aiName.trim()) {
      return aiName.trim();
    }

    // Fallback la numele default bazat pe tip
    return getAITypeDisplayName(aiType);
  }
  // Folosește noul sistem personalizat
  return getPersonalizedAIName(
    {
      aiType: settings?.aiType || "general",
      aiName: settings?.aiName || "",
      character: settings?.character || "prietenos",
      goal: settings?.goal || "să te ajute cu sfaturi",
      addressMode: settings?.addressMode || "Tu",
      responseLength: "scurt",
    },
    userProfile,
    userId
  );
}

export function getAITypeDisplayName(aiType: string): string {
  switch (aiType) {
    case "psihica":
      return "Terapeut Psihic";
    case "fizica":
      return "Terapeut Fizic";
    case "general":
    default:
      return "Asistent General";
  }
}
