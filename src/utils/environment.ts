// filepath: d:\LUPUL\my-typescript-app\src\utils\environment.ts
/**
 * Utilitar pentru gestionarea configurațiilor de mediu și emulatorilor Firebase
 */

// Adăugăm o declarație pentru variabila globală BUILD_DATE disponibilă prin Vite
declare const __BUILD_DATE__: string | undefined;

// Define a proper interface for emulator config
interface EmulatorConfig {
  auth: AuthEmulatorConfig;
  firestore?: {
    host: string;
    port: number;
  };
  functions?: {
    host: string;
    port: number;
  };
  storage?: {
    host: string;
    port: number;
  };
}

// Define a more specific interface for Auth Emulator Config
interface AuthEmulatorConfig {
  host: string;
  port: number;
  url: string;
}

// Mediul curent din variabilele de mediu sau default development
export const ENV = import.meta.env.VITE_ENVIRONMENT || "development";

// Flaguri pentru medii specifice
export const isProd = ENV === "production";
export const isDev = ENV === "development";
export const isTest = ENV === "test";

// Check if code is running in browser environment
export const isBrowser = typeof window !== "undefined";

// Versiunea aplicației
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

// Data build-ului (definită în vite.config.ts)
export const BUILD_DATE = typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : new Date().toISOString();

/**
 * Verifică dacă debugging-ul este activat
 * @returns {boolean} true dacă debugging-ul este activat
 */
export const isDebugEnabled = (): boolean => {
  // În producție valoarea default este false
  if (isProd) {
    return import.meta.env.VITE_DEBUG === "true";
  }
  
  // În development valoarea default este true
  return import.meta.env.VITE_DEBUG !== "false";
};

/**
 * Verifică dacă aplicația ar trebui să utilizeze emulatorii Firebase
 * @returns boolean
 */
export function useEmulators(): boolean {
  // Verificăm explicit valoarea variabilei de mediu 
  // pentru a forța utilizarea sau dezactivarea emulatorilor
  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
    return true;
  }
  
  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "false") {
    return false;
  }
  
  // În producție, niciodată nu folosim emulatorii
  if (import.meta.env.MODE === "production") {
    return false;
  }

  // În dezvoltare, folosim valoarea implicită (false) pentru a păstra datele reale
  return false;
}

/**
 * Obține configurația pentru emulatorii Firebase
 * @returns EmulatorConfig | null
 */
export function getEmulatorConfig(): EmulatorConfig | null {
  if (!useEmulators()) {
    return null;
  }

  // Valorile implicite pentru emulatori
  const defaultHost = "localhost";

  const authEmulatorConfig: AuthEmulatorConfig = {
    host: import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || defaultHost,
    port: parseInt(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || "9099"),
    url: `http://${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || defaultHost}:${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || "9099"}`
  };
  
  return {
    auth: authEmulatorConfig,
    firestore: {
      host: import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || defaultHost,
      port: parseInt(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || "8080")
    },
    storage: {
      host: import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || defaultHost,
      port: parseInt(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || "9199")
    },
    functions: {
      host: import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST || defaultHost,
      port: parseInt(import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001")
    }
  };
}

/**
 * Determină dacă sunt în execuție emulatorii Firebase
 * Această funcție verifică dacă emulatorii sunt activi prin efectuarea unor
 * cereri de verificare. Este utilă pentru a decide automat dacă se folosesc
 * emulatorii sau serviciile reale Firebase.
 * @returns Promise<boolean>
 */
export async function areEmulatorsRunning(): Promise<boolean> {
  if (import.meta.env.MODE === "production") {
    return false;
  }

  try {
    const config = getEmulatorConfig();
    if (!config) return false;

    // Verificăm emulatorului Firestore - de obicei e primul pornit
    if (config.firestore) {
      const _response = await fetch(
        `http://${config.firestore.host}:${config.firestore.port}/`,
        { method: "GET", mode: "no-cors", cache: "no-cache" }
      );
      
      // Dacă am primit un răspuns, emulatorii rulează
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn("Eroare la verificarea emulatorilor Firebase:", error);
    return false;
  }
}

/**
 * Obține URL-ul de bază pentru Firebase Storage
 * Returnează URL-ul pentru Storage în funcție de mediul de execuție
 * @returns string
 */
export function getStorageBaseUrl(): string {
  const config = getEmulatorConfig();
  
  if (useEmulators() && config?.storage) {
    return `http://${config.storage.host}:${config.storage.port}`;
  }
  
  return "https://storage.googleapis.com";
}

/**
 * Obține URL-ul bucket-ului de Storage
 * @param bucketName Numele bucket-ului (implicit cel din configurația Firebase)
 * @returns string
 */
export function getStorageBucketUrl(bucketName: string = "lupulcorbul.appspot.com"): string {
  if (useEmulators()) {
    const config = getEmulatorConfig();
    
    if (config?.storage) {
      return `http://${config.storage.host}:${config.storage.port}/${bucketName}`;
    }
  }
  
  return `https://storage.googleapis.com/${bucketName}`;
}

/**
 * Verifică dacă aplicația rulează în modul de dezvoltare
 * @returns boolean
 */
export function isDevelopment(): boolean {
  return import.meta.env.MODE === "development";
}

/**
 * Verifică dacă aplicația rulează în modul de producție
 * @returns boolean
 */
export function isProduction(): boolean {
  return import.meta.env.MODE === "production";
}

/**
 * Returnează URL-ul API bazat pe mediul curent
 * @returns {string} URL-ul de bază pentru API
 */
export const getApiBaseUrl = (): string => {
  // Dacă există o valoare specifică, o folosim
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Altfel, folosim valori implicite bazate pe mediu
  if (isProd) {
    return "https://us-central1-lupul-si-corbul.cloudfunctions.net";
  }
  
  if (isTest) {
    return "http://localhost:5001/lupul-si-corbul/us-central1";
  }
  
  return "http://localhost:5001/lupul-si-corbul/us-central1";
};

/**
 * Returnează URL-ul site-ului bazat pe mediul curent
 * @returns {string} URL-ul de bază pentru site
 */
export const getSiteBaseUrl = (): string => {
  // Dacă există o valoare specifică, o folosim
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL;
  }
  
  // Altfel, folosim valori implicite bazate pe mediu
  if (isProd) {
    return "https://lupulsicorbul.com";
  }
  
  if (isTest) {
    return "http://localhost:5173";
  }
  
  return "http://localhost:5173";
};

/**
 * Returnează toate informațiile despre mediul de rulare
 * Util pentru debugging
 */
export const getEnvironmentInfo = () => {
  return {
    environment: ENV,
    isProd,
    isDev,
    isTest,
    appVersion: APP_VERSION,
    buildDate: BUILD_DATE,
    debugEnabled: isDebugEnabled(),
    apiBaseUrl: getApiBaseUrl(),
    siteBaseUrl: getSiteBaseUrl(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
};

export default {
  ENV,
  isProd,
  isDev,
  isTest,
  isBrowser,
  APP_VERSION,
  BUILD_DATE,
  isDebugEnabled,
  useEmulators,
  getEmulatorConfig,
  areEmulatorsRunning,
  getStorageBaseUrl,
  getStorageBucketUrl,
  isDevelopment,
  isProduction,
  getApiBaseUrl,
  getSiteBaseUrl,
  getEnvironmentInfo,
};