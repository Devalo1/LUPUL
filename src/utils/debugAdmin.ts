import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";

/**
 * Utilitar pentru debug-ul problemelor cu rolurile de administrator
 */
export const debugAdminRoles = {
  /**
   * Verifică statusul de admin pentru un utilizator în toate locațiile
   */
  checkAdminStatus: async (userEmail: string) => {
    console.group(`🔍 Debug Admin Status pentru: ${userEmail}`);

    try {
      // 1. Verifică în colecția users prin email
      console.log("1️⃣ Verifică în colecția 'users' prin email...");
      const usersRef = collection(firestore, "users");
      const userQuery = query(usersRef, where("email", "==", userEmail));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        userSnapshot.docs.forEach((doc, index) => {
          const userData = doc.data();
          console.log(`📄 Document ${index + 1} găsit în 'users':`, {
            id: doc.id,
            email: userData.email,
            isAdmin: userData.isAdmin,
            role: userData.role,
            displayName: userData.displayName,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
          });
        });
      } else {
        console.log(
          "❌ Nu s-a găsit niciun document în colecția 'users' cu acest email"
        );
      }

      // 2. Verifică în colecția admins prin email
      console.log("\n2️⃣ Verifică în colecția 'admins' prin email...");
      const adminsRef = collection(firestore, "admins");
      const adminQuery = query(adminsRef, where("email", "==", userEmail));
      const adminSnapshot = await getDocs(adminQuery);

      if (!adminSnapshot.empty) {
        adminSnapshot.docs.forEach((doc, index) => {
          const adminData = doc.data();
          console.log(`👑 Document ${index + 1} găsit în 'admins':`, {
            id: doc.id,
            email: adminData.email,
            role: adminData.role,
            createdAt: adminData.createdAt,
            addedAt: adminData.addedAt,
          });
        });
      } else {
        console.log("❌ Nu s-a găsit niciun document în colecția 'admins'");
      }

      // 3. Dacă avem userId, verifică și prin userId
      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        console.log(
          `\n3️⃣ Verifică în colecția 'admins' prin userId: ${userId}...`
        );
        const adminByIdRef = doc(firestore, "admins", userId);
        const adminByIdSnapshot = await getDoc(adminByIdRef);

        if (adminByIdSnapshot.exists()) {
          console.log("👑 Document găsit în 'admins' prin userId:", {
            id: adminByIdSnapshot.id,
            ...adminByIdSnapshot.data(),
          });
        } else {
          console.log("❌ Nu s-a găsit document în 'admins' cu acest userId");
        }
      }
    } catch (error) {
      console.error("❌ Eroare la verificarea statusului de admin:", error);
    }

    console.groupEnd();
  },

  /**
   * Repară rolurile de admin pentru un utilizator
   */
  fixAdminRoles: async (userEmail: string) => {
    console.group(`🔧 Reparare roluri admin pentru: ${userEmail}`);

    try {
      // 1. Găsește utilizatorul în colecția users
      const usersRef = collection(firestore, "users");
      const userQuery = query(usersRef, where("email", "==", userEmail));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        console.log("❌ Utilizatorul nu există în colecția 'users'");
        return false;
      }

      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data();

      console.log("📄 Utilizator găsit:", {
        id: userId,
        email: userData.email,
        currentIsAdmin: userData.isAdmin,
        currentRole: userData.role,
      });

      // 2. Actualizează documentul utilizatorului
      console.log("🔄 Actualizez documentul utilizatorului...");
      await setDoc(
        doc(firestore, "users", userId),
        {
          isAdmin: true,
          role: "admin",
          updatedAt: new Date(),
        },
        { merge: true }
      );

      console.log("✅ Document utilizator actualizat");

      // 3. Actualizează sau creează în colecția admins
      console.log("🔄 Actualizez colecția 'admins'...");
      await setDoc(doc(firestore, "admins", userId), {
        email: userEmail,
        role: "admin",
        addedAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("✅ Document admin actualizat");

      // 4. Verifică rezultatul
      console.log("🔍 Verificare finală...");
      await debugAdminRoles.checkAdminStatus(userEmail);

      return true;
    } catch (error) {
      console.error("❌ Eroare la repararea rolurilor de admin:", error);
      return false;
    }

    console.groupEnd();
  },

  /**
   * Listează toți administratorii din sistem
   */
  listAllAdmins: async () => {
    console.group("👑 Lista tuturor administratorilor");

    try {
      // 1. Din colecția users
      console.log("1️⃣ Administratori din colecția 'users':");
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
          });
        }
      });

      console.table(adminUsers);

      // 2. Din colecția admins
      console.log("\n2️⃣ Administratori din colecția 'admins':");
      const adminsRef = collection(firestore, "admins");
      const adminsSnapshot = await getDocs(adminsRef);

      const adminsList: any[] = [];
      adminsSnapshot.docs.forEach((doc) => {
        const adminData = doc.data();
        adminsList.push({
          id: doc.id,
          email: adminData.email,
          role: adminData.role,
          addedAt: adminData.addedAt,
        });
      });

      console.table(adminsList);
    } catch (error) {
      console.error("❌ Eroare la listarea administratorilor:", error);
    }

    console.groupEnd();
  },
};

// Exportă pentru utilizare globală în consolă
(window as any).debugAdminRoles = debugAdminRoles;
