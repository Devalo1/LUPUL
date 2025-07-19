import {
  doc,
  deleteDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { firestore, db } from "../firebase"; // Direct import from the central firebase.ts
import logger from "./logger"; // Import the logger utility

// Create a component-specific logger
const userRolesLogger = logger.createLogger("UserRoles");

// Define main admin email in a constant to avoid inconsistencies
export const MAIN_ADMIN_EMAIL = "dani_popa21@yahoo.ro";

// Define all admin emails in one place
export const ADMIN_EMAILS = [
  MAIN_ADMIN_EMAIL,
  // Add other admin emails here
];

// Define user roles
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SPECIALIST = "specialist",
  ACCOUNTANT = "accountant",
}

/**
 * Checks if a user with the given email has admin privileges
 * Implementare simplificată care nu mai generează erori de permisiuni
 */
export const isUserAdmin = async (userEmail: string): Promise<boolean> => {
  if (!userEmail) return false;

  // First check if email is in the hardcoded admin list
  if (ADMIN_EMAILS.includes(userEmail)) {
    userRolesLogger.info(`Admin detected from hardcoded list: ${userEmail}`);
    return true;
  }

  try {
    // Metoda simplificată: Verifică doar documentul utilizatorului, fără a verifica colecția de admini
    const usersCollection = collection(firestore, "users");
    const userQuery = query(usersCollection, where("email", "==", userEmail));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      if (userData.isAdmin === true || userData.role === UserRole.ADMIN) {
        userRolesLogger.info(
          `User ${userEmail} has admin flag in user document`
        );
        return true;
      }
    }

    return false;
  } catch (error) {
    userRolesLogger.error("Error checking admin status:", error);
    // Fallback pentru email-ul principal de admin
    return ADMIN_EMAILS.includes(userEmail);
  }
};

/**
 * Checks if a user with the given email has specialist privileges
 */
export const isUserSpecialist = async (userEmail: string): Promise<boolean> => {
  if (!userEmail) return false;

  try {
    console.log("🔍 Verificând rolul de specialist pentru:", userEmail);
    const usersCollection = collection(firestore, "users");
    const userQuery = query(usersCollection, where("email", "==", userEmail));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      console.log("📄 Date utilizator găsite:", {
        email: userData.email,
        role: userData.role,
        isSpecialist: userData.isSpecialist,
        specialization: userData.specialization,
        allData: userData,
      });

      // Verificăm multiple câmpuri pentru rolul de specialist
      if (
        userData.role === UserRole.SPECIALIST ||
        userData.isSpecialist === true ||
        userData.specialization
      ) {
        userRolesLogger.info(`User ${userEmail} has specialist role`);
        console.log("✅ Utilizator confirmat ca specialist");
        return true;
      } else {
        console.log("❌ Utilizatorul NU este specialist");
      }
    } else {
      console.log("❌ Nu s-au găsit date pentru utilizatorul:", userEmail);
    }

    return false;
  } catch (error) {
    userRolesLogger.error("Error checking specialist status:", error);
    console.error("🚨 Eroare la verificarea statutului de specialist:", error);
    return false;
  }
};

/**
 * Checks if a user with the given email has accountant privileges
 */
export const isUserAccountant = async (userEmail: string): Promise<boolean> => {
  if (!userEmail) return false;

  try {
    const usersCollection = collection(firestore, "users");
    const userQuery = query(usersCollection, where("email", "==", userEmail));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      if (
        userData.isAccountant === true ||
        userData.role === UserRole.ACCOUNTANT
      ) {
        userRolesLogger.info(`User ${userEmail} has accountant role`);
        return true;
      }
    }

    return false;
  } catch (error) {
    userRolesLogger.error("Error checking accountant status:", error);
    return false;
  }
};

/**
 * Makes a user admin by updating both user document and admin collection
 */
export const makeUserAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    userRolesLogger.info(`Making user ${userId} an admin`);

    // Update user document with admin role
    const userRef = doc(firestore, "users", userId);
    await setDoc(
      userRef,
      {
        isAdmin: true,
        role: UserRole.ADMIN,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Also add to admin collection for compatibility
    try {
      const adminRef = doc(firestore, "admins", userId);
      await setDoc(adminRef, {
        role: "admin",
        addedAt: new Date(),
      });
    } catch (adminError) {
      userRolesLogger.warn("Could not update admin collection:", adminError);
      // This is not critical, the user document update is sufficient
    }

    userRolesLogger.info(`User ${userId} has been made an admin.`);
    return true;
  } catch (error) {
    userRolesLogger.error("Error making user admin:", error);
    return false;
  }
};

/**
 * Removes admin role from a user
 */
export const removeAdminRole = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    userRolesLogger.info(`Removing admin role from user ${userId}`);

    // Update user document
    const userRef = doc(firestore, "users", userId);
    await setDoc(
      userRef,
      {
        isAdmin: false,
        role: UserRole.USER,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Remove from admin collection
    try {
      const adminRef = doc(firestore, "admins", userId);
      await deleteDoc(adminRef);
    } catch (adminError) {
      userRolesLogger.warn("Could not remove admin document:", adminError);
    }

    userRolesLogger.info(`Admin role removed from user ${userId}`);
    return true;
  } catch (error) {
    userRolesLogger.error("Error removing admin role:", error);
    return false;
  }
};

/**
 * Ensures a user is added to the admins collection
 */
export const ensureAdminInCollection = async (
  userEmail: string
): Promise<void> => {
  try {
    // Check if admin document already exists
    const adminsCollection = collection(firestore, "admins");
    const q = query(adminsCollection, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Add to admins collection if not present
      await addDoc(adminsCollection, {
        email: userEmail,
        createdAt: new Date(),
      });
      userRolesLogger.info(`Admin added to collection: ${userEmail}`);
    }
  } catch (error) {
    userRolesLogger.error("Error ensuring admin in collection:", error);
    throw error; // Re-throw for handling in caller
  }
};

/**
 * Assigns a specific role to a user
 */
export const assignRoleToUser = async (
  userId: string,
  role: string
): Promise<void> => {
  try {
    const userRoleRef = doc(db, "userRoles", userId);
    await setDoc(userRoleRef, { role, updatedAt: new Date() }, { merge: true });

    // Update the user document as well
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        role,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    userRolesLogger.info(`Role ${role} assigned to user ${userId}`);
  } catch (error) {
    userRolesLogger.error("Error assigning role to user:", error);
    throw error;
  }
};

/**
 * Makes a user a specialist
 */
export const makeUserSpecialist = async (
  userId: string,
  specialization?: string
): Promise<boolean> => {
  try {
    const userRef = doc(firestore, "users", userId);

    const updateData: any = {
      role: UserRole.SPECIALIST,
      updatedAt: new Date(),
    };

    if (specialization) {
      updateData.specialization = specialization;
    }

    await setDoc(userRef, updateData, { merge: true });

    userRolesLogger.info(`User ${userId} has been set as a specialist`);
    return true;
  } catch (error) {
    userRolesLogger.error(`Failed to make user ${userId} a specialist`, error);
    return false;
  }
};

/**
 * Removes specialist role from user
 */
export const removeSpecialistRole = async (
  userId: string
): Promise<boolean> => {
  try {
    const userRef = doc(firestore, "users", userId);

    await setDoc(
      userRef,
      {
        role: UserRole.USER,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    userRolesLogger.info(`Specialist role removed from user ${userId}`);
    return true;
  } catch (error) {
    userRolesLogger.error(
      `Failed to remove specialist role from user ${userId}`,
      error
    );
    return false;
  }
};

/**
 * Makes a user accountant by updating their role
 */
export const makeUserAccountant = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    const userRef = doc(firestore, "users", userId);

    await setDoc(
      userRef,
      {
        isAccountant: true,
        role: UserRole.ACCOUNTANT,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    userRolesLogger.info(`User ${userId} has been made an accountant`);
    return true;
  } catch (error) {
    userRolesLogger.error("Error making user accountant:", error);
    return false;
  }
};

/**
 * Removes accountant role from user
 */
export const removeAccountantRole = async (
  userId: string
): Promise<boolean> => {
  try {
    const userRef = doc(firestore, "users", userId);

    await setDoc(
      userRef,
      {
        isAccountant: false,
        role: UserRole.USER,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    userRolesLogger.info(`Accountant role removed from user ${userId}`);
    return true;
  } catch (error) {
    userRolesLogger.error(
      `Failed to remove accountant role from user ${userId}`,
      error
    );
    return false;
  }
};

/**
 * Interfața pentru cererile de schimbare a rolului
 */
export interface RoleChangeRequest {
  id?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  requestedRole: UserRole;
  currentRole: UserRole;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  specialization?: string;
  createdAt: Date;
  updatedAt?: Date;
  processedBy?: string;
}

/**
 * Trimite o cerere pentru schimbarea rolului utilizatorului
 */
export const requestRoleChange = async (
  userId: string,
  userEmail: string,
  userName: string,
  requestedRole: UserRole,
  currentRole: UserRole,
  reason?: string,
  specialization?: string
): Promise<string> => {
  try {
    // Verificăm dacă utilizatorul are deja o cerere activă
    const requestsRef = collection(firestore, "roleChangeRequests");
    const q = query(
      requestsRef,
      where("userId", "==", userId),
      where("status", "==", "pending")
    );
    const existingRequests = await getDocs(q);

    if (!existingRequests.empty) {
      return "existing";
    }

    // Creăm cererea nouă
    const requestData: RoleChangeRequest = {
      userId,
      userEmail,
      userName,
      requestedRole,
      currentRole,
      status: "pending",
      reason,
      specialization,
      createdAt: new Date(),
    };

    const newRequest = await addDoc(
      collection(firestore, "roleChangeRequests"),
      requestData
    );
    userRolesLogger.info(
      `Cerere de schimbare rol creată pentru ${userEmail}: ${requestedRole}`
    );
    return newRequest.id;
  } catch (error) {
    userRolesLogger.error(
      "Eroare la crearea cererii de schimbare a rolului:",
      error
    );
    throw error;
  }
};

/**
 * Obține toate cererile de schimbare a rolului
 */
export const getRoleChangeRequests = async (
  statusFilter?: "pending" | "approved" | "rejected"
): Promise<RoleChangeRequest[]> => {
  try {
    const requestsRef = collection(firestore, "roleChangeRequests");
    let q = query(requestsRef);

    if (statusFilter) {
      q = query(requestsRef, where("status", "==", statusFilter));
    }

    const querySnapshot = await getDocs(q);

    const requests: RoleChangeRequest[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as RoleChangeRequest;
      requests.push({
        ...data,
        id: doc.id,
        // Handle Firestore timestamps correctly by checking if they're Firestore timestamps or regular Dates
        createdAt:
          data.createdAt &&
          "toDate" in data.createdAt &&
          typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate()
            : data.createdAt instanceof Date
              ? data.createdAt
              : new Date(),
        updatedAt:
          data.updatedAt &&
          "toDate" in data.updatedAt &&
          typeof data.updatedAt.toDate === "function"
            ? data.updatedAt.toDate()
            : data.updatedAt instanceof Date
              ? data.updatedAt
              : undefined,
      });
    });

    // Sortare după data creării (cele mai recente mai întâi)
    return requests.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch (error) {
    userRolesLogger.error(
      "Eroare la obținerea cererilor de schimbare a rolului:",
      error
    );
    throw error;
  }
};

/**
 * Procesează o cerere de schimbare a rolului (aprobă sau respinge)
 */
export const processRoleChangeRequest = async (
  requestId: string,
  status: "approved" | "rejected",
  adminEmail?: string
): Promise<boolean> => {
  try {
    const requestRef = doc(firestore, "roleChangeRequests", requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error("Cererea nu a fost găsită");
    }

    const requestData = requestDoc.data() as RoleChangeRequest;

    // Actualizăm cererea
    await updateDoc(requestRef, {
      status,
      updatedAt: new Date(),
      processedBy: adminEmail,
    });

    // Dacă cererea a fost aprobată, actualizăm rolul utilizatorului
    if (
      status === "approved" &&
      requestData.requestedRole === UserRole.SPECIALIST
    ) {
      await makeUserSpecialist(requestData.userId, requestData.specialization);
    }

    userRolesLogger.info(
      `Cerere de schimbare rol ${requestId} a fost ${status === "approved" ? "aprobată" : "respinsă"}`
    );
    return true;
  } catch (error) {
    userRolesLogger.error(
      "Eroare la procesarea cererii de schimbare a rolului:",
      error
    );
    return false;
  }
};

/**
 * Verifică dacă un utilizator are cereri de schimbare a rolului în așteptare
 */
export const checkPendingRoleRequests = async (
  userId: string
): Promise<boolean> => {
  try {
    const requestsRef = collection(firestore, "roleChangeRequests");
    const q = query(
      requestsRef,
      where("userId", "==", userId),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    userRolesLogger.error(
      "Eroare la verificarea cererilor de schimbare a rolului:",
      error
    );
    return false;
  }
};

/**
 * Deletes a user from the system (marks as deleted, preserves data for audit)
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    userRolesLogger.info(`Deleting user ${userId}`);

    // Mark user as deleted instead of actually deleting (for audit purposes)
    const userRef = doc(firestore, "users", userId);
    await setDoc(
      userRef,
      {
        deleted: true,
        deletedAt: new Date(),
        isActive: false,
        isAdmin: false,
        isSpecialist: false,
        isAccountant: false,
        role: UserRole.USER,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Remove from admin collection if exists
    try {
      const adminRef = doc(firestore, "admin", userId);
      await setDoc(adminRef, {
        deleted: true,
        deletedAt: new Date(),
      });
    } catch (adminError) {
      userRolesLogger.warn(
        "Could not update admin collection during deletion:",
        adminError
      );
    }

    // Remove from specialists collection if exists
    try {
      const specialistRef = doc(firestore, "specialists", userId);
      await setDoc(
        specialistRef,
        {
          deleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
        { merge: true }
      );
    } catch (specialistError) {
      userRolesLogger.warn(
        "Could not update specialists collection during deletion:",
        specialistError
      );
    }

    userRolesLogger.info(`User ${userId} has been marked as deleted`);
    return true;
  } catch (error) {
    userRolesLogger.error("Error deleting user:", error);
    return false;
  }
};

/**
 * Permanently restores a deleted user
 */
export const restoreUser = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    userRolesLogger.info(`Restoring user ${userId}`);

    const userRef = doc(firestore, "users", userId);
    await setDoc(
      userRef,
      {
        deleted: false,
        deletedAt: null,
        isActive: true,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    userRolesLogger.info(`User ${userId} has been restored`);
    return true;
  } catch (error) {
    userRolesLogger.error("Error restoring user:", error);
    return false;
  }
};
