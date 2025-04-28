import { 
  auth, 
  firestore, 
  ensureAdminRights, 
  ADMIN_EMAILS
} from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile  // Import corect pentru updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import logger from "../utils/logger";
import { handleUnknownError } from "../utils/errorTypes";

// Create service-specific logger
const authLogger = logger.createLogger("AuthService");

// Define interface for Google login result to replace 'any'
interface GoogleAuthResult {
  success: boolean;
  user?: import("firebase/auth").User;
  isAdmin?: boolean;
  redirectPath?: string;
  error?: string;
}

export class AuthService {
  /**
   * Autentifică un utilizator cu email și parolă
   */
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificăm dacă este contul special de admin
      if (email === "dani_popa21@yahoo.ro" || ADMIN_EMAILS.includes(email)) {
        await ensureAdminRights(result.user.uid, email);
      } else {
        // Pentru utilizatori non-admin, actualizăm doar timestamp-ul de login
        const userRef = doc(firestore, "users", result.user.uid);
        
        // Verificăm dacă utilizatorul există deja în Firestore
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Actualizăm doar timestamp-ul de login pentru utilizatorii existenți
          await setDoc(userRef, {
            lastLogin: new Date(),
            updatedAt: new Date()
          }, { merge: true });
        } else {
          // Creăm un document nou pentru utilizatorii care nu există încă în Firestore
          await setDoc(userRef, {
            email: result.user.email,
            displayName: result.user.displayName || email.split("@")[0],
            photoURL: result.user.photoURL,
            createdAt: new Date(),
            lastLogin: new Date(),
            updatedAt: new Date(),
            isAdmin: false,
            role: "user"
          });
        }
      }
      
      return result;
    } catch (error) {
      authLogger.error("Eroare la autentificare:", error);
      throw error;
    }
  }
  
  /**
   * Înregistrează un utilizator nou cu email și parolă
   */
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Creăm un document pentru utilizator în Firestore
      await setDoc(doc(firestore, "users", result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName || email.split("@")[0],
        photoURL: result.user.photoURL,
        createdAt: new Date(),
        lastLogin: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
        role: "user"
      });
      
      return result;
    } catch (error) {
      authLogger.error("Eroare la înregistrare:", error);
      throw error;
    }
  }
  
  /**
   * Trimite un email pentru resetarea parolei
   */
  async resetPassword(email: string): Promise<void> {
    try {
      authLogger.info(`Încercare de trimitere email de resetare parolă către: ${email}`);
      
      // Adăugăm opțiuni suplimentare pentru configurarea corectă a emailului de resetare
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`, // URL-ul de redirecționare după resetarea parolei
        handleCodeInApp: false // Setăm la false pentru a gestiona pe pagina de Firebase
      });
      
      authLogger.info(`Email de resetare parolă trimis cu succes către: ${email}`);
    } catch (error: unknown) {
      const err = handleUnknownError(error);
      authLogger.error("Eroare detaliată la trimiterea emailului de resetare:", err);
      
      // Gestionăm mai specific erorile pentru a oferi un feedback mai bun
      if (err.code === "auth/user-not-found") {
        throw new Error("Nu există niciun cont asociat cu acest email.");
      } else if (err.code === "auth/invalid-email") {
        throw new Error("Adresa de email nu este validă.");
      } else if (err.code === "auth/too-many-requests") {
        throw new Error("Prea multe încercări. Vă rugăm să încercați din nou mai târziu.");
      } else {
        throw new Error(`Eroare la trimiterea emailului de resetare: ${err.message || "Eroare necunoscută"}`);
      }
    }
  }
  
  /**
   * Deconectează utilizatorul curent
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      authLogger.error("Eroare la deconectare:", error);
      throw error;
    }
  }
  
  /**
   * Autentificare cu Google folosind POPUP în loc de redirect
   * pentru a evita problemele de redirecționare și sesiune
   */
  async loginWithGoogle(redirectPath?: string): Promise<GoogleAuthResult> {
    try {
      authLogger.info("Începe procesul de autentificare cu Google Popup, redirectPath:", redirectPath);
      
      // Detectam daca rulam cu emulatori
      const isUsingEmulator = (auth as any)._instanceStarted === true && 
                              (auth as any)._config?.emulator?.url?.includes("localhost");
      
      if (isUsingEmulator) {
        authLogger.info("Detectat mod emulator - folosim autentificare simulată pentru Google");
        // Simulăm autentificarea cu Google folosind un cont de test pentru emulatori
        // Acest cod rulează doar în dezvoltare, când folosim emulatorul Firebase Auth
        
        // Generăm un UID random dar consistent pentru sesiunea curentă
        const testUid = `test-google-user-${Date.now()}`;
        const testEmail = "test.user@example.com";
        const testDisplayName = "Test User (Emulator)";
        
        // Creăm un obiect user similar cu cel returnat de Google Auth
        const mockUser = {
          uid: testUid,
          email: testEmail,
          displayName: testDisplayName,
          photoURL: "https://ui-avatars.com/api/?name=Test+User&background=random",
          emailVerified: true,
          isAnonymous: false,
          providerData: [{
            providerId: "google.com",
            uid: testEmail,
            displayName: testDisplayName,
            email: testEmail,
            phoneNumber: null,
            photoURL: "https://ui-avatars.com/api/?name=Test+User&background=random"
          }]
        };
        
        // Simulăm salvarea utilizatorului în Firestore
        try {
          const userRef = doc(firestore, "users", testUid);
          await setDoc(userRef, {
            email: testEmail,
            displayName: testDisplayName,
            photoURL: mockUser.photoURL,
            lastLogin: new Date(),
            updatedAt: new Date(),
            createdAt: new Date(),
            isAdmin: true, // pentru testare facilă, setăm utilizatorul ca admin
            role: "admin"
          }, { merge: true });
          
          authLogger.info("Date utilizator emulator salvate cu succes în Firestore");
        } catch (dbError) {
          authLogger.error("Eroare la salvarea datelor utilizatorului emulator:", dbError);
        }
        
        return { 
          success: true, 
          user: mockUser as any,
          isAdmin: true,
          redirectPath: "/admin/dashboard" // pentru testare, redirectionăm direct la dashboard
        };
      }
      
      // Cod normal pentru autentificare Google în producție
      // Configurăm provider-ul pentru Google
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      
      // Setăm parametri pentru a minimiza problemele Cross-Origin-Opener-Policy
      provider.setCustomParameters({
        prompt: "select_account",
        // Următorii parametri ajută să evităm problemele COOP
        "disableWebSignIn": "true",
        "login_hint": ""
      });
      
      try {
        // Folosim popup în loc de redirect
        const result = await signInWithPopup(auth, provider);
        
        if (result && result.user) {
          authLogger.info("Autentificare Google reușită pentru:", result.user.email);
          
          // Verificăm dacă utilizatorul este admin - folosim lista hardcodată pentru a evita erori
          let isAdmin = false;
          if (result.user.email) {
            isAdmin = result.user.email === "dani_popa21@yahoo.ro" || ADMIN_EMAILS.includes(result.user.email);
          }
          
          // Actualizăm sau creăm un document pentru utilizator în Firestore
          try {
            const userRef = doc(firestore, "users", result.user.uid);
            
            // Verificăm dacă utilizatorul există deja
            const userDoc = await getDoc(userRef);
            
            const userData = {
              email: result.user.email,
              displayName: result.user.displayName || "Utilizator",
              photoURL: result.user.photoURL,
              lastLogin: new Date(),
              updatedAt: new Date(),
              isAdmin: isAdmin,
              role: isAdmin ? "admin" : "user"
            };
            
            // Dacă utilizatorul există deja, păstrăm data creării
            if (userDoc.exists()) {
              const existingData = userDoc.data();
              await setDoc(userRef, {
                ...userData,
                createdAt: existingData.createdAt?.toDate() || new Date()
              }, { merge: true });
            } else {
              // Utilizator nou
              await setDoc(userRef, {
                ...userData,
                createdAt: new Date()
              });
            }
            
            authLogger.info("Date utilizator salvate cu succes în Firestore");
          } catch (dbError) {
            authLogger.error("Eroare la salvarea datelor utilizatorului:", dbError);
            // Continuăm procesul de autentificare chiar dacă salvarea datelor eșuează
          }
          
          // Redirecționăm utilizatorul către pagina corectă
          const targetPath = isAdmin ? "/admin/dashboard" : (redirectPath || "/user-home");
          
          // Returnăm rezultatul pentru a permite redirecționarea în componenta care a apelat această metodă
          return { 
            success: true, 
            user: result.user,
            isAdmin,
            redirectPath: targetPath
          };
        }
        
        return { success: false, error: "Autentificare eșuată" };
      } catch (popupError: unknown) {
        // Dacă popup-ul eșuează, înregistrăm eroarea și încercăm o abordare alternativă
        const err = handleUnknownError(popupError);
        authLogger.error("Eroare la popup Google, încercăm altă metodă:", err);
        
        return {
          success: false,
          error: "Autentificarea cu Google a eșuat. Vă rugăm încercați din nou sau folosiți email/parolă."
        };
      }
    } catch (error: unknown) {
      const err = handleUnknownError(error);
      authLogger.error("Eroare la autentificarea cu Google:", err);
      
      return {
        success: false,
        error: err.message || "A apărut o eroare la autentificarea cu Google"
      };
    }
  }

  /**
   * Actualizează profilul utilizatorului în Firebase Auth și Firestore
   * Asigură sincronizarea între ambele sisteme
   */
  async updateProfile(
    user: import("firebase/auth").User,
    profileData: { displayName?: string | null; photoURL?: string | null }
  ): Promise<void> {
    try {
      authLogger.info("Updating user profile in Firebase Auth");
      
      // Verificăm dacă avem un utilizator valid
      if (!user) {
        throw new Error("No user provided for profile update");
      }
      
      // Folosim funcția updateProfile importată direct din firebase/auth
      // în loc de metoda user.updateProfile care nu mai este disponibilă
      await updateProfile(user, {
        displayName: profileData.displayName || user.displayName || undefined,
        photoURL: profileData.photoURL || user.photoURL || undefined
      });
      
      // Actualizăm și în Firestore pentru a menține sincronizarea
      const userRef = doc(firestore, "users", user.uid);
      await setDoc(userRef, {
        displayName: profileData.displayName || user.displayName || undefined,
        photoURL: profileData.photoURL || user.photoURL || undefined,
        updatedAt: new Date()
      }, { merge: true });
      
      // Forțăm reîmprospătarea token-ului pentru a propaga modificările
      if (user && typeof user.getIdToken === "function") {
        await user.getIdToken(true);
      }
      
      authLogger.info("User profile updated successfully in both Firebase Auth and Firestore");
    } catch (error) {
      authLogger.error("Error updating user profile:", error);
      throw error;
    }
  }
}

/**
 * Verifică și repară rolurile de admin pentru utilizatorii care ar trebui să fie admin
 * dar nu au setarea corectă în baza de date.
 */
export const verificaSiRepararaRoluriAdmin = async (): Promise<void> => {
  try {
    authLogger.info("Verificare și reparare roluri admin");
    
    // Verificăm dacă utilizatorii din lista ADMIN_EMAILS au drepturi de admin
    for (const email of ADMIN_EMAILS) {
      try {
        // Căutăm utilizatorul în Firestore după email
        const usersCollection = collection(firestore, "users");
        const q = query(usersCollection, where("email", "==", email));
        const userSnapshot = await getDocs(q);
        
        if (userSnapshot.empty) {
          authLogger.info(`Utilizatorul admin ${email} nu există încă în Firestore, se va configura la prima autentificare`);
          continue;
        }
        
        // Actualizăm fiecare utilizator găsit
        for (const doc of userSnapshot.docs) {
          const userData = doc.data();
          const userId = doc.id;
          
          // Verificăm dacă utilizatorul nu are deja rol de admin
          if (!userData.isAdmin && userData.role !== "admin") {
            authLogger.info(`Reparăm rolul pentru utilizatorul ${email} (${userId})`);
            
            await setDoc(doc.ref, {
              isAdmin: true,
              role: "admin",
              updatedAt: new Date()
            }, { merge: true });
            
            // Verificăm și în colecția admins
            const adminsCollection = collection(firestore, "admins");
            const adminQuery = query(adminsCollection, where("email", "==", email));
            const adminSnapshot = await getDocs(adminQuery);
            
            if (adminSnapshot.empty) {
              await addDoc(adminsCollection, {
                userId,
                email,
                createdAt: new Date()
              });
              authLogger.info(`Utilizatorul ${email} adăugat în colecția admins`);
            }
          } else {
            authLogger.info(`Utilizatorul ${email} are deja rolul de admin configurat corect`);
          }
        }
      } catch (err) {
        authLogger.error(`Eroare la verificarea/repararea rolului pentru ${email}:`, err);
        // Continuăm cu următorul email din listă
      }
    }
    
    authLogger.info("Verificare și reparare roluri admin finalizată");
  } catch (error) {
    authLogger.error("Eroare generală la verificarea/repararea rolurilor admin:", error);
    // Nu aruncăm eroarea mai departe pentru a nu întrerupe fluxul aplicației
  }
};

/**
 * Utility function to wait for specified time
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sincronizează profilul utilizatorului între Firebase Auth și Firestore
 * Detectează discrepanțele și le reconciliază
 * Adăugat retry logic cu exponential backoff pentru erori de quota
 */
export const syncProfileChanges = async (user: import("firebase/auth").User): Promise<void> => {
  try {
    if (!user) return;
    
    authLogger.info("Synchronizing user profile between Firebase Auth and Firestore");
    const userRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    // Verificăm dacă documentul utilizatorului există
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const needsUpdate = 
        userData.displayName !== user.displayName || 
        userData.photoURL !== user.photoURL ||
        userData.email !== user.email;
      
      if (needsUpdate) {
        // Actualizăm documentul Firestore cu datele din Firebase Auth
        await setDoc(userRef, {
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
          updatedAt: new Date(),
          profileVersion: (userData.profileVersion || 0) + 1
        }, { merge: true });
        
        authLogger.info("Firestore user document synchronized with Firebase Auth");
      } else {
        authLogger.debug("No synchronization needed, profiles are already in sync");
      }
    } else {
      // Documentul nu există, îl creăm
      await setDoc(userRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        isAdmin: false,
        role: "user",
        profileVersion: 1
      });
      
      authLogger.info("Created new Firestore user document from Firebase Auth data");
    }
    
    // Verificăm dacă token-ul este mai vechi de 30 de minute înainte de a încerca să îl reîmprospătăm
    // Acest lucru va reduce semnificativ numărul de încercări de reîmprospătare
    const tokenAge = (Date.now() - (user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : 0)) / (1000 * 60);
    if (tokenAge > 30) {
      authLogger.info(`Token age is ${Math.round(tokenAge)} minutes, refreshing token`);
      await refreshTokenWithBackoff(user);
    } else {
      authLogger.debug(`Token age is ${Math.round(tokenAge)} minutes, no need to refresh yet`);
    }
  } catch (error) {
    authLogger.error("Error synchronizing user profile:", error);
  }
};

/**
 * Încearcă să reîmprospăteze token-ul de utilizator cu backoff exponențial
 * pentru a gestiona erorile de tip quota-exceeded și bad request
 */
export const refreshTokenWithBackoff = async (
  user: import("firebase/auth").User, 
  maxRetries = 3, 
  initialDelay = 2000
): Promise<boolean> => {
  let retries = 0;
  let delay = initialDelay;
  
  while (retries <= maxRetries) {
    try {
      // Încercăm să obținem un token nou
      if (user && typeof user.getIdToken === "function") {
        await user.getIdToken(true);
      } else {
        console.warn("getIdToken method not available on user object");
      }
      authLogger.info("Token refreshed successfully");
      return true;
    } catch (error: any) {
      // Verificăm codul de eroare sau status-ul HTTP pentru a determina tipul de eroare
      const isQuotaError = error?.code === "auth/quota-exceeded";
      const isBadRequestError = error?.code === "auth/invalid-credential" || 
                               error?.message?.includes("400") ||
                               error?.message?.includes("Bad Request");
      
      if ((isQuotaError || isBadRequestError) && retries < maxRetries) {
        retries++;
        // Calculăm întârzierea cu backoff exponențial (2s, 4s, 8s, etc.)
        // Adăugăm și o variație aleatorie pentru a evita apeluri simultane
        const jitter = Math.random() * 1000;
        const waitTime = delay + jitter;
        
        const errorType = isQuotaError ? "quota exceeded" : "bad request";
        authLogger.warn(`Token refresh failed (${errorType}), retrying in ${Math.round(waitTime/1000)}s (attempt ${retries}/${maxRetries})`);
        
        // Așteptăm înainte de a încerca din nou
        await wait(waitTime);
        
        // Dublăm întârzierea pentru următoarea încercare
        delay *= 2;
      } else if (isBadRequestError && retries >= maxRetries) {
        // Dacă am atins numărul maxim de încercări cu eroare Bad Request, renunțăm
        // Acest tip de eroare poate indica o problemă permanentă cu token-ul
        authLogger.error("Bad Request error persists after max retries. The token may be invalid or corrupted.");
        return false;
      } else {
        // Altă eroare sau am epuizat încercările
        authLogger.error("Failed to refresh token after retries:", error);
        return false;
      }
    }
  }
  
  return false;
};

// Exportăm o instanță a serviciului pentru a fi folosită în aplicație
const authService = new AuthService();
export default authService;
