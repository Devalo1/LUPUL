import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Receipt,
  FileText,
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  Plus,
  Eye,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AccountingService } from "../services/accountingService";
import SettlementPanel from "../components/accounting/SettlementPanel";
import { FaUserCog, FaUserMd, FaUser, FaCalculator } from "react-icons/fa";
import {
  isUserAdmin,
  isUserSpecialist,
  isUserAccountant,
  UserRole,
} from "../utils/userRoles";

// Import components for different panels
const InvoicePanel = React.lazy(
  () => import("../components/accounting/InvoicePanel")
);
const StockPanel = React.lazy(
  () => import("../components/accounting/StockPanel")
);
const AccountingCalendar = React.lazy(
  () => import("../components/accounting/AccountingCalendar")
);
const ZReportPanel = React.lazy(
  () => import("../components/accounting/ZReportPanel")
);
const CardReportPanel = React.lazy(
  () => import("../components/accounting/CardReportPanel")
);

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  lowStockItems: number;
  todaySettlements: number;
}

const AdminAccounting: React.FC = () => {
  const { panel } = useParams<{ panel: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Determine active panel from URL param
  const activePanel = panel || "dashboard";
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    lowStockItems: 0,
    todaySettlements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Role detection state
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Role detection useEffect
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.email) return;

      setCheckingRole(true);
      try {
        // Check if user is admin
        const isAdmin = await isUserAdmin(user.email);
        if (isAdmin) {
          setUserRole(UserRole.ADMIN);
          return;
        }

        // Check if user is specialist
        const isSpecialist = await isUserSpecialist(user.email);
        if (isSpecialist) {
          setUserRole(UserRole.SPECIALIST);
          return;
        }

        // Check if user is accountant
        const isAccountant = await isUserAccountant(user.email);
        if (isAccountant) {
          setUserRole(UserRole.ACCOUNTANT);
          return;
        }

        // Default to regular user
        setUserRole(UserRole.USER);
      } catch (error) {
        console.error("Eroare la verificarea rolului utilizatorului:", error);
        setUserRole(UserRole.USER); // Default to regular user
      } finally {
        setCheckingRole(false);
      }
    };

    if (user?.email) {
      fetchUserRole();
    }
  }, [user?.email]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load recent Z Reports, Settlements, Invoices, and Stock
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const [zReports, settlements, invoices, stocks] = await Promise.all([
        AccountingService.getZReports(startOfMonth, today),
        AccountingService.getSettlements(startOfMonth, today),
        AccountingService.getInvoices(startOfMonth, today),
        AccountingService.getStocks(),
      ]); // Calculate stats
      const totalRevenue = zReports.reduce(
        (sum: number, report: any) => sum + report.totalSales,
        0
      );
      const monthlyRevenue = totalRevenue;
      const pendingInvoices = invoices.filter(
        (inv: any) => inv.status === "draft" || inv.status === "sent"
      ).length;
      const lowStockItems = stocks.filter(
        (stock: any) => stock.quantity <= stock.minimumLevel
      ).length;
      const todaySettlements = settlements.filter(
        (settlement: any) =>
          settlement.date.toDateString() === today.toDateString()
      ).length;

      setStats({
        totalRevenue,
        monthlyRevenue,
        pendingInvoices,
        lowStockItems,
        todaySettlements,
      }); // Set recent activities
      const activities = [
        ...zReports.slice(0, 3).map((report: any) => ({
          type: "Z Report",
          description: `Z Report pentru ${report.cashRegisterName}`,
          amount: report.totalSales,
          date: report.date,
          icon: Receipt,
        })),
        ...settlements.slice(0, 3).map((settlement: any) => ({
          type: "Settlement",
          description: `Reconciliere ${settlement.type}`,
          amount: settlement.totalAmount,
          date: settlement.date,
          icon: DollarSign,
        })),
        ...invoices.slice(0, 3).map((invoice: any) => ({
          type: "Invoice",
          description: `Factură #${invoice.invoiceNumber}`,
          amount: invoice.totalAmount,
          date: invoice.date,
          icon: FileText,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="admin-page min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="admin-page min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {" "}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Contabilitate
              </h1>
              <p className="text-gray-600 mt-1">
                Bun venit, {user?.displayName || user?.email}
              </p>

              {/* Role badge */}
              {!checkingRole && userRole && (
                <div
                  className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    userRole === UserRole.ADMIN
                      ? "bg-red-100 text-red-800"
                      : userRole === UserRole.SPECIALIST
                        ? "bg-green-100 text-green-800"
                        : userRole === UserRole.ACCOUNTANT
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {userRole === UserRole.ADMIN && (
                    <>
                      <FaUserCog className="mr-1" />
                      Administrator
                    </>
                  )}
                  {userRole === UserRole.SPECIALIST && (
                    <>
                      <FaUserMd className="mr-1" />
                      Specialist
                    </>
                  )}
                  {userRole === UserRole.ACCOUNTANT && (
                    <>
                      <FaCalculator className="mr-1" />
                      Contabil
                    </>
                  )}
                  {userRole === UserRole.USER && (
                    <>
                      <FaUser className="mr-1" />
                      Utilizator
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString("ro-RO", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>{" "}
        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "calendar", label: "Calendar", icon: CalendarDays },
              { id: "zreports", label: "Raport Casă", icon: Receipt },
              { id: "cardreports", label: "Raport Card", icon: DollarSign },
              { id: "settlements", label: "Decontări", icon: DollarSign },
              { id: "invoices", label: "Facturi", icon: FileText },
              { id: "stock", label: "Stoc", icon: Package },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/accounting/${tab.id}`)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePanel === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        {/* Content */}
        {activePanel === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-md">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Venituri Luna
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.monthlyRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Facturi Pending
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.pendingInvoices}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-md">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Stoc Scăzut
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.lowStockItems}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-md">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Reconcilieri Azi
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.todaySettlements}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-md">
                    <Receipt className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Venituri Totale
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Activitate Recentă
                </h3>
              </div>
              <div className="p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="p-2 bg-white rounded-md">
                              <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(activity.date)}
                              </p>
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(activity.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nu există activitate recentă
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Acțiuni Rapide
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate("/accounting/settlements")}
                    className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-blue-600 mr-3" />
                    <span className="font-medium text-blue-900">
                      Adaugă Raport Card
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/accounting/invoices")}
                    className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-green-600 mr-3" />
                    <span className="font-medium text-green-900">
                      Creează Factură
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/accounting/stock")}
                    className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Eye className="w-6 h-6 text-purple-600 mr-3" />
                    <span className="font-medium text-purple-900">
                      Vezi Stocurile
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}{" "}
        {activePanel === "calendar" && (
          <React.Suspense
            fallback={
              <div className="text-center py-8">Se încarcă calendarul...</div>
            }
          >
            <AccountingCalendar canEdit={true} />
          </React.Suspense>
        )}
        {activePanel === "zreports" && (
          <React.Suspense fallback={<div>Se încarcă...</div>}>
            <ZReportPanel canEdit={true} />
          </React.Suspense>
        )}
        {activePanel === "cardreports" && (
          <React.Suspense fallback={<div>Se încarcă...</div>}>
            <CardReportPanel />
          </React.Suspense>
        )}
        {activePanel === "settlements" && <SettlementPanel canEdit={true} />}
        {activePanel === "invoices" && (
          <React.Suspense
            fallback={
              <div className="text-center py-8">Se încarcă facturile...</div>
            }
          >
            <InvoicePanel canEdit={true} />
          </React.Suspense>
        )}
        {activePanel === "stock" && (
          <React.Suspense
            fallback={
              <div className="text-center py-8">Se încarcă stocurile...</div>
            }
          >
            <StockPanel canEdit={true} />
          </React.Suspense>
        )}
      </div>
    </div>
  );
};

export default AdminAccounting;
