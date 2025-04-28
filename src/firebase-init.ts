// Fișier pentru inițializarea Firebase și asigurarea încărcării corecte
import { isInitialized, initializeFirebase } from "./firebase-core";

// Pentru compatibilitate cu codul existent
declare global {
  interface Window {
    __FIREBASE_INITIALIZED__?: boolean;
  }
}

// Exportăm o funcție care verifică inițializarea Firebase
export async function ensureFirebaseInitialized() {
  try {
    if (isInitialized) {
      // Firebase este deja inițializat
      console.info("Firebase este deja inițializat");
      
      // Marcăm inițializarea pentru compatibilitate
      if (typeof window !== "undefined") {
        window.__FIREBASE_INITIALIZED__ = true;
      }
      
      return true;
    }
    
    // În cazul în care Firebase nu ar fi inițializat, apelăm initializeFirebase
    console.info("Se inițializează Firebase...");
    initializeFirebase();
    
    // Marcăm inițializarea pentru compatibilitate
    if (typeof window !== "undefined") {
      window.__FIREBASE_INITIALIZED__ = true;
    }
    
    console.info("Firebase a fost inițializat cu succes");
    return true;
  } catch (error) {
    console.error("Eroare la inițializarea Firebase:", error);
    return false;
  }
}

// Exportăm funcția de verificare a inițializării
export function isFirebaseInitialized() {
  return isInitialized;
}