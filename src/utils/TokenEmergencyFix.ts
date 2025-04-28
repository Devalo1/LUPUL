// TokenEmergencyFix.ts
// Script de recuperare de urgență pentru token-uri Firebase corupte

import { auth as _auth } from "../firebase";
import logger from "./logger";
import TokenManager from "./TokenManager";

const emergencyLogger = logger.createLogger("TokenEmergencyFix");

// Flag pentru a verifica dacă am rulat deja acest fix
let fixApplied = false;
// Contor pentru erorile detectate, pentru a preveni acțiuni premature
let errorCounter = 0;
// Pragul de erori înainte de a aplica curățarea automată
const ERROR_THRESHOLD = 5;
// Timestamp pentru ultima curățare
let lastCleanupTime = 0;
// Minim timp între curățări (5 minute)
const MIN_CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Forțează curățarea completă a tuturor token-urilor Firebase și a cache-ului browser
 */
export const forceTokenCleanup = async (manualTrigger = false): Promise<boolean> => {
  // Verificăm dacă a trecut suficient timp de la ultima curățare
  const now = Date.now();
  if (!manualTrigger && now - lastCleanupTime < MIN_CLEANUP_INTERVAL) {
    emergencyLogger.warn(`Ignorăm curățarea - prea curând de la ultima încercare (${Math.floor((now - lastCleanupTime) / 1000)}s)`);
    return false;
  }
  
  if (fixApplied && !manualTrigger) {
    emergencyLogger.warn("Fix-ul a fost deja aplicat, ignorăm cererea automată");
    return false;
  }

  // Dacă nu este declanșat manual și nu am atins pragul de erori, nu facem nimic
  if (!manualTrigger && errorCounter < ERROR_THRESHOLD) {
    errorCounter++;
    emergencyLogger.warn(`Eroare detectată (${errorCounter}/${ERROR_THRESHOLD}), așteptăm mai multe erori înainte de curățare automată`);
    return false;
  }

  emergencyLogger.warn("Aplicăm fix-ul de urgență pentru token-uri");
  lastCleanupTime = now;
  
  try {
    // Marcăm fixul ca fiind aplicat
    fixApplied = true;
    
    // Folosim TokenManager pentru a gestiona curățarea
    const success = await TokenManager.clearTokensAndLogout();
    
    if (success) {
      // Resetăm contorul de erori
      errorCounter = 0;
      emergencyLogger.info("Fix-ul de token-uri a fost aplicat cu succes");
      return true;
    } else {
      emergencyLogger.error("Fix-ul de token-uri a eșuat");
      return false;
    }
  } catch (error) {
    emergencyLogger.error("Eroare la aplicarea fix-ului de token-uri:", error);
    return false;
  }
};

/**
 * Detectăm și remediem automat erorile de autentificare
 */
export const setupAutoTokenErrorFix = () => {
  // Nu facem verificarea imediată pentru a permite aplicației să funcționeze normal
  // Setăm un interval pentru verificarea continuă mai puțin frecventă
  setInterval(checkAndFixTokenErrors, 30000); // Verificăm la 30 de secunde în loc de 5
  
  // Captăm erorile de rețea
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Verificăm dacă cererea este către Firebase Auth și a eșuat
      const url = args[0]?.toString() || "";
      if (url.includes("securetoken.googleapis.com") && !response.ok) {
        emergencyLogger.error(`Eroare la autentificare: ${response.status} ${response.statusText}`);
        // Nu declanșăm fix-ul automat la fiecare eroare, doar incrementăm contorul
        checkAndFixTokenErrors(false);
      }
      
      return response;
    } catch (error) {
      // Verificăm dacă eroarea este legată de token
      if (args[0]?.toString().includes("securetoken.googleapis.com")) {
        emergencyLogger.error("Eroare la cererea de token:", error);
        // Nu declanșăm fix-ul automat la fiecare eroare, doar incrementăm contorul
        checkAndFixTokenErrors(false);
      }
      throw error;
    }
  };
};

/**
 * Verifică și remediază automat erorile de token
 */
const checkAndFixTokenErrors = (forceCleanup = false) => {
  // Verificăm dacă există erori recente legate de token-uri în consolă
  const consoleErrors = (window as any).__lastError || "";
  const hasTokenErrors = 
    consoleErrors.includes("auth/quota-exceeded") || 
    consoleErrors.includes("400 Bad Request") ||
    consoleErrors.includes("auth/invalid-credential");
  
  // Verificăm și dacă TokenManager are circuit breaker-ul activ
  const tokenHealth = TokenManager.getTokenHealthStatus();
  
  if (forceCleanup || hasTokenErrors) {
    // Dacă circuit breaker-ul este activ, nu mai incrementăm contorul
    if (tokenHealth.circuitBreakerActive) {
      emergencyLogger.debug("Circuit breaker activ, ignorăm erorile de autentificare");
      return;
    }
    
    emergencyLogger.warn("Detectate erori de autentificare, incrementăm contorul");
    errorCounter++;
    
    // Aplicăm fix-ul doar dacă avem multe erori consecutive sau dacă este forțat
    if (forceCleanup || errorCounter >= ERROR_THRESHOLD) {
      emergencyLogger.warn(`Prag de erori atins (${errorCounter}/${ERROR_THRESHOLD}), aplicăm fix-ul`);
      forceTokenCleanup(forceCleanup);
    }
  } else {
    // Dacă nu am găsit erori, reducem treptat contorul
    if (errorCounter > 0) {
      errorCounter--;
    }
  }
};

/**
 * Resetează contorul de erori și starea fix-ului
 */
export const resetErrorCounter = (): void => {
  errorCounter = 0;
  fixApplied = false;
  emergencyLogger.info("Contorul de erori și starea fix-ului au fost resetate");
};

// Exportăm funcțiile principale
export default {
  forceTokenCleanup,
  setupAutoTokenErrorFix,
  resetErrorCounter
};