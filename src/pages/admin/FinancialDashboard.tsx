import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  FaMoneyBillWave,
  FaCreditCard,
  FaChartLine,
  FaFileExport,
} from "react-icons/fa";

interface PaymentData {
  id: string;
  orderNumber: string;
  amount: number;
  netopiaFee: number;
  netAmount: number;
  settlementDate: Date;
  status: "pending" | "settled" | "failed";
  customerEmail: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalFees: number;
  netIncome: number;
  transactionCount: number;
  averageOrder: number;
}

const AdminFinancialDashboard: React.FC = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalFees: 0,
    netIncome: 0,
    transactionCount: 0,
    averageOrder: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("30"); // ultimele 30 zile
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialData();
  }, [dateFilter]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Calculăm data de start based pe filtru
      const daysAgo = parseInt(dateFilter);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Query pentru comenzi din perioada selectată
      const ordersQuery = query(
        collection(db, "orders"),
        where("orderDate", ">=", Timestamp.fromDate(startDate)),
        where("paymentMethod", "==", "card"),
        orderBy("orderDate", "desc")
      );

      const snapshot = await getDocs(ordersQuery);

      if (snapshot.empty) {
        setPayments([]);
        setSummary({
          totalRevenue: 0,
          totalFees: 0,
          netIncome: 0,
          transactionCount: 0,
          averageOrder: 0,
        });
        return;
      }

      const paymentData: PaymentData[] = [];
      let totalRevenue = 0;
      let totalFees = 0;

      snapshot.docs.forEach((doc) => {
        const order = doc.data();
        const amount = order.totalAmount || 0;

        // Calculăm comisionul Netopia (3% + 1 RON fix)
        const netopiaFee = amount * 0.03 + 1;
        const netAmount = amount - netopiaFee;

        paymentData.push({
          id: doc.id,
          orderNumber: order.orderNumber || doc.id.slice(0, 8),
          amount: amount,
          netopiaFee: netopiaFee,
          netAmount: netAmount,
          settlementDate:
            order.settlementDate?.toDate() ||
            new Date(
              order.orderDate.toDate().getTime() + 3 * 24 * 60 * 60 * 1000
            ), // T+3
          status: order.paymentStatus === "paid" ? "settled" : "pending",
          customerEmail: order.email || "N/A",
        });

        totalRevenue += amount;
        totalFees += netopiaFee;
      });

      setPayments(paymentData);
      setSummary({
        totalRevenue,
        totalFees,
        netIncome: totalRevenue - totalFees,
        transactionCount: paymentData.length,
        averageOrder:
          paymentData.length > 0 ? totalRevenue / paymentData.length : 0,
      });
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError("Eroare la încărcarea datelor financiare.");
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
    return date.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Comandă,Sumă Brută,Comision Netopia,Sumă Netă,Data Settlement,Status,Email Client\n" +
      payments
        .map(
          (p) =>
            `${p.orderNumber},${p.amount},${p.netopiaFee.toFixed(2)},${p.netAmount.toFixed(2)},${formatDate(p.settlementDate)},${p.status},${p.customerEmail}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_report_${dateFilter}_days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            📊 Dashboard Financiar - Administrator
          </h1>

          <div className="flex space-x-3">
            <label htmlFor="date-filter" className="sr-only">
              Selectează perioada
            </label>
            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              title="Selectează perioada pentru raport"
            >
              <option value="7">Ultimele 7 zile</option>
              <option value="30">Ultimele 30 zile</option>
              <option value="90">Ultimele 90 zile</option>
              <option value="365">Ultimul an</option>
            </select>

            <button
              onClick={exportData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaFileExport className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Sumar financiar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaMoneyBillWave className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Venituri Brute</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaCreditCard className="text-red-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Comisioane Netopia</p>
                <p className="text-xl font-bold text-red-600">
                  -{formatCurrency(summary.totalFees)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaChartLine className="text-green-600 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Profit Net</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(summary.netIncome)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="text-purple-600 text-2xl mr-3">📊</div>
              <div>
                <p className="text-sm text-gray-600">Tranzacții</p>
                <p className="text-xl font-bold text-purple-600">
                  {summary.transactionCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="text-orange-600 text-2xl mr-3">💰</div>
              <div>
                <p className="text-sm text-gray-600">Comandă Medie</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(summary.averageOrder)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel detaliat */}
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              Nu s-au găsit tranzacții pentru perioada selectată.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Comandă</th>
                  <th className="py-3 px-4 text-right">Sumă Brută</th>
                  <th className="py-3 px-4 text-right">Comision Netopia</th>
                  <th className="py-3 px-4 text-right">Sumă Netă</th>
                  <th className="py-3 px-4 text-center">Data Settlement</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-left">Client</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        #{payment.orderNumber}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="text-sm text-red-600">
                        -{formatCurrency(payment.netopiaFee)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(payment.netAmount)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.settlementDate)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          payment.status === "settled"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status === "settled"
                          ? "Încasat"
                          : payment.status === "pending"
                            ? "În așteptare"
                            : "Eșuat"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">
                        {payment.customerEmail}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Informații importante */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-bold text-blue-900 mb-2">
            ℹ️ Informații importante:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Settlement period:</strong> T+3 zile lucrătoare
            </li>
            <li>
              • <strong>Comision Netopia:</strong> ~3% + 1 RON per tranzacție
            </li>
            <li>
              • <strong>Suma minimă settlement:</strong> 100 RON
            </li>
            <li>
              • <strong>Transfer automat</strong> către IBAN-ul configurat în
              Netopia
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancialDashboard;
