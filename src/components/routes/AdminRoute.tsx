import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isUserAdmin } from "../../utils/authUtils";

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componentă de protecție a rutelor care necesită rol de administrator
 * Verifică dacă utilizatorul este admin și redirecționează dacă nu
 */
const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  redirectTo = "/dashboard"
}) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        // Verifică direct adresa de email pentru admin principal
        if (user.email === "dani_popa21@yahoo.ro") {
          setIsAdmin(true);
          setChecking(false);
          return;
        }

        // Verifică statutul de admin în baza de date
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Afișăm indicator de încărcare în timpul verificării
  if (loading || checking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirecționăm dacă utilizatorul nu e admin
  if (!user || !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  // Returnăm conținutul protejat dacă utilizatorul e admin
  return <>{children}</>;
};

export default AdminRoute;