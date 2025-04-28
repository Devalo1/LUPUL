import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavigation from "../components/AdminNavigation";

/**
 * Admin Layout component that provides a consistent layout for all admin pages
 * This component serves as a wrapper around admin routes, showing navigation
 * and maintaining the admin UI context
 */
const AdminLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Only the AdminLayout should render the AdminNavigation component for admin routes */}
      <AdminNavigation />
      
      {/* Main content with proper padding to account for navigation */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;