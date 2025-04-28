// Implementare completă a autentificării Google - versiune simplificată
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  getAuth
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";

/**
 * Funcție simplă de autentificare cu Google folosind popup în loc de redirect
 * Folosește metoda signInWithPopup în loc de signInWithRedirect pentru a evita probleme de redirect
 */
export const loginWithGoogle = async (): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> => {
  try {
    // Inițializează serviciile Firebase
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    // Adaugă scopes necesare
    provider.addScope("profile");
    provider.addScope("email");
    
    console.log("Începe autentificarea cu Google folosind popup...");
    
    // Folosește popup în loc de redirect - mai puține probleme
    const result = await signInWithPopup(auth, provider);
    
    // Autentificare reușită - verifică dacă utilizatorul este admin
    if (result.user) {
      console.log("Autentificare Google reușită:", result.user.email);
      
      // Salvează datele utilizatorului în Firestore
      try {
        const userRef = doc(firestore, "users", result.user.uid);
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName || "Utilizator",
          photoURL: result.user.photoURL,
          lastLogin: new Date(),
          updatedAt: new Date(),
          createdAt: new Date(),
          isAdmin: false, // Toți utilizatorii obișnuiți au isAdmin=false
          role: "user"    // și rol 'user'
        }, { merge: true });
        
        console.log("Date utilizator salvate cu succes în Firestore");
      } catch (firestoreError) {
        console.error("Eroare la salvarea datelor utilizatorului:", firestoreError);
        // Continuă - eroarea nu ar trebui să împiedice autentificarea
      }
      
      return {
        success: true,
        user: result.user
      };
    }
    
    return {
      success: false,
      error: "Nu s-a găsit niciun utilizator după autentificarea cu Google"
    };
    
  } catch (error) {
    console.error("Eroare la autentificarea cu Google:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Eroare necunoscută la autentificarea cu Google"
    };
  }
};