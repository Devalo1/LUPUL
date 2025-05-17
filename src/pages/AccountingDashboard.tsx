import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaFileInvoiceDollar, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCheck
} from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { firestore } from "../firebase";
import { 
  collection, 
  query, 
  orderBy,
  limit, 
  getDocs, 
  doc, 
  getDoc,
  where,
  Timestamp
} from "firebase/firestore";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AccountingService } from "../services/accounting/accountingService";
import InvoicesList from "../components/accounting/InvoicesList";
import { formatCurrency } from "../utils/formatters";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TimestampConverter } from "../utils/timestampConverter";

// Define Transaction interface to fix type errors
interface Transaction {
  id: string;
  date: Date | Timestamp;
  type: string;
  amount: number;
  [key: string]: any; // For other properties that might exist
}

// Componente interne
const StatCard = ({ title, value, icon: Icon, color, footer, onClick }: any) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="text-white text-xl" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-2">
          {value}
        </div>
        {footer && <div className="text-sm text-gray-500">{footer}</div>}
      </div>
    </div>
  );
};

const AccountingDashboard: React.FC = () => {  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [_userData, setUserData] = useState<any>(null);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [_monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingInvoices: 0,
    overdueInvoices: 0
  });

  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // Verify if user has accountant role
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserData(userData);
          
          // Check if user has accountant role
          if (!userData.roles?.accountant) {
            navigate("/dashboard");
            return;
          }
          
          // Load dashboard data
          await Promise.all([
            loadRecentInvoices(),
            loadMonthlyRevenue(),
            checkPendingApprovals(),
            loadFinancialSummary()
          ]);
          
          setLoading(false);
        } else {
          // User document doesn't exist
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Eroare la verificarea accesului:", error);
        navigate("/dashboard");
      }
    };

    checkAccess();
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

  const loadMonthlyRevenue = async () => {
    try {
      // Obținem începutul și sfârșitul lunii curente
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startTimestamp = Timestamp.fromDate(startOfMonth);
      const endTimestamp = Timestamp.fromDate(endOfMonth);
      
      // Obținem tranzacțiile pentru luna curentă
      const transactionsRef = collection(firestore, "transactions");
      const monthlyQuery = query(
        transactionsRef,
        where("date", ">=", startTimestamp),
        where("date", "<=", endTimestamp),
        orderBy("date", "asc")
      );
      
      const querySnapshot = await getDocs(monthlyQuery);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]; // Cast to Transaction[] to fix type errors
      
      // Grupăm după zi pentru a arăta venitul zilnic
      const dailyRevenue: any = {};
      
      transactions.forEach(transaction => {
        // Convertim timestamp-ul Firebase la Date
        const date = transaction.date instanceof Timestamp 
          ? transaction.date.toDate() 
          : new Date((transaction.date as any).seconds * 1000);
        
        const day = date.getDate();
        
        // Adăugăm sau scădem din venitul zilnic, în funcție de tipul tranzacției
        if (!dailyRevenue[day]) {
          dailyRevenue[day] = 0;
        }
        
        if (transaction.type === "income") {
          dailyRevenue[day] += transaction.amount;
        } else {
          dailyRevenue[day] -= transaction.amount;
        }
      });
      
      // Convertim obiectul într-un array pentru afișare
      const revenueArray = Object.entries(dailyRevenue).map(([day, amount]) => ({
        day: parseInt(day),
        amount
      }));
      
      setMonthlyRevenue(revenueArray);
    } catch (error) {
      console.error("Eroare la încărcarea veniturilor lunare:", error);
    }
  };

  const checkPendingApprovals = async () => {
    try {
      // Verificăm dacă există tranzacții care necesită aprobare
      const approvalsRef = collection(firestore, "transactionApprovals");
      const pendingQuery = query(
        approvalsRef,
        where("status", "==", "pending")
      );
      
      const querySnapshot = await getDocs(pendingQuery);
      setPendingApprovals(querySnapshot.size);
    } catch (error) {
      console.error("Eroare la verificarea aprobărilor în așteptare:", error);
    }
  };
  
  const loadFinancialSummary = async () => {
    try {
      // Obținem începutul și sfârșitul anului curent
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      
      const startTimestamp = Timestamp.fromDate(startOfYear);
      const endTimestamp = Timestamp.fromDate(endOfYear);
      
      // Obținem toate tranzacțiile pentru anul curent
      const transactionsRef = collection(firestore, "transactions");
      const yearlyQuery = query(
        transactionsRef,
        where("date", ">=", startTimestamp),
        where("date", "<=", endTimestamp)
      );
      
      const querySnapshot = await getDocs(yearlyQuery);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]; // Cast to Transaction[] to fix type errors
      
      // Calculăm veniturile și cheltuielile totale
      let totalRevenue = 0;
      let totalExpenses = 0;
      
      transactions.forEach(transaction => {
        if (transaction.type === "income") {
          totalRevenue += transaction.amount;
        } else {
          totalExpenses += transaction.amount;
        }
      });
      
      // Verificăm facturile neplătite și întârziate
      const invoicesRef = collection(firestore, "invoices");
      
      // Facturi neplătite
      const pendingQuery = query(
        invoicesRef,
        where("status", "==", "sent")
      );
      
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingInvoices = pendingSnapshot.size;
      
      // Facturi întârziate
      const overdueQuery = query(
        invoicesRef,
        where("status", "==", "overdue")
      );
      
      const overdueSnapshot = await getDocs(overdueQuery);
      const overdueInvoices = overdueSnapshot.size;
      
      // Actualizăm sumarul financiar
      setFinancialSummary({
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        pendingInvoices,
        overdueInvoices
      });
    } catch (error) {
      console.error("Eroare la încărcarea sumarului financiar:", error);
    }
  };

  const navigateToInvoices = () => {
    navigate("/admin/accounting/invoices");
  };
  
  const navigateToTransactions = () => {
    navigate("/admin/accounting/transactions");
  };
  
  const navigateToReports = () => {
    navigate("/admin/accounting/reports");
  };
  
  const navigateToApprovals = () => {
    navigate("/admin/accounting/approvals");
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="accounting-dashboard">
      <h1 className="text-2xl font-bold mb-6">Dashboard Contabilitate</h1>
      
      {/* Carduri statistice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Venituri" 
          value={formatCurrency(financialSummary.totalRevenue)}
          icon={FaMoneyBillWave} 
          color="bg-green-500"
          footer="Anul curent" 
          onClick={navigateToTransactions}
        />
        
        <StatCard 
          title="Total Cheltuieli" 
          value={formatCurrency(financialSummary.totalExpenses)}
          icon={FaMoneyBillWave} 
          color="bg-red-500"
          footer="Anul curent" 
          onClick={navigateToTransactions}
        />
        
        <StatCard 
          title="Profit Net" 
          value={formatCurrency(financialSummary.netProfit)}
          icon={FaChartLine} 
          color={financialSummary.netProfit >= 0 ? "bg-blue-500" : "bg-red-500"}
          footer="Anul curent" 
          onClick={navigateToReports}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Facturi Neîncasate" 
          value={financialSummary.pendingInvoices}
          icon={FaFileInvoiceDollar} 
          color="bg-yellow-500"
          footer="În așteptare" 
          onClick={navigateToInvoices}
        />
        
        <StatCard 
          title="Facturi Întârziate" 
          value={financialSummary.overdueInvoices}
          icon={FaExclamationTriangle} 
          color="bg-red-500"
          footer="Necesită atenție" 
          onClick={navigateToInvoices}
        />
        
        <StatCard 
          title="Aprobări în Așteptare" 
          value={pendingApprovals}
          icon={FaCheck} 
          color="bg-purple-500"
          footer="Tranzacții de aprobat" 
          onClick={navigateToApprovals}
        />
      </div>

      {/* Secțiunea cu facturi recente */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Facturi Recente</h2>
          <button 
            onClick={navigateToInvoices}
            className="text-blue-500 hover:text-blue-700"
          >
            Vezi toate
          </button>
        </div>
        
        {recentInvoices.length > 0 ? (
          <InvoicesList invoices={recentInvoices} />
        ) : (
          <p className="text-gray-500 italic">Nu există facturi recente.</p>
        )}
      </div>

      {/* Calendar / Evenimente viitoare */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Evenimente Viitoare</h2>
          <FaCalendarAlt className="text-gray-400" />
        </div>
        
        <ul className="divide-y divide-gray-200">
          <li className="py-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Termen depunere D112</p>
                <p className="text-sm text-gray-500">Declarație lunară obligații de plată</p>
              </div>
              <div className="text-red-600">25 Mai 2025</div>
            </div>
          </li>
          <li className="py-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Termen depunere D300</p>
                <p className="text-sm text-gray-500">Decont TVA</p>
              </div>
              <div className="text-red-600">25 Mai 2025</div>
            </div>
          </li>
          <li className="py-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Plată impozit pe profit Q2</p>
                <p className="text-sm text-gray-500">Plată anticipată</p>
              </div>
              <div className="text-yellow-600">25 Iunie 2025</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AccountingDashboard;