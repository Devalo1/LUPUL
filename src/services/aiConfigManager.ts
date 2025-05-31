import { AI_CONFIG } from "./openaiService";
import { type AIProfileType } from "./aiProfiles";

// Cheile pentru localStorage
const STORAGE_KEYS = {
  AI_CONFIG: "therapy_ai_config",
  ACTIVE_PROFILES: "therapy_ai_active_profiles",
  CUSTOM_PROMPTS: "therapy_ai_custom_prompts",
};

export interface SavedAIConfig {
  config: typeof AI_CONFIG;
  profiles: Record<string, AIProfileType>;
  customPrompts: Record<string, string>;
  lastUpdated: string;
}

// Salvează configurația AI în localStorage
export const saveAIConfig = (
  config: typeof AI_CONFIG,
  profiles: Record<string, AIProfileType> = {},
  customPrompts: Record<string, string> = {}
): void => {
  try {
    const configToSave: SavedAIConfig = {
      config,
      profiles,
      customPrompts,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(configToSave));

    // eslint-disable-next-line no-console
    console.log("Configurația AI a fost salvată local");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Eroare la salvarea configurației AI:", error);
  }
};

// Încarcă configurația AI din localStorage
export const loadAIConfig = (): SavedAIConfig | null => {
  try {
    const savedConfig = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    if (!savedConfig) return null;

    const parsed = JSON.parse(savedConfig) as SavedAIConfig;

    // Validează structura salvată
    if (!parsed.config || !parsed.lastUpdated) {
      // eslint-disable-next-line no-console
      console.warn(
        "Configurația salvată nu este validă, se folosește cea default"
      );
      return null;
    }

    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Eroare la încărcarea configurației AI:", error);
    return null;
  }
};

// Resetează configurația la valorile default
export const resetAIConfig = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AI_CONFIG);
    // eslint-disable-next-line no-console
    console.log("Configurația AI a fost resetată la valorile default");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Eroare la resetarea configurației AI:", error);
  }
};

// Exportă configurația curentă ca fișier JSON
export const exportAIConfig = (config: SavedAIConfig): void => {
  try {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `therapy-ai-config-${new Date().toISOString().split("T")[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    // eslint-disable-next-line no-console
    console.log("Configurația AI a fost exportată");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Eroare la exportarea configurației AI:", error);
  }
};

// Importă configurația dintr-un fișier JSON
export const importAIConfig = (file: File): Promise<SavedAIConfig> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content) as SavedAIConfig;

        // Validează configurația importată
        if (!config.config || !config.lastUpdated) {
          throw new Error("Fișierul nu conține o configurație validă");
        }

        // Salvează configurația importată
        saveAIConfig(config.config, config.profiles, config.customPrompts);

        resolve(config);
      } catch (error) {
        reject(new Error(`Eroare la procesarea fișierului: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Eroare la citirea fișierului"));
    };

    reader.readAsText(file);
  });
};
