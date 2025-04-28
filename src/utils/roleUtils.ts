import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc, Timestamp, deleteDoc as _deleteDoc, serverTimestamp as _serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";

/**
 * Enhanced user role detection utility
 */
export const determineUserRole = async (user: any): Promise<string> => {
  if (!user || !user.uid) {
    console.log("No user provided to determineUserRole");
    return "user";
  }

  try {
    console.log(`Determining role for user: ${user.uid}`);
    
    // First check if user is admin
    if (user.email === "dani_popa21@yahoo.ro") {
      console.log("Main admin account detected");
      return "admin";
    }
    
    // Check users collection
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User data for role detection:", userData);
      
      // Check for admin role
      if (userData.isAdmin === true || userData.role === "admin" || userData.role === "ADMIN") {
        console.log("Admin role detected in user document");
        return "admin";
      }
      
      // Check for specialist role
      if ((userData.role === "specialist" || userData.role === "SPECIALIST" || userData.isSpecialist === true) && 
          userData.isActive !== false) {
        console.log("Specialist role detected in user document");
        return "specialist";
      }
    }
    
    // Check if user is in specialists collection
    try {
      // Check using userId field
      const specialistsRef = collection(firestore, "specialists");
      const specialistQuery = query(specialistsRef, where("userId", "==", user.uid));
      const specialistSnap = await getDocs(specialistQuery);
      
      if (!specialistSnap.empty) {
        console.log("User found in specialists collection with userId field");
        return "specialist";
      }
      
      // Direct check
      const directSpecialistDoc = await getDoc(doc(firestore, "specialists", user.uid));
      if (directSpecialistDoc.exists()) {
        console.log("User found directly in specialists collection");
        return "specialist";
      }
    } catch (specialistError) {
      console.error("Error checking specialists collection:", specialistError);
    }
    
    // Check if user is in admins collection
    try {
      const adminDoc = await getDoc(doc(firestore, "admins", user.uid));
      if (adminDoc.exists()) {
        console.log("User found in admins collection");
        return "admin";
      }
      
      // Try looking up by email
      if (user.email) {
        const adminsRef = collection(firestore, "admins");
        const adminQuery = query(adminsRef, where("email", "==", user.email));
        const adminSnap = await getDocs(adminQuery);
        
        if (!adminSnap.empty) {
          console.log("User found in admins collection by email");
          return "admin";
        }
      }
    } catch (adminError) {
      console.error("Error checking admins collection:", adminError);
    }
    
    console.log("No special role detected, defaulting to user");
    return "user";
  } catch (error) {
    console.error("Error in determineUserRole:", error);
    return "user"; // Default to regular user on error
  }
};

/**
 * Check if the current user can access specialist features
 * @param user The current user object
 * @returns Promise resolving to boolean indicating access permission
 */
export const canAccessSpecialistFeatures = async (user: any): Promise<boolean> => {
  if (!user) return false;
  
  try {
    console.log("Checking specialist access for user:", user.uid);
    
    // Check user's custom claims if they exist
    if (user.customClaims && 
        (user.customClaims.specialist === true || 
         user.customClaims.role === "specialist" || 
         user.customClaims.role === "SPECIALIST")) {
      console.log("User has specialist claim");
      return true;
    }
    
    // Check user's document in users collection
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.role === "specialist" || 
          userData.role === "SPECIALIST" || 
          userData.isSpecialist === true) {
        console.log("User has specialist role in users collection");
        return true;
      }
    }
    
    // Check specialists collection directly
    const specialistDoc = await getDoc(doc(firestore, "specialists", user.uid));
    if (specialistDoc.exists()) {
      console.log("User exists in specialists collection");
      return true;
    }
    
    // Check specialists collection where userId matches
    const specialistsRef = collection(firestore, "specialists");
    const q = query(specialistsRef, where("userId", "==", user.uid)) as any;
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      console.log("User ID found in specialists collection");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking specialist access:", error);
    return false;
  }
};

/**
 * Sets or updates a user's specialization (for admin use)
 * @param userId The user ID to update
 * @param specialization The specialization to set
 * @param category The specialization category
 * @returns Promise resolving to success message
 */
export const updateUserSpecialization = async (
  userId: string, 
  specialization: string, 
  category: string = ""
): Promise<string> => {
  if (!userId) throw new Error("User ID is required");
  if (!specialization) throw new Error("Specialization is required");
  
  try {
    console.log(`Updating specialization for user ${userId} to ${specialization} (${category})`);
    
    // Update in users collection first
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        specialization: specialization,
        specializationCategory: category || specialization,
        role: "SPECIALIST",
        isSpecialist: true,
        updatedAt: Timestamp.now()
      });
      console.log("Updated specialization in users collection");
    } else {
      console.warn("User document doesn't exist, can't update specialization");
    }
    
    // Update or create in specialists collection
    const specialistRef = doc(firestore, "specialists", userId);
    const specialistDoc = await getDoc(specialistRef);
    
    if (specialistDoc.exists()) {
      await updateDoc(specialistRef, {
        specialization: specialization,
        specializationCategory: category || specialization,
        isActive: true,
        updatedAt: Timestamp.now()
      });
      console.log("Updated specialization in specialists collection");
    } else {
      // Create new specialist document
      await setDoc(specialistRef, {
        userId: userId,
        specialization: specialization,
        specializationCategory: category || specialization,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log("Created new specialist document");
    }
    
    return "Specialization updated successfully";
  } catch (error) {
    console.error("Error updating specialization:", error);
    throw error;
  }
};

/**
 * Search for users by role and/or specialization
 * @param role Optional role to filter by
 * @param specialization Optional specialization to filter by
 * @returns Promise resolving to array of matching users
 */
export const searchUsersByRole = async (
  role?: string, 
  specialization?: string
): Promise<any[]> => {
  try {
    const usersRef = collection(firestore, "users");
    let q: any = usersRef;
    
    // Apply filters if provided
    if (role && specialization) {
      q = query(
        usersRef, 
        where("role", "==", role),
        where("specialization", "==", specialization)
      ) as any;
    } else if (role) {
      q = query(usersRef, where("role", "==", role)) as any;
    } else if (specialization) {
      q = query(usersRef, where("specialization", "==", specialization)) as any;
    }
    
    const querySnapshot = await getDocs(q);
    
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...(doc.data() as Record<string, any>)
      });
    });
    
    return users;
  } catch (error) {
    console.error("Error searching users by role:", error);
    throw error;
  }
};

/**
 * Gets a list of all specialists from both users and specialists collections
 * @returns Promise resolving to array of specialists
 */
export const getAllSpecialists = async (): Promise<any[]> => {
  try {
    const specialists: any[] = [];
    const processedIds = new Set<string>();
    
    // First check specialists collection
    const specialistsRef = collection(firestore, "specialists");
    const specialistsSnapshot = await getDocs(specialistsRef);
    
    specialistsSnapshot.forEach((doc) => {
      const data = doc.data();
      const id = data.userId || doc.id;
      processedIds.add(id);
      
      specialists.push({
        id: id,
        ...(data as Record<string, any>),
        source: "specialists_collection"
      });
    });
    
    // Then check users collection for specialist role
    const usersRef = collection(firestore, "users");
    const q = query(
      usersRef, 
      where("role", "in", ["specialist", "SPECIALIST"])
    ) as any;
    const usersSnapshot = await getDocs(q);
    
    usersSnapshot.forEach((doc) => {
      if (!processedIds.has(doc.id)) {
        processedIds.add(doc.id);
        specialists.push({
          id: doc.id,
          ...(doc.data() as Record<string, any>),
          source: "users_collection"
        });
      }
    });
    
    // Also check for isSpecialist flag
    const q2 = query(
      usersRef, 
      where("isSpecialist", "==", true)
    ) as any;
    const usersSnapshot2 = await getDocs(q2);
    
    usersSnapshot2.forEach((doc) => {
      if (!processedIds.has(doc.id)) {
        processedIds.add(doc.id);
        specialists.push({
          id: doc.id,
          ...(doc.data() as Record<string, any>),
          source: "users_collection_flag"
        });
      }
    });
    
    return specialists;
  } catch (error) {
    console.error("Error getting all specialists:", error);
    throw error;
  }
};

/**
 * Get all users from the database
 */
export const getAllUsers = async (): Promise<any[]> => {
  try {
    const usersRef = collection(firestore, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    const users: any[] = [];
    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...(doc.data() as Record<string, any>)
      });
    });
    
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<any> => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Make sure we have all possible name fields normalized
      const displayName = userData.displayName || userData.name || userData.fullName;
      const email = userData.email || "";
      
      return {
        id: userDoc.id,
        ...userData,
        displayName,
        name: displayName,
        email: email
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: string): Promise<string> => {
  try {
    const userRef = doc(firestore, "users", userId);
    
    await updateDoc(userRef, {
      role: role,
      updatedAt: Timestamp.now()
    });
    
    return "User role updated successfully";
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

/**
 * Get all specialization change requests
 * @param status Filter by status (optional)
 * @returns Promise resolving to array of specialization change requests
 */
export const getSpecializationChangeRequests = async (status?: "pending" | "approved" | "rejected"): Promise<any[]> => {
  try {
    const requestsRef = collection(firestore, "specializationChangeRequests");
    let q: any;
    
    if (status) {
      q = query(requestsRef, where("status", "==", status)) as any;
    } else {
      q = requestsRef;
    }
    
    const snapshot = await getDocs(q);
    const requests: any[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...(data as Record<string, any>),
        submittedAt: (data as any).submittedAt?.toDate ? (data as any).submittedAt.toDate() : new Date(),
        reviewedAt: (data as any).reviewedAt?.toDate ? (data as any).reviewedAt.toDate() : null
      });
    });
    
    // Sort by date, with newest first
    requests.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    
    return requests;
  } catch (error) {
    console.error("Error fetching specialization change requests:", error);
    throw error;
  }
};

/**
 * Process a specialization change request
 * @param requestId The request ID to process
 * @param approved Whether the request is approved
 * @param adminComment Optional comment from the admin
 * @returns Promise resolving to success message
 */
export const processSpecializationChangeRequest = async (
  requestId: string,
  approved: boolean,
  adminComment?: string
): Promise<string> => {
  try {
    const requestRef = doc(firestore, "specializationChangeRequests", requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error("Request not found");
    }
    
    const requestData = requestDoc.data();
    
    // Update the request status
    await updateDoc(requestRef, {
      status: approved ? "approved" : "rejected",
      reviewedAt: Timestamp.now(),
      adminComment: adminComment || ""
    });
    
    // If approved, update the user's specialization
    if (approved) {
      await updateUserSpecialization(
        requestData.userId,
        requestData.newSpecialization,
        requestData.newCategory || ""
      );
    }
    
    return `Request ${approved ? "approved" : "rejected"} successfully`;
  } catch (error) {
    console.error("Error processing specialization change request:", error);
    throw error;
  }
};

/**
 * Count pending requests
 */
export const countPendingRequests = async (): Promise<number> => {
  try {
    const requestsRef = collection(firestore, "specializationChangeRequests");
    const q = query(requestsRef, where("status", "==", "pending")) as any;
    const snapshot = await getDocs(q);
    
    return snapshot.size;
  } catch (error) {
    console.error("Error counting pending requests:", error);
    return 0;
  }
};

/**
 * Get analytics for admin dashboard
 */
export const getAdminDashboardAnalytics = async (): Promise<any> => {
  try {
    // Count users
    const usersRef = collection(firestore, "users");
    const usersSnapshot = await getDocs(usersRef);
    const userCount = usersSnapshot.size;
    
    // Count specialists
    const specialistsRef = collection(firestore, "specialists");
    const specialistsSnapshot = await getDocs(specialistsRef);
    const specialistCount = specialistsSnapshot.size;
    
    // Count appointments
    const appointmentsRef = collection(firestore, "appointments");
    const appointmentsSnapshot = await getDocs(appointmentsRef);
    const appointmentCount = appointmentsSnapshot.size;
    
    // Count pending appointments
    const pendingAppointmentsQ = query(appointmentsRef, where("status", "==", "pending")) as any;
    const pendingAppointmentsSnapshot = await getDocs(pendingAppointmentsQ);
    const pendingAppointmentCount = pendingAppointmentsSnapshot.size;
    
    // Count specialization requests
    const specializationRequestsRef = collection(firestore, "specializationChangeRequests");
    const pendingSpecRequestsQ = query(specializationRequestsRef, where("status", "==", "pending")) as any;
    const pendingSpecRequestsSnapshot = await getDocs(pendingSpecRequestsQ);
    const pendingSpecRequestCount = pendingSpecRequestsSnapshot.size;
    
    return {
      users: userCount,
      specialists: specialistCount,
      appointments: appointmentCount,
      pendingAppointments: pendingAppointmentCount,
      pendingSpecializationRequests: pendingSpecRequestCount
    };
  } catch (error) {
    console.error("Error getting admin dashboard analytics:", error);
    throw error;
  }
};

/**
 * Check if the current user can access admin features
 */
export const canAccessAdminFeatures = async (user: any): Promise<boolean> => {
  if (!user) return false;
  
  try {
    const role = await determineUserRole(user);
    return role === "admin";
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
};
