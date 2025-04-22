import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isAdminByEmail } from "../firebase";
import logger from "../utils/logger";

// Create component-specific logger
const adminLogger = logger.createLogger("AdminRouteWrapper");

interface AdminRouteWrapperProps {
  element: React.ReactNode;
}

const AdminRouteWrapper: React.FC<AdminRouteWrapperProps> = ({ element }) => {
  const { user, loading, isAdmin } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  useEffect(() => {
    // Force redirect to dashboard for authenticated users
    if (user && !loading && !isChecking) {
      adminLogger.debug("User authenticated, redirecting to dashboard");
      
      if (isAdmin || (user.email && isAdminByEmail(user.email))) {
        adminLogger.debug("Admin user detected, redirecting to admin dashboard");
        navigate("/admin/dashboard", { replace: true });
      } else {
        adminLogger.debug("Regular user detected, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, isChecking, isAdmin, navigate]);

  // Show loading indicator while auth is being determined
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Verificare permisiuni admin...</span>
      </div>
    );
  }

  // Debug logs
  adminLogger.debug("AdminRouteWrapper - user:", user?.email);
  adminLogger.debug("AdminRouteWrapper - isAdmin from context:", isAdmin);
  
  // Use multiple methods to check admin status for reliability
  const hasAdminRights = 
    isAdmin === true || // From context
    (user && user.isAdmin === true) || // Ensure isAdmin is part of User type
    (user && user.email && isAdminByEmail(user.email)); // From email list
  
  adminLogger.debug("AdminRouteWrapper - hasAdminRights:", hasAdminRights);
  
  // If user is not logged in or not an admin, redirect to unauthorized
  if (!user || !hasAdminRights) {
    adminLogger.info("User not admin, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  // Return the React element
  return <>{element}</>;
};

export default AdminRouteWrapper;