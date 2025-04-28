import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import SpecializationRequestsPanel from "../components/admin/SpecializationRequestsPanel";

const AdminSpecializations: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = userRole === "ADMIN" || user?.email === "dani_popa21@yahoo.ro";
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acces interzis</h1>
          <p className="text-gray-700 mb-6">
            Nu aveți permisiunea de a accesa pagina de administrare.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Înapoi la panou
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Cereri de Specializare</h1>
            <p className="text-gray-600 mt-1">
              Gestionați cererile de schimbare a specializării pentru specialiști
            </p>
          </div>
          
          <div className="p-6">
            <SpecializationRequestsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSpecializations;
