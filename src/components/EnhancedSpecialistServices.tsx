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
  FaList,
  FaSearch,
} from "react-icons/fa";

interface SpecialistService {
  id?: string;
  specialistId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
  category?: string;
  createdAt?: Date | string | number | unknown;
  updatedAt?: unknown;
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

interface ServiceTemplate {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

const POPULAR_SERVICES: ServiceTemplate[] = [
  {
    name: "Consultație inițială",
    description:
      "Prima întâlnire pentru evaluarea nevoilor și stabilirea planului de tratament",
    duration: 60,
    price: 150,
    category: "Consultare",
  },
  {
    name: "Ședință de terapie individuală",
    description:
      "Sesiune de terapie individuală pentru abordarea problemelor specifice",
    duration: 50,
    price: 200,
    category: "Terapie",
  },
  {
    name: "Evaluare psihologică",
    description:
      "Evaluare completă pentru diagnosticarea și planificarea intervențiilor",
    duration: 90,
    price: 250,
    category: "Evaluare",
  },
  {
    name: "Terapie de cuplu",
    description: "Sesiune de terapie pentru cupluri cu probleme de relație",
    duration: 75,
    price: 300,
    category: "Terapie",
  },
  {
    name: "Coaching de dezvoltare personală",
    description:
      "Sesiune de coaching pentru dezvoltarea competențelor și atingerea obiectivelor",
    duration: 60,
    price: 180,
    category: "Coaching",
  },
  {
    name: "Workshop grup",
    description: "Atelier tematic pentru grup (5-10 participanți)",
    duration: 120,
    price: 80,
    category: "Workshop",
  },
];

const EnhancedSpecialistServices: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<SpecialistService[]>([]);
  const [filteredServices, setFilteredServices] = useState<SpecialistService[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [specialistProfile, setSpecialistProfile] =
    useState<SpecialistProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [newService, setNewService] = useState<
    Omit<SpecialistService, "id" | "specialistId">
  >({
    name: "",
    description: "",
    duration: 60,
    price: 150,
    isActive: true,
    category: "",
  });

  const [editingService, setEditingService] =
    useState<SpecialistService | null>(null);

  // Load services and profile
  useEffect(() => {
    const fetchServicesAndProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        await Promise.all([fetchSpecialistProfile(), fetchServices()]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage(
          "Nu s-au putut încărca datele. Vă rugăm încercați din nou."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchServicesAndProfile();
    }
  }, [user]);

  // Filter services based on search and filters
  useEffect(() => {
    let filtered = [...services];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower) ||
          service.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (service) => service.category === categoryFilter
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((service) => service.isActive === isActive);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, categoryFilter, statusFilter]);

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
      }
    } catch (error) {
      console.error("Error fetching specialist profile:", error);
    }
  };

  const fetchServices = async () => {
    if (!user) return;

    try {
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
    } catch (error) {
      console.error("Error fetching services:", error);
      setErrorMessage("Nu s-au putut încărca serviciile.");
    }
  };

  const handleAddService = async () => {
    if (!user) return;

    // Validation
    if (!newService.name.trim()) {
      setErrorMessage("Numele serviciului este obligatoriu.");
      return;
    }
    if (!newService.description.trim()) {
      setErrorMessage("Descrierea serviciului este obligatorie.");
      return;
    }
    if (newService.duration <= 0) {
      setErrorMessage("Durata trebuie să fie mai mare decât 0.");
      return;
    }
    if (newService.price <= 0) {
      setErrorMessage("Prețul trebuie să fie mai mare decât 0.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const serviceData = {
        ...newService,
        specialistId: user.uid,
        category:
          newService.category || specialistProfile?.specialization || "General",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(firestore, "specialistServices"),
        serviceData
      );

      const newServiceWithId: SpecialistService = {
        ...serviceData,
        id: docRef.id,
        createdAt: new Date(),
      };

      setServices((prev) => [...prev, newServiceWithId]);

      // Reset form
      setNewService({
        name: "",
        description: "",
        duration: 60,
        price: 150,
        isActive: true,
        category: "",
      });

      setSuccessMessage("Serviciul a fost adăugat cu succes!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding service:", error);
      setErrorMessage("Eroare la adăugarea serviciului. Încercați din nou.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateService = async () => {
    if (!editingService || !editingService.id) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const updateData = {
        ...editingService,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(
        doc(firestore, "specialistServices", editingService.id),
        updateData
      );

      setServices((prev) =>
        prev.map((service) =>
          service.id === editingService.id
            ? { ...editingService, updatedAt: new Date() }
            : service
        )
      );

      setEditingService(null);
      setEditingId(null);
      setSuccessMessage("Serviciul a fost actualizat cu succes!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating service:", error);
      setErrorMessage("Eroare la actualizarea serviciului.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (
      !window.confirm("Sunteți sigur că doriți să ștergeți acest serviciu?")
    ) {
      return;
    }

    try {
      setSaving(true);
      await deleteDoc(doc(firestore, "specialistServices", serviceId));
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
      setSuccessMessage("Serviciul a fost șters cu succes!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting service:", error);
      setErrorMessage("Eroare la ștergerea serviciului.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (
    serviceId: string,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(firestore, "specialistServices", serviceId), {
        isActive: newStatus,
        updatedAt: serverTimestamp(),
      });

      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId
            ? { ...service, isActive: newStatus }
            : service
        )
      );

      setSuccessMessage(
        `Serviciul a fost ${newStatus ? "activat" : "dezactivat"} cu succes!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error toggling service status:", error);
      setErrorMessage("Eroare la schimbarea statusului serviciului.");
    }
  };

  const handleUseTemplate = (template: ServiceTemplate) => {
    setNewService({
      name: template.name,
      description: template.description,
      duration: template.duration,
      price: template.price,
      isActive: true,
      category: template.category,
    });
    setShowTemplates(false);
  };

  const categories = [
    ...new Set([
      "Consultare",
      "Terapie",
      "Evaluare",
      "Coaching",
      "Workshop",
      "General",
      ...services.map((s) => s.category).filter(Boolean),
    ]),
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaList className="mr-3 text-blue-600" />
            Gestionează Serviciile Tale
          </h2>
          <p className="text-gray-600 mt-2">
            Adaugă, editează și gestionează serviciile pe care le oferi
            clienților.
          </p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Caută servicii..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filtrează după categorie"
              aria-label="Selectează categoria pentru filtrare"
            >
              <option value="all">Toate categoriile</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filtrează după status"
              aria-label="Selectează statusul pentru filtrare"
            >
              <option value="all">Toate statusurile</option>
              <option value="active">Doar active</option>
              <option value="inactive">Doar inactive</option>
            </select>

            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Șabloane
            </button>
          </div>
        </div>

        {/* Service Templates */}
        {showTemplates && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">
              Șabloane de servicii populare
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POPULAR_SERVICES.map((template, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-500">
                      {template.duration} min • {template.price} RON
                    </span>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Folosește
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Service Form */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Adaugă serviciu nou</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume serviciu *
              </label>
              <input
                type="text"
                value={newService.name}
                onChange={(e) =>
                  setNewService((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Consultație psihologică"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie
              </label>
              <select
                value={newService.category}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Selectează categoria serviciului"
                aria-label="Categoria serviciului"
              >
                <option value="">Selectează categoria</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durată (minute) *
              </label>
              <input
                type="number"
                min="15"
                max="300"
                value={newService.duration}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Introduceți durata serviciului în minute"
                placeholder="ex: 60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preț (RON) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newService.price}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Introduceți prețul serviciului în RON"
                placeholder="ex: 150.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descriere *
              </label>
              <textarea
                rows={3}
                value={newService.description}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrie serviciul oferit..."
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleAddService}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaPlus className="mr-2" />
              )}
              Adaugă serviciu
            </button>
          </div>
        </div>

        {/* Services List */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Serviciile tale ({filteredServices.length})
          </h3>

          {filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <FaList className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">
                {services.length === 0
                  ? "Nu aveți încă servicii adăugate. Adăugați primul serviciu de mai sus."
                  : "Nu s-au găsit servicii care să corespundă filtrelor aplicate."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg ${
                    service.isActive
                      ? "border-gray-200"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {editingId === service.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingService?.name || ""}
                          onChange={(e) =>
                            setEditingService((prev) =>
                              prev ? { ...prev, name: e.target.value } : null
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Numele serviciului"
                          placeholder="Numele serviciului"
                        />
                        <select
                          value={editingService?.category || ""}
                          onChange={(e) =>
                            setEditingService((prev) =>
                              prev
                                ? { ...prev, category: e.target.value }
                                : null
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Categoria serviciului"
                          aria-label="Selectează categoria"
                        >
                          <option value="">Selectează categoria</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="15"
                          max="300"
                          value={editingService?.duration || 0}
                          onChange={(e) =>
                            setEditingService((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    duration: parseInt(e.target.value) || 0,
                                  }
                                : null
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Durata în minute"
                          placeholder="Durata în minute"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingService?.price || 0}
                          onChange={(e) =>
                            setEditingService((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    price: parseFloat(e.target.value) || 0,
                                  }
                                : null
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Prețul în RON"
                          placeholder="Prețul în RON"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={editingService?.description || ""}
                        onChange={(e) =>
                          setEditingService((prev) =>
                            prev
                              ? { ...prev, description: e.target.value }
                              : null
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Descrierea serviciului"
                        placeholder="Descrierea serviciului"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingService(null);
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
                        >
                          <FaTimes className="mr-1" />
                          Anulează
                        </button>
                        <button
                          onClick={handleUpdateService}
                          disabled={saving}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                          <FaSave className="mr-1" />
                          Salvează
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4
                            className={`text-lg font-semibold ${!service.isActive ? "text-gray-500" : ""}`}
                          >
                            {service.name}
                          </h4>
                          {service.category && (
                            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                              {service.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingId(service.id || "");
                              setEditingService(service);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Editează serviciul"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleActive(
                                service.id || "",
                                service.isActive
                              )
                            }
                            className={`p-2 rounded ${
                              service.isActive
                                ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                                : "text-green-600 hover:text-green-800 hover:bg-green-50"
                            }`}
                            title={
                              service.isActive
                                ? "Dezactivează serviciul"
                                : "Activează serviciul"
                            }
                          >
                            {service.isActive ? <FaTimes /> : <FaPlus />}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteService(service.id || "")
                            }
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Șterge serviciul"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      <p
                        className={`text-gray-600 mb-3 ${!service.isActive ? "text-gray-400" : ""}`}
                      >
                        {service.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <FaClock className="mr-1" />
                          {service.duration} minute
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaMoneyBillWave className="mr-1" />
                          {service.price} RON
                        </div>
                        <div
                          className={`flex items-center ${
                            service.isActive
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {service.isActive ? "● Activ" : "● Inactiv"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSpecialistServices;
