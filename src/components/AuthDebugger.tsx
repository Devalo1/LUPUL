import React, { useEffect } from "react"; // Add useEffect import
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
// Fix import - using default import if that's how it's exported
import _refreshUserAuthToken from "../utils/tokenRefresh"; 
import logger from "../utils/logger";

const debugLogger = logger.createLogger("AuthDebugger");

/**
 * Componentă pentru verificarea și sincronizarea rolurilor utilizatorilor
 * Această componentă nu renderează nimic, dar rulează logica de verificare la fiecare autentificare
 */
const AuthDebugger: React.FC = () => {
  const { user, userRole, isAdmin, isSpecialist } = useAuth();

  // Verificăm rolurile utilizatorului la fiecare autentificare
  useEffect(() => {
    const checkUserRoles = async () => {
      if (!user) return;

      debugLogger.info(`Utilizator autentificat: ${user.email}`);
      debugLogger.info(`Rol din token: ${userRole}`);
      debugLogger.info(`Este admin: ${isAdmin}`);
      debugLogger.info(`Este specialist: ${isSpecialist}`);

      try {
        // Verificăm rolul din Firestore
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firestoreRole = userData.role || "user";
          
          debugLogger.info(`Rol din Firestore: ${firestoreRole}`);
          
          // Verificăm dacă rolurile sunt diferite
          if (userRole !== firestoreRole) {
            debugLogger.warn(`DIFERENȚĂ DETECTATĂ: Token=${userRole}, Firestore=${firestoreRole}`);
            debugLogger.info("Se recomandă utilizarea butonului 'Reîmprospătează sesiunea'");
          }
        } else {
          debugLogger.warn(`Utilizatorul nu are un document Firestore.`);
        }
      } catch (error) {
        debugLogger.error("Eroare la verificarea rolurilor:", error);
      }
    };
    
    if (user) {
      checkUserRoles();
    }
  }, [user, userRole, isAdmin, isSpecialist]);

  // Această componentă nu renderează nimic vizibil
  return null;
};

export default AuthDebugger;