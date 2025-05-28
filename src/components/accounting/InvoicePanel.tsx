import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2, Search, Download } from "lucide-react";
import {
  Invoice,
  InvoiceStatus,
  InvoiceUI,
  InvoiceItemUI,
} from "../../types/accounting";
import { AccountingService } from "../../services/accountingService";

interface InvoicePanelProps {
  canEdit: boolean;
}

const InvoicePanel: React.FC<InvoicePanelProps> = ({ canEdit }) => {
  const [invoices, setInvoices] = useState<InvoiceUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceUI | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  useEffect(() => {
    loadInvoices();
  }, []);

  // Helper to convert Invoice (backend) to InvoiceUI (UI state)
  const toInvoiceUI = (inv: Invoice): InvoiceUI => ({
    ...inv,
    date: inv.date instanceof Date ? inv.date.toISOString().split("T")[0] : "",
    dueDate:
      inv.dueDate instanceof Date
        ? inv.dueDate.toISOString().split("T")[0]
        : "",
    items: (inv.items || []).map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    })),
    description: (inv as unknown as { description?: string }).description || "",
    clientPhone: (inv as unknown as { clientPhone?: string }).clientPhone || "",
    taxRate: (inv as unknown as { taxRate?: number }).taxRate ?? 19,
  });

  const loadInvoices = async () => {
    try {
      const data = await AccountingService.getInvoices();
      setInvoices((data as Invoice[]).map(toInvoiceUI));
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert InvoiceUI (UI state) to Invoice (backend)
  const toInvoiceBackend = (
    ui: InvoiceUI
  ): Omit<Invoice, "id" | "createdAt" | "updatedAt"> => ({
    ...ui,
    date: new Date(ui.date),
    dueDate: new Date(ui.dueDate),
    items: ui.items.map((item) => {
      const { total: _total, ...rest } = item;
      return rest;
    }),
  });

  const handleCreateInvoice = async (
    formData: Omit<InvoiceUI, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Add required fields for backend
      const backendData = {
        ...toInvoiceBackend(formData as InvoiceUI),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await AccountingService.createInvoice(backendData as Invoice);
      await loadInvoices();
      setShowForm(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleUpdateInvoice = async (
    id: string | undefined,
    formData: Partial<InvoiceUI>
  ) => {
    if (!id) return;
    try {
      // Only send fields that are present, but convert date fields if present
      const backendData: Partial<Invoice> = {};
      if (formData.date) backendData.date = new Date(formData.date);
      if (formData.dueDate) backendData.dueDate = new Date(formData.dueDate);
      if (formData.items)
        backendData.items = formData.items.map((item) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { total: _total, ...rest } = item;
          return rest;
        });
      if (formData.status) backendData.status = formData.status;
      if (formData.clientName) backendData.clientName = formData.clientName;
      if (formData.clientEmail) backendData.clientEmail = formData.clientEmail;
      if (formData.clientAddress)
        backendData.clientAddress = formData.clientAddress;
      if (formData.subtotal !== undefined)
        backendData.subtotal = formData.subtotal;
      if (formData.taxAmount !== undefined)
        backendData.taxAmount = formData.taxAmount;
      if (formData.totalAmount !== undefined)
        backendData.totalAmount = formData.totalAmount;
      if (formData.notes) backendData.notes = formData.notes;
      if (formData.paymentMethod)
        backendData.paymentMethod = formData.paymentMethod;
      if (formData.paymentDate)
        backendData.paymentDate = new Date(formData.paymentDate);
      // Do not assign taxRate (not in Invoice)
      await AccountingService.updateInvoice(id, backendData);
      await loadInvoices();
      setEditingInvoice(null);
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  const handleDeleteInvoice = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm("Sigur doriți să ștergeți această factură?")) {
      try {
        await AccountingService.deleteInvoice(id);
        await loadInvoices();
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || invoice.status === statusFilter;

    const matchesDate =
      (!dateFilter.start ||
        new Date(invoice.date).getTime() >=
          new Date(dateFilter.start).getTime()) &&
      (!dateFilter.end ||
        new Date(invoice.date).getTime() <= new Date(dateFilter.end).getTime());

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case "draft":
        return "Ciornă";
      case "sent":
        return "Trimisă";
      case "paid":
        return "Plătită";
      case "overdue":
        return "Întârziată";
      case "cancelled":
        return "Anulată";
      default:
        return status;
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-yellow-100 text-yellow-800";
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
        <h2 className="text-2xl font-bold text-gray-800">Facturi</h2>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Factură nouă
          </button>
        )}
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
                placeholder="Căutați după număr, client sau descriere..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>{" "}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as InvoiceStatus | "")
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrează după status"
              title="Selectează statusul pentru filtrare"
            >
              <option value="">Toate statusurile</option>
              <option value="draft">Ciornă</option>
              <option value="sent">Trimisă</option>
              <option value="paid">Plătită</option>
              <option value="overdue">Întârziată</option>
              <option value="cancelled">Anulată</option>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Total facturi</div>
          <div className="text-2xl font-bold text-gray-800">
            {filteredInvoices.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Valoare totală</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredInvoices
              .reduce((sum, inv) => sum + inv.totalAmount, 0)
              .toFixed(2)}{" "}
            RON
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Plătite</div>
          <div className="text-2xl font-bold text-blue-600">
            {filteredInvoices.filter((inv) => inv.status === "paid").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">Întârziate</div>
          <div className="text-2xl font-bold text-red-600">
            {filteredInvoices.filter((inv) => inv.status === "overdue").length}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Număr factură
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data emiterii
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scadența
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valoare
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
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{invoice.clientName}</div>
                    <div className="text-gray-500 text-xs">
                      {invoice.clientEmail}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(invoice.date).toLocaleDateString("ro-RO")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString("ro-RO")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.totalAmount.toFixed(2)} RON
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
                  >
                    {getStatusLabel(invoice.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Vizualizare detalii"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900"
                      title="Descărcare PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => setEditingInvoice(invoice)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editare"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
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

        {filteredInvoices.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nu au fost găsite facturi.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showForm || editingInvoice) && (
        <InvoiceForm
          invoice={editingInvoice || undefined}
          canEdit={canEdit}
          onSave={(
            data:
              | Partial<InvoiceUI>
              | Omit<InvoiceUI, "id" | "createdAt" | "updatedAt">
          ) => {
            const safeData: InvoiceUI = {
              ...data,
              date:
                (data as InvoiceUI).date ||
                new Date().toISOString().split("T")[0],
              dueDate:
                (data as InvoiceUI).dueDate ||
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
              items: (data as InvoiceUI).items ?? [],
              status: (data as InvoiceUI).status || "draft",
              invoiceNumber: (data as InvoiceUI).invoiceNumber || "",
              clientName: (data as InvoiceUI).clientName || "",
              subtotal: (data as InvoiceUI).subtotal || 0,
              taxAmount: (data as InvoiceUI).taxAmount || 0,
              totalAmount: (data as InvoiceUI).totalAmount || 0,
              createdBy: (data as InvoiceUI).createdBy || "",
              description: (data as InvoiceUI).description || "",
              clientEmail: (data as InvoiceUI).clientEmail || "",
              clientAddress: (data as InvoiceUI).clientAddress || "",
              clientPhone: (data as InvoiceUI).clientPhone || "",
              taxRate: (data as InvoiceUI).taxRate ?? 19,
              notes: (data as InvoiceUI).notes || "",
              createdAt: (data as InvoiceUI).createdAt || new Date(),
              updatedAt: (data as InvoiceUI).updatedAt,
              id: (data as InvoiceUI).id,
            };
            if (editingInvoice) {
              handleUpdateInvoice(editingInvoice?.id, safeData);
            } else {
              handleCreateInvoice(
                safeData as Omit<InvoiceUI, "id" | "createdAt" | "updatedAt">
              );
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingInvoice(null);
          }}
        />
      )}
    </div>
  );
};

// Form component for creating/editing invoices
interface InvoiceFormProps {
  invoice?: InvoiceUI | null;
  canEdit: boolean;
  onSave: (
    data: Partial<InvoiceUI> | Omit<InvoiceUI, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = (props) => {
  const { invoice, canEdit, onSave, onCancel } = props;
  const [formData, setFormData] = useState<InvoiceUI>({
    invoiceNumber: invoice?.invoiceNumber || "",
    date: invoice?.date || new Date().toISOString().split("T")[0],
    dueDate:
      invoice?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    clientName: invoice?.clientName || "",
    clientEmail: invoice?.clientEmail || "",
    clientAddress: invoice?.clientAddress || "",
    clientPhone: invoice?.clientPhone || "",
    description: invoice?.description || "",
    items: (invoice?.items ?? []).map((item: InvoiceItemUI) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    })),
    subtotal: invoice?.subtotal || 0,
    taxRate: invoice?.taxRate || 19,
    taxAmount: invoice?.taxAmount || 0,
    totalAmount: invoice?.totalAmount || 0,
    status: invoice?.status || ("draft" as InvoiceStatus),
    notes: invoice?.notes || "",
    createdBy: invoice?.createdBy || "",
    createdAt: invoice?.createdAt || new Date(),
    updatedAt: invoice?.updatedAt,
    id: invoice?.id,
  });
  const [newItem, setNewItem] = useState<InvoiceItemUI>({
    id: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    amount: 0,
    total: 0,
  });
  const calculateTotals = (items: InvoiceItemUI[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * (formData.taxRate ?? 19)) / 100;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  const addItem = () => {
    if (newItem.description && newItem.quantity > 0 && newItem.unitPrice > 0) {
      const total = newItem.quantity * newItem.unitPrice;
      const updatedItems = [...formData.items, { ...newItem, total }];
      const totals = calculateTotals(updatedItems);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
        ...totals,
      }));
      setNewItem({
        id: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        amount: 0,
        total: 0,
      });
    }
  };
  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const totals = calculateTotals(updatedItems);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      ...totals,
    }));
  };
  const updateNewItemTotal = (quantity: number, unitPrice: number) => {
    setNewItem((prev) => ({
      ...prev,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    }));
  };
  const isReadOnly = !canEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {invoice
            ? canEdit
              ? "Editare factură"
              : "Vizualizare factură"
            : "Factură nouă"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Număr factură
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNumber: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Număr factură"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data emiterii
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
                placeholder="Data emiterii"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data scadenței
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Data scadenței"
              />
            </div>
          </div>

          {/* Client Information */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">
              Informații client
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume client
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientName: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isReadOnly}
                  placeholder="Nume client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email client
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientEmail: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isReadOnly}
                  placeholder="Email client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresă client
                </label>
                <input
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientAddress: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isReadOnly}
                  placeholder="Adresă client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon client
                </label>
                <input
                  type="text"
                  value={formData.clientPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientPhone: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isReadOnly}
                  placeholder="Telefon client"
                />
              </div>
            </div>
          </div>

          {/* Description and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Descriere factură"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as InvoiceStatus,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="Status factură"
              >
                <option value="draft">Ciornă</option>
                <option value="sent">Trimisă</option>
                <option value="paid">Plătită</option>
                <option value="overdue">Întârziată</option>
                <option value="cancelled">Anulată</option>
              </select>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">
              Articole factură
            </h4>

            {canEdit && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Descriere articol"
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Cantitate"
                    value={newItem.quantity}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 1;
                      updateNewItemTotal(quantity, newItem.unitPrice);
                    }}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Preț unitar"
                    value={newItem.unitPrice}
                    onChange={(e) => {
                      const unitPrice = parseFloat(e.target.value) || 0;
                      updateNewItemTotal(newItem.quantity, unitPrice);
                    }}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {newItem.total.toFixed(2)} RON
                    </span>{" "}
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      aria-label="Adaugă articol"
                      title="Adaugă articol nou la factură"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-gray-500">
                      {item.quantity} x {item.unitPrice.toFixed(2)} RON ={" "}
                      {item.total.toFixed(2)} RON
                    </div>
                  </div>{" "}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Șterge articol"
                      title="Șterge acest articol din factură"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              {formData.items.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Nu au fost adăugate articole
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formData.subtotal.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between">
                <span>TVA ({formData.taxRate}%):</span>
                <span>{formData.taxAmount.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formData.totalAmount.toFixed(2)} RON</span>
              </div>
            </div>
          </div>

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
              placeholder="Adaugă observații pentru această factură"
              title="Observații pentru factură"
              disabled={isReadOnly}
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
                {invoice ? "Actualizare" : "Creare"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoicePanel;
