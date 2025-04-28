import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../contexts/AuthProvider";
import { canAccessAdminFeatures } from "../utils/roleUtils";

const AdminPanel: React.FC = () => {
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;
  const isLoading = authContext?.loading || false;
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const adminStatus = await canAccessAdminFeatures(currentUser);
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdminUser(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // Show loading state while authentication is being checked
  if (isLoading || isCheckingAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if user is not admin
  if (!isAdminUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto">
          {/* AdminNavigation removed from here - it's already included in the main Layout */}
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPanel;
