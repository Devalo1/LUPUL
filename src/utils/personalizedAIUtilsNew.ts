// Test version of personalizedAIUtils
export interface AIPersonalizedSettings {
  aiType: string;
  aiName: string;
  character: string;
  goal: string;
  addressMode: string;
  responseLength: string;
}

export interface UserProfile {
  name?: string;
  age?: number;
  gender?: string;
}

export async function loadPersonalizedAISettings(
  userId: string
): Promise<AIPersonalizedSettings | null> {
  console.log("Loading settings for:", userId);
  return null;
}

export function generatePersonalizedPrompt(
  settings: AIPersonalizedSettings,
  _userProfile?: UserProfile,
  _context?: string
): string {
  return `Test prompt for ${settings.aiName}`;
}

export function getPersonalizedAIName(
  settings?: AIPersonalizedSettings,
  _userProfile?: UserProfile,
  _userId?: string
): string {
  return settings?.aiName || "Test AI";
}
