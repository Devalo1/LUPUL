import React, { useState, useEffect } from "react";
import { AccountingService } from "../../services/accounting/accountingService";
import { FinancialReport, ReportType } from "../../types/accounting";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";

// Helper function to convert Firebase timestamp or ISO string to Date
const ensureDate = (dateInput: Date | Timestamp | string | any): Date => {
  if (dateInput instanceof Date) {
    return dateInput;
  } else if (dateInput && typeof dateInput === "object" && "seconds" in dateInput) {
    // Handle Firebase Timestamp
    return new Date(dateInput.seconds * 1000);
  } else if (typeof dateInput === "string") {
    // Handle ISO string
    return new Date(dateInput);
  }
  // Default fallback
  return new Date();
};

const Reports = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<FinancialReport[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState<ReportType>("profit_loss");
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const navigate = useNavigate();

  // Load saved reports on component mount
  useEffect(() => {
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const reports = await AccountingService.getSavedReports();
      setSavedReports(reports);
    } catch (err) {
      setError("Could not load saved reports.");
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setError(null);
    
    try {
      const report = await AccountingService.generateReport(
        reportType,
        startDate,
        endDate
      );
      
      // Save the report
      const reportId = await AccountingService.saveReport(report);
      
      // Navigate to the report view
      navigate(`/admin/accounting/reports/${reportId}`);
    } catch (err) {
      setError("Could not generate report.");
      console.error("Error generating report:", err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const getReportTypeLabel = (type: ReportType): string => {
    switch (type) {
      case "profit_loss":
        return "Profit și Pierdere";
      case "tax":
        return "Raport Fiscal";
      case "cash_flow":
        return "Flux de Numerar";
      default:
        return type;
    }
  };

  const formatDate = (date: Date | Timestamp | string | any): string => {
    return format(ensureDate(date), "PP", { locale: ro });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Rapoarte Financiare</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Generează un raport nou</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip Raport
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="profit_loss">Profit și Pierdere</option>
                <option value="tax">Raport Fiscal</option>
                <option value="cash_flow">Flux de Numerar</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de început
              </label>
              <input
                type="date"
                value={startDate.toISOString().split("T")[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de sfârșit
              </label>
              <input
                type="date"
                value={endDate.toISOString().split("T")[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {generatingReport ? "Se generează..." : "Generează Raport"}
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-4">Rapoarte Salvate</h3>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : savedReports.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-md text-gray-700 text-center">
              Nu există rapoarte salvate.
            </div>
          ) : (
            <div className="bg-gray-50 rounded-md">
              <ul className="divide-y divide-gray-200">
                {savedReports.map((report) => (
                  <li key={report.id} className="p-4 hover:bg-gray-100 cursor-pointer" onClick={() => navigate(`/admin/accounting/reports/${report.id}`)}>
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-semibold">{report.title || getReportTypeLabel(report.type)}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(report.startDate)} - {formatDate(report.endDate)}
                        </p>
                      </div>
                      <div className="text-sm text-blue-600">Vezi detalii</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-4 text-center">
                <button 
                  onClick={fetchSavedReports}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reîncarcă lista de rapoarte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;