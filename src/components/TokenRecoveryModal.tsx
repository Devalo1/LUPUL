import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import TokenManager from "../utils/TokenManager";
import { ProfileSyncService } from "../services/ProfileSyncService"; 
import logger from "../utils/logger";

const recoveryLogger = logger.createLogger("TokenRecovery");

/**
 * Componentă pentru recuperarea după erori de autentificare
 * Se afișează atunci când detectăm token-uri corupte și oferă 
 * utilizatorului opțiunea de a curăța datele și a se reconecta
 */
const TokenRecoveryModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [consoleErrors, _setConsoleErrors] = useState<ErrorData | "">("");

  // Define ErrorData type
  type ErrorData = {
    message: string;
    [key: string]: unknown;
  };

  const _handleError = (_error: ErrorData): void => {
    // Handle error logic here
  };

  // Verificăm la intervale regulate dacă aplicația are probleme cu token-urile
  const checkTokenErrors = useCallback(() => {
    // Limitează frecvența verificărilor (nu mai mult de o dată la 5 secunde)
    const now = Date.now();
    if (now - lastCheckTime < 5000) return;
    setLastCheckTime(now);
    
    // Verificarea se face doar dacă utilizatorul este autentificat
    if (auth.currentUser) {
      // Obținem starea token-ului
      const tokenHealth = TokenManager.getTokenHealthStatus();
      
      // Verificăm dacă în console există erori legate de token-uri
      const hasTokenErrors = 
        typeof consoleErrors === "object" && 
        consoleErrors?.message?.includes("auth/quota-exceeded") ||
        typeof consoleErrors === "object" && 
        consoleErrors?.message?.includes("400 Bad Request") ||
        typeof consoleErrors === "object" && 
        consoleErrors?.message?.includes("auth/invalid-credential");
      
      // Verificăm dacă avem probleme severe cu token-ul
      const hasTokenProblems = 
        hasTokenErrors || 
        tokenHealth.consecutiveFailures > 3 || 
        (tokenHealth.isInBackoff && tokenHealth.consecutiveFailures > 1) ||
        !tokenHealth.isTokenValid;
      
      if (hasTokenProblems) {
        recoveryLogger.warn("Detectate probleme cu token-ul:", tokenHealth);
        setErrorCount(prev => prev + 1);
        
        // Afișăm modalul doar dacă avem mai multe erori consecutive
        if (errorCount >= 2 && !tokenHealth.circuitBreakerActive) {
          recoveryLogger.warn("Multiple erori de token detectate, afișăm modalul de recuperare");
          setIsVisible(true);
        }
      } else {
        // Reducem treptat contorul de erori dacă nu avem probleme
        if (errorCount > 0) {
          setErrorCount(prev => prev - 1);
        }
        
        // Ascundem modalul dacă nu mai avem erori
        if (isVisible && errorCount <= 1) {
          setIsVisible(false);
        }
      }
      
      // Verificăm dacă circuit breaker-ul este activ
      if (tokenHealth.circuitBreakerActive) {
        recoveryLogger.info("Circuit breaker activ, ascundem modalul de recuperare");
        setIsVisible(false);
      }
    }
  }, [errorCount, isVisible, lastCheckTime, consoleErrors]);

  // Verificăm la intervale regulate
  useEffect(() => {
    // Verificăm la pornire și la fiecare 10 secunde
    checkTokenErrors();
    const interval = setInterval(checkTokenErrors, 10000);

    return () => clearInterval(interval);
  }, [checkTokenErrors]);

  // Funcție pentru curățarea token-urilor și deconectare
  const handleCleanupAndLogout = async () => {
    setIsProcessing(true);
    setMessage("Se curăță datele și token-urile...");
    
    try {
      recoveryLogger.info("Începe procesul de curățare și deconectare");
      
      // Folosim ProfileSyncService pentru a curăța complet și a deconecta
      await ProfileSyncService.forceTokenReset();
      
      setMessage("Datele au fost curățate cu succes. Veți fi redirecționat la pagina de autentificare...");
      
      // Redirecționăm utilizatorul la pagina de autentificare după o scurtă pauză
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      recoveryLogger.error("Eroare la curățarea datelor:", error);
      setMessage("A apărut o eroare la curățarea datelor. Reîncărcați pagina și încercați din nou.");
      setIsProcessing(false);
    }
  };

  // Doar afișăm modalul dacă este vizibil
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">Problemă de autentificare detectată</h2>
        
        <p className="mb-4">
          Am detectat o problemă cu datele de autentificare. Acest lucru poate cauza erori repetate și 
          probleme de performanță în aplicație.
        </p>
        
        <p className="mb-4">
          Pentru a rezolva problema, trebuie să curățăm datele salvate și să vă reconectați.
          Acest proces nu vă va afecta datele personale sau alte setări.
        </p>
        
        {message && (
          <div className="my-4 p-3 bg-blue-50 text-blue-700 rounded">
            {message}
          </div>
        )}
        
        <div className="flex justify-end space-x-4 mt-6">
          {!isProcessing && (
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => {
                setIsVisible(false);
                setErrorCount(0);
              }}
            >
              Mai târziu
            </button>
          )}
          
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            onClick={handleCleanupAndLogout}
            disabled={isProcessing}
          >
            {isProcessing ? "Se procesează..." : "Curăță datele și reconectează-te"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenRecoveryModal;