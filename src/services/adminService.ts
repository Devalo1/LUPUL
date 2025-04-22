import { firestore } from "../firebase";
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { handleUnknownError } from "../utils/errorTypes";
import logger from "../utils/logger";

// Serviciu pentru administrarea funcționalităților de admin
export const AdminService = {
  // Verifică starea de admin pentru utilizatorul curent
  verificaRolAdmin: async (email: string): Promise<boolean> => {
    try {
      // Verificăm dacă este adresa de email specială
      if (email === "dani_popa21@yahoo.ro") {
        // Asigurăm că această adresă are întotdeauna drepturi de admin
        await AdminService.verificaSiCorecteazaAdminPrincipal();
        return true;
      }
      
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return userData.isAdmin === true || userData.role === "admin";
      }
      
      return false;
    } catch (error) {
      const err = handleUnknownError(error);
      logger.error("Eroare la verificarea rolului de admin:", err);
      throw err;
    }
  },
  
  // Obține comenzile utilizatorului curent
  obtineComenzileUtilizator: async (userId: string) => {
    try {
      const comenziRef = collection(firestore, "comenzi");
      const q = query(comenziRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      const err = handleUnknownError(error);
      logger.error("Eroare la obținerea comenzilor:", err);
      throw err;
    }
  },
  
  // Verifică dacă utilizatorul "dani_popa21@yahoo.ro" este admin și corectează dacă nu
  verificaSiCorecteazaAdminPrincipal: async (): Promise<boolean> => {
    try {
      const email = "dani_popa21@yahoo.ro";
      
      // Căutăm utilizatorul după email
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Utilizatorul există, verificăm dacă are rol de admin
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        if (!userData.isAdmin || userData.role !== "admin") {
          // Actualizăm rolul de admin
          await updateDoc(doc(firestore, "users", userDoc.id), {
            isAdmin: true,
            role: "admin"
          });
          logger.info(`Rolul de admin a fost actualizat pentru ${email}`);
        }
      } else {
        // Utilizatorul nu există, îl creăm cu rol de admin
        // Generăm un ID unic pentru document
        const newDocId = email.replace(/[^a-zA-Z0-9]/g, "_");
        
        await setDoc(doc(firestore, "users", newDocId), {
          email,
          displayName: "Administrator",
          isAdmin: true,
          role: "admin",
          createdAt: new Date()
        });
        logger.info(`Utilizator admin creat pentru ${email}`);
      }
      
      return true;
    } catch (error) {
      const err = handleUnknownError(error);
      logger.error("Eroare la verificarea/corectarea adminului principal:", err);
      return false;
    }
  }
};

// Make user an admin
export const makeUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(firestore, "users", uid);
    
    await updateDoc(userRef, {
      isAdmin: true,
      role: "admin",
      updatedAt: new Date()
    });
    
    logger.info(`User ${uid} has been granted admin privileges`);
    return true;
  } catch (error) {
    const err = handleUnknownError(error);
    logger.error(`Failed to make user ${uid} an admin`, err);
    throw err;
  }
};

// Remove admin privileges from user
export const removeAdminRole = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(firestore, "users", uid);
    
    await updateDoc(userRef, {
      isAdmin: false,
      role: "user",
      updatedAt: new Date()
    });
    
    logger.info(`Admin privileges removed from user ${uid}`);
    return true;
  } catch (error) {
    const err = handleUnknownError(error);
    logger.error(`Failed to remove admin privileges from user ${uid}`, err);
    throw err;
  }
};

// Create or update user admin status
export const updateUserAdminStatus = async (
  uid: string, 
  isAdmin: boolean
): Promise<boolean> => {
  try {
    const userRef = doc(firestore, "users", uid);
    
    await setDoc(userRef, {
      isAdmin,
      role: isAdmin ? "admin" : "user",
      updatedAt: new Date()
    }, { merge: true });
    
    logger.info(`User ${uid} admin status updated: ${isAdmin}`);
    return true;
  } catch (error) {
    const err = handleUnknownError(error);
    logger.error(`Failed to update admin status for user ${uid}`, err);
    throw err;
  }
};

export default AdminService;
