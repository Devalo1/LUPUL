import { collection, query, where, getDocs, addDoc, getDoc, doc, Timestamp as _Timestamp, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";

/**
 * Submit a specialization change request from a specialist
 * @param userId User ID of the specialist
 * @param currentSpecialization Current specialization (if any)
 * @param newSpecialization Requested new specialization
 * @param reason Reason for the change
 * @param additionalDetails Any additional details about the specialization
 */
export const submitSpecializationChangeRequest = async (
  userId: string, 
  userEmail: string,
  displayName: string,
  currentSpecialization: string, 
  newSpecialization: string, 
  reason: string,
  additionalDetails: string = ""
) => {
  try {
    // Get current user data to include in the request
    const userDoc = await getDoc(doc(firestore, "users", userId));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    // Create the request
    const requestData = {
      userId,
      userEmail,
      displayName: displayName || userData.displayName || "",
      oldSpecialization: currentSpecialization,
      oldCategory: userData.specializationCategory || "",
      newSpecialization,
      specializationDetails: additionalDetails,
      reason,
      status: "pending",
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(firestore, "specializationChangeRequests"), requestData);
    return { success: true, requestId: docRef.id };
  } catch (error) {
    console.error("Error submitting specialization change request:", error);
    return { success: false, error };
  }
};

/**
 * Get all pending specialization change requests for a user
 * @param userId User ID to check for pending requests
 */
export const getPendingSpecializationRequests = async (userId: string) => {
  try {
    const requestsRef = collection(firestore, "specializationChangeRequests");
    const q = query(
      requestsRef,
      where("userId", "==", userId),
      where("status", "==", "pending")
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: true, requests: [] };
    }
    
    const requests = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Handle the case where timestamps might be Firestore Timestamps
      const safeTimestamp = (timestamp: any) => {
        if (!timestamp) return new Date();
        
        // If it's a Firestore Timestamp, convert to JS Date
        if (timestamp.toDate && typeof timestamp.toDate === "function") {
          return timestamp.toDate();
        }
        
        // If already a Date, return it
        if (timestamp instanceof Date) {
          return timestamp;
        }
        
        // Try to parse as date if it's a number or string
        if (typeof timestamp === "number" || typeof timestamp === "string") {
          return new Date(timestamp);
        }
        
        // Fallback
        return new Date();
      };
      
      return {
        id: doc.id,
        ...data,
        submittedAt: safeTimestamp(data.submittedAt),
        createdAt: safeTimestamp(data.createdAt)
      };
    });
    
    return { success: true, requests };
  } catch (error) {
    console.error("Error getting pending specialization requests:", error);
    return { success: false, error, requests: [] };
  }
};

/**
 * Get all specialization change requests for admin review
 */
export const getAllSpecializationRequests = async () => {
  try {
    const requestsRef = collection(firestore, "specializationChangeRequests");
    const querySnapshot = await getDocs(requestsRef);
    
    if (querySnapshot.empty) {
      return { success: true, requests: [] };
    }
    
    const requests = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Handle the case where timestamps might be Firestore Timestamps
      const safeTimestamp = (timestamp: any) => {
        if (!timestamp) return new Date();
        
        // If it's a Firestore Timestamp, convert to JS Date
        if (timestamp.toDate && typeof timestamp.toDate === "function") {
          return timestamp.toDate();
        }
        
        // If already a Date, return it
        if (timestamp instanceof Date) {
          return timestamp;
        }
        
        // Try to parse as date if it's a number or string
        if (typeof timestamp === "number" || typeof timestamp === "string") {
          return new Date(timestamp);
        }
        
        // Fallback
        return new Date();
      };
      
      return {
        id: doc.id,
        ...data,
        submittedAt: safeTimestamp(data.submittedAt),
        createdAt: safeTimestamp(data.createdAt)
      };
    });
    
    // Sort by status (pending first) and then by submission date
    requests.sort((a, b) => {
      // Pending requests come first
      if ((a as any).status === "pending" && (b as any).status !== "pending") return -1;
      if ((a as any).status !== "pending" && (b as any).status === "pending") return 1;
      
      // Then sort by date (newest first)
      return b.submittedAt.getTime() - a.submittedAt.getTime();
    });
    
    return { success: true, requests };
  } catch (error) {
    console.error("Error getting all specialization requests:", error);
    return { success: false, error, requests: [] };
  }
};

// Funcții utilitare pentru gestionarea imaginilor profilurilor specialiștilor

/**
 * Procesează URL-ul imaginii pentru Firebase Storage
 * - Adaugă parametrul alt=media dacă lipsește
 * - Repară URL-urile bucket-ului dacă este necesar
 */
export function processSpecialistPhotoUrl(url?: string | null): string {
  if (!url) return "";
  
  // Skip processing for data URLs
  if (url.startsWith("data:")) return url;
  // Skip processing for relative URLs (local assets)
  if (url.startsWith("/")) return url;
  
  let processedUrl = url;
  
  // Fix all potential incorrect Firebase Storage domains
  // Corectăm toate variantele posibile de bucket-uri
  if (url.includes("appspot.com")) {
    processedUrl = processedUrl.replace("lupulcorbul.appspot.com", "lupulcorbul.firebasestorage.app");
  }
  
  // Ensure we're using the correct storage bucket domain
  const correctBucketDomain = "lupulcorbul.firebasestorage.app";
  const bucketPattern = /lupulcorbul\.(appspot\.com|firebasestorage\.googleapis\.com)/g;
  if (bucketPattern.test(processedUrl)) {
    processedUrl = processedUrl.replace(bucketPattern, correctBucketDomain);
  }
  
  // Add alt=media parameter for Firebase Storage URLs
  if ((processedUrl.includes("firebasestorage.googleapis.com") || 
      processedUrl.includes("storage.googleapis.com") || 
      processedUrl.includes("firebasestorage.app")) && 
      !processedUrl.includes("alt=media")) {
    processedUrl = `${processedUrl}${processedUrl.includes("?") ? "&" : "?"}alt=media`;
  }
  
  // Logging pentru debugging
  if (url !== processedUrl) {
    console.debug("URL specialist procesat:", { original: url, processed: processedUrl });
  }
  
  return processedUrl;
}

/**
 * Generează inițialele din numele specialistului
 */
export function getSpecialistInitials(name: string): string {
  if (!name) return "?";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generează o culoare consistentă pentru un specialist bazată pe ID
 */
export function getSpecialistBgColor(id: string): string {
  const colors = [
    "#3B82F6", // blue-500
    "#EF4444", // red-500
    "#10B981", // green-500
    "#8B5CF6", // purple-500
    "#F59E0B", // amber-500
    "#6366F1"  // indigo-500
  ];
  
  // Generează suma codurilor ASCII pentru fiecare caracter
  const charSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const colorIndex = charSum % colors.length;
  
  return colors[colorIndex];
}