import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import logger from "./logger";

const adminLogger = logger.createLogger("AdminRoleFixer");

/**
 * Utilitar pentru repararea problemelor cu rolurile de administrator
 */
export const adminRoleFixer = {
  /**
   * Repară rolurile de admin pentru un utilizator specific
   */
  fixUserAdminRole: async (userEmail: string): Promise<boolean> => {
    try {
      adminLogger.info(
        `🔧 Încep repararea rolurilor admin pentru: ${userEmail}`
      );

      // 1. Găsește utilizatorul în colecția users
      const usersRef = collection(firestore, "users");
      const userQuery = query(usersRef, where("email", "==", userEmail));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        adminLogger.error(
          `❌ Utilizatorul ${userEmail} nu există în baza de date`
        );
        return false;
      }

      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data();

      adminLogger.info(`📄 Utilizator găsit: ${userId}`, {
        email: userData.email,
        currentIsAdmin: userData.isAdmin,
        currentRole: userData.role,
      });

      // 2. Actualizează documentul utilizatorului în colecția users
      adminLogger.info("🔄 Actualizez documentul utilizatorului...");
      await updateDoc(doc(firestore, "users", userId), {
        isAdmin: true,
        role: "admin",
        updatedAt: new Date(),
      });

      adminLogger.info("✅ Document utilizator actualizat cu rol de admin");

      // 3. Creează sau actualizează documentul în colecția admins
      adminLogger.info("🔄 Actualizez colecția 'admins'...");
      await setDoc(doc(firestore, "admins", userId), {
        email: userEmail,
        role: "admin",
        userId: userId,
        displayName: userData.displayName || "Administrator",
        addedAt: new Date(),
        updatedAt: new Date(),
      });

      adminLogger.info("✅ Document admin creat/actualizat");

      // 4. Verifică că actualizarea a funcționat
      const verifyDoc = await getDoc(doc(firestore, "users", userId));
      if (verifyDoc.exists()) {
        const verifyData = verifyDoc.data();
        const isSuccessful =
          verifyData.isAdmin === true && verifyData.role === "admin";

        if (isSuccessful) {
          adminLogger.info(
            `✅ Repararea a fost finalizată cu succes pentru ${userEmail}`
          );
          return true;
        } else {
          adminLogger.error(
            `❌ Verificarea a eșuat pentru ${userEmail}`,
            verifyData
          );
          return false;
        }
      }

      return false;
    } catch (error) {
      adminLogger.error(
        `❌ Eroare la repararea rolurilor pentru ${userEmail}:`,
        error
      );
      return false;
    }
  },

  /**
   * Repară toate inconsistențele de roluri admin din sistem
   */
  fixAllAdminRoles: async (): Promise<void> => {
    try {
      adminLogger.info("🔧 Încep repararea completă a rolurilor admin...");

      // 1. Găsește toți utilizatorii care ar trebui să fie admin
      const usersRef = collection(firestore, "users");
      const usersSnapshot = await getDocs(usersRef);

      const adminEmails = ["dani_popa21@yahoo.ro"]; // Email-ul principal de admin
      const foundAdmins: any[] = [];

      // Caută utilizatori cu roluri de admin existente
      usersSnapshot.docs.forEach((doc) => {
        const userData = doc.data();
        if (
          userData.isAdmin === true ||
          userData.role === "admin" ||
          adminEmails.includes(userData.email)
        ) {
          foundAdmins.push({
            id: doc.id,
            email: userData.email,
            isAdmin: userData.isAdmin,
            role: userData.role,
          });
        }
      });

      adminLogger.info(
        `📊 Găsiți ${foundAdmins.length} administratori:`,
        foundAdmins
      );

      // 2. Repară fiecare administrator găsit
      for (const admin of foundAdmins) {
        await adminRoleFixer.fixUserAdminRole(admin.email);
      }

      adminLogger.info("✅ Repararea completă finalizată");
    } catch (error) {
      adminLogger.error("❌ Eroare la repararea completă:", error);
    }
  },

  /**
   * Verifică statusul curent al tuturor administratorilor
   */
  checkAllAdminStatus: async (): Promise<void> => {
    try {
      adminLogger.info(
        "🔍 Verificarea statusului tuturor administratorilor..."
      );

      // Verifică colecția users
      const usersRef = collection(firestore, "users");
      const usersSnapshot = await getDocs(usersRef);

      const adminUsers: any[] = [];
      usersSnapshot.docs.forEach((doc) => {
        const userData = doc.data();
        if (userData.isAdmin === true || userData.role === "admin") {
          adminUsers.push({
            id: doc.id,
            email: userData.email,
            displayName: userData.displayName,
            isAdmin: userData.isAdmin,
            role: userData.role,
            source: "users",
          });
        }
      });

      // Verifică colecția admins
      const adminsRef = collection(firestore, "admins");
      const adminsSnapshot = await getDocs(adminsRef);

      const adminDocs: any[] = [];
      adminsSnapshot.docs.forEach((doc) => {
        const adminData = doc.data();
        adminDocs.push({
          id: doc.id,
          email: adminData.email,
          role: adminData.role,
          addedAt: adminData.addedAt,
          source: "admins",
        });
      });

      console.group("👑 Raport complet administratori");
      console.log("📊 Administratori din colecția 'users':");
      console.table(adminUsers);
      console.log("📊 Administratori din colecția 'admins':");
      console.table(adminDocs);
      console.groupEnd();
    } catch (error) {
      adminLogger.error("❌ Eroare la verificarea statusului:", error);
    }
  },
};

export default adminRoleFixer;
