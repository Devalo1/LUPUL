import { AI_CONFIG } from "./openaiService";
import { type AIProfileType } from "./aiProfiles";

// Tipuri pentru gestionarea AI-ului pe utilizatori
export interface UserAICustomPrompts {
  aiType?: string;
  aiName?: string;
  character?: string;
  goal?: string;
  addressMode?: string;
  responseLength?: string;
  sex?: "masculin" | "feminin" | "neutru";
  conversationStyle?: "formal" | "casual" | "prietenos" | "profesional";
  [key: string]: string | undefined; // Pentru compatibilitate cu Record<string, string>
}

export interface UserAIConfig {
  userId: string;
  config: Partial<typeof AI_CONFIG>;
  activeProfiles: Record<string, AIProfileType>;
  customPrompts: UserAICustomPrompts | Record<string, string>;
  lastUpdated: string;
  isEnabled: boolean;
}

export interface AdminAILimits {
  canChangeModel: boolean;
  canChangeTemperature: boolean;
  maxTemperature: number;
  minTemperature: number;
  canChangeMaxTokens: boolean;
  maxTokensLimit: number;
  canCreateCustomPrompts: boolean;
  allowedProfiles: AIProfileType[];
  globalLimits: {
    maxRequestsPerHour: number;
    maxRequestsPerDay: number;
  };
}

export interface AIUsageStats {
  userId: string;
  userName: string;
  totalRequests: number;
  requestsToday: number;
  requestsThisHour: number;
  averageResponseTime: number;
  mostUsedProfile: AIProfileType;
  lastActivity: string;
  favoriteModel: string;
  totalTokensUsed: number;
}

// Configurația default admin
export const DEFAULT_ADMIN_LIMITS: AdminAILimits = {
  canChangeModel: false, // Doar admin poate schimba modelul
  canChangeTemperature: true,
  maxTemperature: 0.9,
  minTemperature: 0.1,
  canChangeMaxTokens: true,
  maxTokensLimit: 1000,
  canCreateCustomPrompts: true,
  allowedProfiles: ["general", "psihica", "fizica"],
  globalLimits: {
    maxRequestsPerHour: 50,
    maxRequestsPerDay: 200,
  },
};

// Cheile pentru localStorage/Firebase
const STORAGE_KEYS = {
  USER_AI_CONFIG: "user_ai_config_",
  ADMIN_LIMITS: "admin_ai_limits",
  AI_USAGE_STATS: "ai_usage_stats_",
  GLOBAL_AI_STATS: "global_ai_stats",
};

class UserAIManager {
  private currentUserId: string | null = null;
  private adminLimits: AdminAILimits = DEFAULT_ADMIN_LIMITS;

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  // Încarcă configurația AI pentru utilizatorul curent
  async loadUserAIConfig(): Promise<UserAIConfig | null> {
    if (!this.currentUserId) return null;

    try {
      const stored = localStorage.getItem(
        STORAGE_KEYS.USER_AI_CONFIG + this.currentUserId
      );
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading user AI config:", error);
    }
    return null;
  }

  // Salvează configurația AI pentru utilizatorul curent
  async saveUserAIConfig(config: Partial<UserAIConfig>): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const userConfig: UserAIConfig = {
        userId: this.currentUserId,
        config: config.config || {},
        activeProfiles: config.activeProfiles || {},
        customPrompts: config.customPrompts || {},
        lastUpdated: new Date().toISOString(),
        isEnabled: config.isEnabled ?? true,
      };

      localStorage.setItem(
        STORAGE_KEYS.USER_AI_CONFIG + this.currentUserId,
        JSON.stringify(userConfig)
      );
      return true;
    } catch (error) {
      console.error("Error saving user AI config:", error);
      return false;
    }
  }

  // Verifică dacă utilizatorul poate modifica o anumită setare
  canUserModify(setting: keyof AdminAILimits): boolean {
    return this.adminLimits[setting] as boolean;
  }

  // Validează configurația utilizatorului în baza limitelor admin
  validateUserConfig(
    config: Partial<typeof AI_CONFIG>
  ): Partial<typeof AI_CONFIG> {
    const validatedConfig = { ...config };

    // Verifică temperatura
    if (config.temperature !== undefined) {
      if (!this.adminLimits.canChangeTemperature) {
        delete validatedConfig.temperature;
      } else {
        validatedConfig.temperature = Math.max(
          this.adminLimits.minTemperature,
          Math.min(this.adminLimits.maxTemperature, config.temperature)
        );
      }
    }

    // Verifică max_tokens
    if (config.max_tokens !== undefined) {
      if (!this.adminLimits.canChangeMaxTokens) {
        delete validatedConfig.max_tokens;
      } else {
        validatedConfig.max_tokens = Math.min(
          this.adminLimits.maxTokensLimit,
          config.max_tokens
        );
      }
    }

    // Verifică modelul
    if (config.model !== undefined && !this.adminLimits.canChangeModel) {
      delete validatedConfig.model;
    }

    return validatedConfig;
  }

  // Înregistrează utilizarea AI-ului pentru statistici
  async recordAIUsage(
    profileType: AIProfileType,
    responseTime: number,
    tokensUsed: number
  ): Promise<void> {
    if (!this.currentUserId) return;

    try {
      const statsKey = STORAGE_KEYS.AI_USAGE_STATS + this.currentUserId;
      const existingStats = localStorage.getItem(statsKey);

      let stats: AIUsageStats;
      if (existingStats) {
        stats = JSON.parse(existingStats);
      } else {
        stats = {
          userId: this.currentUserId,
          userName: "Unknown", // Să fie actualizat cu numele real
          totalRequests: 0,
          requestsToday: 0,
          requestsThisHour: 0,
          averageResponseTime: 0,
          mostUsedProfile: profileType,
          lastActivity: new Date().toISOString(),
          favoriteModel: AI_CONFIG.model,
          totalTokensUsed: 0,
        };
      }

      // Actualizează statisticile
      stats.totalRequests++;
      stats.requestsToday++; // În practică, ar trebui să verifici data
      stats.requestsThisHour++; // În practică, ar trebui să verifici ora
      stats.averageResponseTime =
        (stats.averageResponseTime + responseTime) / 2;
      stats.lastActivity = new Date().toISOString();
      stats.totalTokensUsed += tokensUsed;

      localStorage.setItem(statsKey, JSON.stringify(stats));
    } catch (error) {
      console.error("Error recording AI usage:", error);
    }
  }

  // Încarcă limitele admin
  async loadAdminLimits(): Promise<AdminAILimits> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_LIMITS);
      if (stored) {
        this.adminLimits = { ...DEFAULT_ADMIN_LIMITS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading admin limits:", error);
    }
    return this.adminLimits;
  }

  // Salvează limitele admin (doar pentru admin)
  async saveAdminLimits(limits: Partial<AdminAILimits>): Promise<boolean> {
    try {
      this.adminLimits = { ...this.adminLimits, ...limits };
      localStorage.setItem(
        STORAGE_KEYS.ADMIN_LIMITS,
        JSON.stringify(this.adminLimits)
      );
      return true;
    } catch (error) {
      console.error("Error saving admin limits:", error);
      return false;
    }
  }

  // Obține toate statisticile utilizatorilor (pentru admin)
  async getAllUserStats(): Promise<AIUsageStats[]> {
    const allStats: AIUsageStats[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.AI_USAGE_STATS)) {
          const stats = localStorage.getItem(key);
          if (stats) {
            allStats.push(JSON.parse(stats));
          }
        }
      }
    } catch (error) {
      console.error("Error getting all user stats:", error);
    }

    return allStats;
  }

  getAdminLimits(): AdminAILimits {
    return this.adminLimits;
  }
}

// Instanța singleton
export const userAIManager = new UserAIManager();
