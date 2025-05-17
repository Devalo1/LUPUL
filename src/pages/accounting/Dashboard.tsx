import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import { AccountingService } from "../../services/accounting/accountingService";
import InvoicesList from "../../components/accounting/InvoicesList";
import { FaChartLine, FaMoneyBillWave, FaFileInvoiceDollar, FaExclamationTriangle, FaExchangeAlt, FaSync } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [financialSnapshot, setFinancialSnapshot] = useState({
    currentMonthIncome: 0,
    currentMonthExpense: 0,
    currentMonthProfit: 0,
    previousMonthIncome: 0,
    previousMonthExpense: 0,
    previousMonthProfit: 0,
    incomeChange: 0,
    expenseChange: 0,
    profitChange: 0
  });

  const checkingAccess = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      if (checkingAccess.current) return;
      checkingAccess.current = true;

      timeoutRef.current = setTimeout(() => {
        console.warn("Dashboard load timeout reached");
        setError("Încărcarea datelor a durat prea mult. Vă rugăm să reîncercați.");
        setLoading(false);
        checkingAccess.current = false;
      }, 15000);

      try {
        const cachedIsAccountant = localStorage.getItem("isAccountant") === "true";
        let isAccountant = cachedIsAccountant;

        if (!cachedIsAccountant) {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          isAccountant = userDoc.exists() &&
            (userDoc.data().role === "accountant" || userDoc.data().isAccountant === true);

          localStorage.setItem("isAccountant", String(isAccountant));
        }

        if (isAccountant) {
          setUserData({
            ...user,
            role: "accountant",
            isAccountant: true
          });

          await Promise.all([
            Promise.race([
              loadRecentInvoices(),
              new Promise(resolve => setTimeout(resolve, 5000))
            ]),
            Promise.race([
              loadFinancialData(),
              new Promise(resolve => setTimeout(resolve, 5000))
            ]),
            Promise.race([
              checkPendingApprovals(),
              new Promise(resolve => setTimeout(resolve, 3000))
            ])
          ]);
        } else {
          console.log("User is not an accountant, redirecting to dashboard");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Eroare la verificarea accesului:", error);
        setError("Eroare la încărcarea datelor. Vă rugăm să reîncercați.");
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setLoading(false);
        checkingAccess.current = false;
      }
    };

    checkAccess();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [auth, navigate]);

  const loadRecentInvoices = async () => {
    try {
      const invoicesRef = collection(firestore, "invoices");
      const recentQuery = query(
        invoicesRef,
        orderBy("createdAt", "desc"),
        limit(5)
      );

      const querySnapshot = await getDocs(recentQuery);
      const invoices = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRecentInvoices(invoices);
    } catch (error) {
      console.error("Eroare la încărcarea facturilor:", error);
    }
  };

  const loadFinancialData = async () => {
    try {
      const currentDate = new Date();
      const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      const currentMonthTransactions = await AccountingService.getTransactions({
        startDate: firstDayCurrentMonth,
        endDate: lastDayCurrentMonth
      });

      const previousMonthTransactions = await AccountingService.getTransactions({
        startDate: firstDayPreviousMonth,
        endDate: lastDayPreviousMonth
      });

      let currentMonthIncome = 0;
      let currentMonthExpense = 0;

      currentMonthTransactions.forEach(transaction => {
        if (transaction.type === "income") {
          currentMonthIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          currentMonthExpense += transaction.amount;
        }
      });

      let previousMonthIncome = 0;
      let previousMonthExpense = 0;

      previousMonthTransactions.forEach(transaction => {
        if (transaction.type === "income") {
          previousMonthIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          previousMonthExpense += transaction.amount;
        }
      });

      const currentMonthProfit = currentMonthIncome - currentMonthExpense;
      const previousMonthProfit = previousMonthIncome - previousMonthExpense;

      const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      setFinancialSnapshot({
        currentMonthIncome,
        currentMonthExpense,
        currentMonthProfit,
        previousMonthIncome,
        previousMonthExpense,
        previousMonthProfit,
        incomeChange: calculatePercentageChange(currentMonthIncome, previousMonthIncome),
        expenseChange: calculatePercentageChange(currentMonthExpense, previousMonthExpense),
        profitChange: calculatePercentageChange(currentMonthProfit, previousMonthProfit)
      });

      const monthlyRevenueData = [
        { month: "Ian", income: 5200, expense: 4800 },
        { month: "Feb", income: 5800, expense: 5300 },
        { month: "Mar", income: 6500, expense: 5600 },
        { month: "Apr", income: 7200, expense: 6200 },
        { month: "Mai", income: 7800, expense: 6800 },
        { month: "Iun", income: currentMonthIncome, expense: currentMonthExpense }
      ];

      setMonthlyRevenue(monthlyRevenueData);
    } catch (error) {
      console.error("Eroare la încărcarea datelor financiare:", error);
    }
  };

  const checkPendingApprovals = async () => {
    try {
      const transactionsRef = collection(firestore, "financialTransactions");
      const pendingQuery = query(transactionsRef);

      const querySnapshot = await getDocs(pendingQuery);
      setPendingApprovals(querySnapshot.size);
    } catch (error) {
      console.error("Eroare la verificarea aprobărilor:", error);
    }
  };

  const handleRefresh = async () => {
    if (checkingAccess.current) return;

    setLoading(true);
    setError(null);
    checkingAccess.current = true;

    try {
      await Promise.all([
        loadRecentInvoices(),
        loadFinancialData(),
        checkPendingApprovals()
      ]);
    } catch (error) {
      console.error("Eroare la reîmprospătarea datelor:", error);
      setError("Eroare la reîmprospătarea datelor");
    } finally {
      setLoading(false);
      checkingAccess.current = false;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON"
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Se încarcă datele contabile...</p>
        <button 
          onClick={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            setLoading(false);
          }}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Oprește încărcarea
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-medium">Eroare</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
        >
          <FaSync className="mr-2" /> Reîncarcă datele
        </button>
      </div>
    );
  }
  return (
    <div className="accounting-dashboard mt-16"> {/* Added margin-top to prevent navbar overlap */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Contabilitate</h1>
        <button 
          onClick={handleRefresh}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center text-sm"
        >
          <FaSync className="mr-1" /> Reîmprospătează
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Venituri Luna Curentă</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSnapshot.currentMonthIncome)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaMoneyBillWave className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${financialSnapshot.incomeChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {financialSnapshot.incomeChange >= 0 ? "+" : ""}{financialSnapshot.incomeChange.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">față de luna precedentă</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Cheltuieli Luna Curentă</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(financialSnapshot.currentMonthExpense)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FaMoneyBillWave className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${financialSnapshot.expenseChange <= 0 ? "text-green-600" : "text-red-600"}`}>
              {financialSnapshot.expenseChange >= 0 ? "+" : ""}{financialSnapshot.expenseChange.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">față de luna precedentă</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Profit Net Luna Curentă</p>
              <p className={`text-2xl font-bold ${financialSnapshot.currentMonthProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {formatCurrency(financialSnapshot.currentMonthProfit)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaChartLine className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${financialSnapshot.profitChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {financialSnapshot.profitChange >= 0 ? "+" : ""}{financialSnapshot.profitChange.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">față de luna precedentă</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Facturi Recente</h2>
            <button 
              onClick={() => navigate("/admin/accounting/invoices")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Vezi toate
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {recentInvoices.length > 0 ? (
              <InvoicesList invoices={recentInvoices} />
            ) : (
              <p className="text-gray-500 italic">Nu există facturi recente.</p>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Acțiuni Rapide</h2>
            <div className="space-y-2">
              <button 
                onClick={() => navigate("/admin/accounting/transactions")}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <FaExchangeAlt className="mr-2" /> Adaugă Tranzacție
              </button>
              <button 
                onClick={() => navigate("/admin/accounting/invoices")}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <FaFileInvoiceDollar className="mr-2" /> Creează Factură
              </button>
              <button 
                onClick={() => navigate("/admin/accounting/reports")}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <FaChartLine className="mr-2" /> Generează Raport
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Alerte</h2>
            {pendingApprovals > 0 ? (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-700">
                    {pendingApprovals} tranzacții necesită aprobare
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Nu există alerte noi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;