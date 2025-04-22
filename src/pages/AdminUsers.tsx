import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  orderBy,
  Timestamp,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase";

interface User {
  id: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  createdAt: any; // Timestamp
  role?: string;
  isAdmin?: boolean;
  lastLogin?: any; // Timestamp
  orders?: number;
  appointments?: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'admin', 'regular'
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
      
      // Obține toți utilizatorii
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const usersSnapshot = await getDocs(usersQuery);
      
      // Obține toate comenzile pentru a calcula numărul de comenzi per utilizator
      const ordersQuery = query(collection(db, "orders"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersByUser: { [key: string]: number } = {};
      
      ordersSnapshot.docs.forEach(orderDoc => {
        const userId = orderDoc.data().userId;
        if (userId) {
          ordersByUser[userId] = (ordersByUser[userId] || 0) + 1;
        }
      });
      
      // Obține toate programările pentru a calcula numărul de programări per utilizator
      const appointmentsQuery = query(collection(db, "appointments"));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsByUser: { [key: string]: number } = {};
      
      appointmentsSnapshot.docs.forEach(appointmentDoc => {
        const userId = appointmentDoc.data().userId;
        if (userId) {
          appointmentsByUser[userId] = (appointmentsByUser[userId] || 0) + 1;
        }
      });
      
      // Obține rolurile din colecția separată dacă există
      const rolesQuery = query(collection(db, "roles"));
      const rolesSnapshot = await getDocs(rolesQuery);
      const rolesMap: { [key: string]: string } = {};
      
      rolesSnapshot.docs.forEach(roleDoc => {
        rolesMap[roleDoc.id] = roleDoc.data().role || "";
      });

      // Procesează datele utilizatorilor
      const usersList = await Promise.all(usersSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        
        // Verifică dacă utilizatorul este admin
        let isAdmin = false;
        try {
          const adminDoc = await getDoc(doc(db, "admin", userDoc.id));
          isAdmin = adminDoc.exists();
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
        
        return {
          id: userDoc.id,
          email: userData.email || "",
          displayName: userData.displayName || "",
          phoneNumber: userData.phoneNumber || "",
          createdAt: userData.createdAt || null,
          lastLogin: userData.lastLoginAt || null,
          role: rolesMap[userDoc.id] || (isAdmin ? "admin" : "user"),
          isAdmin,
          orders: ordersByUser[userDoc.id] || 0,
          appointments: appointmentsByUser[userDoc.id] || 0
        };
      }));
      
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
      // Adaugă utilizatorul în colecția admin
      await setDoc(doc(db, "admin", userId), {
        role: "admin",
        addedAt: Timestamp.now()
      });
      
      // Actualizează lista locală
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: true, role: "admin" } : user
      ));
      
      alert("Utilizatorul a fost promovat la rolul de Admin.");
    } catch (error) {
      console.error("Error making user admin:", error);
      alert("Eroare la adăugarea utilizatorului ca admin. Vă rugăm încercați din nou.");
    }
  };
  
  const removeAdmin = async (userId: string) => {
    try {
      // Șterge utilizatorul din colecția admin
      await setDoc(doc(db, "admin", userId), {});
      
      // Actualizează lista locală
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: false, role: "user" } : user
      ));
      
      alert("Rolul de admin a fost revocat pentru acest utilizator.");
    } catch (error) {
      console.error("Error removing admin status:", error);
      alert("Eroare la revocarea rolului de admin. Vă rugăm încercați din nou.");
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
    .filter(user => {
      // Filtrare după text de căutare
      const matchesSearch = 
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      // Filtrare după rol
      switch (filter) {
        case "admin":
          return matchesSearch && user.isAdmin;
        case "regular":
          return matchesSearch && !user.isAdmin;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      // Sortare
      let compareValue = 0;
      
      switch (sortBy) {
        case "email":
          compareValue = a.email.localeCompare(b.email);
          break;
        case "name":
          compareValue = (a.displayName || "").localeCompare(b.displayName || "");
          break;
        case "createdAt":
          compareValue = a.createdAt && b.createdAt 
            ? a.createdAt.seconds - b.createdAt.seconds 
            : 0;
          break;
        case "lastLogin":
          compareValue = a.lastLogin && b.lastLogin 
            ? a.lastLogin.seconds - b.lastLogin.seconds 
            : 0;
          break;
        case "orders":
          compareValue = (a.orders || 0) - (b.orders || 0);
          break;
        case "appointments":
          compareValue = (a.appointments || 0) - (b.appointments || 0);
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  // Formatarea datelor pentru afișare
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Necunoscut";
    try {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "Data invalidă";
    }
  };

  // Statistici pentru dashboard
  const getAdminCount = () => users.filter(user => user.isAdmin).length;
  const getRegularCount = () => users.filter(user => !user.isAdmin).length;
  const getActiveCount = () => users.filter(user => user.lastLogin && Date.now() - (user.lastLogin.seconds * 1000) < 30 * 24 * 60 * 60 * 1000).length;

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Gestionare Utilizatori</h2>
        
        {/* Dashboard sumar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-blue-600 font-medium">Total utilizatori</span>
            <span className="text-2xl font-bold">{users.length}</span>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-green-600 font-medium">Activi (ultima lună)</span>
            <span className="text-2xl font-bold">{getActiveCount()}</span>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-purple-600 font-medium">Administratori</span>
            <span className="text-2xl font-bold">{getAdminCount()}</span>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-yellow-600 font-medium">Utilizatori regulari</span>
            <span className="text-2xl font-bold">{getRegularCount()}</span>
          </div>
        </div>
        
        {/* Filtre și sortare */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Caută utilizator</label>
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
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">Filtru</label>
            <select
              id="filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Toți utilizatorii</option>
              <option value="admin">Doar administratori</option>
              <option value="regular">Doar utilizatori regulari</option>
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sortează după</label>
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
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Ordine</label>
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
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
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
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phoneNumber && (
                            <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                          )}
                          <div className="text-xs text-gray-400">ID: {user.id}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(user.lastLogin)}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                          {user.isAdmin ? "Administrator" : "Utilizator"}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-800">{user.orders}</span> comenzi / 
                          <span className="font-medium text-gray-800"> {user.appointments}</span> programări
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleOpenModal(user)}
                        >
                          Detalii
                        </button>
                        {!user.isAdmin ? (
                          <button 
                            className="text-purple-600 hover:text-purple-900"
                            onClick={() => makeAdmin(user.id)}
                          >
                            Adaugă ca Admin
                          </button>
                        ) : (
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              if(confirm("Sunteți sigur că doriți să revocați rolul de administrator pentru acest utilizator?")) {
                                removeAdmin(user.id);
                              }
                            }}
                          >
                            Revocă Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                      Nu s-au găsit utilizatori care să corespundă criteriilor selectate.
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
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                <h4 className="text-lg font-medium">{selectedUser.displayName || "Utilizator necunoscut"}</h4>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <div className={`inline-block mt-1 px-2 py-1 text-xs leading-5 font-semibold rounded-full ${selectedUser.isAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                  {selectedUser.isAdmin ? "Administrator" : "Utilizator"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID Utilizator</p>
                  <p className="mt-1 text-sm text-gray-800 break-all">{selectedUser.id}</p>
                </div>
                
                {selectedUser.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefon</p>
                    <p className="mt-1 text-sm text-gray-800">{selectedUser.phoneNumber}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Data înregistrării</p>
                  <p className="mt-1 text-sm text-gray-800">{formatDate(selectedUser.createdAt)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Ultima conectare</p>
                  <p className="mt-1 text-sm text-gray-800">{formatDate(selectedUser.lastLogin)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Comenzi</p>
                  <p className="mt-1 text-sm text-gray-800">{selectedUser.orders || 0}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Programări</p>
                  <p className="mt-1 text-sm text-gray-800">{selectedUser.appointments || 0}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Acțiuni</h5>
                {!selectedUser.isAdmin ? (
                  <button 
                    onClick={() => {
                      makeAdmin(selectedUser.id);
                      handleCloseModal();
                    }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Adaugă ca Administrator
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if(confirm("Sunteți sigur că doriți să revocați rolul de administrator pentru acest utilizator?")) {
                        removeAdmin(selectedUser.id);
                        handleCloseModal();
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Revocă drepturi de Administrator
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;