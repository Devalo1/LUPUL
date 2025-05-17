import { User } from "firebase/auth";

interface TokenCache {
  token: string;
  expiresAt: number; // timestamp when this token expires
}

/**
 * TokenRefreshManager provides a centralized way to handle Firebase token refreshes
 * with built-in rate limiting, caching, and exponential backoff to avoid quota exceeded errors.
 */
export class TokenRefreshManager {
  private static tokenCache: Map<string, TokenCache> = new Map();
  private static refreshInProgress: Map<string, Promise<string>> = new Map();
  private static lastRefreshTime: Map<string, number> = new Map();
  private static consecutiveErrors: Map<string, number> = new Map();

  // Configuration
  private static readonly MIN_REFRESH_INTERVAL_MS = 60000; // 1 minute minimum between refreshes
  private static readonly TOKEN_EXPIRY_BUFFER_MS = 300000; // 5 minutes before actual expiry
  private static readonly MAX_RETRIES = 3;
  private static readonly INITIAL_BACKOFF_MS = 2000; // 2 seconds
  private static readonly DEBUG_MODE = false; // Set to true for verbose logging
  private static readonly TOKEN_REQUEST_TIMEOUT_MS = 15000; // 15 seconds timeout for token requests

  /**
   * Get an ID token for a user, using cache when possible and implementing
   * rate limiting and backoff to prevent quota exceeded errors.
   * 
   * @param user Firebase user
   * @param forceRefresh Force refresh the token
   * @returns Promise with the ID token
   */
  public static async getIdToken(user: User, forceRefresh = false): Promise<string> {
    if (!user) {
      throw new Error("User is required to get ID token");
    }

    const userId = user.uid;

    // If a refresh is already in progress for this user, wait for it
    if (this.refreshInProgress.has(userId)) {
      this.logInfo("Token refresh already in progress, waiting for result");
      try {
        // Add a timeout to the waiting process to avoid hanging indefinitely
        const refreshPromise = this.refreshInProgress.get(userId)!;
        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error("Token refresh timeout")), this.TOKEN_REQUEST_TIMEOUT_MS);
        });
        
        return await Promise.race([refreshPromise, timeoutPromise]);
      } catch (error) {
        this.logWarn("Timed out waiting for token refresh, using cached token if available");
        // If we have a cached token, return it rather than failing
        if (this.tokenCache.has(userId)) {
          return this.tokenCache.get(userId)!.token;
        }
        throw error;
      }
    }

    // Check cache first if we're not forcing a refresh
    if (!forceRefresh && this.tokenCache.has(userId)) {
      const cache = this.tokenCache.get(userId)!;
      const now = Date.now();
      
      // Use cached token if it's not expired or close to expiring
      if (now < cache.expiresAt - this.TOKEN_EXPIRY_BUFFER_MS) {
        this.logInfo("Using cached token");
        return cache.token;
      }
    }

    // Check if we need to rate limit
    const now = Date.now();
    const lastRefresh = this.lastRefreshTime.get(userId) || 0;
    const timeSinceLastRefresh = now - lastRefresh;
    
    if (timeSinceLastRefresh < this.MIN_REFRESH_INTERVAL_MS && !forceRefresh) {
      // If we're within rate limit window and have a cached token, return it
      if (this.tokenCache.has(userId)) {
        this.logInfo("Rate limited, using cached token");
        return this.tokenCache.get(userId)!.token;
      }
    }

    // Create a promise for this refresh and store it
    const refreshPromise = this.refreshToken(user, forceRefresh);
    this.refreshInProgress.set(userId, refreshPromise);

    try {
      // Add a timeout to this process as well
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("Token refresh timeout")), this.TOKEN_REQUEST_TIMEOUT_MS);
      });
      
      const token = await Promise.race([refreshPromise, timeoutPromise]);
      return token;
    } catch (error) {
      this.logError("Token refresh failed or timed out", error);
      // If we have a cached token, return it rather than failing
      if (this.tokenCache.has(userId)) {
        this.logWarn("Using cached token after refresh failure");
        return this.tokenCache.get(userId)!.token;
      }
      throw error;
    } finally {
      // Clear the in-progress promise
      this.refreshInProgress.delete(userId);
    }
  }

  /**
   * Parse a JWT token to extract expiration time
   */
  private static parseJwt(token: string): { exp: number } | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      this.logError("Failed to parse JWT", e);
      return null;
    }
  }

  /**
   * Actually refresh the token with backoff retry logic
   */
  private static async refreshToken(user: User, forceRefresh: boolean): Promise<string> {
    const userId = user.uid;
    let retryCount = 0;
    const maxRetries = this.MAX_RETRIES;
    
    while (true) {
      try {
        // Update last refresh time
        this.lastRefreshTime.set(userId, Date.now());
        
        // Get a fresh token
        const token = await user.getIdToken(forceRefresh);
        
        // Parse token to get expiration time
        const parsedToken = this.parseJwt(token);
        const expiresAt = parsedToken?.exp ? parsedToken.exp * 1000 : Date.now() + 3600000; // 1 hour default
        
        // Cache the token
        this.tokenCache.set(userId, {
          token,
          expiresAt
        });
        
        // Reset error counter on success
        this.consecutiveErrors.set(userId, 0);
        
        return token;
      } catch (error) {
        // Increase consecutive errors
        const errorCount = (this.consecutiveErrors.get(userId) || 0) + 1;
        this.consecutiveErrors.set(userId, errorCount);
        
        const isQuotaError = error instanceof Error && 
          (error.message.includes("quota") || 
           error.message.includes("429") || 
           (error as any).code === "auth/quota-exceeded");
        
        if (isQuotaError && retryCount < maxRetries) {
          // Calculate exponential backoff with jitter
          const backoffMs = this.INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
          const jitterMs = Math.random() * 1000; // Add up to 1 second of jitter
          const delayMs = backoffMs + jitterMs;
          
          this.logWarn(`Quota exceeded, retrying in ${Math.round(delayMs/1000)}s (retry ${retryCount + 1}/${maxRetries})`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delayMs));
          retryCount++;
          continue;
        }
        
        // If we have a cached token, return it rather than failing
        if (this.tokenCache.has(userId)) {
          this.logWarn("Token refresh failed, using cached token", error);
          return this.tokenCache.get(userId)!.token;
        }
        
        // No cache and can't refresh, must throw error
        this.logError("Failed to refresh token", error);
        throw error;
      }
    }
  }

  /**
   * Clear the token cache for a user
   */
  public static clearCache(userId: string): void {
    this.tokenCache.delete(userId);
    this.lastRefreshTime.delete(userId);
    this.consecutiveErrors.delete(userId);
  }

  /**
   * Simple logging helpers that don't depend on external logger
   */
  private static logInfo(message: string): void {
    if (this.DEBUG_MODE) {
      console.info(`[TokenRefreshManager] ${message}`);
    }
  }

  private static logWarn(message: string, error?: any): void {
    console.warn(`[TokenRefreshManager] ${message}`, error ? error : "");
  }

  private static logError(message: string, error?: any): void {
    console.error(`[TokenRefreshManager] ${message}`, error ? error : "");
  }
}