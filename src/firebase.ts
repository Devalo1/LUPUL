import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  doc, 
  setDoc, 
  collection, 
  getDoc, 
  getDocs, 
  query, 
  where,
  writeBatch
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";
import { useEmulators, getEmulatorConfig, isProd } from "./utils/environment";
import logger from "./utils/logger";

// Lista de adrese email cu drepturi de administrator
export const ADMIN_EMAILS = [
  "dani_popa21@yahoo.ro",
  // Adaugă alte adrese de email cu drepturi de admin aici
];

// Configurație Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4",
  authDomain: "lupulcorbul.firebaseapp.com",
  projectId: "lupulcorbul",
  storageBucket: "lupulcorbul.firebasestorage.app",
  messagingSenderId: "312943074536",
  appId: "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: "G-38YSZKVXDC"
};

// Inițializăm Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
export const isInitialized = true;

// Inițializare Analytics doar în mediul de producție și doar dacă este suportat
let analytics = null;
if (isProd) {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      logger.info("Firebase Analytics inițializat");
    } else {
      logger.warn("Firebase Analytics nu este suportat în acest browser/mediu");
    }
  }).catch(error => {
    logger.error("Eroare la inițializarea Firebase Analytics", error);
  });
}

// Conectarea la emulatori dacă este necesar
if (useEmulators()) {
  logger.info("Conectare la emulatorii Firebase...");
  
  const emulatorConfig = getEmulatorConfig();
  if (emulatorConfig) {
    // Conectăm emulatorii doar dacă avem configurații valide
    if (emulatorConfig.auth) {
      connectAuthEmulator(
        auth, 
        `http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`, 
        { disableWarnings: true }
      );
    }
    
    if (emulatorConfig.firestore) {
      connectFirestoreEmulator(
        firestore, 
        emulatorConfig.firestore.host, 
        emulatorConfig.firestore.port
      );
    }
    
    if (emulatorConfig.storage) {
      connectStorageEmulator(
        storage, 
        emulatorConfig.storage.host, 
        emulatorConfig.storage.port
      );
    }
    
    if (emulatorConfig.functions) {
      connectFunctionsEmulator(
        functions, 
        emulatorConfig.functions.host, 
        emulatorConfig.functions.port
      );
    }
  }
}

// Inițializare Firebase - păstrat pentru compatibilitate
export const initializeFirebase = () => {
  logger.info("Firebase already initialized");
  return { app, auth, firestore, storage, functions };
};

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
export const sendEventRegistrationEmail = async (data: EventRegistrationData) => {
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
        status: "pending"
      };
      
      // Adăugăm înregistrarea în colecția eventRegistrations pentru compatibilitate cu panoul admin
      const registrationRef = doc(collection(firestore, "eventRegistrations"));
      await setDoc(registrationRef, eventRegistrationData);
      
      logger.info("Datele de participare salvate în Firestore");
    } catch (firestoreError: unknown) {
      logger.error("Eroare la salvarea datelor de participare în Firestore", firestoreError);
      // Continuăm execuția pentru a încerca totuși să trimitem email-ul
    }
    
    // Folosim o funcție Cloud Functions pentru email
    const sendEmailFunction = httpsCallable(functions, "sendEventRegistrationEmail");
    const result = await sendEmailFunction(data);
    
    logger.debug("Rezultat funcție email:", result);
    
    return { success: true, data: result.data };
  } catch (error: unknown) {
    logger.error("Eroare la trimiterea email-ului de înregistrare la eveniment", error);
    
    // Emulare succes în caz de eroare în dezvoltare - permite aplicației să funcționeze
    if (!isProd) {
      logger.warn("Mod dezvoltare: returnăm succes simulat în ciuda erorii");
      return { 
        success: true, 
        data: { 
          mock: true, 
          message: "Email simulat în dezvoltare"
        } 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Eroare necunoscută"
    };
  }
};

// Verifică dacă un utilizator este admin
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

// Asigură drepturile de administrator în baza de date
export const ensureAdminRights = async (uid: string, email: string): Promise<boolean> => {
  try {
    // Căutăm în colecția cu lista de administratori autorizați
    const adminsListRef = collection(firestore, "admin_emails");
    const q = query(adminsListRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      logger.warn(`Utilizatorul ${email} nu este în lista de administratori autorizați`);
      return false;
    }
    
    // Setăm drepturile de administrator în baza de date
    const userRef = doc(firestore, "users", uid);
    await setDoc(userRef, {
      isAdmin: true,
      role: "admin",
      updatedAt: new Date()
    }, { merge: true });
    
    // Adăugăm și în colecția de administratori pentru compatibilitate
    const adminRef = doc(firestore, "admins", uid);
    await setDoc(adminRef, {
      email,
      uid,
      createdAt: new Date()
    });
    
    return true;
  } catch (error: unknown) {
    logger.error("Eroare la asigurarea drepturilor de administrator", error);
    return false;
  }
};

// Adaugă un nou administrator în baza de date
export const addAdminUser = async (email: string, adminName?: string): Promise<boolean> => {
  try {
    // Verificăm dacă email-ul este deja în colecția admin_emails
    const adminsListRef = collection(firestore, "admin_emails");
    const q = query(adminsListRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      logger.info(`Utilizatorul ${email} este deja în lista de administratori`);
      return true;
    }
    
    // Adăugăm email-ul în colecția admin_emails
    const adminEmailRef = doc(collection(firestore, "admin_emails"));
    await setDoc(adminEmailRef, {
      email,
      name: adminName || email.split("@")[0],
      addedAt: new Date(),
      active: true
    });
    
    logger.info(`Administrator nou adăugat: ${email}`);
    
    // Verificăm dacă există deja un cont de utilizator cu acest email
    // și îi actualizăm drepturile dacă există
    const usersRef = collection(firestore, "users");
    const userQuery = query(usersRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      // Utilizatorul există, actualizăm drepturile
      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;
      
      await setDoc(doc(firestore, "users", userId), {
        isAdmin: true,
        role: "admin",
        updatedAt: new Date()
      }, { merge: true });
      
      // Adăugăm și în colecția de administratori pentru compatibilitate
      await setDoc(doc(firestore, "admins", userId), {
        email,
        uid: userId,
        createdAt: new Date()
      }, { merge: true });
      
      logger.info(`Drepturi de administrator actualizate pentru utilizatorul existent: ${email}`);
    }
    
    return true;
  } catch (error: unknown) {
    logger.error("Eroare la adăugarea administratorului nou", error);
    return false;
  }
};

// Obține lista tuturor administratorilor din sistem
export const getAllAdmins = async (): Promise<Array<{
  id?: string;
  email: string;
  source: string;
  addedAt: Date | null;
  active: boolean;
  name?: string;
  role?: string;
  [key: string]: unknown;
}>> => {
  try {
    const adminsList: Array<{
      id?: string;
      email: string;
      source: string;
      addedAt: Date | null;
      active: boolean;
      name?: string;
      role?: string;
      [key: string]: unknown;
    }> = [];
    
    // Obținem lista din colecția admin_emails
    const adminsListRef = collection(firestore, "admin_emails");
    const emailsSnapshot = await getDocs(adminsListRef);
    
    // Transformăm datele și le adăugăm în lista rezultat
    emailsSnapshot.forEach(doc => {
      const data = doc.data();
      adminsList.push({
        id: doc.id,
        ...data,
        source: "admin_emails",
        // Ensure these properties exist with default values if they don't
        email: data.email || "",
        addedAt: data.addedAt || null,
        active: data.active !== undefined ? data.active : true
      });
    });
    
    // Adăugăm și administratorii din lista hardcodată care nu sunt deja incluși
    for (const email of ADMIN_EMAILS) {
      if (!adminsList.some(admin => admin.email === email)) {
        adminsList.push({
          email,
          source: "config",
          addedAt: null,
          active: true
        });
      }
    }
    
    // Obținem și utilizatorii cu rol de admin din colecția users
    const usersRef = collection(firestore, "users");
    const usersQuery = query(usersRef, where("role", "==", "admin"));
    const usersSnapshot = await getDocs(usersQuery);
    
    // Adăugăm și utilizatorii admin care nu sunt deja incluși
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (!adminsList.some(admin => admin.email === userData.email)) {
        adminsList.push({
          id: doc.id,
          ...userData,
          source: "users",
          // Ensure required properties exist
          email: userData.email || "",
          addedAt: userData.createdAt || null,
          active: true
        });
      }
    });
    
    return adminsList;
  } catch (error: unknown) {
    logger.error("Eroare la obținerea listei de administratori", error);
    return [];
  }
};

// Revocă drepturile de administrator pentru un utilizator
export const revokeAdminRights = async (email: string): Promise<boolean> => {
  try {
    let modified = false;
    
    // Ștergem din colecția admin_emails
    const adminsListRef = collection(firestore, "admin_emails");
    const q = query(adminsListRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const batch = writeBatch(firestore);
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      modified = true;
      logger.info(`Administratorul ${email} a fost șters din lista admin_emails`);
    }
    
    // Actualizăm utilizatorul în colecția users
    const usersRef = collection(firestore, "users");
    const userQuery = query(usersRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const batch = writeBatch(firestore);
      userSnapshot.forEach(docSnapshot => {
        batch.update(docSnapshot.ref, {
          isAdmin: false,
          role: "user",
          updatedAt: new Date()
        });
        
        // Ștergem și din colecția admins dacă există
        const adminRef = doc(firestore, "admins", docSnapshot.id);
        batch.delete(adminRef);
      });
      await batch.commit();
      modified = true;
      logger.info(`Drepturile de administrator au fost revocate pentru utilizatorul ${email}`);
    }
    
    return modified;
  } catch (error: unknown) {
    logger.error("Eroare la revocarea drepturilor de administrator", error);
    return false;
  }
};

// Actualizăm datele utilizatorului în baza de date
export const updateUserData = async (userData: {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
  role?: string;
  [key: string]: unknown;
}): Promise<boolean> => {
  try {
    // Filter out undefined values to prevent Firestore errors
    const cleanedData: Record<string, unknown> = Object.entries(userData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);
    
    // Add update timestamp
    cleanedData.updatedAt = new Date();
    
    // Actualizăm datele în baza de date
    const userRef = doc(firestore, "users", userData.uid);
    await setDoc(userRef, cleanedData, { merge: true });
    
    return true;
  } catch (error: unknown) {
    logger.error("Eroare la actualizarea datelor utilizatorului", error);
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
  signInWithRedirect(auth, googleProvider)
    .catch((error: unknown) => {
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

// Export pentru a utiliza în aplicație
export const db = firestore;
export { app, auth, firestore, storage, functions, analytics };
