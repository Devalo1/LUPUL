import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { isUserAccountant, isUserAdmin } from "../../utils/userRoles";
import {
  Calendar,
  FileText,
  DollarSign,
  Package,
  BarChart3,
} from "lucide-react";
import ZReportPanel from "./ZReportPanel";
import SettlementPanel from "./SettlementPanel";
import InvoicePanel from "./InvoicePanel";
import StockPanel from "./StockPanel";
import AccountingCalendar from "./AccountingCalendar";

interface AccountingDashboardProps {
  activeTab?: ActivePanel;
}

type ActivePanel =
  | "overview"
  | "zreports"
  | "settlements"
  | "invoices"
  | "stock"
  | "calendar";

const AccountingDashboard: React.FC<AccountingDashboardProps> = ({
  activeTab: propActiveTab,
}) => {
  const { currentUser } = useAuth();
  const [activePanel, setActivePanel] = useState<ActivePanel>(
    propActiveTab || "overview"
  );
  const [isAccountant, setIsAccountant] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRoles = async () => {
      if (currentUser?.email) {
        const [accountantCheck, adminCheck] = await Promise.all([
          isUserAccountant(currentUser.email),
          isUserAdmin(currentUser.email),
        ]);
        setIsAccountant(accountantCheck);
        setIsAdmin(adminCheck);
      }
      setLoading(false);
    };

    checkUserRoles();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAccountant && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Acces interzis
          </h2>
          <p className="text-gray-600">
            Nu aveți permisiuni pentru a accesa panoul contabil.
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "Privire generală", icon: BarChart3 },
    { id: "zreports", label: "Rapoarte Z", icon: FileText },
    { id: "settlements", label: "Decontări", icon: DollarSign },
    { id: "invoices", label: "Facturi", icon: FileText },
    { id: "stock", label: "Stocuri", icon: Package },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ];
  const renderContent = () => {
    switch (activePanel) {
      case "zreports":
        return <ZReportPanel canEdit={isAdmin} />;
      case "settlements":
        return <SettlementPanel canEdit={isAdmin} />;
      case "invoices":
        return <InvoicePanel canEdit={isAdmin} />;
      case "stock":
        return <StockPanel canEdit={isAdmin} />;
      case "calendar":
        return <AccountingCalendar canEdit={isAdmin} />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Privire generală contabilitate
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuItems.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActivePanel(item.id as ActivePanel)}
                  >
                    <Icon className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.label}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Accesați modulul {item.label.toLowerCase()}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informații despre cont
              </h3>
              <div className="space-y-2">
                {" "}
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {currentUser?.email || "Necunoscut"}
                </p>
                <p>
                  <span className="font-medium">Rol:</span>{" "}
                  {isAdmin ? "Administrator" : "Contabil"}
                </p>
                <p>
                  <span className="font-medium">Permisiuni:</span>{" "}
                  {isAdmin ? "Editare completă" : "Doar vizualizare"}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">Panou Contabil</h1>
            <p className="text-sm text-gray-600 mt-1">
              {isAdmin ? "Administrator" : "Contabil"}
            </p>
          </div>

          <nav className="mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePanel(item.id as ActivePanel)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                    activePanel === item.id
                      ? "bg-blue-50 border-r-2 border-blue-600 text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AccountingDashboard;
