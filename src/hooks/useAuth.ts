import { useAuth as originalUseAuth } from "../contexts/useAuth";
import TokenBlocker from "../firebase/tokenBlocker";

/**
 * Custom hook pentru context-ul de autentificare
 * Extends the original useAuth with token blocking functionality
 */
export const useAuth = () => {
  const context = originalUseAuth();
  
  if (!context) {
    throw new Error("useAuth trebuie folosit într-un AuthProvider");
  }
  
  // Adăugăm o verificare suplimentară pentru blocarea token-urilor
  const decoratedContext = {
    ...context,
    
    // Suprascriem refreshUserData pentru a verifica blocarea token-urilor
    refreshUserData: async (): Promise<void> => {
      // Verificăm dacă token blocker-ul este activ
      if (TokenBlocker.isBlocked()) {
        console.warn("RefreshUserData ignorat - blocarea token-urilor este activă");
        return;
      }
      
      await context.refreshUserData();
      return;
    }
  };
  
  return decoratedContext;
};
