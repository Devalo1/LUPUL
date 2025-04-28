import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  orderBy, 
  where, 
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { useCategories } from "../hooks/useCategories"; // Updated import
import { Product } from "../types";

interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changedBy: string; // user email
  action: "add" | "remove" | "adjust" | "order";
  reason?: string;
  timestamp: any; // Timestamp
  orderId?: string;
}

const AdminInventory: React.FC = () => {
  // State pentru produse și istoric
  const [products, setProducts] = useState<Product[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // State pentru UI
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // State pentru filtrare și sortare
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showLowStock, setShowLowStock] = useState(false);
  
  // State pentru ajustarea stocului
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");

  // Utilizăm contextul categoriilor
  const { categories, formatCategoryName } = useCategories();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Obține toate produsele ordonate după nume
      const productsQuery = query(collection(db, "products"), orderBy("name"));
      const productsSnapshot = await getDocs(productsQuery);
      
      // Procesează datele produselor
      const productsList = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          price: data.price || 0,
          category: data.category || "diverse",
          stock: data.stock || 0,
          sku: data.sku || "",
          lastUpdated: data.lastUpdated || null,
          image: data.image || data.imageUrl || "",
          imageUrl: data.imageUrl || data.image || "",
          inStock: data.inStock !== undefined ? data.inStock : (data.stock > 0),
          lowStockAlert: data.lowStockAlert || 5,
          costPrice: data.costPrice || 0,
          supplier: data.supplier || ""
        } as Product;
      });
      
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Eroare la încărcarea produselor. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStockHistory = async (productId: string) => {
    try {
      setHistoryLoading(true);
      
      // Obține istoricul stocului pentru produsul selectat
      const historyQuery = query(
        collection(db, "stockHistory"),
        where("productId", "==", productId),
        orderBy("timestamp", "desc")
      );
      
      const historySnapshot = await getDocs(historyQuery);
      
      const history = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockHistory));
      
      setStockHistory(history);
    } catch (error) {
      console.error("Error fetching stock history:", error);
      alert("Eroare la încărcarea istoricului stocului. Vă rugăm încercați din nou.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct) return;
    
    if (!adjustmentReason.trim()) {
      alert("Vă rugăm introduceți un motiv pentru ajustarea stocului.");
      return;
    }
    
    try {
      const previousStock = selectedProduct.stock || 0; // Add default value of 0
      const newStock = previousStock + stockAdjustment;
      
      if (newStock < 0) {
        alert("Stocul nu poate fi negativ.");
        return;
      }
      
      // Actualizează stocul produsului
      const productRef = doc(db, "products", selectedProduct.id);
      await updateDoc(productRef, {
        stock: newStock,
        inStock: newStock > 0, // Actualizăm și statusul inStock pe baza stocului
        lastUpdated: Timestamp.now()
      });
      
      // Adaugă la istoric
      await addDoc(collection(db, "stockHistory"), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        previousStock,
        newStock,
        changedBy: "admin@example.com", // Ar trebui să folosești email-ul utilizatorului real
        action: stockAdjustment > 0 ? "add" : "remove",
        reason: adjustmentReason,
        timestamp: Timestamp.now()
      });
      
      // Actualizează lista de produse
      setProducts(products.map(product => 
        product.id === selectedProduct.id 
          ? { ...product, stock: newStock, inStock: newStock > 0, lastUpdated: Timestamp.now() } 
          : product
      ));
      
      // Închide modalul de ajustare
      setIsModalOpen(false);
      setStockAdjustment(0);
      setAdjustmentReason("");
      
      alert("Stocul a fost actualizat cu succes!");
    } catch (error) {
      console.error("Error adjusting stock:", error);
      alert("Eroare la ajustarea stocului. Vă rugăm încercați din nou.");
    }
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustment(0);
    setAdjustmentReason("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleOpenHistoryModal = async (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
    await fetchProductStockHistory(product.id);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedProduct(null);
    setStockHistory([]);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Nedefinit";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString("ro-RO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Format invalid";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Filtrarea produselor pe baza termenilor de căutare și a categoriei
  const filteredProducts = products
    .filter(product => {
      // Filtrare după text de căutare
      const matchesSearch = 
        (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      // Filtrare după categorie
      const matchesCategory = 
        filterCategory === "all" || product.category === filterCategory;
      
      // Filtrare după stoc scăzut
      const matchesLowStock = 
        !showLowStock || ((product.stock ?? 0) <= (product.lowStockAlert || 5));
      
      return matchesSearch && matchesCategory && matchesLowStock;
    })
    .sort((a, b) => {
      // Sortare
      let compareValue = 0;
      
      switch (sortBy) {
        case "name":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "price":
          compareValue = a.price - b.price;
          break;
        case "stock":
          compareValue = (a.stock ?? 0) - (b.stock ?? 0);
          break;
        case "category":
          // Handle both string and Category object types
          const categoryA = typeof a.category === "string" ? a.category : (a.category?.name || "");
          const categoryB = typeof b.category === "string" ? b.category : (b.category?.name || "");
          compareValue = categoryA.localeCompare(categoryB);
          break;
        case "lastUpdated":
          compareValue = a.lastUpdated && b.lastUpdated 
            ? a.lastUpdated.seconds - b.lastUpdated.seconds 
            : 0;
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  // Statistici generale
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * (product.stock ?? 0)), 0);
  const totalStockItems = products.reduce((sum, product) => sum + (product.stock ?? 0), 0);
  const lowStockItems = products.filter(product => (product.stock ?? 0) <= (product.lowStockAlert || 5)).length;

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Gestionare Stocuri</h2>
        
        {/* Dashboard sumar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-blue-600 font-medium">Total produse</span>
            <span className="text-2xl font-bold">{totalProducts}</span>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-green-600 font-medium">Valoare totală stoc</span>
            <span className="text-2xl font-bold">{formatCurrency(totalValue)}</span>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-purple-600 font-medium">Total unități în stoc</span>
            <span className="text-2xl font-bold">{totalStockItems}</span>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-yellow-600 font-medium">Produse cu stoc scăzut</span>
            <span className="text-2xl font-bold">{lowStockItems}</span>
          </div>
        </div>
        
        {/* Filtre și sortare */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Caută produs</label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nume, descriere sau SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Toate categoriile</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sortează după</label>
            <select
              id="sortBy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Nume</option>
              <option value="price">Preț</option>
              <option value="stock">Stoc</option>
              <option value="category">Categorie</option>
              <option value="lastUpdated">Ultima actualizare</option>
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Ordine</label>
            <select
              id="sortOrder"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Crescător</option>
              <option value="desc">Descrescător</option>
            </select>
          </div>
          
          <div className="w-full md:w-48 flex items-end">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Doar stoc scăzut</span>
            </label>
          </div>
        </div>
        
        {/* Tabel produse */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Produs
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    SKU / Categorie
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Preț
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Stoc
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Ultima actualizare
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {product.imageUrl || product.image ? (
                            <img 
                              src={product.imageUrl || product.image} 
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover mr-3" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                              <span className="text-xs text-gray-500">No img</span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{product.sku || "Fără SKU"}</div>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {typeof product.category === "string" 
                            ? formatCategoryName(product.category) 
                            : product.category?.name || "Necategorizat"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</div>
                        {product.costPrice && (
                          <div className="text-xs text-gray-500">
                            Cost: {formatCurrency(product.costPrice)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className={`text-sm font-medium ${
                          (product.stock ?? 0) <= (product.lowStockAlert || 5)
                            ? "text-red-600" 
                            : "text-green-600"
                        }`}>
                          {product.stock ?? 0} buc
                        </div>
                        {product.lowStockAlert && (
                          <div className="text-xs text-gray-500">
                            Alertă la: {product.lowStockAlert} buc
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {product.lastUpdated ? formatDate(product.lastUpdated) : "Necunoscut"}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Ajustează stoc
                        </button>
                        <button 
                          onClick={() => handleOpenHistoryModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Istoric
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                      Nu s-au găsit produse care să corespundă criteriilor selectate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal ajustare stoc */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Ajustare Stoc</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-4">
                {selectedProduct.imageUrl || selectedProduct.image ? (
                  <img 
                    src={selectedProduct.imageUrl || selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="h-16 w-16 rounded object-cover mr-3" 
                  />
                ) : (
                  <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center mr-3">
                    <span className="text-xs text-gray-500">No img</span>
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedProduct.name}</h4>
                  <div className="text-sm text-gray-500">SKU: {selectedProduct.sku || "Fără SKU"}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Stoc curent</span>
                    <div className="mt-1 text-2xl font-bold">{selectedProduct.stock ?? 0}</div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Preț de vânzare</span>
                    <div className="mt-1 text-xl font-medium">{formatCurrency(selectedProduct.price)}</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="stockAdjustment" className="block text-sm font-medium text-gray-700 mb-1">
                  Ajustare stoc (+ pentru adăugare, - pentru retragere)
                </label>
                <input
                  type="number"
                  id="stockAdjustment"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="adjustmentReason" className="block text-sm font-medium text-gray-700 mb-1">
                  Motiv pentru ajustare
                </label>
                <textarea
                  id="adjustmentReason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Introduceți motivul ajustării stocului..."
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Stoc după ajustare:</span>
                  <span className={`text-lg font-bold ${
                    (selectedProduct.stock ?? 0) + stockAdjustment <= (selectedProduct.lowStockAlert || 5)
                      ? "text-red-600"
                      : "text-green-600"
                  }`}>
                    {(selectedProduct.stock ?? 0) + stockAdjustment}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleAdjustStock}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={stockAdjustment === 0}
              >
                Salvează modificarea
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal istoric stoc */}
      {isHistoryModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Istoric Stoc</h3>
              <button 
                onClick={handleCloseHistoryModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-lg mb-1">{selectedProduct.name}</h4>
              <p className="text-sm text-gray-500">SKU: {selectedProduct.sku || "Fără SKU"}</p>
            </div>
            
            {historyLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Data
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Acțiune
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Stoc anterior
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Stoc nou
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Modificat de
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Motiv
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stockHistory.length > 0 ? (
                      stockHistory.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatDate(entry.timestamp)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              entry.action === "add" 
                                ? "bg-green-100 text-green-800"
                                : entry.action === "remove"
                                  ? "bg-red-100 text-red-800" 
                                  : entry.action === "order"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {entry.action === "add" 
                                ? "Adăugare" 
                                : entry.action === "remove" 
                                  ? "Eliminare"
                                  : entry.action === "order"
                                    ? "Comandă"
                                    : "Ajustare"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {entry.previousStock}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {entry.newStock}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {entry.changedBy}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                            {entry.reason || "—"}
                            {entry.orderId && (
                              <span className="ml-1 text-xs text-blue-600">
                                (Comandă #{entry.orderId.substring(0, 6)})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                          Nu există înregistrări în istoricul stocului pentru acest produs.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;