import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaFilter, FaSearch, FaPrint, FaDownload, FaEdit, FaTrash } from "react-icons/fa";
import { AccountingService } from "../../services/accounting/accountingService";
import { Invoice } from "../../types/accounting";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State pentru filtre
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    clientName: "",
    search: ""
  });
  
  // State pentru paginație și filtre
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  
  // Sumarizare valori
  const [invoiceSummary, setInvoiceSummary] = useState({
    totalPaid: 0,
    totalUnpaid: 0,
    totalOverdue: 0,
    countDrafts: 0,
    countSent: 0,
    countPaid: 0,
    countOverdue: 0
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const invoicesData = await AccountingService.getInvoices();
      setInvoices(invoicesData);
      calculateSummary(invoicesData);
    } catch (err) {
      console.error("Eroare la încărcarea facturilor:", err);
      setError("Nu s-au putut încărca facturile. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (invoicesList: Invoice[]) => {
    let totalPaid = 0;
    let totalUnpaid = 0;
    let totalOverdue = 0;
    let countDrafts = 0;
    let countSent = 0;
    let countPaid = 0;
    let countOverdue = 0;
    
    invoicesList.forEach(invoice => {
      switch (invoice.status) {
        case "paid":
          totalPaid += invoice.total;
          countPaid++;
          break;
        case "sent":
          totalUnpaid += invoice.total;
          countSent++;
          break;
        case "overdue":
          totalOverdue += invoice.total;
          countOverdue++;
          break;
        case "draft":
          countDrafts++;
          break;
      }
    });
    
    setInvoiceSummary({
      totalPaid,
      totalUnpaid,
      totalOverdue,
      countDrafts,
      countSent,
      countPaid,
      countOverdue
    });
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
      
      if (filters.status) {
        filterOptions.status = filters.status;
      }
      
      const invoicesData = await AccountingService.getInvoices(filterOptions);
      
      // Filtrare suplimentară după nume client și textul de căutare
      let filteredData = invoicesData;
      
      if (filters.clientName) {
        const clientName = filters.clientName.toLowerCase();
        filteredData = filteredData.filter(invoice => 
          invoice.clientName.toLowerCase().includes(clientName)
        );
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(invoice => 
          invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
          invoice.clientName.toLowerCase().includes(searchTerm) ||
          (invoice.notes && invoice.notes.toLowerCase().includes(searchTerm))
        );
      }
      
      setInvoices(filteredData);
      calculateSummary(filteredData);
      setCurrentPage(1); // Resetăm la prima pagină când aplicăm filtre
    } catch (err) {
      console.error("Eroare la filtrarea facturilor:", err);
      setError("Nu s-au putut filtra facturile. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      clientName: "",
      search: ""
    });
    loadInvoices();
  };

  const handleCreateInvoice = () => {
    // Navigare către pagina de creare factură
    navigate("/admin/accounting/invoices/create");
  };

  const handleViewInvoice = (id: string) => {
    navigate(`/admin/accounting/invoices/${id}`);
  };

  const handleEditInvoice = (id: string) => {
    navigate(`/admin/accounting/invoices/${id}/edit`);
  };

  const handleDeleteInvoice = (id: string) => {
    // Implementare ștergere factură
    console.log(`Ștergere factură cu ID: ${id}`);
  };

  const handlePrintInvoice = (id: string) => {
    // Implementare printare factură
    console.log(`Printare factură cu ID: ${id}`);
  };

  const handleDownloadInvoice = (id: string) => {
    // Implementare descărcare factură ca PDF
    console.log(`Descărcare factură cu ID: ${id}`);
  };

  // Calculăm paginația
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = invoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(invoices.length / itemsPerPage);

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
      
      return format(jsDate, "P", { locale: ro });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Formatare sume
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON"
    }).format(amount);
  };

  // Obține clasa CSS pentru status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obține textul pentru status
  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Plătită";
      case "sent":
        return "Trimisă";
      case "overdue":
        return "Întârziată";
      case "draft":
        return "Ciornă";
      default:
        return status;
    }
  };

  return (
    <div className="invoices-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Facturi</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            <FaFilter className="mr-1" /> Filtre
          </button>
          
          <button
            onClick={handleCreateInvoice}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaPlus className="mr-1" /> Crează Factură
          </button>
        </div>
      </div>
      
      {/* Carduri informative cu statistici */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Facturi deschise</p>
          <p className="text-2xl font-bold text-blue-600">{invoiceSummary.countSent}</p>
          <p className="text-sm text-gray-500 mt-1">{formatAmount(invoiceSummary.totalUnpaid)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Facturi plătite</p>
          <p className="text-2xl font-bold text-green-600">{invoiceSummary.countPaid}</p>
          <p className="text-sm text-gray-500 mt-1">{formatAmount(invoiceSummary.totalPaid)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Facturi întârziate</p>
          <p className="text-2xl font-bold text-red-600">{invoiceSummary.countOverdue}</p>
          <p className="text-sm text-gray-500 mt-1">{formatAmount(invoiceSummary.totalOverdue)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Ciorne</p>
          <p className="text-2xl font-bold text-gray-600">{invoiceSummary.countDrafts}</p>
          <p className="text-sm text-gray-500 mt-1">Facturi nepublicate</p>
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
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Toate</option>
                <option value="draft">Ciornă</option>
                <option value="sent">Trimisă</option>
                <option value="paid">Plătită</option>
                <option value="overdue">Întârziată</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <input
                type="text"
                name="clientName"
                value={filters.clientName}
                onChange={handleFilterChange}
                placeholder="Nume client"
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
                placeholder="Căutare după număr factură, client, etc."
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
      
      {/* Tabel facturi */}
      {!loading && invoices.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Nu există facturi care să corespundă criteriilor de căutare.</p>
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
                    Număr Factură
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Emiterii
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scadență
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewInvoice(invoice.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {formatAmount(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrintInvoice(invoice.id); }}
                        className="text-gray-600 hover:text-gray-900 mx-1"
                        title="Printează"
                      >
                        <FaPrint />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(invoice.id); }}
                        className="text-blue-600 hover:text-blue-900 mx-1"
                        title="Descarcă PDF"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditInvoice(invoice.id); }}
                        className="text-indigo-600 hover:text-indigo-900 mx-1"
                        title="Editează"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(invoice.id); }}
                        className="text-red-600 hover:text-red-900 mx-1"
                        title="Șterge"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginație */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Afișare <span className="font-medium">{indexOfFirstItem + 1}</span> - <span className="font-medium">
                {Math.min(indexOfLastItem, invoices.length)}
              </span> din <span className="font-medium">{invoices.length}</span> rezultate
            </div>
            
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
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculăm paginile de afișat pentru a nu arăta toate atunci când sunt multe
                const pageRange = 2; // pagini de afișat în stânga și dreapta paginii curente
                let startPage = Math.max(1, currentPage - pageRange);
                let endPage = Math.min(totalPages, currentPage + pageRange);
                
                // Ajustăm startPage și endPage pentru a menține mereu 5 pagini afișate sau mai puțin
                if (endPage - startPage + 1 < Math.min(5, totalPages)) {
                  if (startPage === 1) {
                    endPage = Math.min(5, totalPages);
                  } else {
                    startPage = Math.max(1, endPage - 4);
                  }
                }
                
                // Generăm array-ul de pagini de afișat
                const paginationRange = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
                
                return paginationRange.map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded ${
                      currentPage === number ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {number}
                  </button>
                ));
              }).flat()}
              
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
          </div>
        </>
      )}
    </div>
  );
};

export default Invoices;