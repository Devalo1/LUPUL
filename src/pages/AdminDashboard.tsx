import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, FaUserMd, FaCalendarAlt, 
  FaExchangeAlt
} from "react-icons/fa";
import SpecializationRequestsPanel from "../components/admin/SpecializationRequestsPanel";
import SpecialistManagement from "../components/admin/SpecialistManagement";
import UserManagement from "../components/admin/UserManagement";
import { countPendingRequests } from "../utils/roleUtils";

const AdminDashboard: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<string>("dashboard");
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  
  useEffect(() => {
    // Fetch pending specialization requests count
    const fetchPendingRequests = async () => {
      try {
        const count = await countPendingRequests();
        setPendingRequests(count);
      } catch (error) {
        console.error("Error fetching pending requests count:", error);
      }
    };
    
    fetchPendingRequests();
  }, []);
  
  // Check if user is admin - allow access for test email too
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
  
  // Quick actions cards data
  const quickActions = [
    { 
      id: "users", 
      title: "Manage Users", 
      icon: <FaUsers className="text-blue-500 text-2xl" />,
      onClick: () => setActivePanel("users")
    },
    { 
      id: "specialists", 
      title: "Manage Specialists", 
      icon: <FaUserMd className="text-green-500 text-2xl" />,
      onClick: () => setActivePanel("specialists")
    },
    { 
      id: "specializations", 
      title: "Specialization Requests", 
      icon: <FaExchangeAlt className="text-yellow-500 text-2xl" />,
      count: pendingRequests,
      onClick: () => setActivePanel("specializations")
    },
    { 
      id: "appointments", 
      title: "Appointments", 
      icon: <FaCalendarAlt className="text-purple-500 text-2xl" />,
      onClick: () => setActivePanel("appointments")
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-100">
      
      <div className="container mx-auto px-4 py-8">
        {activePanel === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickActions.map(action => (
                <div 
                  key={action.id}
                  onClick={action.onClick}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-full bg-gray-50">{action.icon}</div>
                    {action.count !== undefined && action.count > 0 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-500 text-white">
                        {action.count}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{action.title}</h3>
                </div>
              ))}
            </div>
            
            {/* Other dashboard content */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">System Overview</h2>
              <p className="text-gray-600">
                Welcome to the admin dashboard. Use the cards above or the navigation menu to manage the system.
              </p>
            </div>
          </div>
        )}
        
        {activePanel === "specializations" && <SpecializationRequestsPanel />}
        {activePanel === "specialists" && <SpecialistManagement />}
        {activePanel === "users" && <UserManagement />}
        
        {activePanel === "appointments" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Appointment Management</h2>
            <p className="text-gray-600">The appointment management interface will be available soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
