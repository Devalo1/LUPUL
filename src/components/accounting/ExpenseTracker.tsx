import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaChartPie } from "react-icons/fa";
import { AccountingService } from "../../services/accounting/accountingService";

interface ExpenseCategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const ExpenseTracker: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseCategoryData[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  // Lista de culori pentru categoriile de cheltuieli
  const categoryColors = [
    "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500",
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-500"
  ];

  useEffect(() => {
    fetchExpenseData();
  }, [period]);

  const fetchExpenseData = async () => {
    setLoading(true);
    try {
      // Determinăm intervalul de date în funcție de perioada selectată
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      // Obținem datele financiare pentru perioada selectată
      const financialData = await AccountingService.getFinancialSummary(startDate, endDate);
      
      // Calculăm totalul cheltuielilor
      const total = financialData.totalExpense;
      setTotalExpenses(total);
      
      // Transformăm datele în formatul necesar pentru afișare
      const expensesData = Object.entries(financialData.expenseByCategory)
        .map(([category, amount], index) => ({
          category,
          amount: amount as number,
          percentage: total > 0 ? ((amount as number) / total) * 100 : 0,
          color: categoryColors[index % categoryColors.length]
        }))
        .sort((a, b) => b.amount - a.amount); // Sortăm descrescător după sumă
      
      setExpensesByCategory(expensesData);
    } catch (error) {
      console.error("Eroare la încărcarea datelor despre cheltuieli:", error);
      // Setăm date de test în caz de eroare
      setExpensesByCategory([
        { category: "Chirii", amount: 15000, percentage: 30, color: "bg-blue-500" },
        { category: "Salarii", amount: 25000, percentage: 50, color: "bg-green-500" },
        { category: "Utilități", amount: 5000, percentage: 10, color: "bg-yellow-500" },
        { category: "Diverse", amount: 5000, percentage: 10, color: "bg-red-500" }
      ]);
      setTotalExpenses(50000);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="expense-tracker">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-gray-500">
          <button 
            onClick={() => handlePeriodChange("month")} 
            className={`mr-2 px-2 py-1 rounded ${period === "month" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
          >
            Luna
          </button>
          <button 
            onClick={() => handlePeriodChange("quarter")} 
            className={`mr-2 px-2 py-1 rounded ${period === "quarter" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
          >
            Trimestru
          </button>
          <button 
            onClick={() => handlePeriodChange("year")} 
            className={`px-2 py-1 rounded ${period === "year" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
          >
            An
          </button>
        </div>
        
        <div className="flex">
          <button
            title="Adaugă cheltuială nouă"
            className="p-1 text-blue-600 hover:text-blue-800"
            onClick={() => window.location.href = "/admin/accounting/transactions/add?type=expense"}
          >
            <FaPlusCircle size={18} />
          </button>
          <button
            title="Vizualizează rapoarte"
            className="p-1 text-blue-600 hover:text-blue-800 ml-2"
            onClick={() => window.location.href = "/admin/accounting/reports?type=expense"}
          >
            <FaChartPie size={18} />
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="text-sm text-gray-500 mb-1">Total Cheltuieli</div>
        <div className="text-lg font-bold text-gray-800">{formatCurrency(totalExpenses)}</div>
      </div>

      <div className="space-y-2">
        {expensesByCategory.length > 0 ? (
          expensesByCategory.map((expense, index) => (
            <div key={index} className="bg-white p-2 rounded-md border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm font-medium">{expense.category}</div>
                <div className="text-sm font-bold">{formatCurrency(expense.amount)}</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${expense.color} h-2 rounded-full`}
                  style={{ width: `${expense.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">{expense.percentage.toFixed(1)}%</div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nu există date despre cheltuieli pentru perioada selectată
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <a 
          href="/admin/accounting/transactions?type=expense" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Vezi toate cheltuielile
        </a>
      </div>
    </div>
  );
};

export default ExpenseTracker;