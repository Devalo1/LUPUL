import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isUserAdmin, MAIN_ADMIN_EMAIL } from "../utils/userRoles";
import logger from "../utils/logger";

// Create component-specific logger
const adminLogger = logger.createLogger("AdminRoute");

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }
      
      try {
        // First check if the user object already has isAdmin flag
        if (user.isAdmin === true) {
          adminLogger.debug("User has isAdmin flag in user object");
          setIsAdmin(true);
          setCheckingAdmin(false);
          return;
        }

        // Otherwise check with the Firestore function
        const admin = await isUserAdmin(user.email || "");
        adminLogger.info(`Admin status determined: ${admin}`);
        setIsAdmin(admin);
      } catch (error) {
        adminLogger.error("Eroare la verificarea drepturilor de administrator:", error);
        
        // Special case for hardcoded admin email
        if (user.email === MAIN_ADMIN_EMAIL) {
          adminLogger.debug("Using hardcoded admin detection for main admin");
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  // Handle navigation when user is not authenticated
  useEffect(() => {
    if (!loading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/login", { 
        state: { from: location },
        replace: true 
      });
    }
  }, [user, loading, navigate, location]);

  // Display loading indicator while checking admin status
  if (loading || checkingAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Se verifică permisiunile de administrator...</p>
      </div>
    );
  }

  // If user is not authenticated, show loading until redirect happens
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Se redirecționează...</p>
      </div>
    );
  }

  // If the user is not admin, show access denied page
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-600 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Acces restricționat</h1>
          <p className="text-center text-gray-600 mb-6">
            Nu aveți permisiunile necesare pentru a accesa această secțiune.
            Această zonă este disponibilă doar administratorilor.
          </p>
          <p className="text-center text-gray-500 mb-4">
            Email: {user.email}
          </p>
          <div className="flex justify-center">
            <a
              href="/"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Înapoi la pagina principală
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If user is admin, render the protected content
  return <>{children}</>;
};

export default AdminRoute;
