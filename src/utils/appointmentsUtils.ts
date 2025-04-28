import { firestore } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";

/**
 * Fetches appointments with related specialist information
 * @param userId User ID to filter appointments for
 * @param isSpecialist Whether the user is a specialist or a regular user
 * @returns Promise with appointments array
 */
export const fetchAppointmentsWithRelations = async (userId: string, isSpecialist: boolean) => {
  try {
    const appointmentsRef = collection(firestore, "appointments");
    
    // Create query based on whether user is specialist or regular user
    const q = query(
      appointmentsRef, 
      isSpecialist 
        ? where("specialistId", "==", userId) 
        : where("userId", "==", userId),
      orderBy("date", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const appointments = [];
    
    // Process each appointment
    for (const appointmentDoc of querySnapshot.docs) {
      const appointmentData = appointmentDoc.data();
      const appointment = {
        id: appointmentDoc.id,
        ...appointmentData,
        // Parse date if it's a timestamp
        date: appointmentData.date?.toDate ? appointmentData.date.toDate() : appointmentData.date
      };
      
      // Get specialist information
      if (appointmentData.specialistId && !isSpecialist) {
        try {
          // First try to get from specialists collection
          const specialistRef = doc(firestore, "specialists", appointmentData.specialistId);
          let specialistDoc = await getDoc(specialistRef);
          
          // If not found directly, try querying by userId
          if (!specialistDoc.exists()) {
            const specialistsQuery = query(
              collection(firestore, "specialists"),
              where("userId", "==", appointmentData.specialistId)
            );
            const specialistsQuerySnap = await getDocs(specialistsQuery);
            
            if (!specialistsQuerySnap.empty) {
              specialistDoc = specialistsQuerySnap.docs[0];
            } else {
              // Fallback to user collection if not found in specialists
              const userDocRef = doc(firestore, "users", appointmentData.specialistId);
              specialistDoc = await getDoc(userDocRef);
            }
          }
          
          if (specialistDoc.exists()) {
            const specialistData = specialistDoc.data();
            (appointment as any).specialist = {
              id: specialistDoc.id,
              name: specialistData.displayName || specialistData.fullName || specialistData.name || "Unknown Specialist",
              specialization: specialistData.specialization || specialistData.serviceType || "General",
              photo: specialistData.photoURL || specialistData.photo || null
            };
          }
        } catch (error) {
          console.error("Error fetching specialist:", error);
        }
      }
      
      // Get the service information
      if (appointmentData.serviceId) {
        try {
          // First check in specialistServices collection
          const specialistServiceRef = doc(firestore, "specialistServices", appointmentData.serviceId);
          let serviceDoc = await getDoc(specialistServiceRef);
          
          // If not found, check in services collection
          if (!serviceDoc.exists()) {
            const serviceRef = doc(firestore, "services", appointmentData.serviceId);
            serviceDoc = await getDoc(serviceRef);
          }
          
          if (serviceDoc.exists()) {
            const serviceData = serviceDoc.data();
            (appointment as any).serviceDetails = {
              id: serviceDoc.id,
              name: serviceData.name || "Unknown Service",
              description: serviceData.description || "",
              duration: serviceData.duration || 60,
              price: serviceData.price || 0
            };
          }
        } catch (error) {
          console.error("Error fetching service:", error);
        }
      }
      
      appointments.push(appointment);
    }
    
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

/**
 * Fetch all specialization change requests for admin
 * @param status Optional status filter
 * @returns Promise with requests array
 */
export const fetchSpecializationChangeRequests = async (status?: "pending" | "approved" | "rejected") => {
  try {
    const requestsRef = collection(firestore, "specializationChangeRequests");
    let requestsQuery;
    
    if (status) {
      requestsQuery = query(
        requestsRef,
        where("status", "==", status)
      );
    } else {
      requestsQuery = query(requestsRef, orderBy("submittedAt", "desc"));
    }
    
    const querySnapshot = await getDocs(requestsQuery);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Record<string, any>),
      submittedAt: (doc.data() as any)?.submittedAt?.toDate 
        ? (doc.data() as any).submittedAt.toDate() 
        : new Date()
    }));
    
    return requests;
  } catch (error) {
    console.error("Error fetching specialization change requests:", error);
    return [];
  }
};