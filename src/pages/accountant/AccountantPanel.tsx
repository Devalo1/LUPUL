import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, Timestamp, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts";
import { FaFileInvoiceDollar, FaCalendarAlt, FaChartLine, FaDownload, FaUpload, FaPrint, FaFileImage, FaTrash } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { TimestampConverter } from "../../utils/timestampConverter";
import "../../styles/AccountantPanel.css";
import uploadStyles from "../../styles/UploadProgress.module.css";

interface DailyReport {
  id: string;
  date: Date | Timestamp;
  totalAmount: number;
  invoicesCount: number;
  expenses: number;
  profit: number;
  notes?: string;
  createdBy: string;
  createdAt: Date | Timestamp;
  images?: string[];
}

interface Invoice {
  id: string;
  number: string;
  date: Date | Timestamp;
  customerName: string;
  amount: number;
  paid: boolean;
  reportId?: string;
}

interface Order {
  id: string;
  totalAmount: string;
  [key: string]: any; // For other properties that might exist
}

// Function to ensure a Date is returned from various timestamp-like objects
const ensureDate = (date: Date | Timestamp | any): Date => {
  return TimestampConverter.toDate(date);
};

export const AccountantPanel: React.FC = () => {
  const { user } = useAuth();  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [_loading, setLoading] = useState(true);
  const [reportDates, setReportDates] = useState<Date[]>([]);
  const [activeTab, setActiveTab] = useState<"dailyReport" | "calendar" | "reports" | "images">("dailyReport");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newReport, setNewReport] = useState<Partial<DailyReport>>({
    totalAmount: 0,
    invoicesCount: 0,
    expenses: 0,
    profit: 0,
    notes: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [reportImages, setReportImages] = useState<string[]>([]);

  const formatDateForComparison = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const formatDateForStorage = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchAccountingData = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const ordersQuery = query(ordersRef, orderBy("createdAt", "desc"));
        const ordersSnapshot = await getDocs(ordersQuery);

        const orders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[]; // Cast to Order[] to fix type errors

        let revenue = 0;
        orders.forEach(order => {
          if (order.totalAmount) {
            revenue += parseFloat(order.totalAmount);
          }
        });

        setTotalOrders(orders.length);
        setTotalRevenue(revenue);

        await fetchReports();
      } catch (error) {
        console.error("Error fetching accounting data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountingData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchInvoicesForDate(selectedDate);
      fetchImagesForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchReports = async () => {
    try {
      const reportsRef = collection(db, "dailyReports");
      const reportsQuery = query(reportsRef, orderBy("date", "desc"));
      const reportsSnapshot = await getDocs(reportsQuery);

      if (!reportsSnapshot.empty) {
        const reports = reportsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: ensureDate(data.date),
            createdAt: ensureDate(data.createdAt)
          } as DailyReport;
        });

        setDailyReports(reports);

        const dates = reports.map(report => ensureDate(report.date));
        setReportDates(dates);
      } else {
        console.log("No reports found");
        setDailyReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchInvoicesForDate = async (date: Date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const invoicesRef = collection(db, "invoices");
      const invoicesQuery = query(
        invoicesRef,
        where("date", ">=", Timestamp.fromDate(startOfDay)),
        where("date", "<=", Timestamp.fromDate(endOfDay))
      );

      const invoicesSnapshot = await getDocs(invoicesQuery);

      if (!invoicesSnapshot.empty) {
        const invoicesList = invoicesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: ensureDate(data.date)
          } as Invoice;
        });

        setInvoices(invoicesList);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchImagesForDate = async (date: Date) => {
    try {
      const report = findReportForSelectedDate();
      if (report?.images && report.images.length > 0) {
        setReportImages(report.images);
        return;
      }

      const storage = getStorage();
      const dateString = formatDateForStorage(date);
      const imagesRef = storageRef(storage, `accounting/daily-reports/${dateString}`);

      try {
        const result = await listAll(imagesRef);
        const urls = await Promise.all(result.items.map(item => getDownloadURL(item)));
        setReportImages(urls);
      } catch (error) {
        console.log("No images found in storage or error listing:", error);
        setReportImages([]);
      }
    } catch (error) {
      console.error("Error fetching images for date:", error);
      setReportImages([]);
    }
  };

  const handleDateChange = (date: Date | Date[]) => {
    if (Array.isArray(date)) {
      setSelectedDate(date[0]);
    } else {
      setSelectedDate(date);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReport({
      ...newReport,
      [name]: name === "notes" ? value : parseFloat(value) || 0
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleUploadFiles = async () => {
    if (!selectedFiles.length) return;

    try {
      setUploadProgress(0);
      const storage = getStorage();
      const dateString = formatDateForStorage(selectedDate);

      const uploadedUrls: string[] = [];
      let completed = 0;

      for (const file of selectedFiles) {
        const fileRef = storageRef(storage, `accounting/daily-reports/${dateString}/${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        uploadedUrls.push(url);

        completed++;
        setUploadProgress(Math.round((completed / selectedFiles.length) * 100));
      }

      if (uploadedUrls.length > 0) {
        const report = findReportForSelectedDate();
        if (report?.id) {
          const reportRef = doc(db, "dailyReports", report.id);
          await updateDoc(reportRef, {
            images: [...(report.images || []), ...uploadedUrls]
          });
        }
      }

      fetchImagesForDate(selectedDate);
      setSelectedFiles([]);
      alert("Fișierele au fost încărcate cu succes!");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("A apărut o eroare la încărcarea fișierelor.");
    } finally {
      setUploadProgress(0);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const reportToSave = {
        ...newReport,
        date: Timestamp.fromDate(selectedDate),
        createdBy: user.uid,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, "dailyReports"), reportToSave);

      await fetchReports();

      setNewReport({
        totalAmount: 0,
        invoicesCount: 0,
        expenses: 0,
        profit: 0,
        notes: ""
      });

      setUploadModalOpen(false);
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Eroare la salvarea raportului. Vă rugăm încercați din nou.");
    }
  };

  const findReportForSelectedDate = () => {
    return dailyReports.find(report =>
      formatDateForComparison(ensureDate(report.date)) === formatDateForComparison(selectedDate)
    );
  };

  const selectedReport = findReportForSelectedDate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(amount);
  };

  const formatDate = (date: Date | Timestamp) => {
    date = ensureDate(date);
    return new Intl.DateTimeFormat("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  };

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === "month") {
      const hasReport = reportDates.some(reportDate =>
        formatDateForComparison(reportDate) === formatDateForComparison(date)
      );
      return hasReport ? "has-report" : null;
    }
    return null;
  };

  return (
    <div className="accounting-panel min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Panoul de Contabilitate</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                <FaUpload className="mr-2" /> Adaugă Raport Z
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <FaPrint className="mr-2" /> Printează
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dailyReport"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("dailyReport")}
              >
                <div className="flex items-center">
                  <FaFileInvoiceDollar className="mr-2" /> Raport Zilnic
                </div>
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "calendar"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("calendar")}
              >
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2" /> Calendar
                </div>
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("reports")}
              >
                <div className="flex items-center">
                  <FaChartLine className="mr-2" /> Istoric Rapoarte
                </div>
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "images"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("images")}
              >
                <div className="flex items-center">
                  <FaFileImage className="mr-2" /> Documente Scanate
                </div>
              </button>
            </nav>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Comenzi</p>
                  <p className="text-2xl font-semibold">{totalOrders}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Venituri Totale</p>
                  <p className="text-2xl font-semibold">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rapoarte Z</p>
                  <p className="text-2xl font-semibold">{dailyReports.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Facturi Emise Azi</p>
                  <p className="text-2xl font-semibold">{invoices.length}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {activeTab === "dailyReport" && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Raport Zilnic: {formatDate(selectedDate)}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        setSelectedDate(yesterday);
                      }}
                    >
                      Ziua anterioară
                    </button>
                    <button
                      className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Astăzi
                    </button>
                    <button
                      className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setSelectedDate(tomorrow);
                      }}
                    >
                      Ziua următoare
                    </button>
                  </div>
                </div>

                {selectedReport ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-sm text-gray-500">Total Încasări</p>
                        <p className="text-lg font-semibold">{formatCurrency(selectedReport.totalAmount)}</p>
                      </div>
                      <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-sm text-gray-500">Număr Facturi</p>
                        <p className="text-lg font-semibold">{selectedReport.invoicesCount}</p>
                      </div>
                      <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-sm text-gray-500">Cheltuieli</p>
                        <p className="text-lg font-semibold">{formatCurrency(selectedReport.expenses)}</p>
                      </div>
                      <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-sm text-gray-500">Profit</p>
                        <p className="text-lg font-semibold">{formatCurrency(selectedReport.profit)}</p>
                      </div>
                    </div>

                    {selectedReport.notes && (
                      <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Note:</p>
                        <p className="text-md">{selectedReport.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-gray-500 mb-3">Nu există raport Z pentru această dată</p>
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition focus:outline-none"
                    >
                      Adaugă Raport Z
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Facturi - {formatDate(selectedDate)}
                </h2>

                {invoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nr. Factură
                          </th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dată
                          </th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sumă
                          </th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acțiuni
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="py-3 px-4">{invoice.number}</td>
                            <td className="py-3 px-4">{invoice.customerName}</td>
                            <td className="py-3 px-4">{formatDate(invoice.date)}</td>
                            <td className="py-3 px-4">{formatCurrency(invoice.amount)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                invoice.paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {invoice.paid ? "Plătită" : "Neplătită"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button className="text-blue-600 hover:text-blue-800">
                                <FaDownload className="inline" /> Descarcă
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-gray-500">Nu există facturi pentru această dată</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "calendar" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Calendar Rapoarte</h2>
              <div className="calendar-container">
                <style>{`
                  .has-report {
                    background-color: #e0f2fe;
                    color: #0369a1;
                    font-weight: bold;
                  }
                  .react-calendar { 
                    width: 100%;
                    border: none;
                    font-family: Arial, Helvetica, sans-serif;
                    background-color: white;
                  }
                  .react-calendar__tile {
                    height: 80px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: flex-start;
                    padding: 5px;
                    background-color: white;
                  }
                  .react-calendar__month-view__days__day--weekend {
                    color: #f43f5e;
                  }
                  .react-calendar__tile--active {
                    background: #dbeafe;
                    color: #1e3a8a;
                  }
                  .react-calendar__tile--now {
                    background: #fef3c7;
                    color: #92400e;
                  }
                  .react-calendar__navigation button {
                    background-color: white;
                    color: #1e3a8a;
                  }
                  .react-calendar__navigation button:enabled:hover,
                  .react-calendar__navigation button:enabled:focus {
                    background-color: #f8fafc;
                  }
                `}</style>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileClassName={tileClassName}
                  locale="ro-RO"
                />
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Legendă:</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#e0f2fe] rounded-sm mr-2"></div>
                      <span className="text-sm">Cu raport</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#fef3c7] rounded-sm mr-2"></div>
                      <span className="text-sm">Astăzi</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#dbeafe] rounded-sm mr-2"></div>
                      <span className="text-sm">Zi selectată</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Istoric Rapoarte Z</h2>

              {dailyReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dată
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Încasări
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nr. Facturi
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cheltuieli
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profit
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acțiuni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dailyReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => {
                                setSelectedDate(ensureDate(report.date));
                                setActiveTab("dailyReport");
                              }}
                            >
                              {formatDate(report.date)}
                            </button>
                          </td>
                          <td className="py-3 px-4">{formatCurrency(report.totalAmount)}</td>
                          <td className="py-3 px-4">{report.invoicesCount}</td>
                          <td className="py-3 px-4">{formatCurrency(report.expenses)}</td>
                          <td className="py-3 px-4">{formatCurrency(report.profit)}</td>
                          <td className="py-3 px-4">
                            <button className="text-blue-600 hover:text-blue-800 mr-2">
                              <FaDownload className="inline" /> Export
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <FaPrint className="inline" /> Print
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="text-gray-500">Nu există rapoarte Z</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "images" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Documente Scanate - {formatDate(selectedDate)}
              </h2>

              <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
                <h3 className="text-lg font-medium mb-3">Încarcă Documente Noi</h3>
                <div className="mb-4">                  <input 
                    type="file" 
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    aria-label="Selectează fișiere pentru încărcare"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Format acceptat: JPG, PNG, PDF (max 10MB per fișier)
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm">{selectedFiles.length} fișiere selectate</p>
                    <ul className="mt-2 text-sm text-gray-600">
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB</li>
                      ))}
                    </ul>                    {uploadProgress > 0 && (
                      <div className={uploadStyles.uploadProgressContainer}>
                        <div 
                          className={`${uploadStyles.uploadProgressBar} ${uploadStyles[`uploadProgressWidth${Math.round(uploadProgress)}`] || uploadStyles.uploadProgressWidth0}`}
                        ></div>
                      </div>
                    )}

                    <button
                      onClick={handleUploadFiles}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      <FaUpload className="inline mr-2" /> Încarcă Fișiere
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Documente Existente</h3>
                
                {reportImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportImages.map((url, index) => (
                      <div key={index} className="border rounded-md overflow-hidden bg-gray-50">
                        {url.toLowerCase().endsWith(".pdf") ? (
                          <div className="h-40 bg-gray-100 flex items-center justify-center">
                            <FaFileImage className="text-4xl text-gray-400" />
                          </div>
                        ) : (
                          <div className="h-40 bg-gray-100">
                            <img 
                              src={url} 
                              alt={`Document ${index + 1}`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="p-3 flex justify-between items-center bg-white">
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Vizualizare
                          </a>                          <button 
                            className="text-red-500 hover:text-red-700"
                            aria-label="Șterge documentul"
                            title="Șterge documentul"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-gray-500">Nu există documente scanate pentru această dată</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {uploadModalOpen && (
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Adaugă Raport Z</h3>                  <button
                    onClick={() => setUploadModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Închide"
                    title="Închide"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmitReport}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                      Data Raportului
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={selectedDate.toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="totalAmount">
                      Total Încasări (RON)
                    </label>
                    <input
                      type="number"
                      id="totalAmount"
                      name="totalAmount"
                      value={newReport.totalAmount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="invoicesCount">
                      Număr Facturi
                    </label>
                    <input
                      type="number"
                      id="invoicesCount"
                      name="invoicesCount"
                      value={newReport.invoicesCount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expenses">
                      Cheltuieli (RON)
                    </label>
                    <input
                      type="number"
                      id="expenses"
                      name="expenses"
                      value={newReport.expenses}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="profit">
                      Profit (RON)
                    </label>
                    <input
                      type="number"
                      id="profit"
                      name="profit"
                      value={newReport.profit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                      Note
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={newReport.notes}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                    >
                      Anulează
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Salvează
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountantPanel;