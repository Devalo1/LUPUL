import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import {
  SpecializationCategories,
  getDefaultServicesForSpecialization,
} from "../utils/specializationCategories";

interface SpecialistService {
  id?: string;
  specialistId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
  category?: string;
  createdAt?: Date | string | number | unknown; // Replace 'any' with 'unknown'
  updatedAt?: unknown; // Replace 'any' with 'unknown'
}

interface SpecialistProfile {
  id?: string;
  userId: string;
  fullName: string;
  email: string;
  specialization?: string;
  specializationCategory?: string;
  bio?: string;
  isActive?: boolean;
}

const SpecialistServices: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<SpecialistService[]>([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState<
    Omit<SpecialistService, "id" | "specialistId" | "createdAt">
  >({
    name: "",
    description: "",
    duration: 60,
    price: 150,
    isActive: true,
    category: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editedService, setEditedService] = useState<SpecialistService | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [specialistProfile, setSpecialistProfile] =
    useState<SpecialistProfile | null>(null);

  // Fetch specialist services and profile
  useEffect(() => {
    const fetchServicesAndProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Get specialist profile first
        await fetchSpecialistProfile();

        // Fetch services provided by this specialist
        const q = query(
          collection(firestore, "specialistServices"),
          where("specialistId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const servicesData: SpecialistService[] = [];

        querySnapshot.forEach((doc) => {
          servicesData.push({
            id: doc.id,
            ...(doc.data() as Omit<SpecialistService, "id">),
          });
        });

        setServices(servicesData);

        // If we don't have any services yet, prepare suggestions based on specialization
        if (servicesData.length === 0 && specialistProfile?.specialization) {
          const defaultServices = getDefaultServicesForSpecialization(
            specialistProfile.specialization
          );
          if (defaultServices.length > 0) {
            setNewService({
              ...newService,
              name: defaultServices[0].name,
              description: defaultServices[0].description,
              duration: defaultServices[0].duration,
              price: defaultServices[0].price,
              category: specialistProfile.specialization,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching specialist services:", error);
        setErrorMessage(
          "Nu s-au putut încărca serviciile. Vă rugăm încercați din nou."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchServicesAndProfile();
    }
  }, [user]);

  // Fetch the specialist profile data
  const fetchSpecialistProfile = async () => {
    if (!user) return;

    try {
      // Try to get from specialists collection first
      const specialistsRef = collection(firestore, "specialists");
      const q = query(specialistsRef, where("userId", "==", user.uid));
      const specialistsSnapshot = await getDocs(q);

      if (!specialistsSnapshot.empty) {
        const data = specialistsSnapshot.docs[0].data();
        setSpecialistProfile({
          id: specialistsSnapshot.docs[0].id,
          userId: user.uid,
          fullName: data.fullName || data.name || user.displayName || "",
          email: data.email || user.email || "",
          specialization:
            data.specialization || data.specializationCategory || "",
          specializationCategory:
            data.specializationCategory || data.specialization || "",
          bio: data.bio || data.description || "",
          isActive: data.isActive !== false,
        });
        return;
      }

      // Try direct document in specialists collection
      const directSpecialistRef = doc(firestore, "specialists", user.uid);
      const directSpecialistDoc = await getDoc(directSpecialistRef);

      if (directSpecialistDoc.exists()) {
        const data = directSpecialistDoc.data();
        setSpecialistProfile({
          id: user.uid,
          userId: user.uid,
          fullName: data.fullName || data.name || user.displayName || "",
          email: data.email || user.email || "",
          specialization:
            data.specialization || data.specializationCategory || "",
          specializationCategory:
            data.specializationCategory || data.specialization || "",
          bio: data.bio || data.description || "",
          isActive: data.isActive !== false,
        });
        return;
      }

      // Fall back to user data
      const userDoc = await getDoc(doc(firestore, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setSpecialistProfile({
          userId: user.uid,
          fullName: data.displayName || user.displayName || "",
          email: data.email || user.email || "",
          specialization: data.specialization || "",
          specializationCategory: data.specializationCategory || "",
          bio: data.bio || data.description || "",
          isActive: data.isActive !== false,
        });
      } else {
        // Create a minimal profile if we have nothing
        setSpecialistProfile({
          userId: user.uid,
          fullName: user.displayName || "",
          email: user.email || "",
          isActive: true,
        });
      }
    } catch (error) {
      console.error("Error fetching specialist profile:", error);
    }
  };

  // Add a new service
  const handleAddService = async () => {
    if (!user) return;

    if (
      !newService.name ||
      !newService.description ||
      newService.duration <= 0 ||
      newService.price < 0
    ) {
      setErrorMessage(
        "Toate câmpurile sunt obligatorii. Durata trebuie să fie pozitivă și prețul nu poate fi negativ."
      );
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const serviceData: Omit<SpecialistService, "id"> = {
        specialistId: user.uid,
        name: newService.name,
        description: newService.description,
        duration: newService.duration,
        price: newService.price,
        isActive: true,
        category:
          newService.category || specialistProfile?.specialization || "General",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(firestore, "specialistServices"),
        serviceData
      );

      // Update the state with the new service
      setServices([...services, { id: docRef.id, ...serviceData }]);
      setSuccessMessage("Serviciu adăugat cu succes!");

      // Reset form
      setNewService({
        name: "",
        description: "",
        duration: 60,
        price: 150,
        isActive: true,
        category: specialistProfile?.specialization || "",
      });
      setShowAddForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error adding service:", error);
      setErrorMessage(
        "A apărut o eroare la adăugarea serviciului. Vă rugăm încercați din nou."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete a service
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Sigur doriți să ștergeți acest serviciu?")) return;

    try {
      await deleteDoc(doc(firestore, "specialistServices", serviceId));

      // Update the state
      setServices(services.filter((service) => service.id !== serviceId));

      setSuccessMessage("Serviciu șters cu succes!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting service:", error);
      setErrorMessage(
        "A apărut o eroare la ștergerea serviciului. Vă rugăm încercați din nou."
      );
    }
  };

  // Start editing a service
  const handleEditStart = (service: SpecialistService) => {
    setEditing(service.id || null);
    setEditedService({ ...service });
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditing(null);
    setEditedService(null);
  };

  // Save edited service
  const handleSaveEdit = async () => {
    if (!editedService || !editedService.id) return;

    if (
      !editedService.name ||
      !editedService.description ||
      editedService.duration <= 0 ||
      editedService.price < 0
    ) {
      setErrorMessage(
        "Toate câmpurile sunt obligatorii. Durata trebuie să fie pozitivă și prețul nu poate fi negativ."
      );
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const serviceRef = doc(firestore, "specialistServices", editedService.id);

      await updateDoc(serviceRef, {
        name: editedService.name,
        description: editedService.description,
        duration: editedService.duration,
        price: editedService.price,
        isActive: editedService.isActive,
        category:
          editedService.category ||
          specialistProfile?.specialization ||
          "General",
        updatedAt: serverTimestamp(),
      });

      // Update the state
      setServices(
        services.map((service) =>
          service.id === editedService.id ? editedService : service
        )
      );

      setSuccessMessage("Serviciu actualizat cu succes!");
      setEditing(null);
      setEditedService(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating service:", error);
      setErrorMessage(
        "A apărut o eroare la actualizarea serviciului. Vă rugăm încercați din nou."
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle service active status
  const toggleServiceActive = async (
    serviceId: string,
    currentStatus: boolean
  ) => {
    try {
      const serviceRef = doc(firestore, "specialistServices", serviceId);

      await updateDoc(serviceRef, {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });

      // Update the state
      setServices(
        services.map((service) =>
          service.id === serviceId
            ? { ...service, isActive: !currentStatus }
            : service
        )
      );

      setSuccessMessage(
        `Serviciu ${!currentStatus ? "activat" : "dezactivat"} cu succes!`
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error toggling service status:", error);
      setErrorMessage(
        "A apărut o eroare la actualizarea statusului serviciului. Vă rugăm încercați din nou."
      );
    }
  };

  // Function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Se încarcă serviciile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Serviciile mele</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          title="Adaugă serviciu"
          aria-label="Adaugă serviciu"
        >
          <FaPlus />
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {errorMessage}
          <button
            className="absolute top-2 right-2"
            onClick={() => setErrorMessage(null)}
            title="Închide mesajul de eroare"
            aria-label="Închide mesajul de eroare"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
          <button
            className="absolute top-2 right-2"
            onClick={() => setSuccessMessage(null)}
            title="Închide mesajul de succes"
            aria-label="Închide mesajul de succes"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Adaugă serviciu nou</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume serviciu *
              </label>
              <input
                type="text"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Introdu numele serviciului"
                aria-label="Nume serviciu"
                title="Nume serviciu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie
              </label>
              <select
                aria-label="Alege categoria serviciului"
                title="Alege categoria serviciului"
              >
                <option value="">Selectează categoria</option>
                {SpecializationCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durată (minute) *
              </label>
              <input
                type="number"
                value={newService.duration}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Durata în minute"
                aria-label="Durată (minute)"
                title="Durată (minute)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preț (RON) *
              </label>
              <input
                type="number"
                value={newService.price}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    price: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Preț în RON"
                aria-label="Preț (RON)"
                title="Preț (RON)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descriere *
              </label>
              <textarea
                value={newService.description}
                onChange={(e) =>
                  setNewService({ ...newService, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descriere serviciu"
                aria-label="Descriere serviciu"
                title="Descriere serviciu"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Anulează
            </button>
            <button
              onClick={handleAddService}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Se salvează...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Salvează
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Niciun serviciu adăugat
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Adăugați serviciile pe care le oferiți pentru a permite clienților
            să le aleagă la programare.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <FaPlus className="mr-2" /> Adaugă primul serviciu
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Serviciu
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Detalii
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr
                  key={service.id}
                  className={`${service.isActive ? "" : "bg-gray-50"}`}
                >
                  {editing === service.id ? (
                    <>
                      <td className="px-6 py-4" colSpan={4}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nume serviciu *
                            </label>
                            <input
                              type="text"
                              value={editedService?.name || ""}
                              onChange={(e) =>
                                setEditedService((prev) =>
                                  prev
                                    ? { ...prev, name: e.target.value }
                                    : null
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Introdu numele serviciului"
                              aria-label="Nume serviciu"
                              title="Nume serviciu"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categorie
                            </label>
                            <select
                              value={editedService?.category || ""}
                              onChange={(e) =>
                                setEditedService((prev) =>
                                  prev
                                    ? { ...prev, category: e.target.value }
                                    : null
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              aria-label="Categorie serviciu"
                              title="Categorie serviciu"
                            >
                              <option value="">Selectează o categorie</option>
                              {SpecializationCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Durată (minute) *
                            </label>
                            <input
                              type="number"
                              value={editedService?.duration || 0}
                              onChange={(e) =>
                                setEditedService((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        duration: parseInt(e.target.value) || 0,
                                      }
                                    : null
                                )
                              }
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Durata în minute"
                              aria-label="Durată (minute)"
                              title="Durată (minute)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Preț (RON) *
                            </label>
                            <input
                              type="number"
                              value={editedService?.price || 0}
                              onChange={(e) =>
                                setEditedService((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        price: parseInt(e.target.value) || 0,
                                      }
                                    : null
                                )
                              }
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Preț în RON"
                              aria-label="Preț (RON)"
                              title="Preț (RON)"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descriere *
                            </label>
                            <textarea
                              value={editedService?.description || ""}
                              onChange={(e) =>
                                setEditedService((prev) =>
                                  prev
                                    ? { ...prev, description: e.target.value }
                                    : null
                                )
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Descriere serviciu"
                              aria-label="Descriere serviciu"
                              title="Descriere serviciu"
                            ></textarea>
                          </div>

                          <div className="md:col-span-2 flex items-center">
                            <input
                              type="checkbox"
                              id={`active-${service.id}`}
                              checked={editedService?.isActive || false}
                              onChange={(e) =>
                                setEditedService((prev) =>
                                  prev
                                    ? { ...prev, isActive: e.target.checked }
                                    : null
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`active-${service.id}`}
                              className="ml-2 block text-sm text-gray-700"
                            >
                              Serviciu activ (disponibil pentru programări)
                            </label>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={handleEditCancel}
                            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                          >
                            <FaTimes className="inline mr-1" /> Anulează
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Se salvează...
                              </>
                            ) : (
                              <>
                                <FaSave className="mr-2" /> Salvează
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {service.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {service.category || "General"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {service.description}
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaClock className="mr-1" /> {service.duration} minute
                          <span className="mx-2">•</span>
                          <FaMoneyBillWave className="mr-1" />{" "}
                          {formatPrice(service.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                            service.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          onClick={() =>
                            toggleServiceActive(
                              service.id || "",
                              service.isActive
                            )
                          }
                          title={
                            service.isActive
                              ? "Click pentru a dezactiva"
                              : "Click pentru a activa"
                          }
                        >
                          {service.isActive ? "Activ" : "Inactiv"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditStart(service)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <FaEdit className="inline mr-1" /> Editează
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id || "")}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline mr-1" /> Șterge
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SpecialistServices;
