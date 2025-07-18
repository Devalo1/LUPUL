// filepath: d:\LUPUL\my-typescript-app\src\utils\environment.ts
/**
 * Utilitar pentru gestionarea informațiilor despre mediul de execuție
 */

// Adăugăm o declarație pentru variabila globală BUILD_DATE disponibilă prin Vite
declare const __BUILD_DATE__: string | undefined;

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
export const BUILD_DATE =
  typeof __BUILD_DATE__ !== "undefined"
    ? __BUILD_DATE__
    : new Date().toISOString();

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
 * Verifică dacă emulatorii ar trebui folosiți
 * @returns {boolean} true dacă emulatorii trebuie folosiți
 */
export const useEmulators = (): boolean => {
  // În producție nu folosim niciodată emulatori
  if (isProd) {
    return false;
  }

  // Verificăm dacă există configurare specifică
  return import.meta.env.VITE_USE_EMULATORS !== "false";
};

/**
 * Returnează configurația pentru emulatori
 * @returns {Object} Configurațiile pentru fiecare emulator Firebase
 */
export const getEmulatorConfig = () => {
  return {
    auth: {
      host: import.meta.env.VITE_AUTH_EMULATOR_HOST || "localhost",
      port: parseInt(import.meta.env.VITE_AUTH_EMULATOR_PORT || "9099", 10),
    },
    firestore: {
      host: import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || "localhost",
      port: parseInt(
        import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || "8080",
        10
      ),
    },
    functions: {
      host: import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST || "localhost",
      port: parseInt(
        import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT || "5001",
        10
      ),
    },
    storage: {
      host: import.meta.env.VITE_STORAGE_EMULATOR_HOST || "localhost",
      port: parseInt(import.meta.env.VITE_STORAGE_EMULATOR_PORT || "9199", 10),
    },
  };
};

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
    return "http://localhost:8888";
  }

  return "http://localhost:8888";
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
  getApiBaseUrl,
  getSiteBaseUrl,
  getEnvironmentInfo,
};
