import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAccountingPermissions } from "../../contexts/AccountingPermissionsContext";
import { FaUserShield, FaUserTie, FaUserCog, FaFilter, FaSync, FaExclamationTriangle } from "react-icons/fa";

interface User {
  id: string;
  email: string;
  displayName?: string;
  roles?: {
    admin?: boolean;
    accountant?: boolean;
    specialist?: boolean;
  };
  // Legacy fields
  isAdmin?: boolean;
  isAccountant?: boolean;
}

const AccountingPermissions: React.FC = () => {
  const { isAdmin, loading: permissionsLoading } = useAccountingPermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!permissionsLoading && isAdmin) {
      fetchUsers();
    }
  }, [permissionsLoading, isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      
      const usersData = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<User, "id">
      }));
      
      // Sortăm utilizatorii după rol (admin, contabil, specialist) și apoi după email
      usersData.sort((a, b) => {
        // Adminii primii
        if ((a.roles?.admin || a.isAdmin) && !(b.roles?.admin || b.isAdmin)) return -1;
        if (!(a.roles?.admin || a.isAdmin) && (b.roles?.admin || b.isAdmin)) return 1;
        
        // Apoi contabilii
        if ((a.roles?.accountant || a.isAccountant) && !(b.roles?.accountant || b.isAccountant)) return -1;
        if (!(a.roles?.accountant || a.isAccountant) && (b.roles?.accountant || b.isAccountant)) return 1;
        
        // Apoi după email
        return (a.email || "").localeCompare(b.email || "");
      });
      
      setUsers(usersData);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Nu s-au putut încărca datele utilizatorilor. Vă rugăm să încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, role: "admin" | "accountant" | "specialist") => {
    try {
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) return;

      const userRef = doc(db, "users", userId);
      
      // Asigurăm că obiectul roles există
      const roles = userToUpdate.roles || {};
      const updatedRoles = { 
        ...roles, 
        [role]: !roles[role] 
      };
      
      // Actualizăm și câmpurile legacy pentru compatibilitate
      const updates: any = {
        roles: updatedRoles,
      };
      
      if (role === "admin") {
        updates.isAdmin = !roles.admin;
      } else if (role === "accountant") {
        updates.isAccountant = !roles.accountant;
      }
      
      // Actualizăm în Firestore
      await updateDoc(userRef, updates);

      // Actualizăm starea locală
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            roles: updatedRoles,
            ...updates
          };
        }
        return user;
      }));

      setSuccessMessage(`Permisiunile utilizatorului ${userToUpdate.email || userToUpdate.displayName || "selectat"} au fost actualizate cu succes!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error updating user role:", error);
      setErrorMessage("Nu s-a putut actualiza rolul utilizatorului. Vă rugăm să încercați din nou.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchTerms = searchQuery.toLowerCase().trim();
    if (!searchTerms) return true;
    
    return (
      (user.email && user.email.toLowerCase().includes(searchTerms)) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchTerms))
    );
  });

  if (permissionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
        <p className="flex items-center">
          <FaExclamationTriangle className="mr-2" /> Nu aveți permisiunea de a accesa această pagină. Doar administratorii pot gestiona permisiunile contabile.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Gestionare Permisiuni Contabilitate</h1>
      
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Caută utilizatori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaFilter className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Se încarcă..." : "Reîmprospătează"}
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{errorMessage}</p>
        </div>
      )}

      {loading && users.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Utilizator</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-center">Admin</th>
                <th className="py-3 px-6 text-center">Contabil</th>
                <th className="py-3 px-6 text-center">Specialist</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">
                      {user.displayName || "(Fără nume)"}
                    </td>
                    <td className="py-3 px-6 text-left">{user.email || "(Fără email)"}</td>
                    <td className="py-3 px-6 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!user.roles?.admin || !!user.isAdmin}
                          onChange={() => toggleRole(user.id, "admin")}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <FaUserShield className={`ml-2 ${!!user.roles?.admin || !!user.isAdmin ? "text-blue-600" : "text-gray-400"}`} />
                      </label>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!user.roles?.accountant || !!user.isAccountant}
                          onChange={() => toggleRole(user.id, "accountant")}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <FaUserTie className={`ml-2 ${!!user.roles?.accountant || !!user.isAccountant ? "text-blue-600" : "text-gray-400"}`} />
                      </label>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!user.roles?.specialist}
                          onChange={() => toggleRole(user.id, "specialist")}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <FaUserCog className={`ml-2 ${!!user.roles?.specialist ? "text-blue-600" : "text-gray-400"}`} />
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 px-6 text-center">
                    Nu s-au găsit utilizatori care să corespundă criteriilor de căutare.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountingPermissions;