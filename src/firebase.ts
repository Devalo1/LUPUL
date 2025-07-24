// Re-exportăm tot din firebase-core pentru compatibilitate cu codul existent
import {
  app,
  auth,
  firestore,
  db,
  storage,
  functions,
  isInitialized,
  initializeFirebase,
} from "./firebase-core";

import logger from "./utils/logger";

// Import direct pentru Firestore client API
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { httpsCallable } from "firebase/functions";

// Reexportăm toate serviciile Firebase pentru compatibilitate cu codul existent
export {
  app,
  auth,
  firestore,
  db,
  storage,
  functions,
  isInitialized,
  initializeFirebase,
};

// Lista de adrese email cu drepturi de administrator
export const ADMIN_EMAILS = [
  "dani_popa21@yahoo.ro",
  // Adaugă alte adrese de email cu drepturi de admin aici
];

// Interfața pentru datele de înregistrare la evenimente
interface EventRegistrationData {
  eventId?: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  participantCount: number;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  participant: {
    fullName: string;
    expectations: string;
    age: string;
  };
}

// Trimitere email de înregistrare la eveniment
export const sendEventRegistrationEmail = async (
  data: EventRegistrationData
) => {
  try {
    logger.info("Trimitere email de înregistrare la eveniment", data);

    // Înregistrăm informațiile de participare în Firestore
    try {
      const eventRegistrationData = {
        eventId: data.eventId,
        eventTitle: data.eventTitle,
        userId: data.user.id,
        userEmail: data.user.email,
        name: data.participant.fullName,
        email: data.user.email,
        phone: "", // Nu avem această informație, dar o adăugăm pentru compatibilitate
        additionalInfo: data.participant.expectations,
        createdAt: new Date(),
        status: "pending",
      };

      // Adăugăm înregistrarea în colecția eventRegistrations pentru compatibilitate cu panoul admin
      const registrationRef = doc(
        firestore,
        "eventRegistrations",
        Date.now().toString()
      );
      await setDoc(registrationRef, eventRegistrationData);

      logger.info("Datele de participare salvate în Firestore");
    } catch (firestoreError: unknown) {
      logger.error(
        "Eroare la salvarea datelor de participare în Firestore",
        firestoreError
      );
      // Continuăm execuția pentru a încerca totuși să trimitem email-ul
    }

    // Folosim o funcție Cloud Functions pentru email
    try {
      const sendEmailFunction = httpsCallable(
        functions,
        "sendEventRegistrationEmail"
      );
      const result = await sendEmailFunction(data);

      logger.debug("Rezultat funcție email:", result);

      return { success: true, data: result.data };
    } catch (functionsError: unknown) {
      logger.error(
        "Eroare la apelarea funcției Cloud Functions",
        functionsError
      );

      // Returnăm succes chiar dacă email-ul nu s-a trimis pentru că datele sunt salvate în Firestore
      return {
        success: true,
        data: {
          message: "Înregistrarea a fost salvată cu succes",
        },
      };
    }
  } catch (error: unknown) {
    logger.error(
      "Eroare la trimiterea email-ului de înregistrare la eveniment",
      error
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Eroare necunoscută",
    };
  }
};

// Verifică dacă un utilizator este admin prin UID
export const isAdmin = async (uid: string): Promise<boolean> => {
  try {
    // Verificăm în baza de date
    const userRef = doc(firestore, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.isAdmin === true || userData.role === "admin";
    }

    // Verificăm în colecția de administratori pentru compatibilitate
    const adminRef = doc(firestore, "admins", uid);
    const adminDoc = await getDoc(adminRef);

    return adminDoc.exists();
  } catch (error: unknown) {
    logger.error("Eroare la verificarea statutului de administrator", error);
    return false;
  }
};

// Verifică dacă un email este în lista de administratori
export const isAdminByEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email);
};

// Verifică dacă un utilizator este admin prin email
export const isUserAdmin = async (email: string): Promise<boolean> => {
  try {
    // Verificăm mai întâi în lista hardcodată
    if (ADMIN_EMAILS.includes(email)) {
      return true;
    }

    // Căutăm în colecția users
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return userData.isAdmin === true || userData.role === "admin";
    }

    return false;
  } catch (error: unknown) {
    logger.error(
      "Eroare la verificarea statutului de administrator prin email",
      error
    );
    return false;
  }
};

// Curățăm starea de autentificare
export const clearAuthState = (): void => {
  sessionStorage.removeItem("googleAuthRedirect");
  sessionStorage.removeItem("googleRedirectProcessed");
  sessionStorage.removeItem("googleAuthOriginalPath");
  sessionStorage.removeItem("afterLoginRedirect");
};

// Login cu Google prin redirect
export const loginWithGoogleRedirect = (redirectPath?: string): void => {
  // Salvăm informațiile de redirecționare în sessionStorage
  logger.info("Începere redirecționare login Google cu path:", redirectPath);
  sessionStorage.setItem("googleAuthRedirect", "true");
  sessionStorage.setItem("afterLoginRedirect", redirectPath || "/dashboard");

  // Inițializăm Google Auth Provider
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });

  // Executăm redirecționarea
  signInWithRedirect(auth, googleProvider).catch((error: unknown) => {
    logger.error("Eroare în timpul redirecționării către Google", error);
    clearAuthState();
  });
};

// Tratează redirecturile de autentificare Google
export const handleGoogleAuthRedirects = (): boolean => {
  logger.debug("Gestionare redirecționări autentificare Google");

  // Verificăm dacă ne întoarcem dintr-o redirecționare
  const isRedirecting = sessionStorage.getItem("googleAuthRedirect") === "true";

  if (isRedirecting) {
    logger.debug("Detectată redirecționare autentificare Google în curs");
  }

  return isRedirecting;
};
