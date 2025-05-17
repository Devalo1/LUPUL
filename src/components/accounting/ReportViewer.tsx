import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AccountingService } from "../../services/accounting/accountingService";
import { FinancialReport, ReportType } from "../../types/accounting";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { FaFilePdf, FaFileCsv, FaPrint, FaArrowLeft } from "react-icons/fa";
import { Timestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

const ReportViewer = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reportId) {
      loadReport(reportId);
    }
  }, [reportId]);

  const loadReport = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const reportData = await AccountingService.getReportById(id);
      if (reportData) {
        setReport(reportData);
      } else {
        setError("Raportul nu a fost găsit.");
      }
    } catch (err) {
      setError("A apărut o eroare la încărcarea raportului.");
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeLabel = (type: ReportType): string => {
    switch (type) {
      case "profit_loss":
        return "Raport Profit și Pierdere";
      case "tax":
        return "Raport Fiscal";
      case "cash_flow":
        return "Raport Flux de Numerar";
      default:
        return type;
    }
  };

  const formatDate = (date: Date | Timestamp | string | any): string => {
    return format(ensureDate(date), "PP", { locale: ro });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON"
    }).format(amount);
  };

  const handlePrint = async (): Promise<void> => {
    const originalContent = document.body.innerHTML;
    const printContent = reportRef.current?.innerHTML || "";

    document.body.innerHTML = `
      <div class="print-container">
        <h1>${report?.title || getReportTypeLabel(report?.type || "profit_loss")}</h1>
        <p>Perioada: ${report ? formatDate(report.startDate) : ""} - ${report ? formatDate(report.endDate) : ""}</p>
        <p>Generat: ${report ? formatDate(report.createdAt) : ""}</p>
        ${printContent}
      </div>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    return Promise.resolve(); // Explicit return to satisfy Promise<void>
  };

  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = "";
    
    csvContent += `"${getReportTypeLabel(report.type)}"\n`;
    csvContent += `"Perioada: ${formatDate(report.startDate)} - ${formatDate(report.endDate)}"\n\n`;
    
    csvContent += "\"Rezumat:\"\n";
    csvContent += `"Total Venituri","${report.summary.totalIncome}"\n`;
    csvContent += `"Total Cheltuieli","${report.summary.totalExpense}"\n`;
    csvContent += `"Profit Net","${report.summary.netProfit}"\n\n`;
    
    if (report.type === "profit_loss") {
      csvContent += "\"Venituri pe categorii:\"\n";
      for (const [category, amount] of Object.entries(report.summary.incomeByCategory)) {
        csvContent += `"${category}","${amount}"\n`;
      }
      csvContent += "\n";
      
      csvContent += "\"Cheltuieli pe categorii:\"\n";
      for (const [category, amount] of Object.entries(report.summary.expenseByCategory)) {
        csvContent += `"${category}","${amount}"\n`;
      }
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${report.title || "report"}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async (): Promise<void> => {
    if (!report || !reportRef.current) return;

    try {
      // Show loading indicator
      setLoading(true);
      
      // Get report title and date for the PDF filename
      const reportTitle = report.title || getReportTypeLabel(report.type);
      const dateStr = new Date().toISOString().split("T")[0];
      
      // Create a temporary div that includes the header info for the PDF
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="text-align: center; color: #333;">${reportTitle}</h1>
          <p style="text-align: center;">Perioada: ${formatDate(report.startDate)} - ${formatDate(report.endDate)}</p>
          <p style="text-align: center;">Generat: ${formatDate(report.createdAt)}</p>
        </div>
      `;
      
      // Append the report content
      const reportClone = reportRef.current.cloneNode(true) as HTMLElement;
      tempDiv.appendChild(reportClone);
      
      // Append to the body temporarily (needed for html2canvas to work properly)
      document.body.appendChild(tempDiv);
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false
      });
      
      // Remove the temporary element
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = canvas.width / 4;
      const pdfHeight = canvas.height / 4;
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4"
      });
      
      // Calculate optimal PDF dimensions while maintaining aspect ratio
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let imgWidth = pageWidth - 20; // 10mm margin on each side
      let imgHeight = (imgWidth * canvas.height) / canvas.width;
      
      // If image height exceeds page height, scale down
      if (imgHeight > pageHeight - 20) {
        imgHeight = pageHeight - 20;
        imgWidth = (imgHeight * canvas.width) / canvas.height;
      }
      
      // Center the image horizontally
      const xPos = (pageWidth - imgWidth) / 2;
      
      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", xPos, 10, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`${reportTitle.replace(/\s+/g, "_")}_${dateStr}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("A apărut o eroare la exportul PDF");
    } finally {
      setLoading(false);
    }
  };

  const renderProfitLossReport = () => {
    if (!report || report.type !== "profit_loss") return null;
    const data = report.data as {
      revenues: any[];
      expenses: any[];
      netProfit: number;
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-semibold text-lg mb-3">Rezumat</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Total Venituri</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(report.summary.totalIncome)}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Total Cheltuieli</p>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(report.summary.totalExpense)}</p>
            </div>
            <div className={`p-3 rounded-md ${report.summary.netProfit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
              <p className="text-sm text-gray-600">Profit Net</p>
              <p className={`text-lg font-semibold ${report.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(report.summary.netProfit)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Venituri pe categorii</h4>
            {Object.keys(report.summary.incomeByCategory).length > 0 ? (
              <div className="bg-white rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {Object.entries(report.summary.incomeByCategory).map(([category, amount]) => (
                    <li key={category} className="px-4 py-3 flex justify-between">
                      <span>{category}</span>
                      <span className="font-semibold">{formatCurrency(amount as number)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 italic">Nu există date despre venituri.</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Cheltuieli pe categorii</h4>
            {Object.keys(report.summary.expenseByCategory).length > 0 ? (
              <div className="bg-white rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {Object.entries(report.summary.expenseByCategory).map(([category, amount]) => (
                    <li key={category} className="px-4 py-3 flex justify-between">
                      <span>{category}</span>
                      <span className="font-semibold">{formatCurrency(amount as number)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 italic">Nu există date despre cheltuieli.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTaxReport = () => {
    if (!report || report.type !== "tax") return null;
    const data = report.data as {
      taxableIncome: number;
      deductions: number;
      estimatedTax: number;
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-semibold text-lg mb-3">Rezumat Fiscal</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Venit Impozabil</p>
              <p className="text-lg font-semibold text-blue-600">{formatCurrency(data.taxableIncome)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Deduceri</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(data.deductions)}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Impozit Estimat</p>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(data.estimatedTax)}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold text-lg mb-3 text-yellow-800">Notă Importantă</h4>
          <p className="text-yellow-800">
            Acest raport este doar o estimare și nu înlocuiește sfatul unui contabil profesionist. 
            Consultați un expert contabil pentru determinarea exactă a obligațiilor fiscale.
          </p>
        </div>
      </div>
    );
  };

  const renderCashFlowReport = () => {
    if (!report || report.type !== "cash_flow") return null;
    const data = report.data as {
      transactionsByDate: Record<string, any[]>;
      openingBalance: number;
      closingBalance: number;
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-semibold text-lg mb-3">Rezumat Flux de Numerar</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Sold Inițial</p>
              <p className="text-lg font-semibold text-blue-600">{formatCurrency(data.openingBalance)}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Flux Net</p>
              <p className="text-lg font-semibold text-purple-600">
                {formatCurrency(data.closingBalance - data.openingBalance)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Sold Final</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(data.closingBalance)}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-3">Flux Zilnic</h4>
          {Object.keys(data.transactionsByDate).length > 0 ? (
            <div className="bg-white rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dată
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tranzacții
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intrări
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ieșiri
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(data.transactionsByDate).map(([date, transactions]) => {
                    const income = transactions
                      .filter(t => t.type === "income")
                      .reduce((sum, t) => sum + t.amount, 0);
                      
                    const expense = transactions
                      .filter(t => t.type === "expense")
                      .reduce((sum, t) => sum + t.amount, 0);
                      
                    const net = income - expense;
                    
                    return (
                      <tr key={date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(new Date(date))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transactions.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                          {formatCurrency(income)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                          {formatCurrency(expense)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(net)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">Nu există date despre tranzacții.</p>
          )}
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    if (!report) return null;

    switch (report.type) {
      case "profit_loss":
        return renderProfitLossReport();
      case "tax":
        return renderTaxReport();
      case "cash_flow":
        return renderCashFlowReport();
      default:
        return <p>Tipul de raport nu este suportat.</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <h3 className="text-xl font-bold mb-2">Eroare</h3>
        <p>{error}</p>
        <button 
          onClick={() => navigate("/admin/accounting/reports")}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Înapoi la Rapoarte
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
        <h3 className="text-xl font-bold mb-2">Raport negăsit</h3>
        <p>Raportul solicitat nu a fost găsit.</p>
        <button 
          onClick={() => navigate("/admin/accounting/reports")}
          className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
        >
          Înapoi la Rapoarte
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/admin/accounting/reports")}
            className="mr-4 text-gray-600 hover:text-gray-800"
            aria-label="Înapoi"
          >
            <FaArrowLeft size={18} />
          </button>
          <h2 className="text-2xl font-bold">{getReportTypeLabel(report.type)}</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            title="Exportă CSV"
          >
            <FaFileCsv className="mr-1" /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
            title="Exportă PDF"
          >
            <FaFilePdf className="mr-1" /> PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            title="Printează raport"
          >
            <FaPrint className="mr-1" /> Print
          </button>
        </div>
      </div>

      <div className="mb-6 bg-gray-100 p-4 rounded-md">
        <p className="text-gray-700">
          <span className="font-semibold">Perioada:</span> {formatDate(report.startDate)} - {formatDate(report.endDate)}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Generat:</span> {formatDate(report.createdAt)}
        </p>
      </div>

      <div className="print-container" ref={reportRef}>
        <div className="print-header" style={{ display: "none" }}>
          <h1>{getReportTypeLabel(report.type)}</h1>
          <p>Perioada: {formatDate(report.startDate)} - {formatDate(report.endDate)}</p>
          <p>Generat: {formatDate(report.createdAt)}</p>
        </div>
        
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportViewer;