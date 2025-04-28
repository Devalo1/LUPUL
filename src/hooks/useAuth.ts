import { useContext } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthContext";
import TokenBlocker from "../firebase/tokenBlocker";

/**
 * Custom hook pentru context-ul de autentificare
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
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
