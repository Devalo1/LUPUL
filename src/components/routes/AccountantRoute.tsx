import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isUserAccountant, isUserAdmin } from "../../utils/userRoles";

// Loading component
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-gray-600">{message}</p>
  </div>
);

interface AccountantRouteProps {
  children: React.ReactNode;
}

/**
 * Component for protecting routes that require accountant or admin privileges
 * Accountants can access accounting features, and admins can access everything
 */
const AccountantRoute: React.FC<AccountantRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAccountant, setIsAccountant] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  // Check user roles when user changes
  useEffect(() => {
    const checkUserRoles = async () => {
      if (user?.email) {
        setCheckingRole(true);
        try {
          const [accountantCheck, adminCheck] = await Promise.all([
            isUserAccountant(user.email),
            isUserAdmin(user.email),
          ]);

          setIsAccountant(accountantCheck);
          setIsAdmin(adminCheck);
        } catch (error) {
          console.error("Error checking user roles:", error);
          setIsAccountant(false);
          setIsAdmin(false);
        } finally {
          setCheckingRole(false);
        }
      } else {
        setIsAccountant(false);
        setIsAdmin(false);
        setCheckingRole(false);
      }
    };

    checkUserRoles();
  }, [user]);

  // Show loading while checking authentication or roles
  if (loading || checkingRole) {
    return <LoadingFallback message="Verificare acces..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required privileges (accountant or admin)
  if (!isAccountant && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">
              Acces restricționat
            </h2>
            <p className="mt-2 mb-4">
              Nu aveți permisiunile necesare pentru a accesa panoul de
              contabilitate.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Înapoi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccountantRoute;
