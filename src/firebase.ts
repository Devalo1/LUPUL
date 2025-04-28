// Re-exportăm tot din firebase-core pentru compatibilitate cu codul existent
import {
  app, 
  auth,
  firestore,
  db,
  storage,
  functions,
  isInitialized,
  authAPI,
  firestoreAPI,
  functionsAPI,
  initializeFirebase
} from "./firebase-core";

import { isProd } from "./utils/environment";
import logger from "./utils/logger";

// Import tipuri necesare pentru Firebase
import { 
  DocumentData, 
  QueryDocumentSnapshot 
} from "firebase/firestore";

// Reexportăm toate serviciile Firebase pentru compatibilitate cu codul existent
export {
  app,
  auth,
  firestore,
  db,
  storage,
  functions,
  isInitialized,
  initializeFirebase
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
      // FIX: Folosim addDoc pentru a genera automat un ID, în loc de setDoc cu serverTimestamp ca ID
      const registrationsCollection = firestoreAPI.collection(firestore, "eventRegistrations");
      await firestoreAPI.addDoc(registrationsCollection, eventRegistrationData);
      
      logger.info("Datele de participare salvate în Firestore");
    } catch (firestoreError: unknown) {
      logger.error("Eroare la salvarea datelor de participare în Firestore", firestoreError);
      // Continuăm execuția pentru a încerca totuși să trimitem email-ul
    }
    
    // Folosim o funcție Cloud Functions pentru email
    const sendEmailFunction = functionsAPI.httpsCallable(functions, "sendEventRegistrationEmail");
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
    const userRef = firestoreAPI.doc(firestore, "users", uid);
    const userDoc = await firestoreAPI.getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.isAdmin === true || userData.role === "admin";
    }
    
    // Verificăm în colecția de administratori pentru compatibilitate
    const adminRef = firestoreAPI.doc(firestore, "admins", uid);
    const adminDoc = await firestoreAPI.getDoc(adminRef);
    
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
    const adminsListRef = firestoreAPI.collection(firestore, "admin_emails");
    const q = firestoreAPI.query(adminsListRef, firestoreAPI.where("email", "==", email));
    const querySnapshot = await firestoreAPI.getDocs(q);
    
    if (querySnapshot.empty) {
      logger.warn(`Utilizatorul ${email} nu este în lista de administratori autorizați`);
      return false;
    }
    
    // Setăm drepturile de administrator în baza de date
    const userRef = firestoreAPI.doc(firestore, "users", uid);
    await firestoreAPI.setDoc(userRef, {
      isAdmin: true,
      role: "admin",
      updatedAt: new Date()
    }, { merge: true });
    
    // Adăugăm și în colecția de administratori pentru compatibilitate
    const adminRef = firestoreAPI.doc(firestore, "admins", uid);
    await firestoreAPI.setDoc(adminRef, {
      email,
      uid,
      createdAt: new Date()
    }, { merge: true });
    
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
    const adminsListRef = firestoreAPI.collection(firestore, "admin_emails");
    const q = firestoreAPI.query(adminsListRef, firestoreAPI.where("email", "==", email));
    const querySnapshot = await firestoreAPI.getDocs(q);
    
    if (!querySnapshot.empty) {
      logger.info(`Utilizatorul ${email} este deja în lista de administratori`);
      return true;
    }
    
    // Adăugăm email-ul în colecția admin_emails
    // Corectăm apelul doc pentru a include firestore și calea
    const adminEmailRef = firestoreAPI.doc(firestore, "admin_emails", Date.now().toString());
    await firestoreAPI.setDoc(adminEmailRef, {
      email,
      name: adminName || email.split("@")[0],
      addedAt: new Date(),
      active: true
    }, { merge: false });
    
    logger.info(`Administrator nou adăugat: ${email}`);
    
    // Verificăm dacă există deja un cont de utilizator cu acest email
    // și îi actualizăm drepturile dacă există
    const usersRef = firestoreAPI.collection(firestore, "users");
    const userQuery = firestoreAPI.query(usersRef, firestoreAPI.where("email", "==", email));
    const userSnapshot = await firestoreAPI.getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      // Utilizatorul există, actualizăm drepturile
      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;
      
      await firestoreAPI.setDoc(firestoreAPI.doc(firestore, "users", userId), {
        isAdmin: true,
        role: "admin",
        updatedAt: new Date()
      }, { merge: true });
      
      // Adăugăm și în colecția de administratori pentru compatibilitate
      await firestoreAPI.setDoc(firestoreAPI.doc(firestore, "admins", userId), {
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

// Definim o interfață pentru un administrator
interface Admin {
  id?: string;
  email: string;
  source: string;
  addedAt: Date | null;
  active: boolean;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

// Obține lista tuturor administratorilor din sistem
export const getAllAdmins = async (): Promise<Admin[]> => {
  try {
    const adminsList: Admin[] = [];
    
    // Obținem lista din colecția admin_emails
    const adminsListRef = firestoreAPI.collection(firestore, "admin_emails");
    const emailsSnapshot = await firestoreAPI.getDocs(adminsListRef);
    
    // Transformăm datele și le adăugăm în lista rezultat
    emailsSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
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
    const usersRef = firestoreAPI.collection(firestore, "users");
    const usersQuery = firestoreAPI.query(usersRef, firestoreAPI.where("role", "==", "admin"));
    const usersSnapshot = await firestoreAPI.getDocs(usersQuery);
    
    // Adăugăm și utilizatorii admin care nu sunt deja incluși
    usersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
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
    const adminsListRef = firestoreAPI.collection(firestore, "admin_emails");
    const q = firestoreAPI.query(adminsListRef, firestoreAPI.where("email", "==", email));
    const querySnapshot = await firestoreAPI.getDocs(q);
    
    if (!querySnapshot.empty) {
      const batch = firestoreAPI.writeBatch(firestore);
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      modified = true;
      logger.info(`Administratorul ${email} a fost șters din lista admin_emails`);
    }
    
    // Actualizăm utilizatorul în colecția users
    const usersRef = firestoreAPI.collection(firestore, "users");
    const userQuery = firestoreAPI.query(usersRef, firestoreAPI.where("email", "==", email));
    const userSnapshot = await firestoreAPI.getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const batch = firestoreAPI.writeBatch(firestore);
      userSnapshot.forEach((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
        batch.update(docSnapshot.ref, {
          isAdmin: false,
          role: "user",
          updatedAt: new Date()
        });
        
        // Ștergem și din colecția admins dacă există
        const adminRef = firestoreAPI.doc(firestore, "admins", docSnapshot.id);
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
    const userRef = firestoreAPI.doc(firestore, "users", userData.uid);
    await firestoreAPI.setDoc(userRef, cleanedData, { merge: true });
    
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
  const googleProvider = new authAPI.GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
  
  // Executăm redirecționarea
  authAPI.signInWithRedirect(auth, googleProvider)
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
