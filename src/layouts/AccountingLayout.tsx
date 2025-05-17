import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { 
  FaChartLine, 
  FaFileInvoiceDollar, 
  FaExchangeAlt, 
  FaChartBar,
  FaCog,
  FaUserLock,
  FaClipboardCheck,
  FaSignOutAlt
} from "react-icons/fa";
import { useAccountingPermissions } from "../contexts/AccountingPermissionsContext";
import { AccountingPermission } from "../utils/accountingPermissions";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  requiredPermission?: AccountingPermission;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, title, requiredPermission }) => {
  const { hasPermission, loading } = useAccountingPermissions();
  
  // Dacă nu este specificată o permisiune, afișăm întotdeauna elementul
  // Altfel, verificăm dacă utilizatorul are permisiunea necesară
  const shouldRender = !requiredPermission || hasPermission(requiredPermission);
  
  if (loading || !shouldRender) {
    return null;
  }
  
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) =>
        `flex items-center px-4 py-3 transition duration-150 ease-in-out ${
          isActive
            ? "bg-blue-700 text-white"
            : "text-gray-300 hover:bg-blue-600 hover:text-white"
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{title}</span>
    </NavLink>
  );
};

export const AccountingLayout: React.FC = () => {
  const { isAdmin, isAccountant, loading } = useAccountingPermissions();
  const navigate = useNavigate();
  
  // Dacă utilizatorul nu are rolul de admin sau contabil, îl redirecționăm la pagina principală
  if (!loading && !isAdmin && !isAccountant) {
    navigate("/");
    return null;
  }

  // Funcție pentru a determina titlul paginii și textul de bun venit bazat pe rol
  const getRoleSpecificContent = () => {
    if (isAdmin) {
      return {
        title: "Administrator Contabilitate",
        welcomeText: "Bun venit în panoul de administrare contabilă"
      };
    } else if (isAccountant) {
      return {
        title: "Panou Contabil",
        welcomeText: "Bun venit în panoul contabil"
      };
    } else {
      return {
        title: "Panou Contabil",
        welcomeText: "Se încarcă..."
      };
    }
  };

  const roleContent = getRoleSpecificContent();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 flex-none">
        <div className="p-4">
          <h1 className="text-white text-xl font-semibold">{roleContent.title}</h1>
          <p className="text-blue-200 text-sm">{roleContent.welcomeText}</p>
        </div>
        <nav className="mt-6">
          {/* Elementele de navigare cu verificări de permisiuni */}
          <NavItem 
            to="/admin/accounting" 
            icon={<FaChartLine />} 
            title="Dashboard" 
            requiredPermission={AccountingPermission.VIEW_DASHBOARD}
          />
          <NavItem 
            to="/admin/accounting/invoices" 
            icon={<FaFileInvoiceDollar />} 
            title="Facturi"
            requiredPermission={AccountingPermission.VIEW_INVOICES}
          />
          <NavItem 
            to="/admin/accounting/transactions" 
            icon={<FaExchangeAlt />} 
            title="Tranzacții"
            requiredPermission={AccountingPermission.VIEW_TRANSACTIONS}
          />
          <NavItem 
            to="/admin/accounting/reports" 
            icon={<FaChartBar />} 
            title="Rapoarte"
            requiredPermission={AccountingPermission.VIEW_REPORTS}
          />
          
          {/* Elemente disponibile doar pentru administratori */}
          <NavItem 
            to="/admin/accounting/approvals" 
            icon={<FaClipboardCheck />} 
            title="Aprobări"
            requiredPermission={AccountingPermission.APPROVE_INVOICE}
          />
          <NavItem 
            to="/admin/accounting/permissions" 
            icon={<FaUserLock />} 
            title="Permisiuni"
            requiredPermission={AccountingPermission.MANAGE_PERMISSIONS}
          />
          <NavItem 
            to="/admin/accounting/settings" 
            icon={<FaCog />} 
            title="Setări"
            requiredPermission={AccountingPermission.MANAGE_SETTINGS}
          />
          
          {/* Buton de ieșire - disponibil tuturor */}
          <div className="mt-auto pt-10">
            <button 
              onClick={() => navigate("/")} 
              className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white transition duration-150 ease-in-out"
            >
              <FaSignOutAlt className="mr-3" />
              <span>Ieșire</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};