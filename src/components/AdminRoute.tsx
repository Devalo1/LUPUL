import React from "react";
import AdminRoute from "./routes/AdminRoute";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * @deprecated Use components/routes/AdminRoute.tsx instead
 * This is a legacy component being maintained for backward compatibility.
 * It redirects to the main AdminRoute implementation in components/routes/AdminRoute.tsx.
 */
const AdminRouteLegacy: React.FC<AdminRouteProps> = ({ children }) => {
  console.warn("AdminRoute.tsx in components directory is deprecated. Use components/routes/AdminRoute.tsx instead.");
  return <AdminRoute>{children}</AdminRoute>;
};

export default AdminRouteLegacy;
