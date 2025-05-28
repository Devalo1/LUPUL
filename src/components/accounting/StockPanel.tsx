import React, { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { Stock, StockMovement } from "../../types/accounting";
import { AccountingService } from "../../services/accountingService";

interface StockPanelProps {
  canEdit: boolean;
}

const StockPanel: React.FC<StockPanelProps> = ({ canEdit }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stocks" | "movements">("stocks");
  const [showStockForm, setShowStockForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stocksData, movementsData] = await Promise.all([
        AccountingService.getStock(),
        AccountingService.getStockMovements(),
      ]);
      setStocks(stocksData);
      setMovements(movementsData);
    } catch (error) {
      console.error("Error loading stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStock = async (
    formData: Omit<Stock, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await AccountingService.addStockItem({
        ...formData,
        createdBy: "admin", // TODO: Get from auth context
      });
      await loadData();
      setShowStockForm(false);
    } catch (error) {
      console.error("Error creating stock item:", error);
    }
  };

  const handleUpdateStock = async (id: string, formData: Partial<Stock>) => {
    try {
      await AccountingService.updateStockItem(id, formData);
      await loadData();
      setEditingStock(null);
    } catch (error) {
      console.error("Error updating stock item:", error);
    }
  };

  const handleDeleteStock = async (id: string) => {
    if (window.confirm("Sigur doriți să ștergeți acest articol din stoc?")) {
      try {
        await AccountingService.deleteStockItem(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting stock item:", error);
      }
    }
  };

  const handleCreateMovement = async (
    formData: Omit<StockMovement, "id" | "createdAt">
  ) => {
    try {
      await AccountingService.addStockMovement({
        ...formData,
        createdBy: "admin", // TODO: Get from auth context
        reason: formData.reference || "Manual entry",
        totalValue: formData.quantity * (formData.unitPrice || 0),
      });
      await loadData();
      setShowMovementForm(false);
    } catch (error) {
      console.error("Error creating stock movement:", error);
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || stock.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredMovements = movements.filter((movement) => {
    return movement.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const lowStockItems = stocks.filter(
    (stock) => stock.quantity <= stock.minimumLevel
  );
  const categories = [...new Set(stocks.map((stock) => stock.category))];

  const getStockStatusColor = (stock: Stock) => {
    if (stock.quantity <= stock.minimumLevel) return "text-red-600";
    if (stock.quantity <= stock.minimumLevel * 1.5) return "text-yellow-600";
    return "text-green-600";
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
        <h2 className="text-2xl font-bold text-gray-800">
          Gestiunea stocurilor
        </h2>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowStockForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Articol nou
            </button>
            <button
              onClick={() => setShowMovementForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Mișcare stoc
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Total articole</div>
              <div className="text-2xl font-bold text-gray-800">
                {stocks.length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Stoc redus</div>
              <div className="text-2xl font-bold text-red-600">
                {lowStockItems.length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Valoare totală</div>
              <div className="text-2xl font-bold text-green-600">
                {stocks
                  .reduce(
                    (sum, stock) => sum + stock.quantity * stock.unitPrice,
                    0
                  )
                  .toFixed(2)}{" "}
                RON
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Mișcări azi</div>
              <div className="text-2xl font-bold text-purple-600">
                {
                  movements.filter(
                    (m) =>
                      new Date(m.createdAt).toDateString() ===
                      new Date().toDateString()
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-red-800">
              Alertă stoc redus
            </h3>
          </div>
          <div className="text-red-700">
            Următoarele articole au stocul sub nivelul minim:
            <ul className="mt-2 space-y-1">
              {lowStockItems.slice(0, 5).map((item) => (
                <li key={item.id} className="text-sm">
                  • {item.name} - Stoc: {item.quantity}, Minim:{" "}
                  {item.minimumLevel}
                </li>
              ))}
              {lowStockItems.length > 5 && (
                <li className="text-sm">
                  • ... și încă {lowStockItems.length - 5} articole
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("stocks")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "stocks"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Stocuri
            </button>
            <button
              onClick={() => setActiveTab("movements")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "movements"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Mișcări stoc
            </button>
          </nav>
        </div>
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
                placeholder={
                  activeTab === "stocks"
                    ? "Căutați după nume sau SKU..."
                    : "Căutați după nume produs..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Căutare stocuri sau mișcări de stoc"
                title="Căutare stocuri sau mișcări de stoc"
              />
            </div>
          </div>
          {activeTab === "stocks" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie
              </label>{" "}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrează după categorie"
                title="Selectează categoria pentru filtrare"
              >
                <option value="">Toate categoriile</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "stocks" ? (
        <StocksTable
          stocks={filteredStocks}
          canEdit={canEdit}
          onEdit={setEditingStock}
          onDelete={handleDeleteStock}
          getStatusColor={getStockStatusColor}
        />
      ) : (
        <MovementsTable movements={filteredMovements} />
      )}

      {/* Forms */}
      {showStockForm && (
        <StockForm
          onSave={handleCreateStock}
          onCancel={() => setShowStockForm(false)}
          canEdit={canEdit}
        />
      )}

      {editingStock && (
        <StockForm
          stock={editingStock}
          onSave={(data) => handleUpdateStock(editingStock.id || "", data)}
          onCancel={() => setEditingStock(null)}
          canEdit={canEdit}
        />
      )}

      {showMovementForm && (
        <MovementForm
          stocks={stocks}
          onSave={handleCreateMovement}
          onCancel={() => setShowMovementForm(false)}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};

// Stocks Table Component
interface StocksTableProps {
  stocks: Stock[];
  canEdit: boolean;
  onEdit: (stock: Stock) => void;
  onDelete: (id: string) => void;
  getStatusColor: (stock: Stock) => string;
}

const StocksTable: React.FC<StocksTableProps> = ({
  stocks,
  canEdit,
  onEdit,
  onDelete,
  getStatusColor,
}) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Produs
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            SKU
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Categorie
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Stoc curent
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Preț unitar
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Valoare totală
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acțiuni
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {stocks.map((stock) => (
          <tr key={stock.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {stock.name}
                </div>
                <div className="text-sm text-gray-500">{stock.description}</div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {stock.sku}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {stock.category}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className={`font-medium ${getStatusColor(stock)}`}>
                {stock.quantity} {stock.unit}
              </div>
              <div className="text-xs text-gray-500">
                Min: {stock.minimumLevel}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {stock.unitPrice.toFixed(2)} RON
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {(stock.quantity * stock.unitPrice).toFixed(2)} RON
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(stock)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Vizualizare detalii"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {canEdit && (
                  <>
                    <button
                      onClick={() => onEdit(stock)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Editare"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(stock.id || "")}
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

    {stocks.length === 0 && (
      <div className="text-center py-8">
        <p className="text-gray-500">Nu au fost găsite articole în stoc.</p>
      </div>
    )}
  </div>
);

// Movements Table Component
interface MovementsTableProps {
  movements: StockMovement[];
}

const MovementsTable: React.FC<MovementsTableProps> = ({ movements }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Data
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Produs
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tip mișcare
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Cantitate
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Referință
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Observații
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {movements.map((movement) => (
          <tr key={movement.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {new Date(movement.createdAt).toLocaleDateString("ro-RO")}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {movement.productName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  movement.type === "in"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {movement.type === "in" ? "Intrare" : "Ieșire"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span
                className={
                  movement.type === "in" ? "text-green-600" : "text-red-600"
                }
              >
                {movement.type === "in" ? "+" : "-"}
                {movement.quantity}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {movement.reference || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {movement.notes || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {movements.length === 0 && (
      <div className="text-center py-8">
        <p className="text-gray-500">Nu au fost găsite mișcări de stoc.</p>
      </div>
    )}
  </div>
);

// Stock Form Component
interface StockFormProps {
  stock?: Stock;
  onSave: (data: Omit<Stock, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  canEdit: boolean;
}

const StockForm: React.FC<StockFormProps> = ({
  stock,
  onSave,
  onCancel,
  canEdit,
}) => {
  const [formData, setFormData] = useState({
    name: stock?.name || "",
    description: stock?.description || "",
    sku: stock?.sku || "",
    category: stock?.category || "",
    unit: stock?.unit || "buc",
    quantity: stock?.quantity || 0,
    minimumLevel: stock?.minimumLevel || 0,
    unitPrice: stock?.unitPrice || 0,
    supplier: stock?.supplier || "",
    location: stock?.location || "",
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      createdBy: "admin", // TODO: Get from auth context
    });
  };

  const isReadOnly = !canEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {stock
            ? canEdit
              ? "Editare articol"
              : "Vizualizare articol"
            : "Articol nou"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume produs
              </label>{" "}
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Introduceți numele produsului"
                title="Numele produsului"
                aria-label="Numele produsului"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>{" "}
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sku: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Introduceți codul SKU"
                title="Codul SKU al produsului"
                aria-label="Codul SKU al produsului"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descriere
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isReadOnly}
              placeholder="Descriere produs (opțional)"
              title="Descriere produs"
              aria-label="Descriere produs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Categorie produs"
                title="Categorie produs"
                aria-label="Categorie produs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unitate măsură
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isReadOnly}
                aria-label="Unitate de măsură"
                title="Selectează unitatea de măsură"
              >
                <option value="buc">Bucată</option>
                <option value="kg">Kilogram</option>
                <option value="l">Litru</option>
                <option value="m">Metru</option>
                <option value="set">Set</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preț unitar (RON)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    unitPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Preț unitar"
                title="Preț unitar"
                aria-label="Preț unitar"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantitate curentă
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Cantitate curentă"
                title="Cantitate curentă"
                aria-label="Cantitate curentă"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel minim
              </label>
              <input
                type="number"
                min="0"
                value={formData.minimumLevel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minimumLevel: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadOnly}
                placeholder="Nivel minim de stoc"
                title="Nivel minim de stoc"
                aria-label="Nivel minim de stoc"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Furnizor
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, supplier: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isReadOnly}
                placeholder="Furnizor (opțional)"
                title="Furnizor"
                aria-label="Furnizor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Locație
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isReadOnly}
                placeholder="Locație (opțional)"
                title="Locație"
                aria-label="Locație"
              />
            </div>
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
                {stock ? "Actualizare" : "Creare"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Movement Form Component
interface MovementFormProps {
  stocks: Stock[];
  onSave: (data: Omit<StockMovement, "id" | "createdAt">) => void;
  onCancel: () => void;
  canEdit: boolean;
}

const MovementForm: React.FC<MovementFormProps> = ({
  stocks,
  onSave,
  onCancel,
  canEdit,
}) => {
  const [formData, setFormData] = useState({
    productId: "",
    type: "in" as "in" | "out",
    quantity: 0,
    reference: "",
    notes: "",
  });

  const selectedStock = stocks.find((stock) => stock.id === formData.productId);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStock) {
      onSave({
        ...formData,
        productName: selectedStock.name,
        createdBy: "admin", // TODO: Get from auth context
        reason: formData.reference || "Manual entry",
        totalValue: formData.quantity * selectedStock.unitPrice,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Mișcare stoc nouă</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produs
            </label>
            <select
              value={formData.productId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, productId: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={!canEdit}
              aria-label="Selectează produsul pentru mișcare de stoc"
              title="Selectează produsul pentru mișcare de stoc"
            >
              <option value="">Selectați produsul</option>
              {stocks.map((stock) => (
                <option key={stock.id} value={stock.id}>
                  {stock.name} (Stoc: {stock.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tip mișcare
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as "in" | "out",
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!canEdit}
              aria-label="Tip mișcare stoc"
              title="Selectează tipul de mișcare de stoc"
            >
              <option value="in">Intrare în stoc</option>
              <option value="out">Ieșire din stoc</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantitate
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={!canEdit}
              placeholder="Cantitate pentru mișcare"
              title="Cantitate pentru mișcare"
              aria-label="Cantitate pentru mișcare"
            />
            {selectedStock &&
              formData.type === "out" &&
              formData.quantity > selectedStock.quantity && (
                <p className="text-red-600 text-sm mt-1">
                  Cantitatea depășește stocul disponibil (
                  {selectedStock.quantity})
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referință
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reference: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Comandă #123, Transfer"
              disabled={!canEdit}
              title="Referință pentru mișcare de stoc"
              aria-label="Referință pentru mișcare de stoc"
            />
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
              rows={2}
              disabled={!canEdit}
              placeholder="Observații pentru mișcare de stoc (opțional)"
              title="Observații pentru mișcare de stoc"
              aria-label="Observații pentru mișcare de stoc"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Anulare
            </button>
            {canEdit && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={
                  selectedStock &&
                  formData.type === "out" &&
                  formData.quantity > selectedStock.quantity
                }
              >
                Creare
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockPanel;
