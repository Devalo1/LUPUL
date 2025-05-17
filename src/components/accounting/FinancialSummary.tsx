import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface FinancialSummaryData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingInvoices: number;
  pendingExpenses: number;
}

const FinancialSummary: React.FC = () => {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [summaryData, setSummaryData] = useState<FinancialSummaryData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstandingInvoices: 0,
    pendingExpenses: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSummaryData();
  }, [period]);

  const loadSummaryData = async () => {
    setLoading(true);
    try {
      // Simulăm încărcarea datelor pentru diferite perioade
      let now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // În implementarea reală, aici ar trebui să interogăm Firestore pentru date
      // financiare între startDate și now
      
      // Pentru acest exemplu, folosim date simulate
      let data: FinancialSummaryData = {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        outstandingInvoices: 0,
        pendingExpenses: 0
      };
      
      switch (period) {
        case "month":
          data = {
            totalRevenue: 75000,
            totalExpenses: 45000,
            netProfit: 30000,
            outstandingInvoices: 12000,
            pendingExpenses: 5000
          };
          break;
        case "quarter":
          data = {
            totalRevenue: 210000,
            totalExpenses: 130000,
            netProfit: 80000,
            outstandingInvoices: 25000,
            pendingExpenses: 8000
          };
          break;
        case "year":
          data = {
            totalRevenue: 850000,
            totalExpenses: 520000,
            netProfit: 330000,
            outstandingInvoices: 45000,
            pendingExpenses: 12000
          };
          break;
      }
      
      setSummaryData(data);
    } catch (error) {
      console.error("Eroare la încărcarea datelor financiare:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePeriodChange = (newPeriod: "month" | "quarter" | "year") => {
    setPeriod(newPeriod);
  };

  return (
    <div className="financial-summary">
      <div className="summary-header">
        <h4 className="font-semibold text-gray-700">Sumar Financiar</h4>
        
        <div className="period-selector">
          <button 
            className={`${period === "month" ? "active" : ""}`}
            onClick={() => handlePeriodChange("month")}
          >
            Luna
          </button>
          <button 
            className={`${period === "quarter" ? "active" : ""}`}
            onClick={() => handlePeriodChange("quarter")}
          >
            Trimestru
          </button>
          <button 
            className={`${period === "year" ? "active" : ""}`}
            onClick={() => handlePeriodChange("year")}
          >
            An
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="summary-content">
          <div className="summary-item revenue">
            <div className="item-label">Venituri Totale</div>
            <div className="item-value">{formatCurrency(summaryData.totalRevenue)}</div>
          </div>
          
          <div className="summary-item expenses">
            <div className="item-label">Cheltuieli Totale</div>
            <div className="item-value">{formatCurrency(summaryData.totalExpenses)}</div>
          </div>
          
          <div className="summary-item profit">
            <div className="item-label">Profit Net</div>
            <div className="item-value">{formatCurrency(summaryData.netProfit)}</div>
            <div className="flex items-center justify-end mt-1">
              <span className="text-xs text-green-600 flex items-center">
                <FaArrowUp className="mr-1" size={10} />
                8.2%
              </span>
              <span className="text-xs text-gray-400 ml-1">vs. perioada anterioară</span>
            </div>
          </div>
          
          <div className="summary-item">
            <div className="item-label">Facturi neîncasate</div>
            <div className="item-value">{formatCurrency(summaryData.outstandingInvoices)}</div>
            <div className="flex items-center justify-end mt-1">
              <span className="text-xs text-red-600 flex items-center">
                <FaArrowUp className="mr-1" size={10} />
                4.5%
              </span>
              <span className="text-xs text-gray-400 ml-1">vs. perioada anterioară</span>
            </div>
          </div>
          
          <div className="summary-item">
            <div className="item-label">Cheltuieli în așteptare</div>
            <div className="item-value">{formatCurrency(summaryData.pendingExpenses)}</div>
            <div className="flex items-center justify-end mt-1">
              <span className="text-xs text-green-600 flex items-center">
                <FaArrowDown className="mr-1" size={10} />
                2.3%
              </span>
              <span className="text-xs text-gray-400 ml-1">vs. perioada anterioară</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSummary;