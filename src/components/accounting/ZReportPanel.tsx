import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import { ZReport, ZReportUI } from "../../types/accounting";
import { AccountingService } from "../../services/accountingService";

interface ZReportPanelProps {
  canEdit: boolean;
}

const ZReportPanel: React.FC<ZReportPanelProps> = ({ canEdit }) => {
  const [reports, setReports] = useState<ZReportUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<ZReportUI | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await AccountingService.getZReports();
      setReports(
        (data as ZReport[]).map((report) => {
          const uiFields =
            typeof report === "object"
              ? (report as unknown as Partial<ZReportUI>)
              : {};
          let dateString = "";
          if (report.date instanceof Date) {
            dateString = report.date.toISOString().split("T")[0];
          } else if (typeof report.date === "string") {
            dateString = report.date;
          }
          return {
            id: report.id,
            date: dateString,
            cashRegisterId: report.cashRegisterId,
            cashRegisterName: report.cashRegisterName,
            openingAmount: report.openingAmount,
            totalSales: report.totalSales,
            totalDiscounts: report.totalDiscounts,
            totalRefunds: report.totalRefunds,
            totalCash: report.totalCash,
            totalCard: report.totalCard,
            totalOther: report.totalOther,
            closingAmount: report.closingAmount,
            difference: report.difference,
            transactions: report.transactions,
            createdBy: report.createdBy,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            operatorName: uiFields.operatorName || "",
            startingCash: uiFields.startingCash ?? 0,
            endingCash: uiFields.endingCash ?? 0,
            totalVAT: uiFields.totalVAT ?? 0,
            reportNumber: uiFields.reportNumber || "",
            notes: uiFields.notes || "",
          };
        })
      );
    } catch (error) {
      console.error("Error loading Z reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm("Sigur doriți să ștergeți acest raport Z?")) {
      try {
        await AccountingService.deleteZReport(id);
        await loadReports();
      } catch (error) {
        console.error("Error deleting Z report:", error);
      }
    }
  };

  // UI handler: date is string for UI, convert to Date for backend
  const handleCreateReportUI = (
    formData: Omit<ZReportUI, "id" | "createdAt" | "updatedAt">
  ) => {
    const backendData: Omit<ZReport, "id" | "createdAt" | "updatedAt"> = {
      ...formData,
      date: new Date(formData.date), // string to Date
    };
    AccountingService.createZReport(backendData).then(() => {
      loadReports();
      setShowForm(false);
    });
  };

  const handleUpdateReportUI = (
    formData: Omit<ZReportUI, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingReport && editingReport.id) {
      const backendData: Partial<ZReport> = {
        ...formData,
        date: new Date(formData.date), // string to Date
      };
      AccountingService.updateZReport(editingReport.id, backendData).then(
        () => {
          loadReports();
          setEditingReport(null);
        }
      );
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.cashRegisterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.operatorName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDate =
      (!dateFilter.start ||
        new Date(report.date) >= new Date(dateFilter.start)) &&
      (!dateFilter.end || new Date(report.date) <= new Date(dateFilter.end));

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rapoarte Z</h2>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Raport nou
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Căutare
            </label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Căutați după casa de marcat sau operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data început
            </label>
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, start: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Alegeți data de început"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data sfârșit
            </label>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Alegeți data de sfârșit"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Casa de marcat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total vânzări
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TVA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(report.date).toLocaleDateString("ro-RO")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.cashRegisterId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.operatorName || ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.totalSales.toFixed(2)} RON
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(report.totalVAT ?? 0).toFixed(2)} RON
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingReport(report)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Vizualizare detalii"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => setEditingReport(report)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editare"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id || "")}
                          className="text-red-600 hover:text-red-900"
                          title="Ștergere"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nu au fost găsite rapoarte Z.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showForm || editingReport) && (
        <ZReportForm
          report={editingReport}
          canEdit={canEdit}
          onSave={showForm ? handleCreateReportUI : handleUpdateReportUI}
          onCancel={() => {
            setShowForm(false);
            setEditingReport(null);
          }}
        />
      )}
    </div>
  );
};

// Form component for creating/editing Z reports
interface ZReportFormProps {
  report?: ZReportUI | null;
  canEdit: boolean;
  onSave: (data: Omit<ZReportUI, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const ZReportForm: React.FC<ZReportFormProps> = ({
  report,
  canEdit,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<
    Omit<ZReportUI, "id" | "createdAt" | "updatedAt">
  >({
    date:
      typeof report?.date === "string"
        ? report.date
        : report?.date
          ? new Date(report.date as unknown as Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
    cashRegisterId: report?.cashRegisterId || "",
    operatorName: report?.operatorName || "",
    startingCash: report?.startingCash ?? 0,
    totalSales: report?.totalSales || 0,
    totalVAT: report?.totalVAT ?? 0,
    endingCash: report?.endingCash ?? 0,
    reportNumber: report?.reportNumber || "",
    notes: report?.notes || "",
    cashRegisterName: report?.cashRegisterName || "",
    openingAmount: report?.openingAmount ?? 0,
    totalDiscounts: report?.totalDiscounts ?? 0,
    totalRefunds: report?.totalRefunds ?? 0,
    totalCash: report?.totalCash ?? 0,
    totalCard: report?.totalCard ?? 0,
    totalOther: report?.totalOther ?? 0,
    closingAmount: report?.closingAmount ?? 0,
    difference: report?.difference ?? 0,
    transactions: report?.transactions ?? [],
    createdBy: report?.createdBy || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isReadOnly = !canEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {report
            ? canEdit
              ? "Editare raport Z"
              : "Vizualizare raport Z"
            : "Raport Z nou"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Data raportului Z"
                title="Data raportului Z"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Casa de marcat
              </label>
              <input
                type="text"
                value={formData.cashRegisterId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cashRegisterId: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="ID casă de marcat"
                title="ID casă de marcat"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator
              </label>
              <input
                type="text"
                value={formData.operatorName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    operatorName: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Nume operator"
                title="Nume operator"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Număr raport
              </label>
              <input
                type="text"
                value={formData.reportNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reportNumber: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Număr raport Z"
                title="Număr raport Z"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numerar început (RON)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.startingCash}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startingCash: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Numerar început (RON)"
                title="Numerar început (RON)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numerar sfârșit (RON)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.endingCash}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endingCash: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Numerar sfârșit (RON)"
                title="Numerar sfârșit (RON)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total vânzări (RON)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.totalSales}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalSales: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Total vânzări (RON)"
                title="Total vânzări (RON)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total TVA (RON)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.totalVAT}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalVAT: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Total TVA (RON)"
                title="Total TVA (RON)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observații
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isReadOnly}
              placeholder="Observații raport Z"
              title="Observații raport Z"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              {canEdit ? "Anulare" : "Închidere"}
            </button>
            {canEdit && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {report ? "Actualizare" : "Creare"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZReportPanel;
