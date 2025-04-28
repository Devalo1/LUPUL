import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, addDoc, Timestamp, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { FaUserMd, FaEdit, FaTrash, FaCheck, FaBan, FaArrowRight, FaSearch, FaUserEdit, FaPhone, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import { SpecializationCategories } from "../utils/specializationCategories";

interface Specialist {
  id: string;
  userId: string;
  fullName: string;
  specialization: string;
  specializationCategory?: string;
  email: string;
  phone: string;
  bio: string;
  isActive: boolean;
  createdAt: any;
  imageUrl?: string;
}

const AdminSpecialists: React.FC = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [editingSpecialist, setEditingSpecialist] = useState<any>({});
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecialists = async () => {
      setLoading(true);
      try {
        const specialistsMap = new Map<string, Specialist>();

        const specialistsCollection = collection(db, "specialists");
        const specialistsSnapshot = await getDocs(specialistsCollection);

        specialistsSnapshot.forEach((doc) => {
          const data = doc.data();
          const userId = data.userId || doc.id;

          specialistsMap.set(userId, {
            id: doc.id,
            userId: userId,
            fullName: data.fullName || data.name || data.displayName || data.email || "Fără nume",
            specialization: data.specialization || data.specializationCategory || data.serviceType || "Neselectat",
            specializationCategory: data.specializationCategory || "",
            email: data.email || "",
            phone: data.phone || "",
            bio: data.bio || data.description || "",
            isActive: data.isActive ?? true,
            createdAt: data.createdAt,
            imageUrl: data.imageUrl || data.photoURL || ""
          });
        });

        const usersCollection = collection(db, "users");
        const specialistQuery = query(usersCollection, where("role", "==", "specialist"));
        const specialistSnapshot = await getDocs(specialistQuery);

        specialistSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          const userId = userDoc.id;

          if (specialistsMap.has(userId)) {
            const existing = specialistsMap.get(userId)!;
            specialistsMap.set(userId, {
              ...existing,
              fullName: existing.fullName !== "Fără nume" ? existing.fullName :
                (userData.displayName || userData.fullName || userData.email || "Fără nume"),
              email: existing.email || userData.email || "",
              phone: existing.phone || userData.phone || userData.phoneNumber || "",
              specialization: existing.specialization !== "Neselectat" ? existing.specialization :
                (userData.specialization || userData.specializationCategory || "Neselectat"),
              imageUrl: existing.imageUrl || userData.photoURL || userData.imageUrl || "",
            });
          } else {
            specialistsMap.set(userId, {
              id: userId,
              userId: userId,
              fullName: userData.displayName || userData.fullName || userData.email || "Fără nume",
              specialization: userData.specialization || userData.specializationCategory || "Neselectat",
              specializationCategory: userData.specializationCategory || "",
              email: userData.email || "",
              phone: userData.phone || userData.phoneNumber || "",
              bio: userData.bio || userData.description || "",
              isActive: userData.isActive ?? true,
              createdAt: userData.createdAt,
              imageUrl: userData.photoURL || userData.imageUrl || ""
            });
          }
        });

        const usersWithClaimsQuery = query(usersCollection, where("isSpecialist", "==", true));
        const usersWithClaimsSnapshot = await getDocs(usersWithClaimsQuery);

        usersWithClaimsSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          const userId = userDoc.id;

          if (specialistsMap.has(userId)) {
            const existing = specialistsMap.get(userId)!;
            specialistsMap.set(userId, {
              ...existing,
              fullName: existing.fullName !== "Fără nume" ? existing.fullName :
                (userData.displayName || userData.fullName || userData.email || "Fără nume"),
              email: existing.email || userData.email || "",
              phone: existing.phone || userData.phone || userData.phoneNumber || "",
            });
          } else {
            specialistsMap.set(userId, {
              id: userId,
              userId: userId,
              fullName: userData.displayName || userData.fullName || userData.email || "Fără nume",
              specialization: userData.specialization || userData.specializationCategory || "Neselectat",
              specializationCategory: userData.specializationCategory || "",
              email: userData.email || "",
              phone: userData.phone || userData.phoneNumber || "",
              bio: userData.bio || userData.description || "",
              isActive: userData.isActive ?? true,
              createdAt: userData.createdAt,
              imageUrl: userData.photoURL || userData.imageUrl || ""
            });
          }
        });

        try {
          const servicesCollection = collection(db, "specialistServices");
          const servicesSnapshot = await getDocs(servicesCollection);

          const specialistIdsFromServices = new Set<string>();
          servicesSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.specialistId) {
              specialistIdsFromServices.add(data.specialistId);
            }
          });

          const processSpecialistIds = async () => {
            for (const specialistId of Array.from(specialistIdsFromServices)) {
              try {
                const userDoc = await getDoc(doc(usersCollection, specialistId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  specialistsMap.set(specialistId, {
                    id: specialistId,
                    userId: specialistId,
                    fullName: userData.displayName || userData.fullName || userData.email || "Fără nume",
                    specialization: userData.specialization || userData.specializationCategory || "Neselectat",
                    specializationCategory: userData.specializationCategory || "",
                    email: userData.email || "",
                    phone: userData.phone || userData.phoneNumber || "",
                    bio: userData.bio || userData.description || "",
                    isActive: userData.isActive ?? true,
                    createdAt: userData.createdAt,
                    imageUrl: userData.photoURL || userData.imageUrl || ""
                  });

                  if (!userData.role || userData.role !== "specialist") {
                    await updateDoc(doc(usersCollection, specialistId), {
                      role: "specialist",
                      isSpecialist: true,
                      updatedAt: Timestamp.now()
                    });
                    console.log(`Updated user ${specialistId} with specialist role`);
                  }
                }
              } catch (err) {
                console.error(`Error fetching user data for specialist ${specialistId}:`, err);
              }
            }
          };

          const processSpecialistMap = async () => {
            await Promise.all(
              Array.from(specialistsMap.entries()).map(async ([userId, specialist]) => {
                if (specialist.fullName === "Fără nume") {
                  try {
                    const appointmentsRef = collection(db, "appointments");
                    const appointmentsQuery = query(appointmentsRef, where("specialistId", "==", userId));
                    const appointmentsSnapshot = await getDocs(appointmentsQuery);

                    if (!appointmentsSnapshot.empty) {
                      for (const appointmentDoc of appointmentsSnapshot.docs) {
                        const appointmentData = appointmentDoc.data();
                        if (appointmentData.specialistName && appointmentData.specialistName !== "Fără nume") {
                          specialist.fullName = appointmentData.specialistName;
                          break;
                        }
                      }
                    }

                    if (specialist.fullName === "Fără nume") {
                      const specialistProfileRef = doc(db, "specialistProfiles", userId);
                      const specialistProfileDoc = await getDoc(specialistProfileRef);

                      if (specialistProfileDoc.exists()) {
                        const profileData = specialistProfileDoc.data();
                        if (profileData.fullName || profileData.name || profileData.displayName) {
                          specialist.fullName = profileData.fullName || profileData.name || profileData.displayName;
                        }
                      }
                    }

                    if (specialist.fullName !== "Fără nume") {
                      try {
                        const specialistRef = doc(db, "specialists", specialist.id);
                        const specialistDoc = await getDoc(specialistRef);

                        if (specialistDoc.exists()) {
                          await updateDoc(specialistRef, {
                            fullName: specialist.fullName,
                            updatedAt: Timestamp.now()
                          });
                        }

                        const userRef = doc(db, "users", userId);
                        const userDoc = await getDoc(userRef);

                        if (userDoc.exists()) {
                          await updateDoc(userRef, {
                            displayName: specialist.fullName,
                            updatedAt: Timestamp.now()
                          });
                        }

                        console.log(`Updated name for specialist ${userId} to ${specialist.fullName}`);
                      } catch (updateError) {
                        console.error(`Error updating name for specialist ${userId}:`, updateError);
                      }
                    }
                  } catch (searchError) {
                    console.error(`Error searching for specialist name ${userId}:`, searchError);
                  }
                }
              })
            );
          };

          await processSpecialistIds();
          await processSpecialistMap();
        } catch (err) {
          console.error("Error checking specialistServices collection:", err);
        }

        const specialistsData = Array.from(specialistsMap.values());
        specialistsData.sort((a, b) => a.fullName.localeCompare(b.fullName));

        console.log(`Found ${specialistsData.length} specialists`);
        setSpecialists(specialistsData);
      } catch (error) {
        console.error("Error fetching specialists:", error);
        toast.error("A apărut o eroare la încărcarea specialiștilor");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, []);

  const handleToggleActive = async (specialistId: string, currentStatus: boolean) => {
    try {
      const specialistRef = doc(db, "specialists", specialistId);
      const specialistDoc = await getDoc(specialistRef);

      if (specialistDoc.exists()) {
        await updateDoc(specialistRef, {
          isActive: !currentStatus,
          updatedAt: Timestamp.now()
        });
      } else {
        const specialistData = specialists.find(s => s.id === specialistId);

        if (specialistData) {
          await setDoc(specialistRef, {
            userId: specialistData.userId,
            fullName: specialistData.fullName,
            specialization: specialistData.specialization,
            specializationCategory: specialistData.specializationCategory || "",
            email: specialistData.email,
            phone: specialistData.phone,
            bio: specialistData.bio,
            isActive: !currentStatus,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            imageUrl: specialistData.imageUrl || ""
          });

          const userRef = doc(db, "users", specialistData.userId);
          await updateDoc(userRef, {
            isSpecialist: true,
            role: "specialist",
            isActive: !currentStatus,
            updatedAt: Timestamp.now()
          });
        }
      }

      setSpecialists(specialists.map(s =>
        s.id === specialistId ? { ...s, isActive: !currentStatus } : s
      ));

      toast.success(`Specialistul a fost ${!currentStatus ? "activat" : "dezactivat"} cu succes`);
    } catch (error) {
      console.error("Error toggling specialist status:", error);
      toast.error("A apărut o eroare la actualizarea statusului");
    }
  };

  const handleDeleteSpecialist = async (specialistId: string, userId: string) => {
    if (!window.confirm("Sunteți sigur că doriți să ștergeți acest specialist? Această acțiune nu poate fi anulată.")) {
      return;
    }

    try {
      const specialistRef = doc(db, "specialists", specialistId);
      const specialistDoc = await getDoc(specialistRef);

      if (specialistDoc.exists()) {
        await deleteDoc(specialistRef);
      }

      if (userId && userId !== specialistId) {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          await updateDoc(userRef, {
            isSpecialist: false,
            role: "user",
            updatedAt: Timestamp.now()
          });
        }
      }

      try {
        const servicesQuery = query(
          collection(db, "specialistServices"),
          where("specialistId", "==", userId || specialistId)
        );

        const servicesSnapshot = await getDocs(servicesQuery);
        const deletePromises = servicesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        console.warn("Error deleting related services:", error);
      }

      setSpecialists(specialists.filter(s => s.id !== specialistId));

      toast.success("Specialistul a fost șters cu succes");
    } catch (error) {
      console.error("Error deleting specialist:", error);
      toast.error("A apărut o eroare la ștergerea specialistului");
    }
  };

  const handleUpdateSpecialist = async () => {
    if (!editingSpecialist) return;

    if (!editingSpecialist.fullName || !editingSpecialist.specialization) {
      toast.error("Numele și specializarea sunt obligatorii");
      return;
    }

    try {
      const specialistRef = doc(db, "specialists", editingSpecialist.id);
      const specialistDoc = await getDoc(specialistRef);

      if (specialistDoc.exists()) {
        await updateDoc(specialistRef, {
          fullName: editingSpecialist.fullName,
          specialization: editingSpecialist.specialization,
          specializationCategory: editingSpecialist.specializationCategory || editingSpecialist.specialization,
          email: editingSpecialist.email,
          phone: editingSpecialist.phone,
          bio: editingSpecialist.bio,
          updatedAt: Timestamp.now()
        });
      } else {
        await setDoc(specialistRef, {
          userId: editingSpecialist.userId,
          fullName: editingSpecialist.fullName,
          specialization: editingSpecialist.specialization,
          specializationCategory: editingSpecialist.specializationCategory || editingSpecialist.specialization,
          email: editingSpecialist.email,
          phone: editingSpecialist.phone,
          bio: editingSpecialist.bio,
          isActive: editingSpecialist.isActive,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          imageUrl: editingSpecialist.imageUrl || ""
        });
      }

      const userRef = doc(db, "users", editingSpecialist.userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          specialization: editingSpecialist.specialization,
          specializationCategory: editingSpecialist.specializationCategory || editingSpecialist.specialization,
          displayName: editingSpecialist.fullName,
          phone: editingSpecialist.phone,
          bio: editingSpecialist.bio,
          updatedAt: Timestamp.now()
        });
      }

      setSpecialists(specialists.map(s =>
        s.id === editingSpecialist.id ? editingSpecialist : s
      ));

      toast.success("Specialistul a fost actualizat cu succes");
      setShowEditForm(false);
      setEditingSpecialist(null);
    } catch (error) {
      console.error("Error updating specialist:", error);
      toast.error("A apărut o eroare la actualizarea specialistului");
    }
  };

  const handleEditSpecialist = (specialist: any) => {
    setEditingSpecialist(specialist);
    setShowEditForm(true);
  };

  const filteredSpecialists = specialists.filter(specialist => {
    const matchesSearch =
      (specialist.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (specialist.specialization?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (specialist.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    if (filterActive === "all") return matchesSearch;
    if (filterActive === "active") return matchesSearch && specialist.isActive;
    if (filterActive === "inactive") return matchesSearch && !specialist.isActive;

    return matchesSearch;
  });

  const _createSpecialistInFirestore = async () => {
    try {
      const specialistsCollection = collection(db, "specialists");
      const docRef = await addDoc(specialistsCollection, {
        ...editingSpecialist,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      });

      if (editingSpecialist.userId) {
        const userRef = doc(db, "users", editingSpecialist.userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          await updateDoc(userRef, {
            isSpecialist: true,
            role: "specialist",
            specialization: editingSpecialist.specialization || "",
            specializationCategory: editingSpecialist.specializationCategory || "",
            updatedAt: Timestamp.now()
          });
        }
      }

      toast.success("Specialist creat cu succes!");

      navigate(`/admin/specialists/edit/${docRef.id}`);
    } catch (error) {
      console.error("Error creating specialist:", error);
      toast.error("A apărut o eroare la crearea specialistului");
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";

    try {
      if (date.toDate) {
        date = date.toDate();
      } else if (typeof date === "string") {
        date = new Date(date);
      }

      return new Date(date).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Data invalidă";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FaUserMd className="mr-2" /> Gestionare Specialiști
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Caută specialiști..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Status:</span>
            <div className="flex space-x-1">
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  filterActive === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setFilterActive("all")}
              >
                Toți
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  filterActive === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setFilterActive("active")}
              >
                Activi
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  filterActive === "inactive"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setFilterActive("inactive")}
              >
                Inactivi
              </button>
            </div>
          </div>

          <Link
            to="/admin/specialists/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
          >
            <span>Adaugă specialist</span>
          </Link>
        </div>

        {showEditForm && editingSpecialist && (
          <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FaUserEdit className="mr-2" /> Editare Specialist
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingSpecialist.fullName}
                  onChange={(e) => setEditingSpecialist({...editingSpecialist, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ex: Dr. Ana Popescu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specializare <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingSpecialist.specialization}
                  onChange={(e) => setEditingSpecialist({...editingSpecialist, specialization: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ex: Psihoterapeut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie specializare
                </label>
                <select
                  value={editingSpecialist.specializationCategory || ""}
                  onChange={(e) => setEditingSpecialist({...editingSpecialist, specializationCategory: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selectează categoria</option>
                  {SpecializationCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingSpecialist.email}
                  onChange={(e) => setEditingSpecialist({...editingSpecialist, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  value={editingSpecialist.phone}
                  onChange={(e) => setEditingSpecialist({...editingSpecialist, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ex: 0712345678"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descriere / Bio
                </label>
                <textarea
                  value={editingSpecialist.bio}
                  onChange={(e) => setEditingSpecialist({...editingSpecialist, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Descriere a experienței și specializărilor"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingSpecialist(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Anulează
              </button>

              <button
                onClick={handleUpdateSpecialist}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvează modificările
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredSpecialists.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nu există specialiști care să corespundă criteriilor de căutare.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Specialist</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Specializare</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSpecialists.map((specialist) => (
                  <tr key={specialist.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {specialist.imageUrl ? (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              src={specialist.imageUrl} 
                              alt={specialist.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(specialist.fullName) + "&background=0D8ABC&color=fff";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUserMd className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{specialist.fullName}</div>
                          <div className="text-xs text-gray-500">
                            <FaCalendarAlt className="inline mr-1" size={10} />
                            Înregistrat: {formatDate(specialist.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{specialist.specialization}</div>
                      {specialist.specializationCategory && specialist.specializationCategory !== specialist.specialization && (
                        <div className="text-xs text-gray-500">{specialist.specializationCategory}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {specialist.email && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <FaEnvelope className="mr-1" size={12} />
                          {specialist.email}
                        </div>
                      )}
                      {specialist.phone && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <FaPhone className="mr-1" size={12} />
                          {specialist.phone}
                        </div>
                      )}
                      {!specialist.email && !specialist.phone && (
                        <div className="text-sm text-gray-500">N/A</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          specialist.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {specialist.isActive ? "Activ" : "Inactiv"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditSpecialist(specialist)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Editează"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(specialist.id, specialist.isActive)}
                          className={`p-1 rounded ${
                            specialist.isActive
                              ? "text-red-600 hover:text-red-800"
                              : "text-green-600 hover:text-green-800"
                          }`}
                          title={specialist.isActive ? "Dezactivează" : "Activează"}
                        >
                          {specialist.isActive ? <FaBan className="h-5 w-5" /> : <FaCheck className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSpecialist(specialist.id, specialist.userId)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Șterge"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                        <Link
                          to={`/specialists/${specialist.id}`}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="Vezi profilul public"
                          target="_blank"
                        >
                          <FaArrowRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSpecialists;
