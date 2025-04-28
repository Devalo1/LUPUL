import React from "react";
import AdminRoute from "./routes/AdminRoute";

interface AdminRouteWrapperProps {
  children: React.ReactElement;
}

/**
 * @deprecated Use components/routes/AdminRoute.tsx instead
 * This is a wrapper component that redirects to the main AdminRoute implementation
 * in components/routes/AdminRoute.tsx for better code organization and to avoid duplication.
 */
const AdminRouteWrapper: React.FC<AdminRouteWrapperProps> = ({ children }) => {
  // Simply pass through to the main AdminRoute implementation
  return <AdminRoute>{children}</AdminRoute>;
};

export default AdminRouteWrapper;