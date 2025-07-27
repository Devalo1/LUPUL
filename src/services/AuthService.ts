import { auth, firestore, isUserAdmin, ADMIN_EMAILS } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
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

      // Verificăm dacă este admin și actualizăm flagul dacă este cazul
      if (email === "dani_popa21@yahoo.ro" || ADMIN_EMAILS.includes(email)) {
        const userRef = doc(firestore, "users", result.user.uid);
        await setDoc(
          userRef,
          {
            isAdmin: true,
            role: "admin",
            lastLogin: new Date(),
            updatedAt: new Date(),
          },
          { merge: true }
        );
      } else {
        // Pentru utilizatori non-admin, actualizăm doar timestamp-ul de login
        const userRef = doc(firestore, "users", result.user.uid);

        // Verificăm dacă utilizatorul există deja în Firestore
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // Actualizăm doar timestamp-ul de login pentru utilizatorii existenți
          await setDoc(
            userRef,
            {
              lastLogin: new Date(),
              updatedAt: new Date(),
            },
            { merge: true }
          );
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
            role: "user",
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
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Creăm un document pentru utilizator în Firestore
      await setDoc(doc(firestore, "users", result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName || email.split("@")[0],
        photoURL: result.user.photoURL,
        createdAt: new Date(),
        lastLogin: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
        role: "user",
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
      authLogger.info(
        `Încercare de trimitere email de resetare parolă către: ${email}`
      );

      // Verificăm mai întâi dacă utilizatorul există în Firebase
      // Pentru a detecta tipul de cont (email/password vs Google)
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`, // URL-ul de redirecționare după resetarea parolei
        handleCodeInApp: false, // Setăm la false pentru a gestiona pe pagina de Firebase
      });

      authLogger.info(
        `Email de resetare parolă trimis cu succes către: ${email}`
      );
    } catch (error: unknown) {
      const err = handleUnknownError(error);

      // Verificăm dacă utilizatorul există în Firestore pentru a determina tipul de cont
      if (err.code === "auth/user-not-found") {
        // Utilizatorul nu există deloc
        throw err;
      } else {
        // Pentru alte erori, inclusiv conturi Google care nu au parolă
        try {
          // Verificăm în baza de date dacă este cont Google
          const userRef = doc(firestore, "users", email.replace(/[@.]/g, "_"));
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Dacă utilizatorul există dar nu poate reseta parola, probabil e cont Google
            if (
              userData.photoURL &&
              userData.photoURL.includes("googleusercontent")
            ) {
              throw new Error("no-password");
            }
          }
        } catch (dbError) {
          authLogger.warn("Nu s-a putut verifica tipul de cont:", dbError);
        }
      }

      authLogger.error(
        "Eroare detaliată la trimiterea emailului de resetare:",
        err
      );

      // Gestionăm mai specific erorile pentru a oferi un feedback mai bun
      if (err.code === "auth/user-not-found") {
        throw new Error("Nu există niciun cont asociat cu acest email.");
      } else if (err.code === "auth/invalid-email") {
        throw new Error("Adresa de email nu este validă.");
      } else if (err.code === "auth/too-many-requests") {
        throw new Error(
          "Prea multe încercări. Vă rugăm să încercați din nou mai târziu."
        );
      } else {
        throw new Error(
          `Eroare la trimiterea emailului de resetare: ${err.message || "Eroare necunoscută"}`
        );
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
   */ async loginWithGoogle(redirectPath?: string): Promise<GoogleAuthResult> {
    try {
      authLogger.info(
        "Începe procesul de autentificare cu Google Popup, redirectPath:",
        redirectPath
      );

      // Configurăm provider-ul pentru Google
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");

      // Configurăm parametrii pentru producție și dezvoltare
      const isProduction =
        window.location.hostname === "lupulsicorbul.com" ||
        window.location.hostname.includes("lupulsicorbul.com");

      // Build custom parameters object with only string values
      const customParams: Record<string, string> = {
        prompt: "select_account",
      };

      // Add production-specific parameters only if they have string values
      if (isProduction) {
        customParams.access_type = "online";
        // Note: hd parameter is intentionally omitted to allow all Google domains
      }

      provider.setCustomParameters(customParams);

      try {
        // Folosim popup în loc de redirect
        const result = await signInWithPopup(auth, provider);

        if (result && result.user) {
          authLogger.info(
            "Autentificare Google reușită pentru:",
            result.user.email
          );

          // Verificăm dacă utilizatorul este admin folosind funcția din firebase.ts
          let isAdmin = false;
          if (result.user.email) {
            isAdmin = await isUserAdmin(result.user.email);
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
              role: isAdmin ? "admin" : "user",
            };

            // Dacă utilizatorul există deja, păstrăm data creării
            if (userDoc.exists()) {
              const existingData = userDoc.data();
              await setDoc(
                userRef,
                {
                  ...userData,
                  createdAt: existingData.createdAt?.toDate() || new Date(),
                },
                { merge: true }
              );
            } else {
              // Utilizator nou
              await setDoc(userRef, {
                ...userData,
                createdAt: new Date(),
              });
            }

            authLogger.info("Date utilizator salvate cu succes în Firestore");
          } catch (dbError) {
            authLogger.error(
              "Eroare la salvarea datelor utilizatorului:",
              dbError
            );
            // Continuăm procesul de autentificare chiar dacă salvarea datelor eșuează
          }

          // Redirecționăm utilizatorul către pagina corectă
          const targetPath = isAdmin
            ? "/admin/dashboard"
            : redirectPath || "/user-home";

          // Returnăm rezultatul pentru a permite redirecționarea în componenta care a apelat această metodă
          return {
            success: true,
            user: result.user,
            isAdmin,
            redirectPath: targetPath,
          };
        }

        return { success: false, error: "Autentificare eșuată" };
      } catch (popupError: unknown) {
        // Dacă popup-ul eșuează, înregistrăm eroarea și oferim un mesaj specific
        const err = handleUnknownError(popupError);
        authLogger.error("Eroare la popup Google:", err);

        // Verificăm tipul de eroare pentru a oferi mesaje specifice
        if (err.message?.includes("popup-closed-by-user")) {
          return {
            success: false,
            error:
              "Autentificarea a fost anulată. Vă rugăm să încercați din nou.",
          };
        } else if (err.message?.includes("popup-blocked")) {
          return {
            success: false,
            error:
              "Popup-ul de autentificare a fost blocat. Vă rugăm să permiteți popup-urile pentru acest site.",
          };
        } else if (
          err.message?.includes("unauthorized-domain") ||
          err.message?.includes("auth/unauthorized-domain")
        ) {
          return {
            success: false,
            error:
              "Domeniul nu este autorizat pentru autentificare. Vă rugăm să contactați administratorul.",
          };
        } else {
          return {
            success: false,
            error:
              "Autentificarea cu Google a eșuat. Vă rugăm încercați din nou sau folosiți email/parolă.",
          };
        }
      }
    } catch (error: unknown) {
      const err = handleUnknownError(error);
      authLogger.error("Eroare la autentificarea cu Google:", err);

      // Gestionăm erori specifice de Firebase Auth
      if (err.message?.includes("auth/unauthorized-domain")) {
        return {
          success: false,
          error:
            "Domeniul nu este autorizat pentru autentificare Google. Contactați administratorul pentru a adăuga domeniul în Firebase Console.",
        };
      } else if (err.message?.includes("auth/operation-not-allowed")) {
        return {
          success: false,
          error:
            "Autentificarea cu Google nu este activată. Contactați administratorul.",
        };
      }

      return {
        success: false,
        error: err.message || "A apărut o eroare la autentificarea cu Google",
      };
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
          authLogger.info(
            `Utilizatorul admin ${email} nu există încă în Firestore, se va configura la prima autentificare`
          );
          continue;
        }

        // Actualizăm fiecare utilizator găsit
        for (const doc of userSnapshot.docs) {
          const userData = doc.data();
          const userId = doc.id;

          // Verificăm dacă utilizatorul nu are deja rol de admin
          if (!userData.isAdmin && userData.role !== "admin") {
            authLogger.info(
              `Reparăm rolul pentru utilizatorul ${email} (${userId})`
            );

            await setDoc(
              doc.ref,
              {
                isAdmin: true,
                role: "admin",
                updatedAt: new Date(),
              },
              { merge: true }
            );

            // Verificăm și în colecția admins
            const adminsCollection = collection(firestore, "admins");
            const adminQuery = query(
              adminsCollection,
              where("email", "==", email)
            );
            const adminSnapshot = await getDocs(adminQuery);

            if (adminSnapshot.empty) {
              await addDoc(adminsCollection, {
                userId,
                email,
                createdAt: new Date(),
              });
              authLogger.info(
                `Utilizatorul ${email} adăugat în colecția admins`
              );
            }
          } else {
            authLogger.info(
              `Utilizatorul ${email} are deja rolul de admin configurat corect`
            );
          }
        }
      } catch (err) {
        authLogger.error(
          `Eroare la verificarea/repararea rolului pentru ${email}:`,
          err
        );
        // Continuăm cu următorul email din listă
      }
    }

    authLogger.info("Verificare și reparare roluri admin finalizată");
  } catch (error) {
    authLogger.error(
      "Eroare generală la verificarea/repararea rolurilor admin:",
      error
    );
    // Nu aruncăm eroarea mai departe pentru a nu întrerupe fluxul aplicației
  }
};

// Exportăm o instanță a serviciului pentru a fi folosită în aplicație
const authService = new AuthService();
export default authService;
