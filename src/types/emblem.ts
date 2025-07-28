// Emblem System Types
import { Timestamp } from "firebase/firestore";

export interface EmblemMetadata {
  uniqueTraits: string[];
  image: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  attributes: {
    strength: number;
    wisdom: number;
    mysticism: number;
    wellness: number;
  };
}

export interface Emblem {
  id: string;
  userId: string;
  type:
    | "lupul_intelepta"
    | "corbul_mistic"
    | "gardianul_wellness"
    | "cautatorul_lumina";
  mintDate: Timestamp;
  level: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  engagement: number;
  benefits: string[];
  metadata: EmblemMetadata;
  isTransferable: boolean;
  purchasePrice: number;
  currentValue?: number;
}

export interface EmblemCollection {
  name: string;
  description: string;
  totalSupply: number;
  price: number;
  benefits: string[];
  image: string;
  available: number;
  tier: number;
}

export interface EmblemEvolution {
  currentLevel: string;
  nextLevel: string;
  requiredEngagement: number;
  newBenefits: string[];
  evolutionDate?: Timestamp;
}

export interface UserEmblemStatus {
  hasEmblem: boolean;
  emblem?: Emblem;
  totalEngagement: number;
  eventsAttended: number;
  communityRank: number;
  canEvolveTo?: string;
}

export const EMBLEM_COLLECTIONS: Record<string, EmblemCollection> = {
  lupul_intelepta: {
    name: "Lupul Înțelept",
    description: "Simbolul înțelepciunii și ghidării spirituale",
    totalSupply: 10,
    price: 150,
    benefits: [
      "Acces VIP la toate evenimentele",
      "AI prioritar cu răspunsuri extinse",
      "Badge special în comunitate",
      "Acces la meetup-uri fizice exclusive",
    ],
    image: "/emblems/lupul-intelepta.svg",
    available: 10,
    tier: 4,
  },
  corbul_mistic: {
    name: "Corbul Mistic",
    description: "Păzitorul secretelor și al cunoașterii ascunse",
    totalSupply: 15,
    price: 120,
    benefits: [
      "Acces la evenimente premium",
      "Analytics avansate personalizate",
      "Preview la funcționalități noi",
      "Sesiuni de coaching individual",
    ],
    image: "/emblems/corbul-mistic.svg",
    available: 15,
    tier: 3,
  },
  gardianul_wellness: {
    name: "Gardianul Wellnessului",
    description: "Protectorul echilibrului mental și fizic",
    totalSupply: 25,
    price: 80,
    benefits: [
      "Acces la evenimente standard",
      "Mood tracking premium cu insights",
      "Rapoarte de progres detaliate",
      "Acces la biblioteca de resurse",
    ],
    image: "/emblems/gardianul-wellness.svg",
    available: 25,
    tier: 2,
  },
  cautatorul_lumina: {
    name: "Căutătorul de Lumină",
    description: "Începutul călătoriei către autodescoprire",
    totalSupply: 50,
    price: 50,
    benefits: [
      "Acces la evenimente grupate",
      "Comunitate exclusivă",
      "Ghiduri de început în wellness",
      "Support prioritar",
    ],
    image: "/emblems/cautatorul-lumina.svg",
    available: 50,
    tier: 1,
  },
};

export const ENGAGEMENT_ACTIONS = {
  dailyMoodTracking: 2,
  aiConversation: 5,
  eventAttendance: 25,
  communityHelpful: 10,
  contentSharing: 15,
  weeklyStreak: 20,
  monthlyActive: 50,
};

export const EVOLUTION_LEVELS = {
  bronze: { engagement: 0, benefits: ["basic"] },
  silver: { engagement: 100, benefits: ["enhanced_ai", "priority_support"] },
  gold: {
    engagement: 500,
    benefits: ["exclusive_events", "advanced_analytics"],
  },
  platinum: {
    engagement: 1000,
    benefits: ["co_creation_access", "beta_features"],
  },
  diamond: {
    engagement: 2500,
    benefits: ["platform_governance", "revenue_sharing"],
  },
};
