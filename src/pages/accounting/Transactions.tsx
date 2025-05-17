import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaFilter, FaSearch, FaTrash, FaEdit, FaFileExport } from "react-icons/fa";
import { AccountingService } from "../../services/accounting/accountingService";
import { FinancialTransaction } from "../../types/accounting";

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State pentru filtre
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    type: "",
    search: ""
  });
  
  // State pentru paginație
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const transactionsData = await AccountingService.getTransactions();
      setTransactions(transactionsData);
    } catch (err) {
      console.error("Eroare la încărcarea tranzacțiilor:", err);
      setError("Nu s-au putut încărca tranzacțiile. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filterOptions: any = {};
      
      if (filters.startDate) {
        filterOptions.startDate = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        filterOptions.endDate = new Date(filters.endDate);
      }
      
      if (filters.category) {
        filterOptions.category = filters.category;
      }
      
      if (filters.type) {
        filterOptions.type = filters.type;
      }
      
      const transactionsData = await AccountingService.getTransactions(filterOptions);
      
      // Filtrare suplimentară după textul de căutare
      let filteredData = transactionsData;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = transactionsData.filter(transaction => 
          transaction.description.toLowerCase().includes(searchTerm) ||
          transaction.category.toLowerCase().includes(searchTerm)
        );
      }
      
      setTransactions(filteredData);
      setCurrentPage(1); // Resetăm la prima pagină când aplicăm filtre
    } catch (err) {
      console.error("Eroare la filtrarea tranzacțiilor:", err);
      setError("Nu s-au putut filtra tranzacțiile. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      category: "",
      type: "",
      search: ""
    });
    loadTransactions();
  };

  const handleAddTransaction = () => {
    // Navigare către pagina de adăugare tranzacție
    // Sau deschidere modal pentru adăugare
    console.log("Adaugă tranzacție");
  };

  const handleExportCSV = () => {
    // Logica pentru exportul în CSV
    const headers = "ID,Tip,Sumă,Categorie,Descriere,Dată\n";
    
    const csvRows = transactions.map(transaction => {
      const date = transaction.date instanceof Date 
        ? transaction.date.toISOString().split("T")[0]
        : new Date((transaction.date as any).seconds * 1000).toISOString().split("T")[0];
      
      return `"${transaction.id}","${transaction.type}","${transaction.amount}","${transaction.category}","${transaction.description}","${date}"`;
    });
    
    const csvContent = headers + csvRows.join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tranzactii.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteTransaction = (id: string) => {
    // Logica pentru ștergerea tranzacției
    console.log("Șterge tranzacția", id);
  };

  const handleEditTransaction = (id: string) => {
    // Navigare către pagina de editare sau deschidere modal
    console.log("Editează tranzacția", id);
  };

  // Calculăm paginația
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Formatare dată
  const formatDate = (date: any) => {
    if (!date) return "N/A";
    
    try {
      const jsDate = date instanceof Date 
        ? date 
        : new Date((date.seconds || 0) * 1000);
      
      return jsDate.toLocaleDateString("ro-RO");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Formatare sumă
  const formatAmount = (amount: number, type: string) => {
    const formattedAmount = new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON"
    }).format(amount);
    
    return type === "expense" ? `-${formattedAmount}` : formattedAmount;
  };

  return (
    <div className="transactions-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tranzacții Financiare</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            <FaFilter className="mr-1" /> Filtre
          </button>
          
          <button
            onClick={handleAddTransaction}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaPlus className="mr-1" /> Adaugă Tranzacție
          </button>
        </div>
      </div>
      
      {/* Secțiunea de filtre */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Început
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Sfârșit
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Toate</option>
                <option value="income">Venit</option>
                <option value="expense">Cheltuială</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie
              </label>
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Introduceți categoria"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Căutare după descriere, categorie..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="ml-4 flex space-x-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aplică
              </button>
              
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Resetează
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mesaj de eroare */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Tabel tranzacții */}
      {!loading && transactions.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Nu există tranzacții care să corespundă criteriilor de căutare.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Resetează filtrele
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dată
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descriere
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categorie
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sumă
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.category}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleEditTransaction(transaction.id)}
                        className="text-indigo-600 hover:text-indigo-900 mx-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-900 mx-2"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginație și export */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Următor
              </button>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <FaFileExport className="mr-1" /> Exportă CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Transactions;