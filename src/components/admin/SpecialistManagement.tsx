import React, { useState, useEffect } from "react";
import { firestore } from "../../firebase";
import { getDoc, doc, collection, query, where, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { FaSearch, FaUserMd, FaEdit, FaCheck, FaTimes, FaSpinner, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { SpecializationCategories } from "../../utils/specializationCategories";

// Mock functions for missing imports
const _getAllSpecialists = async () => { return []; };
const _approveSpecialist = async () => { return true; };
const _rejectSpecialist = async () => { return true; };
const _getUserById = async () => { return null; };

// Define processImageUrl locally
const processImageUrl = (url: string) => url || "";

// Add the missing updateUserSpecialization function
const updateUserSpecialization = async (userId: string, specialization: string, category: string) => {
  try {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      specialization: specialization,
      specializationCategory: category,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user specialization:", error);
    return false;
  }
};

interface Timestamp {
  toDate(): Date;
}

// Create specific interfaces to replace 'any'
interface SpecialistRecord {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  [key: string]: unknown;
}

interface FilterState {
  searchTerm: string;
  status?: string;
  [key: string]: unknown;
}

// Add specific types for Specialist's createdAt and updatedAt
interface Specialist {
  id: string;
  userId?: string;
  name?: string;
  displayName?: string;
  fullName?: string;
  email?: string;
  photoURL?: string;
  specialization?: string;
  specializationCategory?: string;
  isActive?: boolean;
  services?: string[];
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
}

// Add underscore prefix to unused variables
const _specialists: SpecialistRecord[] = [];
const _filters: FilterState = {
  searchTerm: "",
  status: ""
};

// Helper function to get the best display name for a specialist
const getDisplayName = (specialist: Specialist): string => {
  return specialist.fullName || 
         specialist.displayName || 
         specialist.name || 
         (specialist.email ? specialist.email.split("@")[0] : "Fără nume");
};

// Helper function to get the first letter of the name for avatar
const getFirstLetter = (specialist: Specialist): string => {
  const name = getDisplayName(specialist);
  return name.charAt(0).toUpperCase();
}

const SpecialistManagement: React.FC = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingSpecialistId, setEditingSpecialistId] = useState<string | null>(null);
  const [newSpecialization, setNewSpecialization] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);

  // Load specialists on component mount
  useEffect(() => {
    const fetchSpecialists = async () => {
      setLoading(true);
      try {
        const specialistsCollection = collection(firestore, "specialists");
        const specialistsSnapshot = await getDocs(specialistsCollection);
        
        const specialistsData: Specialist[] = [];
        
        // Process specialists from specialists collection
        specialistsSnapshot.forEach((doc) => {
          const data = doc.data();
          specialistsData.push({
            id: doc.id,
            userId: data.userId || doc.id,
            fullName: data.fullName || data.name || data.displayName || "",
            name: data.name || "",
            displayName: data.displayName || "",
            specialization: data.specialization || data.specializationCategory || data.serviceType || "Neselectat",
            specializationCategory: data.specializationCategory || "",
            email: data.email || "",
            isActive: data.isActive ?? true,
            createdAt: data.createdAt,
            photoURL: data.imageUrl || data.photoURL || ""
          });
        });
        
        // Also look in users collection for users with specialist role
        const usersCollection = collection(firestore, "users");
        const specialistQuery = query(usersCollection, where("role", "==", "specialist"));
        const specialistSnapshot = await getDocs(specialistQuery);
        
        // Process users with role=specialist
        const processedUserIds = new Set();
        for (const userDoc of specialistSnapshot.docs) {
          const userData = userDoc.data();
          processedUserIds.add(userDoc.id);
          
          // Check if this user is already in the specialists list
          const existingSpecialist = specialistsData.find(s => s.userId === userDoc.id);
          if (!existingSpecialist) {
            specialistsData.push({
              id: userDoc.id,
              userId: userDoc.id,
              fullName: userData.displayName || userData.fullName || "",
              name: userData.name || "",
              displayName: userData.displayName || "",
              specialization: userData.specialization || userData.specializationCategory || "Neselectat",
              specializationCategory: userData.specializationCategory || "",
              email: userData.email || "",
              isActive: userData.isActive ?? true,
              createdAt: userData.createdAt,
              photoURL: userData.photoURL || userData.imageUrl || ""
            });
          }
        }
        
        // Check user claims for specialist role
        const usersWithClaimsQuery = query(usersCollection, where("isSpecialist", "==", true));
        const usersWithClaimsSnapshot = await getDocs(usersWithClaimsQuery);
        
        for (const userDoc of usersWithClaimsSnapshot.docs) {
          if (processedUserIds.has(userDoc.id)) continue;
          
          processedUserIds.add(userDoc.id);
          const userData = userDoc.data();
          
          // Check if this user is already in the specialists list
          const existingSpecialist = specialistsData.find(s => s.userId === userDoc.id);
          if (!existingSpecialist) {
            specialistsData.push({
              id: userDoc.id,
              userId: userDoc.id,
              fullName: userData.displayName || userData.fullName || "",
              name: userData.name || "",
              displayName: userData.displayName || "",
              specialization: userData.specialization || userData.specializationCategory || "Neselectat",
              specializationCategory: userData.specializationCategory || "",
              email: userData.email || "",
              isActive: userData.isActive ?? true,
              createdAt: userData.createdAt,
              photoURL: userData.photoURL || userData.imageUrl || ""
            });
          }
        }
        
        // Resolve specialist names from userId if needed
        for (const specialist of specialistsData) {
          // If we don't have a name yet but we have a userId, try to get the user data
          if ((!specialist.fullName && !specialist.displayName && !specialist.name) && specialist.userId) {
            try {
              const userRef = doc(firestore, "users", specialist.userId);
              const userDoc = await getDoc(userRef);
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                specialist.fullName = userData.displayName || userData.fullName || "";
                specialist.displayName = userData.displayName || "";
                specialist.name = userData.name || "";
                specialist.email = userData.email || specialist.email || "";
                specialist.photoURL = userData.photoURL || userData.imageUrl || specialist.photoURL || "";
              }
            } catch (error) {
              console.error(`Error fetching user data for specialist ${specialist.id}:`, error);
            }
          }
        }
        
        // Sort specialists by name
        specialistsData.sort((a, b) => {
          const nameA = getDisplayName(a);
          const nameB = getDisplayName(b);
          return nameA.localeCompare(nameB);
        });
        
        setSpecialists(specialistsData);
        setFilteredSpecialists(specialistsData);
      } catch (error) {
        console.error("Eroare la încărcarea specialiștilor:", error);
        toast.error("Nu s-au putut încărca specialiștii. Încercați din nou.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecialists();
  }, []);

  // Filter specialists when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSpecialists(specialists);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = specialists.filter(specialist => 
      (specialist.name && specialist.name.toLowerCase().includes(query)) ||
      (specialist.displayName && specialist.displayName.toLowerCase().includes(query)) ||
      (specialist.fullName && specialist.fullName.toLowerCase().includes(query)) ||
      (specialist.email && specialist.email.toLowerCase().includes(query)) ||
      (specialist.specialization && specialist.specialization.toLowerCase().includes(query)) ||
      (specialist.id && specialist.id.toLowerCase().includes(query))
    );
    
    setFilteredSpecialists(filtered);
  }, [searchQuery, specialists]);

  const handleUpdateSpecialization = async (specialistId: string): Promise<void> => {
    if (!newSpecialization.trim()) {
      toast.warning("Vă rugăm să introduceți o specializare");
      return;
    }
    
    setProcessing(true);
    
    try {
      // Get the actual user ID if it exists separately
      const specialist = specialists.find(s => s.id === specialistId);
      const userId = specialist?.userId || specialistId;
      
      await updateUserSpecialization(userId, newSpecialization, newCategory);
      
      // Update local state
      setSpecialists(prevSpecialists => 
        prevSpecialists.map(spec => 
          spec.id === specialistId 
            ? { 
                ...spec, 
                specialization: newSpecialization,
                specializationCategory: newCategory || newSpecialization
              } 
            : spec
        )
      );
      
      setFilteredSpecialists(prevSpecialists => 
        prevSpecialists.map(spec => 
          spec.id === specialistId 
            ? { 
                ...spec, 
                specialization: newSpecialization,
                specializationCategory: newCategory || newSpecialization
              } 
            : spec
        )
      );
      
      toast.success("Specializarea a fost actualizată cu succes");
      
      // Reset form state
      setEditingSpecialistId(null);
      setNewSpecialization("");
      setNewCategory("");
    } catch (error) {
      console.error("Eroare la actualizarea specializării:", error);
      toast.error("Nu s-a putut actualiza specializarea");
    } finally {
      setProcessing(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp: unknown): string => {
    if (!timestamp) return "N/A";
    
    if (timestamp && typeof timestamp === "object" && "toDate" in timestamp && typeof timestamp.toDate === "function") {
      const date = timestamp.toDate();
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    
    try {
      const date = new Date(timestamp as string | number | Date);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Dată invalidă";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestionare Specialiști</h2>
      
      {/* Search */}
      <div className="mb-6 flex">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Caută după nume, email sau specializare..."
          className="px-4 py-2 border border-gray-300 rounded-l flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setSearchQuery("")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
        >
          <FaSearch />
        </button>
      </div>
      
      {/* Specialists list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredSpecialists.length === 0 ? (
        <div className="text-center py-12">
          <FaUserMd className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">Nu s-au găsit specialiști care să corespundă criteriilor de căutare.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialist
                </th>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specializare
                </th>
                <th className="px-4 py-3 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 border-b text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSpecialists.map(specialist => (
                <tr key={specialist.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {specialist.photoURL ? (
                        <img 
                          src={processImageUrl(specialist.photoURL)} 
                          alt="Avatar"
                          className="h-10 w-10 rounded-full mr-3 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(getDisplayName(specialist)) + "&background=0D8ABC&color=fff";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">
                            {getFirstLetter(specialist)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {getDisplayName(specialist)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <FaCalendarAlt className="mr-1" size={10} />
                          Înregistrat: {formatDate(specialist.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editingSpecialistId === specialist.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newSpecialization}
                          onChange={(e) => setNewSpecialization(e.target.value)}
                          placeholder="Specializare nouă"
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-2 py-1 text-sm border rounded"
                        >
                          <option value="">Selectează categoria (opțional)</option>
                          {Array.isArray(SpecializationCategories) && SpecializationCategories.map(category => (
                            <option key={typeof category === "string" ? category : category.id} 
                                    value={typeof category === "string" ? category : category.name}>
                              {typeof category === "string" ? category : category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {specialist.specialization || "Nespecificat"}
                        </div>
                        {specialist.specializationCategory && specialist.specializationCategory !== specialist.specialization && (
                          <div className="text-xs text-gray-500">
                            Categoria: {specialist.specializationCategory}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      specialist.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {specialist.isActive ? "Activ" : "Inactiv"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {specialist.email && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <FaEnvelope className="mr-1" size={12} />
                        {specialist.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingSpecialistId === specialist.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleUpdateSpecialization(specialist.id)}
                          disabled={processing}
                          className="text-green-600 hover:text-green-900"
                          title="Salvează"
                        >
                          {processing ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSpecialistId(null);
                            setNewSpecialization("");
                            setNewCategory("");
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Anulează"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingSpecialistId(specialist.id);
                          setNewSpecialization(specialist.specialization || "");
                          setNewCategory(specialist.specializationCategory || "");
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editează specializarea"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SpecialistManagement;
