import React, { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "../../utils/roleUtils";
import { FaSearch, FaUserCircle, FaEdit, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

// Create interfaces to replace any
interface UserData {
  id: string;
  displayName?: string;
  email?: string;
  role?: string;
  photoURL?: string;
  phoneNumber?: string;
  [key: string]: unknown;
}

// Prefix unused interface with underscore
interface _FilterState {
  searchTerm: string;
  role?: string;
  [key: string]: unknown;
}

interface ExtendedUser extends UserData {
  isActive?: boolean;
}

// Add underscore prefix to unused interface
interface _ActionEvent {
  currentTarget: {
    dataset: {
      action?: string;
      userid?: string;
    };
  };
}

// Replace 'any' with specific type
interface _EventData {
  currentTarget: {
    dataset: {
      action?: string;
      userid?: string;
    };
  };
}

// Add underscore to unused function and parameters 
const _handleAction = (_event: React.MouseEvent<HTMLButtonElement>): void => {
  // Placeholder for action handling logic
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  const roleOptions = [
    { id: "USER", name: "Utilizator Standard" },
    { id: "SPECIALIST", name: "Specialist" },
    { id: "ADMIN", name: "Administrator" }
  ];

  // Load users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Couldn't load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filter users when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      (user.displayName && user.displayName.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.id && user.id.toLowerCase().includes(query))
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleUpdateUserRole = async (userId: string) => {
    if (!selectedRole) {
      toast.warning("Please select a role first");
      return;
    }
    
    setProcessingUser(userId);
    
    try {
      await updateUserRole(userId, selectedRole);
      
      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: selectedRole } : user
        )
      );
      
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: selectedRole } : user
        )
      );
      
      setEditingUserId(null);
      setSelectedRole("");
      
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setProcessingUser(null);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    setProcessingUser(userId);
    
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", userId);
      
      await updateDoc(userRef, {
        isActive: !isActive
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isActive: !isActive } : user
        )
      );
      
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isActive: !isActive } : user
        )
      );
      
      toast.success(`User ${isActive ? "deactivated" : "activated"} successfully`);
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    } finally {
      setProcessingUser(null);
    }
  };

  // Format date for display
  const formatDate = (timestamp: unknown): string => {
    if (!timestamp) return "N/A";
    
    if (timestamp && typeof timestamp === "object" && "toDate" in timestamp && typeof timestamp.toDate === "function") {
      const date = timestamp.toDate();
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    
    try {
      const date = new Date(timestamp as string | number | Date);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestionare Utilizatori</h2>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex-1 flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută după nume, email sau ID..."
            className="px-4 py-2 border border-gray-300 rounded-l flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setSearchQuery("")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
          >
            <FaSearch />
          </button>
        </div>
      </div>
      
      {/* Users list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="animate-spin text-blue-500" size={24} />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <FaUserCircle className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">Nu s-au găsit utilizatori care să corespundă criteriilor de căutare.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilizator
                </th>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-4 py-3 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data înregistrării
                </th>
                <th className="px-4 py-3 border-b text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.photoURL ? (
                        <img src={String(user.photoURL || "")} alt="Avatar" className="h-8 w-8 rounded-full mr-3" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 font-medium">
                            {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{user.displayName || "No name"}</div>
                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email || "No email"}</div>
                    {user.phoneNumber && (
                      <div className="text-xs text-gray-500">{String(user.phoneNumber || "")}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select role</option>
                        {roleOptions.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "ADMIN" 
                          ? "bg-purple-100 text-purple-800" 
                          : user.role === "SPECIALIST"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role || "USER"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (user as ExtendedUser)?.isActive !== false
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {(user as ExtendedUser)?.isActive !== false ? "Activ" : "Inactiv"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {editingUserId === user.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateUserRole(user.id)}
                            disabled={processingUser === user.id}
                            className="text-green-600 hover:text-green-900"
                          >
                            {processingUser === user.id ? 
                              <FaSpinner className="animate-spin" /> : 
                              <FaCheck />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(null);
                              setSelectedRole("");
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingUserId(user.id);
                              setSelectedRole(user.role || "");
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id, (user as ExtendedUser)?.isActive !== false)}
                            disabled={processingUser === user.id}
                            className={`${
                              (user as ExtendedUser)?.isActive !== false
                                ? "text-red-600 hover:text-red-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                          >
                            {processingUser === user.id ? 
                              <FaSpinner className="animate-spin" /> : 
                              (user as ExtendedUser)?.isActive !== false ? <FaTimes /> : <FaCheck />}
                          </button>
                        </>
                      )}
                    </div>
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

export default UserManagement;
