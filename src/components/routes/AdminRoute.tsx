import React, { useEffect } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isUserAdmin, MAIN_ADMIN_EMAIL } from "../../utils/userRoles";

// Loading component that was missing
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-gray-600">{message}</p>
  </div>
);

interface AdminRouteProps {
  children: React.ReactNode;
  _redirectPath?: string;
}

/**
 * Componentă pentru protejarea rutelor care necesită drepturi de administrator
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children 
}) => {
  const { user, isAdmin: contextIsAdmin, loading } = useAuth();
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = React.useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = React.useState<boolean>(true);

  // Effect to check admin status directly
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdminUser(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        // Special case for main admin email
        if (user.email === MAIN_ADMIN_EMAIL) {
          console.log("Main admin detected:", user.email);
          setIsAdminUser(true);
          setCheckingAdmin(false);
          return;
        }

        // Check admin status through the utility function
        const adminStatus = await isUserAdmin(user.email || "");
        console.log("User admin status:", adminStatus);
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        
        // Fallback to context's isAdmin value
        setIsAdminUser(contextIsAdmin);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading, contextIsAdmin]);

  // Afișăm un indicator de încărcare în timp ce se verifică autentificarea și drepturile de admin
  if (loading || checkingAdmin) {
    return <LoadingFallback message="Se verifică drepturile de administrator..." />;
  }

  // Verificăm dacă utilizatorul este autentificat
  if (!user) {
    // Salvăm calea curentă pentru a reveni după autentificare
    sessionStorage.setItem("afterLoginRedirect", location.pathname);
    
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace
      />
    );
  }

  // Use either the local checked admin status or fallback to context's isAdmin
  const hasAdminAccess = isAdminUser === true || contextIsAdmin === true;

  // Verificăm dacă utilizatorul are drepturi de administrator
  if (!hasAdminAccess) {
    console.warn("Acces restricționat: Utilizatorul nu are drepturi de administrator");
    
    // În loc să redirecționăm, afișăm un mesaj de acces restricționat
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-600 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Acces restricționat</h1>
          <p className="text-center text-gray-600 mb-6">
            Doar administratorii pot accesa această secțiune. Nu aveți permisiunile necesare.
          </p>
          {user.email && (
            <p className="text-center text-gray-500 mb-4">
              Email: {user.email}
            </p>
          )}
          <div className="flex justify-center">
            <Link
              to="/"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dacă utilizatorul este administrator, permitem accesul la ruta protejată
  return <>{children}</>;
};

export default AdminRoute;