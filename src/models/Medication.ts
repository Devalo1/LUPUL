export interface Medication {
  id: string;
  name: string;
  description?: string;
  sideEffects?: string[];
  interactions?: string[];
  recommendedFor?: string[];
}
