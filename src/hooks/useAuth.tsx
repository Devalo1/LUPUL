import { useContext, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext";

// Configuration for token refresh backoff
const TOKEN_REFRESH_CONFIG = {
  minBackoffTime: 5000,        // 5 seconds minimum backoff
  maxBackoffTime: 300000,      // 5 minutes maximum backoff
  backoffFactor: 1.5,          // Exponential backoff factor
  maxRefreshAttempts: 3,       // Maximum consecutive refresh attempts
  refreshCooldown: 60000,      // Cooldown period after max attempts (1 minute)
};

// Track token refresh state
const tokenRefreshState = {
  lastRefreshTime: 0,
  consecutiveAttempts: 0,
  backoffTime: TOKEN_REFRESH_CONFIG.minBackoffTime,
  isInCooldown: false,
  cooldownTimer: null as NodeJS.Timeout | null,
};

// Define the hook with proper type inference and token refresh protection
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Rate-limited & protected refreshUserData
  const safeRefreshUserData = useCallback(async (): Promise<void> => {
    // Skip if in cooldown
    if (tokenRefreshState.isInCooldown) {
      console.warn("Token refresh skipped - system is in cooldown period");
      return;
    }
    
    const now = Date.now();
    const timeSinceLastRefresh = now - tokenRefreshState.lastRefreshTime;
    
    // Enforce backoff period
    if (timeSinceLastRefresh < tokenRefreshState.backoffTime) {
      console.warn(`Token refresh too frequent - waiting for backoff period (${Math.round(tokenRefreshState.backoffTime/1000)}s)`);
      return;
    }
    
    try {
      // Update refresh state before attempt
      tokenRefreshState.lastRefreshTime = now;
      tokenRefreshState.consecutiveAttempts++;
      
      // Log attempt for debugging
      console.log(`Refreshing user data (attempt ${tokenRefreshState.consecutiveAttempts} of ${TOKEN_REFRESH_CONFIG.maxRefreshAttempts})`);
      
      // Check if we've hit the maximum consecutive attempts
      if (tokenRefreshState.consecutiveAttempts >= TOKEN_REFRESH_CONFIG.maxRefreshAttempts) {
        console.warn(`Maximum consecutive refresh attempts (${TOKEN_REFRESH_CONFIG.maxRefreshAttempts}) reached, entering cooldown`);
        
        // Enter cooldown mode
        tokenRefreshState.isInCooldown = true;
        
        // Set timer to exit cooldown
        tokenRefreshState.cooldownTimer = setTimeout(() => {
          // Reset state after cooldown
          tokenRefreshState.isInCooldown = false;
          tokenRefreshState.consecutiveAttempts = 0;
          tokenRefreshState.backoffTime = TOKEN_REFRESH_CONFIG.minBackoffTime;
          console.log("Token refresh cooldown period ended, refresh operations restored");
        }, TOKEN_REFRESH_CONFIG.refreshCooldown);
        
        return; // Skip the refresh
      }
      
      // Call the original refreshUserData
      await context.refreshUserData();
      
      // Success - reset consecutive attempts and gradually reduce backoff
      tokenRefreshState.consecutiveAttempts = 0;
      tokenRefreshState.backoffTime = Math.max(
        TOKEN_REFRESH_CONFIG.minBackoffTime,
        tokenRefreshState.backoffTime / TOKEN_REFRESH_CONFIG.backoffFactor
      );
      
    } catch (error) {
      // Failure - increase backoff time exponentially
      tokenRefreshState.backoffTime = Math.min(
        tokenRefreshState.backoffTime * TOKEN_REFRESH_CONFIG.backoffFactor,
        TOKEN_REFRESH_CONFIG.maxBackoffTime
      );
      
      console.error("Token refresh failed, increasing backoff time", {
        backoffTime: tokenRefreshState.backoffTime,
        error
      });
    }
  }, [context.refreshUserData]);
  
  // Override the refresh method
  return {
    ...context,
    refreshUserData: safeRefreshUserData
  };
};