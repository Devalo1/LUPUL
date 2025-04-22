import React from "react";
import { AdminDashboard, AdminUsers, AdminProducts } from "../components/admin/AdminPageComponents";

// Define route types
interface Route {
  path: string;
  element: React.ReactNode;
}

// Admin routes requiring admin privileges
export const adminRoutes: Route[] = [
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />
  },
  {
    path: "/admin/users",
    element: <AdminUsers />
  },
  {
    path: "/admin/products",
    element: <AdminProducts />
  },
  // Add other admin routes...
];

export default adminRoutes;