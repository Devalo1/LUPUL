// filepath: d:\LUPUL\my-typescript-app\src\pages\accounting\AccountantPanel.tsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { useAccountingPermissions } from "../../contexts/AccountingPermissionsContext";
import { AccountingPermission } from "../../utils/accountingPermissions";
import { 
  FaFileInvoiceDollar, 
  FaClock, 
  FaChartLine, 
  FaMoneyBillWave,
  FaBellSlash,
  FaExclamationTriangle
} from "react-icons/fa";

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  type: string;
  status: string;
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  client: string;
  status: string;
}

const AccountantPanel: React.FC = () => {
  const { isAdmin, hasPermission, loading: loadingPermissions } = useAccountingPermissions();
  
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Încărcăm datele dashboard-ului
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (loadingPermissions) return;
      
      try {
        setLoading(true);
        
        // Obținem statistici pentru dashboard
        const statsData: DashboardStat[] = await fetchStats();
        setStats(statsData);
        
        // Obținem tranzacțiile recente
        const transactions = await fetchRecentTransactions();
        setRecentTransactions(transactions);
        
        // Dacă utilizatorul este admin, obținem și facturile care necesită aprobare
        if (isAdmin) {
          const approvals = await fetchPendingApprovals();
          setPendingApprovals(approvals);
        }
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Nu s-au putut încărca datele dashboard-ului");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [loadingPermissions, isAdmin]);
  
  // Funcție pentru a obține statisticile
  const fetchStats = async (): Promise<DashboardStat[]> => {
    // În practică, am face interogări Firestore pentru a obține aceste statistici
    // Pentru exemplu, utilizăm date statice
    
    const totalInvoices = 132;
    const pendingInvoices = 28;
    const monthlyRevenue = 25700;
    const growthRate = 12.5;
    
    return [
      {
        title: "Facturi totale",
        value: totalInvoices,
        icon: <FaFileInvoiceDollar className="text-2xl" />,
        color: "bg-blue-500"
      },
      {
        title: "Facturi în așteptare",
        value: pendingInvoices,
        icon: <FaClock className="text-2xl" />,
        color: "bg-yellow-500"
      },
      {
        title: "Venituri lunare",
        value: `${monthlyRevenue} RON`,
        icon: <FaMoneyBillWave className="text-2xl" />,
        color: "bg-green-500"
      },
      {
        title: "Creștere",
        value: `${growthRate}%`,
        icon: <FaChartLine className="text-2xl" />,
        color: "bg-purple-500"
      }
    ];
  };
  
  // Funcție pentru a obține tranzacțiile recente
  const fetchRecentTransactions = async (): Promise<Transaction[]> => {
    try {
      const transactionsRef = collection(db, "transactions");
      const q = query(
        transactionsRef,
        orderBy("date", "desc"),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date.toDate(),
          amount: data.amount,
          description: data.description,
          type: data.type,
          status: data.status
        };
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };
  
  // Funcție pentru a obține facturile care necesită aprobare
  const fetchPendingApprovals = async (): Promise<Invoice[]> => {
    try {
      const invoicesRef = collection(db, "invoices");
      const q = query(
        invoicesRef,
        where("status", "==", "awaiting_approval"),
        orderBy("date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date.toDate(),
          amount: data.amount,
          client: data.client,
          status: data.status
        };
      });
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      return [];
    }
  };

  if (loadingPermissions || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
        <p className="font-bold">Eroare</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">
        Dashboard Contabilitate
        {isAdmin && <span className="ml-2 text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">Admin</span>}
      </h1>
      
      {/* Statistici principale */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`${stat.color} text-white p-4 rounded-lg shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-75">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Secțiunea pentru aprobări - vizibilă doar pentru admini */}
      {isAdmin && pendingApprovals.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaExclamationTriangle className="text-yellow-500 mr-2" /> 
            Facturi care necesită aprobare
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">ID Factură</th>
                  <th className="px-4 py-2 text-left text-gray-600">Client</th>
                  <th className="px-4 py-2 text-left text-gray-600">Data</th>
                  <th className="px-4 py-2 text-left text-gray-600">Sumă</th>
                  <th className="px-4 py-2 text-left text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((invoice) => (
                  <tr key={invoice.id} className="border-t">
                    <td className="px-4 py-2 text-gray-800">{invoice.id}</td>
                    <td className="px-4 py-2 text-gray-800">{invoice.client}</td>
                    <td className="px-4 py-2 text-gray-800">
                      {invoice.date.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-gray-800">{invoice.amount} RON</td>
                    <td className="px-4 py-2">
                      <button 
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                        onClick={() => {
                          /* Logica pentru aprobare */
                          alert(`Factură aprobată: ${invoice.id}`);
                        }}
                      >
                        Aprobă
                      </button>
                      <button 
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => {
                          /* Logica pentru respingere */
                          alert(`Factură respinsă: ${invoice.id}`);
                        }}
                      >
                        Respinge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Panoul pentru tranzacțiile recente */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tranzacții recente</h2>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-6 flex flex-col items-center text-gray-500">
            <FaBellSlash className="text-4xl mb-2" />
            <p>Nu există tranzacții recente de afișat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">ID</th>
                  <th className="px-4 py-2 text-left text-gray-600">Data</th>
                  <th className="px-4 py-2 text-left text-gray-600">Descriere</th>
                  <th className="px-4 py-2 text-left text-gray-600">Tip</th>
                  <th className="px-4 py-2 text-left text-gray-600">Sumă</th>
                  <th className="px-4 py-2 text-left text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t">
                    <td className="px-4 py-2 text-gray-800">{transaction.id}</td>
                    <td className="px-4 py-2 text-gray-800">
                      {transaction.date.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-gray-800">{transaction.description}</td>
                    <td className="px-4 py-2 text-gray-800">{transaction.type}</td>
                    <td className="px-4 py-2 text-gray-800">{transaction.amount} RON</td>
                    <td className="px-4 py-2">
                      <span 
                        className={`px-2 py-1 rounded text-white ${
                          transaction.status === "completed" 
                            ? "bg-green-500" 
                            : transaction.status === "pending" 
                            ? "bg-yellow-500" 
                            : "bg-red-500"
                        }`}
                      >
                        {transaction.status === "completed" 
                          ? "Finalizat" 
                          : transaction.status === "pending" 
                          ? "În așteptare" 
                          : "Anulat"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Link către toate tranzacțiile - doar dacă utilizatorul are permisiunea */}
        {hasPermission(AccountingPermission.VIEW_TRANSACTIONS) && (
          <div className="mt-4 text-right">
            <a 
              href="/admin/accounting/transactions" 
              className="text-blue-500 hover:underline"
            >
              Vezi toate tranzacțiile →
            </a>
          </div>
        )}
      </div>
      
      {/* Funcționalități exclusive pentru admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Setări rapide</h2>
            <div className="space-y-3">
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
                onClick={() => window.location.href = "/admin/accounting/settings"}
              >
                Configurare conturi
              </button>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
                onClick={() => window.location.href = "/admin/accounting/permissions"}
              >
                Gestionare permisiuni
              </button>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
                onClick={() => {
                  /* Logica pentru reîmprospătare date */
                  alert("Date reîmprospătate!");
                }}
              >
                Reîmprospătare date
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notificări administrative</h2>
            <ul className="space-y-2">
              <li className="p-2 bg-yellow-50 border-l-4 border-yellow-500">
                3 facturi care necesită revizuire
              </li>
              <li className="p-2 bg-blue-50 border-l-4 border-blue-500">
                Actualizare software programată pentru 27.05.2025
              </li>
              <li className="p-2 bg-green-50 border-l-4 border-green-500">
                Toate rapoartele fiscale au fost trimise cu succes
              </li>
              <li className="p-2 bg-red-50 border-l-4 border-red-500">
                Eroare la sincronizarea cu sistemul bancar
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantPanel;