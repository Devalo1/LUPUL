import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Admin layout that provides a consistent structure for all admin pages
 * with centralized navigation
 * Note: AdminNavigation is now handled by the main AdminLayout in the layouts directory
 */
const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout-container w-full">
      {/* Removed AdminNavigation to prevent duplication */}
      
      {/* Content area for admin pages */}
      <div className="admin-content-container p-4 md:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;