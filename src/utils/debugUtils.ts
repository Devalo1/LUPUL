import { isProd, isDebugEnabled } from "./environment";

/**
 * Verifică dacă funcționalitățile de debugging sunt activate
 * @returns {boolean} true dacă debugging-ul este activat
 */
export const isDebugMode = (): boolean => {
  // În producție, debugging-ul este dezactivat complet
  if (isProd) return false;
  
  // În alte medii, depinde de setări
  return isDebugEnabled();
};

/**
 * Funcție pentru logging condițional de debugging
 * Aceasta va afișa log-uri doar dacă debugging-ul este activat
 */
export const debugLog = (message: string, ...args: unknown[]): void => {
  if (!isDebugMode()) return;
  console.log(`[DEBUG] ${message}`, ...args);
};

export default {
  isDebugMode,
  debugLog
};