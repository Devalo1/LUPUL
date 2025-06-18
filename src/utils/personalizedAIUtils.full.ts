export interface AIPersonalizedSettings {
  aiType: string;
  aiName: string;
  character: string;
  goal: string;
  addressMode: string;
  responseLength: string;
}

export function getPersonalizedAIName(): string {
  return "Test AI";
}
