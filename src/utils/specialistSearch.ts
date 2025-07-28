import {
  collection,
  query,
  where,
  getDocs,
  limit,
  DocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { SearchFilters } from "../components/SpecialistSearch";

export interface Specialist {
  id: string;
  userId?: string;
  fullName: string;
  name?: string;
  displayName?: string;
  email: string;
  phone?: string;
  specialization: string;
  specializationCategory?: string;
  bio?: string;
  description?: string;
  isActive: boolean;
  rating?: number;
  reviewsCount?: number;
  experience?: number;
  imageUrl?: string;
  photoURL?: string;
  services?: string[];
  createdAt?: Date | string | number | unknown;
  source?: string;
}

export interface SearchResult {
  specialists: Specialist[];
  totalCount: number;
  hasMore: boolean;
  lastDoc?: DocumentSnapshot;
}

/**
 * Searches specialists from both specialists and users collections
 */
export const searchSpecialists = async (
  filters: SearchFilters,
  pageSize = 20,
  lastDocument?: DocumentSnapshot
): Promise<SearchResult> => {
  try {
    const specialists: Specialist[] = [];
    const processedIds = new Set<string>();

    // Search in specialists collection first
    const specialistsFromCollection = await searchInSpecialistsCollection(
      filters,
      pageSize
    );

    specialistsFromCollection.forEach((specialist) => {
      if (!processedIds.has(specialist.id)) {
        processedIds.add(specialist.id);
        specialists.push(specialist);
      }
    });

    // Search in users collection for users with specialist role
    const specialistsFromUsers = await searchInUsersCollection(
      filters,
      pageSize
    );

    specialistsFromUsers.forEach((specialist) => {
      if (!processedIds.has(specialist.id)) {
        processedIds.add(specialist.id);
        specialists.push(specialist);
      }
    });

    // Apply client-side filtering and sorting
    const filteredSpecialists = applyFiltersAndSort(specialists, filters);

    // Implement pagination
    const startIndex = lastDocument ? 0 : 0; // For simplicity, we'll handle pagination client-side
    const paginatedSpecialists = filteredSpecialists.slice(
      startIndex,
      startIndex + pageSize
    );

    return {
      specialists: paginatedSpecialists,
      totalCount: filteredSpecialists.length,
      hasMore: filteredSpecialists.length > startIndex + pageSize,
      lastDoc: undefined, // We'll implement proper pagination later if needed
    };
  } catch (error) {
    console.error("Error searching specialists:", error);
    return {
      specialists: [],
      totalCount: 0,
      hasMore: false,
    };
  }
};

/**
 * Search in specialists collection
 */
const searchInSpecialistsCollection = async (
  filters: SearchFilters,
  pageSize: number
): Promise<Specialist[]> => {
  try {
    const specialistsRef = collection(firestore, "specialists");
    let q = query(specialistsRef);

    // Apply Firestore filters
    if (filters.specialization) {
      q = query(q, where("specialization", "==", filters.specialization));
    }

    if (filters.isActive !== null) {
      q = query(q, where("isActive", "==", filters.isActive));
    }

    // Add limit
    q = query(q, limit(pageSize * 2)); // Get more to account for client-side filtering

    const snapshot = await getDocs(q);
    const specialists: Specialist[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      specialists.push({
        id: doc.id,
        userId: data.userId || doc.id,
        fullName:
          data.fullName || data.name || data.displayName || "Nume necunoscut",
        name: data.name,
        displayName: data.displayName,
        email: data.email || "",
        phone: data.phone,
        specialization:
          data.specialization || data.specializationCategory || "Neselectat",
        specializationCategory: data.specializationCategory,
        bio: data.bio || data.description,
        description: data.description,
        isActive: data.isActive !== false,
        rating: data.rating || 0,
        reviewsCount: data.reviewsCount || 0,
        experience: data.experience || 0,
        imageUrl: data.imageUrl || data.photoURL,
        photoURL: data.photoURL,
        services: data.services || [],
        createdAt: data.createdAt,
        source: "specialists",
      });
    });

    return specialists;
  } catch (error) {
    console.error("Error searching in specialists collection:", error);
    return [];
  }
};

/**
 * Search in users collection for specialists
 */
const searchInUsersCollection = async (
  filters: SearchFilters,
  pageSize: number
): Promise<Specialist[]> => {
  try {
    const usersRef = collection(firestore, "users");
    let q = query(usersRef, where("role", "==", "specialist"));

    // Apply additional filters
    if (filters.specialization) {
      q = query(q, where("specialization", "==", filters.specialization));
    }

    if (filters.isActive !== null) {
      q = query(q, where("isActive", "==", filters.isActive));
    }

    // Add limit
    q = query(q, limit(pageSize * 2));

    const snapshot = await getDocs(q);
    const specialists: Specialist[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Only include users who are actually specialists
      if (data.role === "specialist" || data.isSpecialist === true) {
        specialists.push({
          id: doc.id,
          userId: doc.id,
          fullName:
            data.displayName ||
            data.fullName ||
            data.name ||
            data.email ||
            "Nume necunoscut",
          name: data.name,
          displayName: data.displayName,
          email: data.email || "",
          phone: data.phone || data.phoneNumber,
          specialization:
            data.specialization || data.specializationCategory || "Neselectat",
          specializationCategory: data.specializationCategory,
          bio: data.bio || data.description,
          description: data.description,
          isActive: data.isActive !== false,
          rating: data.rating || 0,
          reviewsCount: data.reviewsCount || 0,
          experience: data.experience || 0,
          imageUrl: data.photoURL || data.imageUrl,
          photoURL: data.photoURL,
          services: data.services || [],
          createdAt: data.createdAt,
          source: "users",
        });
      }
    });

    return specialists;
  } catch (error) {
    console.error("Error searching in users collection:", error);
    return [];
  }
};

/**
 * Apply client-side filters and sorting
 */
const applyFiltersAndSort = (
  specialists: Specialist[],
  filters: SearchFilters
): Specialist[] => {
  let filtered = [...specialists];

  // Apply search term filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((specialist) => {
      const nameMatch =
        specialist.fullName?.toLowerCase().includes(searchLower) ||
        specialist.name?.toLowerCase().includes(searchLower) ||
        specialist.displayName?.toLowerCase().includes(searchLower);

      const specializationMatch =
        specialist.specialization?.toLowerCase().includes(searchLower) ||
        specialist.specializationCategory?.toLowerCase().includes(searchLower);

      const emailMatch = specialist.email?.toLowerCase().includes(searchLower);

      return nameMatch || specializationMatch || emailMatch;
    });
  }

  // Apply specialization filter (client-side for partial matching)
  if (filters.specialization) {
    filtered = filtered.filter(
      (specialist) =>
        specialist.specialization?.includes(filters.specialization) ||
        specialist.specializationCategory?.includes(filters.specialization)
    );
  }

  // Apply active status filter
  if (filters.isActive !== null) {
    filtered = filtered.filter(
      (specialist) => specialist.isActive === filters.isActive
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case "name":
        comparison = (a.fullName || "").localeCompare(b.fullName || "");
        break;
      case "specialization":
        comparison = (a.specialization || "").localeCompare(
          b.specialization || ""
        );
        break;
      case "rating":
        comparison = (b.rating || 0) - (a.rating || 0);
        break;
      case "experience":
        comparison = (b.experience || 0) - (a.experience || 0);
        break;
      default:
        comparison = (a.fullName || "").localeCompare(b.fullName || "");
    }

    return filters.sortOrder === "desc" ? -comparison : comparison;
  });

  return filtered;
};

/**
 * Get specialist by ID from both collections
 */
export const getSpecialistById = async (
  specialistId: string
): Promise<Specialist | null> => {
  try {
    // Try specialists collection first
    const specialistDoc = await getDocs(
      query(
        collection(firestore, "specialists"),
        where("userId", "==", specialistId)
      )
    );

    if (!specialistDoc.empty) {
      const data = specialistDoc.docs[0].data();
      return {
        id: specialistDoc.docs[0].id,
        userId: data.userId || specialistDoc.docs[0].id,
        fullName:
          data.fullName || data.name || data.displayName || "Nume necunoscut",
        email: data.email || "",
        specialization: data.specialization || "Neselectat",
        isActive: data.isActive !== false,
        ...data,
        source: "specialists",
      } as Specialist;
    }

    // Try users collection
    const userDoc = await getDocs(
      query(
        collection(firestore, "users"),
        where("__name__", "==", specialistId)
      )
    );

    if (!userDoc.empty) {
      const data = userDoc.docs[0].data();
      if (data.role === "specialist" || data.isSpecialist === true) {
        return {
          id: userDoc.docs[0].id,
          userId: userDoc.docs[0].id,
          fullName:
            data.displayName || data.fullName || data.name || "Nume necunoscut",
          email: data.email || "",
          specialization: data.specialization || "Neselectat",
          isActive: data.isActive !== false,
          ...data,
          source: "users",
        } as Specialist;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting specialist by ID:", error);
    return null;
  }
};

/**
 * Get available specializations from the database
 */
export const getAvailableSpecializations = async (): Promise<string[]> => {
  try {
    const specializations = new Set<string>();

    // Get from specialists collection
    const specialistsSnapshot = await getDocs(
      collection(firestore, "specialists")
    );
    specialistsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.specialization) {
        specializations.add(data.specialization);
      }
      if (data.specializationCategory) {
        specializations.add(data.specializationCategory);
      }
    });

    // Get from users collection
    const usersSnapshot = await getDocs(
      query(collection(firestore, "users"), where("role", "==", "specialist"))
    );
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.specialization) {
        specializations.add(data.specialization);
      }
      if (data.specializationCategory) {
        specializations.add(data.specializationCategory);
      }
    });

    return Array.from(specializations).sort();
  } catch (error) {
    console.error("Error getting available specializations:", error);
    return [];
  }
};
