import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import {
  Settlement,
  SettlementUI,
  SettlementType,
} from "../../types/accounting";
import { AccountingService } from "../../services/accountingService";
import DocumentUpload from "./DocumentUpload";

interface SettlementPanelProps {
  canEdit: boolean;
}

const SettlementPanel: React.FC<SettlementPanelProps> = ({ canEdit }) => {
  const [settlements, setSettlements] = useState<SettlementUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSettlement, setEditingSettlement] =
    useState<SettlementUI | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<SettlementType | "">("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    try {
      const data = await AccountingService.getSettlements();
      setSettlements(
        data.map((s) => ({
          ...s,
          startDate: s.date ? s.date.toISOString().split("T")[0] : "",
          endDate: s.date ? s.date.toISOString().split("T")[0] : "",
          description: (s as SettlementUI).description || "",
          employeeName: (s as SettlementUI).employeeName || "",
          employeeId: (s as SettlementUI).employeeId || "",
          expenseDetails: Array.isArray((s as SettlementUI).expenseDetails)
            ? (s as SettlementUI).expenseDetails
            : [],
          status: (s as SettlementUI).status || "pending",
          notes: (s as SettlementUI).notes || "",
        }))
      );
    } catch (error) {
      console.error("Error loading settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSettlement = async (
    formData: Omit<SettlementUI, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const payload: Omit<Settlement, "id" | "createdAt" | "updatedAt"> = {
        ...formData,
        date: formData.startDate ? new Date(formData.startDate) : new Date(),
        cashRegisterId: formData.cashRegisterId,
        totalAmount: formData.totalAmount,
        bankDeposit: formData.bankDeposit,
        remainingCash: formData.remainingCash,
        notes: formData.notes,
        attachments: undefined,
        createdBy: formData.createdBy,
      };
      await AccountingService.createSettlement(payload);
      await loadSettlements();
      setShowForm(false);
    } catch (error) {
      console.error("Error creating settlement:", error);
    }
  };

  const handleUpdateSettlement = async (
    id: string | undefined,
    formData: Partial<SettlementUI>
  ) => {
    if (!id) return;
    try {
      const payload: Partial<Settlement> = {
        ...formData,
        date: formData.startDate ? new Date(formData.startDate) : undefined,
        // do not include startDate/endDate, not in Settlement
      };
      await AccountingService.updateSettlement(id, payload);
      await loadSettlements();
      setEditingSettlement(null);
    } catch (error) {
      console.error("Error updating settlement:", error);
    }
  };

  const handleDeleteSettlement = async (id?: string) => {
    if (!id) return;
    if (window.confirm("Sigur doriți să ștergeți această decontare?")) {
      try {
        await AccountingService.deleteSettlement(id);
        await loadSettlements();
      } catch (error) {
        console.error("Error deleting settlement:", error);
      }
    }
  };

  const filteredSettlements = settlements.filter((settlement) => {
    const matchesSearch =
      (settlement.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (settlement.employeeName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || settlement.type === typeFilter;
    const matchesDate =
      (!dateFilter.start ||
        new Date(settlement.startDate || "1970-01-01") >=
          new Date(dateFilter.start)) &&
      (!dateFilter.end ||
        new Date(settlement.endDate || "2100-01-01") <=
          new Date(dateFilter.end));
    return matchesSearch && matchesType && matchesDate;
  });

  const getTypeLabel = (type: SettlementType) => {
    switch (type) {
      case "daily":
        return "Zilnic";
      case "weekly":
        return "Săptămânal";
      case "monthly":
        return "Lunar";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-800">Decontări</h2>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Decontare nouă
          </button>
        )}
      </div>

      {/* Print button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => window.print()}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Printează
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Căutare
            </label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Căutați după descriere sau angajat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="Căutare după descriere sau angajat"
                aria-label="Căutare"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tip
            </label>{" "}
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as SettlementType | "")
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrează după tip"
              title="Selectează tipul pentru filtrare"
            >
              <option value="">Toate tipurile</option>
              <option value="daily">Zilnic</option>
              <option value="weekly">Săptămânal</option>
              <option value="monthly">Lunar</option>
            </select>
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
              title="Data de început pentru filtrare"
              aria-label="Data de început"
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
              title="Data de sfârșit pentru filtrare"
              aria-label="Data de sfârșit"
            />
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perioada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tip
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Angajat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sumă totală
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSettlements.map((settlement) => (
              <tr
                key={settlement.id || Math.random()}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">
                      {settlement.startDate
                        ? new Date(settlement.startDate).toLocaleDateString(
                            "ro-RO"
                          )
                        : "-"}{" "}
                      -{" "}
                      {settlement.endDate
                        ? new Date(settlement.endDate).toLocaleDateString(
                            "ro-RO"
                          )
                        : "-"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {settlement.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getTypeLabel(settlement.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {settlement.employeeName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {settlement.totalAmount.toFixed(2)} RON
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(settlement.status || "pending")}`}
                  >
                    {settlement.status === "pending"
                      ? "În așteptare"
                      : settlement.status === "approved"
                        ? "Aprobat"
                        : settlement.status === "rejected"
                          ? "Respins"
                          : settlement.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingSettlement(settlement)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Vizualizare detalii"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => setEditingSettlement(settlement)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editare"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSettlement(settlement.id)}
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

        {filteredSettlements.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nu au fost găsite decontări.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showForm || editingSettlement) && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <SettlementForm
            settlement={editingSettlement}
            canEdit={canEdit}
            onSave={
              editingSettlement
                ? (data) => handleUpdateSettlement(editingSettlement.id!, data)
                : handleCreateSettlement
            }
            onCancel={() => {
              setShowForm(false);
              setEditingSettlement(null);
            }}
            loadSettlements={loadSettlements} // Pass as prop
          />
        </div>
      )}
    </div>
  );
};

// Form component for creating/editing settlements
interface SettlementFormProps {
  settlement?: SettlementUI | null;
  canEdit: boolean;
  onSave: (data: Omit<SettlementUI, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  loadSettlements: () => Promise<void>; // Add this prop
}

const SettlementForm: React.FC<SettlementFormProps> = ({
  settlement,
  canEdit,
  onSave,
  onCancel,
  loadSettlements, // Destructure here
}) => {
  const [formData, setFormData] = useState<
    Omit<SettlementUI, "id" | "createdAt" | "updatedAt">
  >({
    date: settlement?.date || new Date(),
    type: settlement?.type || ("daily" as SettlementType),
    startDate: settlement?.startDate || new Date().toISOString().split("T")[0],
    endDate: settlement?.endDate || new Date().toISOString().split("T")[0],
    employeeName: settlement?.employeeName || "",
    employeeId: settlement?.employeeId || "",
    description: settlement?.description || "",
    totalAmount: settlement?.totalAmount || 0,
    expenseDetails: Array.isArray(settlement?.expenseDetails)
      ? settlement.expenseDetails
      : [],
    status: settlement?.status || "pending",
    notes: settlement?.notes || "",
    cashRegisterId: settlement?.cashRegisterId || "",
    bankDeposit: settlement?.bankDeposit || 0,
    remainingCash: settlement?.remainingCash || 0,
    createdBy: settlement?.createdBy || "",
  });

  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: 0,
    receiptNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Fix expenseDetails always as array
  const addExpense = () => {
    if (newExpense.category && newExpense.amount > 0) {
      setFormData((prev) => ({
        ...prev,
        expenseDetails: [...(prev.expenseDetails || []), { ...newExpense }],
        totalAmount: prev.totalAmount + newExpense.amount,
      }));
      setNewExpense({
        category: "",
        description: "",
        amount: 0,
        receiptNumber: "",
      });
    }
  };
  const removeExpense = (index: number) => {
    const expense = (formData.expenseDetails || [])[index];
    setFormData((prev) => ({
      ...prev,
      expenseDetails: (prev.expenseDetails || []).filter((_, i) => i !== index),
      totalAmount: prev.totalAmount - (expense?.amount || 0),
    }));
  };

  const isReadOnly = !canEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {settlement
            ? canEdit
              ? "Editare decontare"
              : "Vizualizare decontare"
            : "Decontare nouă"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip decontare
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as SettlementType,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                title="Tip decontare"
                aria-label="Tip decontare"
              >
                <option value="daily">Zilnic</option>
                <option value="weekly">Săptămânal</option>
                <option value="monthly">Lunar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isReadOnly}
                title="Status decontare"
                aria-label="Status decontare"
              >
                <option value="pending">În așteptare</option>
                <option value="approved">Aprobat</option>
                <option value="rejected">Respins</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data început
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Data început decontare"
                title="Data început decontare"
                aria-label="Data început decontare"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data sfârșit
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Data sfârșit decontare"
                title="Data sfârșit decontare"
                aria-label="Data sfârșit decontare"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume angajat
              </label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employeeName: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                title="Nume angajat"
                aria-label="Nume angajat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID angajat
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employeeId: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                title="ID angajat"
                aria-label="ID angajat"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descriere
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={isReadOnly}
              title="Descriere"
              aria-label="Descriere"
            />
          </div>

          {/* Expense Details */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">
              Detalii cheltuieli
            </h4>

            {canEdit && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Categoria"
                    value={newExpense.category}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    title="Categoria cheltuielii"
                    aria-label="Categoria cheltuielii"
                  />
                  <input
                    type="text"
                    placeholder="Descriere"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    title="Descriere cheltuielii"
                    aria-label="Descriere cheltuielii"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Suma"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    title="Sumă cheltuială"
                    aria-label="Sumă cheltuială"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Nr. chitanță"
                      value={newExpense.receiptNumber}
                      onChange={(e) =>
                        setNewExpense((prev) => ({
                          ...prev,
                          receiptNumber: e.target.value,
                        }))
                      }
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      title="Număr chitanță"
                      aria-label="Număr chitanță"
                    />{" "}
                    <button
                      type="button"
                      onClick={addExpense}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      aria-label="Adaugă cheltuială"
                      title="Adaugă o cheltuială nouă"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {(formData.expenseDetails || []).map((expense, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {expense.category} - {expense.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      Suma: {expense.amount.toFixed(2)} RON
                      {expense.receiptNumber &&
                        ` | Chitanța: ${expense.receiptNumber}`}
                    </div>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => removeExpense(index)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Șterge cheltuială"
                      title="Șterge această cheltuială"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              {(formData.expenseDetails || []).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Nu au fost adăugate cheltuieli
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">
                Total: {formData.totalAmount.toFixed(2)} RON
              </div>
            </div>
          </div>

          {/* Document attachments */}
          {settlement?.id && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-800 mb-2">
                Documente atașate
              </h4>
              <DocumentUpload
                documentType="settlement"
                attachments={settlement.attachments || []}
                canEdit={canEdit}
                onUpload={async (files) => {
                  await AccountingService.uploadSettlementAttachments(
                    settlement.id!,
                    files
                  );
                  await loadSettlements();
                }}
                onDelete={async (id) => {
                  await AccountingService.deleteSettlementAttachment(
                    settlement.id!,
                    id
                  );
                  await loadSettlements();
                }}
                onView={(attachment) => window.open(attachment.url, "_blank")}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observații
            </label>{" "}
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isReadOnly}
              placeholder="Adaugă observații pentru această decontare"
              title="Observații pentru decontare"
              aria-label="Observații pentru decontare"
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
                {settlement ? "Actualizare" : "Creare"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettlementPanel;
