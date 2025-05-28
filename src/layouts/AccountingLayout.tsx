import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Accounting Layout component that provides a consistent layout for all accounting pages
 * This component serves as a wrapper around accounting routes, maintaining the accounting UI context
 */
const AccountingLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main content with proper padding */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AccountingLayout;
