import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  makeUserSpecialist,
  removeSpecialistRole,
  makeUserAccountant,
  removeAccountantRole,
  makeUserAdmin,
  removeAdminRole,
  deleteUser,
  UserRole,
} from "../utils/userRoles";

interface User {
  id: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  createdAt: any; // Timestamp
  role?: string;
  isAdmin?: boolean;
  isSpecialist?: boolean;
  isAccountant?: boolean;
  lastLogin?: any; // Timestamp
  orders?: number;
  appointments?: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'admin', 'regular', 'specialist'
  const [sortBy, setSortBy] = useState("lastLogin");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Obține toți utilizatorii din colecția 'users'
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, orderBy("createdAt", "desc"));
      const usersSnapshot = await getDocs(usersQuery);

      // Pregătește un obiect pentru a ține evidența comenzilor pe utilizator
      const ordersByUser: { [key: string]: number } = {};

      // Obține comenzile pentru a număra câte are fiecare utilizator
      const ordersRef = collection(db, "orders");
      const ordersSnapshot = await getDocs(ordersRef);

      ordersSnapshot.docs.forEach((orderDoc) => {
        const userId = orderDoc.data().userId;
        if (userId) {
          ordersByUser[userId] = (ordersByUser[userId] || 0) + 1;
        }
      });

      // Obține programările pentru a număra câte are fiecare utilizator
      const appointmentsByUser: { [key: string]: number } = {};
      const appointmentsRef = collection(db, "appointments");
      const appointmentsSnapshot = await getDocs(appointmentsRef);

      appointmentsSnapshot.docs.forEach((appointmentDoc) => {
        const userId = appointmentDoc.data().userId;
        if (userId) {
          appointmentsByUser[userId] = (appointmentsByUser[userId] || 0) + 1;
        }
      });

      // Obține rolurile din colecția separată dacă există
      const rolesQuery = query(collection(db, "roles"));
      const rolesSnapshot = await getDocs(rolesQuery);
      const rolesMap: { [key: string]: string } = {};

      rolesSnapshot.docs.forEach((roleDoc) => {
        rolesMap[roleDoc.id] = roleDoc.data().role || "";
      });

      // Procesează datele utilizatorilor
      const usersList = await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          const isAccountant =
            userData.isAccountant === true ||
            userData.role === UserRole.ACCOUNTANT;

          // Verifică dacă utilizatorul este admin
          let isAdmin = false;
          try {
            const adminDoc = await getDoc(doc(db, "admins", userDoc.id));
            isAdmin = adminDoc.exists();
          } catch (error) {
            console.error("Error checking admin status:", error);
          }

          // Determină rolul utilizatorului, inclusiv specialist
          const role = userData.role || (isAdmin ? "admin" : "user");
          const isSpecialist = role === "specialist";

          return {
            id: userDoc.id,
            email: userData.email || "",
            displayName: userData.displayName || "",
            phoneNumber: userData.phoneNumber || "",
            createdAt: userData.createdAt || null,
            lastLogin: userData.lastLoginAt || null,
            role: role,
            isAdmin,
            isSpecialist,
            isAccountant,
            orders: ordersByUser[userDoc.id] || 0,
            appointments: appointmentsByUser[userDoc.id] || 0,
          };
        })
      );

      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Eroare la încărcarea utilizatorilor. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async (userId: string) => {
    try {
      // Use the improved function that updates all necessary collections
      const success = await makeUserAdmin(userId);

      if (success) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  isAdmin: true,
                  role: "admin",
                  isSpecialist: false,
                  isAccountant: false,
                }
              : u
          )
        );
        alert("Utilizatorul a fost promovat la rolul de Admin.");
      } else {
        alert(
          "Eroare la adăugarea utilizatorului ca admin. Vă rugăm încercați din nou."
        );
      }
    } catch (error) {
      console.error("Error making user admin:", error);
      alert(
        "Eroare la adăugarea utilizatorului ca admin. Vă rugăm încercați din nou."
      );
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      // Use the improved function that updates all necessary collections
      const success = await removeAdminRole(userId);

      if (success) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === userId ? { ...u, isAdmin: false, role: "user" } : u
          )
        );
        alert("Rolul de admin a fost revocat pentru acest utilizator.");
      } else {
        alert(
          "Eroare la revocarea rolului de admin. Vă rugăm încercați din nou."
        );
      }
    } catch (error) {
      console.error("Error removing admin status:", error);
      alert(
        "Eroare la revocarea rolului de admin. Vă rugăm încercați din nou."
      );
    }
  };

  // Funcții pentru rol de specialist
  const makeSpecialist = async (userId: string) => {
    try {
      // Adaugă utilizatorul ca specialist
      await makeUserSpecialist(userId);

      // Actualizează lista locală
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId
            ? {
                ...u,
                isSpecialist: true,
                role: "specialist",
                isAdmin: false,
                isAccountant: false,
              }
            : u
        )
      );

      alert("Utilizatorul a fost setat ca Specialist.");
    } catch (error) {
      console.error("Error making user specialist:", error);
      alert(
        "Eroare la adăugarea utilizatorului ca specialist. Vă rugăm încercați din nou."
      );
    }
  };

  const removeSpecialist = async (userId: string) => {
    try {
      // Revocă rolul de specialist
      await removeSpecialistRole(userId);

      // Actualizează lista locală
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId
            ? {
                ...u,
                isSpecialist: false,
                role: "user",
                isAccountant: u.isAccountant,
              }
            : u
        )
      );

      alert("Rolul de specialist a fost revocat pentru acest utilizator.");
    } catch (error) {
      console.error("Error removing specialist status:", error);
      alert(
        "Eroare la revocarea rolului de specialist. Vă rugăm încercați din nou."
      );
    }
  };

  // Funcții pentru rol de contabil
  const makeAccountant = async (userId: string) => {
    try {
      await makeUserAccountant(userId);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId
            ? {
                ...u,
                isAccountant: true,
                role: UserRole.ACCOUNTANT,
                isAdmin: false,
                isSpecialist: false,
              }
            : u
        )
      );
      alert("Utilizatorul a fost setat ca Contabil.");
    } catch (error) {
      console.error("Error making user accountant:", error);
      alert(
        "Eroare la adăugarea utilizatorului ca contabil. Vă rugăm încercați din nou."
      );
    }
  };
  const removeAccountant = async (userId: string) => {
    try {
      await removeAccountantRole(userId);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId
            ? { ...u, isAccountant: false, role: UserRole.USER }
            : u
        )
      );
      alert("Rolul de contabil a fost revocat pentru acest utilizator.");
    } catch (error) {
      console.error("Error removing accountant status:", error);
      alert(
        "Eroare la revocarea rolului de contabil. Vă rugăm încercați din nou."
      );
    }
  };

  // Funcția pentru ștergerea utilizatorului
  const handleDeleteUser = async (userId: string) => {
    try {
      const success = await deleteUser(userId);

      if (success) {
        // Remove user from local state
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
        alert("Utilizatorul a fost șters cu succes.");
      } else {
        alert(
          "Eroare la ștergerea utilizatorului. Vă rugăm încercați din nou."
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Eroare la ștergerea utilizatorului. Vă rugăm încercați din nou.");
    }
  };

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Aplicăm filtrele și sortarea
  const filteredUsers = users
    .filter((user) => {
      // Filtrare după text de căutare
      const matchesSearch =
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false ||
        user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;

      // Filtrare după rol
      switch (filter) {
        case "admin":
          return matchesSearch && user.isAdmin;
        case "regular":
          return (
            matchesSearch &&
            !user.isAdmin &&
            !user.isSpecialist &&
            !user.isAccountant
          );
        case "specialist":
          return matchesSearch && user.isSpecialist;
        case "accountant":
          return matchesSearch && user.isAccountant;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      // Implementare simplă pentru sortare
      const aValue = a[sortBy as keyof User];
      const bValue = b[sortBy as keyof User];

      if (aValue === null || aValue === undefined)
        return sortOrder === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined)
        return sortOrder === "asc" ? 1 : -1;

      // Sortare pentru valori de tip Timestamp sau obiecte cu seconds
      if (
        aValue &&
        bValue &&
        typeof aValue === "object" &&
        "seconds" in aValue &&
        typeof bValue === "object" &&
        "seconds" in bValue
      ) {
        return sortOrder === "asc"
          ? (aValue as any).seconds - (bValue as any).seconds
          : (bValue as any).seconds - (aValue as any).seconds;
      }

      // Sortare pentru string-uri
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Sortare pentru numere și alte valori
      return sortOrder === "asc"
        ? (aValue as any) - (bValue as any)
        : (bValue as any) - (aValue as any);
    });

  // Formatare dată pentru afișare
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "Format invalid";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestionare Utilizatori</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Filtre și opțiuni de sortare */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Căutare
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email, nume sau telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtru
            </label>
            <select
              id="filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Toate</option>
              <option value="admin">Admin</option>
              <option value="regular">Utilizatori</option>
              <option value="specialist">Specialiști</option>
              <option value="accountant">Contabili</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="sortBy"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sortează după
            </label>
            <select
              id="sortBy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="email">Email</option>
              <option value="name">Nume</option>
              <option value="lastLogin">Ultima conectare</option>
              <option value="createdAt">Data înregistrării</option>
              <option value="orders">Comenzi</option>
              <option value="appointments">Programări</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="sortOrder"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ordine
            </label>
            <select
              id="sortOrder"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Crescător</option>
              <option value="desc">Descrescător</option>
            </select>
          </div>
        </div>

        {/* Tabel utilizatori */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Utilizator
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Dată înregistrare
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Ultima conectare
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Rol
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Comenzi / Programări
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || "Utilizator necunoscut"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.phoneNumber && (
                            <div className="text-sm text-gray-500">
                              {user.phoneNumber}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            ID: {user.id}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(user.lastLogin)}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isAdmin
                              ? "bg-purple-100 text-purple-800"
                              : user.isSpecialist
                                ? "bg-green-100 text-green-800"
                                : user.isAccountant
                                  ? "bg-teal-100 text-teal-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.isAdmin
                            ? "Administrator"
                            : user.isSpecialist
                              ? "Specialist"
                              : user.isAccountant
                                ? "Contabil"
                                : "Utilizator"}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-800">
                            {user.orders}
                          </span>{" "}
                          comenzi /
                          <span className="font-medium text-gray-800">
                            {" "}
                            {user.appointments}
                          </span>{" "}
                          programări{" "}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <button
                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                            onClick={() => handleOpenModal(user)}
                          >
                            Detalii
                          </button>

                          {/* Buton pentru ștergerea utilizatorului */}
                          <button
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
                            onClick={() => {
                              if (
                                confirm(
                                  `Sunteți sigur că doriți să ștergeți utilizatorul ${user.displayName || user.email}? Această acțiune nu poate fi anulată.`
                                )
                              ) {
                                handleDeleteUser(user.id);
                              }
                            }}
                          >
                            🗑️ Șterge
                          </button>
                          {!user.isAdmin &&
                          !user.isSpecialist &&
                          !user.isAccountant ? (
                            <div className="space-y-3">
                              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                  Adaugă Roluri
                                </h4>
                                <div className="space-y-3">
                                  <button
                                    className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-purple-400 text-sm font-semibold rounded-lg text-purple-800 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 hover:border-purple-500 focus:outline-none focus:ring-3 focus:ring-purple-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    onClick={() => makeAdmin(user.id)}
                                  >
                                    👑 Adaugă ca Administrator
                                  </button>
                                  <button
                                    className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-green-400 text-sm font-semibold rounded-lg text-green-800 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 hover:border-green-500 focus:outline-none focus:ring-3 focus:ring-green-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    onClick={() => makeSpecialist(user.id)}
                                  >
                                    🩺 Adaugă ca Specialist
                                  </button>
                                  <button
                                    className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-teal-400 text-sm font-semibold rounded-lg text-teal-800 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 hover:border-teal-500 focus:outline-none focus:ring-3 focus:ring-teal-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    onClick={() => makeAccountant(user.id)}
                                  >
                                    💼 Adaugă ca Contabil
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : user.isAdmin ? (
                            <div className="border-2 border-red-300 rounded-lg p-4 bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
                              <h4 className="text-sm font-bold text-red-700 mb-3 uppercase tracking-wide flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                Rol Actual
                              </h4>
                              <div className="bg-white p-3 rounded-lg border border-red-200 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                  👑 Administrator
                                </span>
                              </div>
                              <button
                                className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-red-400 text-sm font-semibold rounded-lg text-red-800 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 hover:border-red-500 focus:outline-none focus:ring-3 focus:ring-red-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Sunteți sigur că doriți să revocați rolul de administrator pentru acest utilizator?"
                                    )
                                  ) {
                                    removeAdmin(user.id);
                                  }
                                }}
                              >
                                ❌ Revocă drepturi de Administrator
                              </button>
                            </div>
                          ) : user.isSpecialist ? (
                            <div className="border-2 border-red-300 rounded-lg p-4 bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
                              <h4 className="text-sm font-bold text-red-700 mb-3 uppercase tracking-wide flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                Rol Actual
                              </h4>
                              <div className="bg-white p-3 rounded-lg border border-red-200 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  🩺 Specialist
                                </span>
                              </div>
                              <button
                                className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-red-400 text-sm font-semibold rounded-lg text-red-800 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 hover:border-red-500 focus:outline-none focus:ring-3 focus:ring-red-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Sunteți sigur că doriți să revocați rolul de specialist pentru acest utilizator?"
                                    )
                                  ) {
                                    removeSpecialist(user.id);
                                  }
                                }}
                              >
                                ❌ Revocă drepturi de Specialist
                              </button>
                            </div>
                          ) : user.isAccountant ? (
                            <div className="border-2 border-red-300 rounded-lg p-4 bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
                              <h4 className="text-sm font-bold text-red-700 mb-3 uppercase tracking-wide flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                Rol Actual
                              </h4>
                              <div className="bg-white p-3 rounded-lg border border-red-200 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                                  💼 Contabil
                                </span>
                              </div>
                              <button
                                className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-red-400 text-sm font-semibold rounded-lg text-red-800 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 hover:border-red-500 focus:outline-none focus:ring-3 focus:ring-red-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Sunteți sigur că doriți să revocați rolul de contabil pentru acest utilizator?"
                                    )
                                  ) {
                                    removeAccountant(user.id);
                                  }
                                }}
                              >
                                ❌ Revocă drepturi de Contabil
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 px-4 text-center text-gray-500"
                    >
                      Nu s-au găsit utilizatori care să corespundă criteriilor
                      selectate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalii utilizator */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Detalii Utilizator</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Închide detaliile utilizatorului"
                title="Închide"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-gray-500">
                    {selectedUser.displayName
                      ? selectedUser.displayName.substring(0, 2).toUpperCase()
                      : selectedUser.email.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <h4 className="text-lg font-medium">
                  {selectedUser.displayName || "Utilizator necunoscut"}
                </h4>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <div
                  className={`inline-block mt-1 px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                    selectedUser.isAdmin
                      ? "bg-purple-100 text-purple-800"
                      : selectedUser.isSpecialist
                        ? "bg-green-100 text-green-800"
                        : selectedUser.isAccountant
                          ? "bg-teal-100 text-teal-800"
                          : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedUser.isAdmin
                    ? "Administrator"
                    : selectedUser.isSpecialist
                      ? "Specialist"
                      : selectedUser.isAccountant
                        ? "Contabil"
                        : "Utilizator"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    ID Utilizator
                  </p>
                  <p className="mt-1 text-sm text-gray-800 break-all">
                    {selectedUser.id}
                  </p>
                </div>

                {selectedUser.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefon</p>
                    <p className="mt-1 text-sm text-gray-800">
                      {selectedUser.phoneNumber}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Data înregistrării
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Ultima conectare
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatDate(selectedUser.lastLogin)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Comenzi</p>
                  <p className="mt-1 text-sm text-gray-800">
                    {selectedUser.orders || 0}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Programări
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {selectedUser.appointments || 0}
                  </p>
                </div>
              </div>{" "}
              <div className="pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-500 mb-3">
                  Gestionare Roluri
                </h5>{" "}
                {!selectedUser.isAdmin &&
                !selectedUser.isSpecialist &&
                !selectedUser.isAccountant ? (
                  <div className="space-y-4">
                    <div className="border-2 border-gray-300 rounded-lg p-5 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
                      <h6 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Adaugă Roluri
                      </h6>
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            makeAdmin(selectedUser.id);
                            handleCloseModal();
                          }}
                          className="w-full inline-flex items-center justify-center px-5 py-3 border-2 border-purple-400 text-sm font-semibold rounded-lg text-purple-800 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 hover:border-purple-500 focus:outline-none focus:ring-3 focus:ring-purple-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          👑 Adaugă ca Administrator
                        </button>
                        <button
                          onClick={() => {
                            makeSpecialist(selectedUser.id);
                            handleCloseModal();
                          }}
                          className="w-full inline-flex items-center justify-center px-5 py-3 border-2 border-green-400 text-sm font-semibold rounded-lg text-green-800 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 hover:border-green-500 focus:outline-none focus:ring-3 focus:ring-green-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          🩺 Adaugă ca Specialist
                        </button>
                        <button
                          onClick={() => {
                            makeAccountant(selectedUser.id);
                            handleCloseModal();
                          }}
                          className="w-full inline-flex items-center justify-center px-5 py-3 border-2 border-teal-400 text-sm font-semibold rounded-lg text-teal-800 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 hover:border-teal-500 focus:outline-none focus:ring-3 focus:ring-teal-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          💼 Adaugă ca Contabil
                        </button>
                      </div>
                    </div>
                  </div>
                ) : selectedUser.isAdmin ? (
                  <div className="border-2 border-red-300 rounded-lg p-5 bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
                    <h6 className="text-sm font-bold text-red-700 mb-4 uppercase tracking-wide flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Rol Actual
                    </h6>
                    <div className="bg-white p-4 rounded-lg border border-red-200 mb-4 shadow-sm">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 shadow-sm">
                        👑 Administrator
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Sunteți sigur că doriți să revocați rolul de administrator pentru acest utilizator?"
                          )
                        ) {
                          removeAdmin(selectedUser.id);
                          handleCloseModal();
                        }
                      }}
                      className="w-full inline-flex items-center justify-center px-5 py-3 border-2 border-red-400 text-sm font-semibold rounded-lg text-red-800 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 hover:border-red-500 focus:outline-none focus:ring-3 focus:ring-red-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      ❌ Revocă drepturi de Administrator
                    </button>
                  </div>
                ) : selectedUser.isSpecialist ? (
                  <div className="border-2 border-red-300 rounded-lg p-5 bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
                    <h6 className="text-sm font-bold text-red-700 mb-4 uppercase tracking-wide flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Rol Actual
                    </h6>
                    <div className="bg-white p-4 rounded-lg border border-red-200 mb-4 shadow-sm">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
                        🩺 Specialist
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Sunteți sigur că doriți să revocați rolul de specialist pentru acest utilizator?"
                          )
                        ) {
                          removeSpecialist(selectedUser.id);
                          handleCloseModal();
                        }
                      }}
                      className="w-full inline-flex items-center justify-center px-5 py-3 border-2 border-red-400 text-sm font-semibold rounded-lg text-red-800 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 hover:border-red-500 focus:outline-none focus:ring-3 focus:ring-red-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      ❌ Revocă drepturi de Specialist
                    </button>
                  </div>
                ) : selectedUser.isAccountant ? (
                  <div className="border-2 border-red-300 rounded-lg p-5 bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
                    <h6 className="text-sm font-bold text-red-700 mb-4 uppercase tracking-wide flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Rol Actual
                    </h6>
                    <div className="bg-white p-4 rounded-lg border border-red-200 mb-4 shadow-sm">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-800 shadow-sm">
                        💼 Contabil
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Sunteți sigur că doriți să revocați rolul de contabil pentru acest utilizator?"
                          )
                        ) {
                          removeAccountant(selectedUser.id);
                          handleCloseModal();
                        }
                      }}
                      className="w-full inline-flex items-center justify-center px-5 py-3 border-2 border-red-400 text-sm font-semibold rounded-lg text-red-800 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 hover:border-red-500 focus:outline-none focus:ring-3 focus:ring-red-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      ❌ Revocă drepturi de Contabil
                    </button>
                  </div>
                ) : null}
              </div>
              {/* Buton pentru ștergerea utilizatorului */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="border-2 border-red-300 rounded-lg p-4 bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
                  <h6 className="text-sm font-bold text-red-700 mb-3 uppercase tracking-wide flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Zona Periculoasă
                  </h6>
                  <p className="text-xs text-red-600 mb-3">
                    Această acțiune va șterge permanent utilizatorul din sistem.
                    Acțiunea nu poate fi anulată.
                  </p>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Sunteți absolut sigur că doriți să ștergeți utilizatorul ${selectedUser.displayName || selectedUser.email}? Această acțiune va șterge permanent toate datele asociate și nu poate fi anulată.`
                        )
                      ) {
                        handleDeleteUser(selectedUser.id);
                        handleCloseModal();
                      }
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-red-500 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 hover:border-red-600 focus:outline-none focus:ring-3 focus:ring-red-300 focus:ring-opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    🗑️ Șterge Utilizatorul Permanent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
