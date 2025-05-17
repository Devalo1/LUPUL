import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AccountantPanel from "../pages/accounting/AccountantPanel";
import Transactions from "../pages/accounting/Transactions";
import Invoices from "../pages/accounting/Invoices";
import Reports from "../components/accounting/Reports";
import Settings from "../components/accounting/Settings";
import ReportViewer from "../components/accounting/ReportViewer";
import AccountingPermissions from "../pages/accounting/Permissions";
import AccountingApprovals from "../pages/accounting/Approvals";
import { AccountingLayout } from "../layouts/AccountingLayout";
import { useAccountingPermissions } from "../contexts/AccountingPermissionsContext";

// Componentă de gardă pentru rutele care necesită rol de admin
const AdminGuard: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { isAdmin, loading } = useAccountingPermissions();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
        <p>Nu aveți permisiunea de a accesa această pagină.</p>
        <button
          onClick={() => window.location.href = "/admin/accounting"}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Înapoi la dashboard
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
};

/**
 * Rutele pentru modulul de contabilitate
 */
const AccountingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AccountingLayout />}>
        <Route index element={<AccountantPanel />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:reportId" element={<ReportViewer />} />
        
        {/* Rute protejate - doar pentru admin */}
        <Route path="settings" element={
          <AdminGuard>
            <Settings />
          </AdminGuard>
        } />
        
        <Route path="permissions" element={
          <AdminGuard>
            <AccountingPermissions />
          </AdminGuard>
        } />
        
        <Route path="approvals" element={
          <AdminGuard>
            <AccountingApprovals />
          </AdminGuard>
        } />
        
        {/* Rută de redirecționare pentru căi inexistente */}
        <Route path="*" element={<Navigate to="/admin/accounting" replace />} />
      </Route>
    </Routes>
  );
};

export default AccountingRoutes;