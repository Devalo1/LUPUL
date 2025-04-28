import { getAuth, User } from "firebase/auth";
import logger from "./logger";

// Folosim un cache pentru a ține evidența încercărilor de reîmprospătare token
const tokenRefreshAttempts: Record<string, { count: number; lastAttempt: number }> = {};
const _TOKEN_BACKOFF_INTERVAL = 30000; // 30 secunde între încercări
const _MAX_REFRESH_ATTEMPTS = 3; // Maxim 3 încercări consecutive

/**
 * Typed interface for refreshUserSession function params
 */
export interface RefreshSessionOptions {
  forceRefresh?: boolean;
  timeout?: number;
  showFeedback?: boolean;
}

/**
 * Resetează starea de eroare a token-urilor
 */
export const resetTokenRefreshState = (userId?: string): void => {
  if (userId) {
    delete tokenRefreshAttempts[userId];
  } else {
    // Resetează tot cache-ul
    Object.keys(tokenRefreshAttempts).forEach(key => {
      delete tokenRefreshAttempts[key];
    });
  }
};

/**
 * Verifică dacă un token este aproape de expirare
 */
export const isTokenExpiringSoon = async (user: User): Promise<boolean> => {
  try {
    const tokenResult = await user.getIdTokenResult();
    const expirationTime = new Date(tokenResult.expirationTime).getTime();
    const currentTime = new Date().getTime();
    
    // Considerăm că tokenul expiră curând dacă are mai puțin de 5 minute
    const fiveMinutesInMs = 5 * 60 * 1000;
    return expirationTime - currentTime < fiveMinutesInMs;
  } catch (error) {
    logger.error("Eroare la verificarea expirării token-ului:", error);
    return false;
  }
};

/**
 * Refreshes the user session by forcing a new ID token
 */
export const refreshUserSession = async (options: RefreshSessionOptions = {}): Promise<boolean> => {
  const { forceRefresh = true, timeout = 10000, showFeedback = false } = options;
  
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn("Cannot refresh session: No user is currently logged in");
      return false;
    }
    
    // Wait for the token to refresh with a timeout
    const refreshPromise = user.getIdToken(forceRefresh);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Token refresh timed out")), timeout);
    });
    
    // Race between refresh and timeout
    await Promise.race([refreshPromise, timeoutPromise]);
    
    if (showFeedback) {
      console.log("User session refreshed successfully");
    }
    
    return true;
  } catch (error) {
    console.error("Error refreshing user session:", error);
    return false;
  }
};

/**
 * Forțează reîmprospătarea token-ului și tratează erorile
 */
export const forceTokenRefresh = async (): Promise<boolean> => {
  // Resetăm întâi starea de reîmprospătare token
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    resetTokenRefreshState(user.uid);
  }
  
  return refreshUserSession();
};

/**
 * Inițializează un listener pentru a reîmprospăta automat tokenii înainte de expirare
 */
export const initializeTokenRefreshListener = (): void => {
  const auth = getAuth();
  
  // La fiecare 10 minute, verificăm dacă token-ul expiră curând
  const intervalId = setInterval(async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      const needsRefresh = await isTokenExpiringSoon(user);
      if (needsRefresh) {
        await refreshUserSession();
      }
    } catch (error) {
      logger.error("Eroare la verificarea automată a expirării token-ului:", error);
    }
  }, 10 * 60 * 1000); // 10 minute
  
  // Pentru cleanup
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      clearInterval(intervalId);
    });
  }
};

export default {
  refreshUserSession,
  forceTokenRefresh,
  resetTokenRefreshState,
  initializeTokenRefreshListener
};