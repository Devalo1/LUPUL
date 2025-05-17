import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts";
import { isUserAccountant } from "../utils/userRoles";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "specialist" | "accountant";
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user, loading, isAdmin, userRole } = useAuth();
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState<boolean>(!!requiredRole);

  useEffect(() => {
    const checkRoleAccess = async () => {
      if (!user || !requiredRole) {
        setHasRequiredRole(true);
        setCheckingRole(false);
        return;
      }

      try {
        let roleCheck = false;

        // Verifică rolul necesar
        switch (requiredRole) {
          case "admin":
            roleCheck = isAdmin === true;
            break;
          case "specialist":
            roleCheck = userRole === "specialist";
            break;
          case "accountant":
            roleCheck = await isUserAccountant(user.uid);
            break;
          default:
            roleCheck = true;
        }

        setHasRequiredRole(roleCheck);
      } catch (error) {
        console.error("Eroare la verificarea rolurilor:", error);
        setHasRequiredRole(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (user && requiredRole) {
      checkRoleAccess();
    } else {
      setHasRequiredRole(true);
      setCheckingRole(false);
    }
  }, [user, isAdmin, userRole, requiredRole]);

  // Afișează un loading spinner în timpul verificării autentificării sau rolului
  if (loading || checkingRole) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirecționează către login dacă nu este autentificat
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirecționează către pagina de acces interzis dacă nu are rolul necesar
  if (requiredRole && hasRequiredRole === false) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Afișează conținutul protejat dacă utilizatorul are acces
  return <>{children}</>;
};

export default PrivateRoute;