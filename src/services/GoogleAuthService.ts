import { 
  signInWithPopup, 
  GoogleAuthProvider,
  getAuth
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestore, ADMIN_EMAILS } from "../firebase";
import logger from "../utils/logger";

// Create service-specific logger
const googleServiceLogger = logger.createLogger("GoogleAuthService");

/**
 * Un serviciu simplu de autentificare cu Google care folosește popup
 * în loc de redirect pentru a evita problemele de redirecționare
 */
export const GoogleAuthService = {
  /**
   * Autentificare simplă cu Google folosind popup
   */
  async signIn() {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      
      // Adăugăm scopuri necesare
      provider.addScope("profile");
      provider.addScope("email");
      
      googleServiceLogger.debug("Pornire autentificare Google cu popup...");
      
      // Folosim popup în loc de redirect pentru simplitate
      const result = await signInWithPopup(auth, provider);
      
      if (result && result.user) {
        googleServiceLogger.debug("Autentificare Google reușită pentru:", result.user.email);
        
        // Determinăm dacă utilizatorul este admin
        const isAdmin = result.user.email ? ADMIN_EMAILS.includes(result.user.email) : false;
        googleServiceLogger.debug("Este utilizator admin:", isAdmin);
        
        // Salvăm sau actualizăm datele utilizatorului în Firestore
        await this.saveUserToFirestore(result.user, isAdmin);
        
        return {
          success: true,
          user: result.user,
          isAdmin
        };
      }
      
      return {
        success: false,
        error: "Nu s-a putut obține utilizatorul după autentificare"
      };
    } catch (error) {
      googleServiceLogger.error("Eroare la autentificarea cu Google:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Eroare necunoscută"
      };
    }
  },
  
  /**
   * Salvează sau actualizează datele utilizatorului în Firestore
   */
  async saveUserToFirestore(user: Record<string, any>, isAdmin = false) {
    if (!user || !user.uid) {
      googleServiceLogger.error("Utilizator invalid sau fără uid");
      return false;
    }
    
    try {
      const userRef = doc(firestore, "users", user.uid);
      
      // Verificăm dacă utilizatorul există deja
      const userDoc = await getDoc(userRef);
      let userData = {
        email: user.email,
        displayName: user.displayName || "Utilizator",
        photoURL: user.photoURL,
        lastLogin: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        isAdmin: isAdmin,
        role: isAdmin ? "admin" : "user"
      };
      
      // Dacă utilizatorul există deja, păstrăm data creării
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        userData = {
          ...userData,
          createdAt: existingData.createdAt?.toDate() || new Date()
        };
      } else {
        // Utilizator nou
        userData.createdAt = new Date();
      }
      
      // Salvăm datele în Firestore
      await setDoc(userRef, userData, { merge: true });
      googleServiceLogger.debug("Date utilizator salvate cu succes în Firestore");
      
      return true;
    } catch (error) {
      googleServiceLogger.error("Eroare la salvarea datelor utilizatorului:", error);
      return false;
    }
  }
};