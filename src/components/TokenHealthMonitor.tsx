import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts";
import TokenManager from "../utils/TokenManager";
import { ProfileSyncService } from "../services/ProfileSyncService";
import logger from "../utils/logger";

const healthLogger = logger.createLogger("TokenHealth");

interface TokenHealthInfo {
  isValid: boolean;
  isInBackoff: boolean;
  failureCount: number;
  lastError: string | null;
  circuitBreakerActive: boolean;
}

/**
 * Componentă care monitorizează sănătatea token-urilor și încearcă să le repare automat
 * când detectează probleme
 */
const TokenHealthMonitor: React.FC = () => {
  const { user } = useAuth();
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [isPerformingRecovery, setIsPerformingRecovery] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [lastRecoveryTime, setLastRecoveryTime] = useState(0);

  // Verifica și repară token-urile automat
  const checkAndHealTokens = useCallback(async () => {
    if (!user || isPerformingRecovery) return;
    
    // Nu verificăm prea des - maxim o dată la 10 secunde
    const now = Date.now();
    if (now - lastCheckTime < 10000) return;
    setLastCheckTime(now);
    
    // Obținem starea de sănătate a token-ului
    const healthStatus = TokenManager.getTokenHealthStatus();
    const tokenHealth: TokenHealthInfo = {
      isValid: healthStatus.isTokenValid,
      isInBackoff: healthStatus.isInBackoff,
      failureCount: healthStatus.consecutiveFailures,
      lastError: healthStatus.lastError,
      circuitBreakerActive: healthStatus.circuitBreakerActive
    };
    
    // Verificăm dacă circuit breaker-ul este activ
    if (tokenHealth.circuitBreakerActive) {
      healthLogger.info("Circuit breaker activ, nu facem nimic");
      return;
    }
    
    // Verificăm dacă token-ul are probleme
    const hasTokenProblems = 
      !tokenHealth.isValid || 
      tokenHealth.failureCount > 2 || 
      (tokenHealth.isInBackoff && tokenHealth.failureCount > 0);
    
    if (hasTokenProblems) {
      // Verificăm dacă a trecut suficient timp de la ultima încercare de recuperare (minim 2 minute)
      if (now - lastRecoveryTime < 2 * 60 * 1000) {
        healthLogger.info(`Ignorăm problema token-ului - prea curând de la ultima încercare (${Math.floor((now - lastRecoveryTime) / 1000)}s)`);
        return;
      }
      
      healthLogger.warn(`Probleme cu token-ul detectate: valid=${tokenHealth.isValid}, backoff=${tokenHealth.isInBackoff}, eșecuri=${tokenHealth.failureCount}`);
      
      try {
        setIsPerformingRecovery(true);
        setLastRecoveryTime(now);
        setRecoveryAttempts(prev => prev + 1);
        
        // Dacă am încercat de prea multe ori fără succes, folosim metoda agresivă
        if (recoveryAttempts >= 2) {
          healthLogger.warn(`Prea multe încercări de recuperare (${recoveryAttempts}), folosim curățarea completă`);
          
          // Curățăm complet token-urile și deconectăm utilizatorul
          await ProfileSyncService.forceTokenReset();
          
          // Resetăm contoarele
          setRecoveryAttempts(0);
        } else {
          // Încercăm mai întâi o reparare simplă
          healthLogger.info("Încercăm să reparăm token-ul");
          const healed = await TokenManager.healToken(user);
          
          if (healed) {
            healthLogger.info("Token reparat cu succes");
            setRecoveryAttempts(0);
          } else {
            healthLogger.warn("Repararea token-ului a eșuat");
          }
        }
      } catch (error) {
        healthLogger.error("Eroare la repararea token-ului:", error);
      } finally {
        setIsPerformingRecovery(false);
      }
    } else {
      // Dacă token-ul nu are probleme, resetăm contorul de încercări de recuperare treptat
      if (recoveryAttempts > 0 && now - lastRecoveryTime > 5 * 60 * 1000) {
        setRecoveryAttempts(0);
      }
    }
  }, [user, isPerformingRecovery, lastCheckTime, recoveryAttempts, lastRecoveryTime]);

  // Verificăm la intervale regulate sănătatea token-urilor
  useEffect(() => {
    if (!user) return;
    
    // Verificăm imediat la pornire
    checkAndHealTokens();
    
    // Și apoi verificăm la fiecare 30 secunde pentru a reduce presiunea
    const interval = setInterval(checkAndHealTokens, 30000);
    
    return () => clearInterval(interval);
  }, [user, checkAndHealTokens]);

  // Nu renderizăm nimic vizibil
  return null;
};

export default TokenHealthMonitor;
