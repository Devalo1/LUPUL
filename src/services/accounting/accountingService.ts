import { db } from "../../firebase";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, orderBy, where, Timestamp, limit } from "firebase/firestore";
import { 
  AccountingSettings, 
  FinancialTransaction, 
  FinancialReport, 
  ReportType, 
  Invoice
} from "../../types/accounting";

/**
 * Serviciu pentru gestionarea operațiilor contabile
 */
export class AccountingService {
  
  /**
   * Obține setările contabile din Firestore
   */
  static async getAccountingSettings(): Promise<AccountingSettings> {
    try {
      const settingsRef = doc(db, "accountingSettings", "default");
      const settingsSnapshot = await getDoc(settingsRef);
      
      if (settingsSnapshot.exists()) {
        return settingsSnapshot.data() as AccountingSettings;
      } else {
        // Returnăm valorile implicite dacă nu există setări salvate
        const defaultSettings: AccountingSettings = {
          currency: "RON",
          taxRate: 19,
          fiscalYear: {
            startMonth: 1, // Ianuarie
            startDay: 1
          },
          invoicePrefix: "INV",
          invoiceNumbering: {
            currentNumber: 1,
            resetYearly: false
          }
        };
        
        // Salvăm setările implicite
        await setDoc(settingsRef, defaultSettings);
        
        return defaultSettings;
      }
    } catch (error) {
      console.error("Error fetching accounting settings:", error);
      throw error;
    }
  }

  /**
   * Salvează setările contabile în Firestore
   */
  static async saveAccountingSettings(settings: AccountingSettings): Promise<void> {
    try {
      const settingsRef = doc(db, "accountingSettings", "default");
      await setDoc(settingsRef, settings);
    } catch (error) {
      console.error("Error saving accounting settings:", error);
      throw error;
    }
  }

  /**
   * Adaugă o nouă tranzacție financiară
   */
  static async addTransaction(transaction: Omit<FinancialTransaction, "id" | "createdAt">): Promise<string> {
    try {
      const transactionData = {
        ...transaction,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, "financialTransactions"), transactionData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  }

  /**
   * Obține toate tranzacțiile financiare, cu opțiuni de filtrare
   */
  static async getTransactions(
    filters?: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
      type?: "income" | "expense";
    },
    limitCount?: number
  ): Promise<FinancialTransaction[]> {
    try {
      let q = collection(db, "financialTransactions");
      const queryConstraints = [];
      
      if (filters) {
        if (filters.startDate) {
          const startTimestamp = Timestamp.fromDate(filters.startDate);
          queryConstraints.push(where("date", ">=", startTimestamp));
        }
        
        if (filters.endDate) {
          const endTimestamp = Timestamp.fromDate(filters.endDate);
          queryConstraints.push(where("date", "<=", endTimestamp));
        }
        
        if (filters.category) {
          queryConstraints.push(where("category", "==", filters.category));
        }
        
        if (filters.type) {
          queryConstraints.push(where("type", "==", filters.type));
        }
      }
      
      // Adăugăm orderBy și limit dacă există
      queryConstraints.push(orderBy("date", "desc"));
      
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }
      
      const transactionsQuery = query(q, ...queryConstraints);
      const snapshot = await getDocs(transactionsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FinancialTransaction));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  /**
   * Generează un raport financiar
   */
  static async generateReport(
    type: ReportType,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialReport> {
    try {
      // Obținem toate tranzacțiile din perioada specificată
      const transactions = await this.getTransactions({
        startDate,
        endDate
      });
      
      // Inițializăm obiectul pentru raport
      const report: FinancialReport = {
        id: "", // Va fi setat la salvare
        type,
        title: this.getReportTitle(type),
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        createdAt: Timestamp.now(),
        summary: {
          totalIncome: 0,
          totalExpense: 0,
          netProfit: 0,
          incomeByCategory: {},
          expenseByCategory: {}
        },
        data: {}
      };
      
      // Calculăm sumele pentru fiecare categorie
      transactions.forEach(transaction => {
        if (transaction.type === "income") {
          report.summary.totalIncome += transaction.amount;
          
          // Adăugăm suma la categoria corespunzătoare
          if (report.summary.incomeByCategory[transaction.category]) {
            report.summary.incomeByCategory[transaction.category] += transaction.amount;
          } else {
            report.summary.incomeByCategory[transaction.category] = transaction.amount;
          }
        } else if (transaction.type === "expense") {
          report.summary.totalExpense += transaction.amount;
          
          // Adăugăm suma la categoria corespunzătoare
          if (report.summary.expenseByCategory[transaction.category]) {
            report.summary.expenseByCategory[transaction.category] += transaction.amount;
          } else {
            report.summary.expenseByCategory[transaction.category] = transaction.amount;
          }
        }
      });
      
      // Calculăm profitul net
      report.summary.netProfit = report.summary.totalIncome - report.summary.totalExpense;
      
      // Generăm date specifice pentru fiecare tip de raport
      switch (type) {
        case "profit_loss":
          report.data = {
            revenues: Object.entries(report.summary.incomeByCategory).map(([category, amount]) => ({
              category,
              amount
            })),
            expenses: Object.entries(report.summary.expenseByCategory).map(([category, amount]) => ({
              category,
              amount
            })),
            netProfit: report.summary.netProfit
          };
          break;
          
        case "tax":
          // Calcul simplu pentru impozitul estimat (exemplu: 16% din venit)
          const taxableIncome = report.summary.totalIncome - report.summary.totalExpense;
          const deductions = report.summary.totalExpense * 0.6; // Exemplu: 60% din cheltuieli sunt deductibile
          const estimatedTax = Math.max(0, taxableIncome) * 0.16; // 16% impozit pe profit
          
          report.data = {
            taxableIncome,
            deductions,
            estimatedTax
          };
          break;
          
        case "cash_flow":
          // Grupăm tranzacțiile după dată
          const transactionsByDate: Record<string, any[]> = {};
          let openingBalance = 0;
          let closingBalance = 0;
          
          // Sortăm tranzacțiile după dată
          const sortedTransactions = [...transactions].sort((a, b) => {
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });
          
          // Grupăm tranzacțiile după dată
          sortedTransactions.forEach(transaction => {
            const date = transaction.date instanceof Timestamp 
              ? transaction.date.toDate() 
              : new Date(transaction.date);
            
            const dateString = date.toISOString().split("T")[0];
            
            if (!transactionsByDate[dateString]) {
              transactionsByDate[dateString] = [];
            }
            
            transactionsByDate[dateString].push(transaction);
            
            // Actualizăm soldurile
            if (transaction.type === "income") {
              closingBalance += transaction.amount;
            } else {
              closingBalance -= transaction.amount;
            }
          });
          
          report.data = {
            transactionsByDate,
            openingBalance,
            closingBalance
          };
          break;
      }
      
      return report;
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      throw error;
    }
  }

  /**
   * Salvează un raport în Firestore
   */
  static async saveReport(report: FinancialReport): Promise<string> {
    try {
      const reportRef = await addDoc(collection(db, "financialReports"), report);
      return reportRef.id;
    } catch (error) {
      console.error("Error saving report:", error);
      throw error;
    }
  }

  /**
   * Obține rapoartele salvate
   */
  static async getSavedReports(): Promise<FinancialReport[]> {
    try {
      const reportsQuery = query(
        collection(db, "financialReports"),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(reportsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FinancialReport));
    } catch (error) {
      console.error("Error fetching saved reports:", error);
      throw error;
    }
  }

  /**
   * Obține un raport după ID
   */
  static async getReportById(id: string): Promise<FinancialReport | null> {
    try {
      const reportRef = doc(db, "financialReports", id);
      const reportSnapshot = await getDoc(reportRef);
      
      if (reportSnapshot.exists()) {
        return {
          id: reportSnapshot.id,
          ...reportSnapshot.data()
        } as FinancialReport;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching report by ID:", error);
      throw error;
    }
  }

  /**
   * Adaugă o nouă factură
   */
  static async addInvoice(invoice: Omit<Invoice, "id" | "createdAt">): Promise<string> {
    try {
      const invoiceData = {
        ...invoice,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, "invoices"), invoiceData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding invoice:", error);
      throw error;
    }
  }

  /**
   * Obține toate facturile, cu opțiuni de filtrare
   */
  static async getInvoices(
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: string;
      clientId?: string;
    },
    limitCount?: number
  ): Promise<Invoice[]> {
    try {
      let q = collection(db, "invoices");
      const queryConstraints = [];
      
      if (filters) {
        if (filters.startDate) {
          const startTimestamp = Timestamp.fromDate(filters.startDate);
          queryConstraints.push(where("issueDate", ">=", startTimestamp));
        }
        
        if (filters.endDate) {
          const endTimestamp = Timestamp.fromDate(filters.endDate);
          queryConstraints.push(where("issueDate", "<=", endTimestamp));
        }
        
        if (filters.status) {
          queryConstraints.push(where("status", "==", filters.status));
        }
        
        if (filters.clientId) {
          queryConstraints.push(where("clientId", "==", filters.clientId));
        }
      }
      
      // Adăugăm orderBy și limit dacă există
      queryConstraints.push(orderBy("issueDate", "desc"));
      
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }
      
      const invoicesQuery = query(q, ...queryConstraints);
      const snapshot = await getDocs(invoicesQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Invoice));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  }

  /**
   * Obtains financial summary for a specified period
   */
  static async getFinancialSummary(startDate: Date, endDate: Date): Promise<any> {
    try {
      // Get all transactions for the specified period
      const transactions = await this.getTransactions({
        startDate,
        endDate
      });
      
      // Initialize financial summary
      const summary = {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        incomeByCategory: {} as Record<string, number>,
        expenseByCategory: {} as Record<string, number>
      };
      
      // Calculate totals for each category
      transactions.forEach(transaction => {
        if (transaction.type === "income") {
          summary.totalIncome += transaction.amount;
          
          // Add amount to corresponding category
          if (summary.incomeByCategory[transaction.category]) {
            summary.incomeByCategory[transaction.category] += transaction.amount;
          } else {
            summary.incomeByCategory[transaction.category] = transaction.amount;
          }
        } else if (transaction.type === "expense") {
          summary.totalExpense += transaction.amount;
          
          // Add amount to corresponding category
          if (summary.expenseByCategory[transaction.category]) {
            summary.expenseByCategory[transaction.category] += transaction.amount;
          } else {
            summary.expenseByCategory[transaction.category] = transaction.amount;
          }
        }
      });
      
      // Calculate net profit
      summary.netProfit = summary.totalIncome - summary.totalExpense;
      
      return summary;
    } catch (error) {
      console.error("Error getting financial summary:", error);
      throw error;
    }
  }

  /**
   * Utilitar pentru obținerea titlului raportului în funcție de tip
   */
  private static getReportTitle(type: ReportType): string {
    switch (type) {
      case "profit_loss":
        return "Raport Profit și Pierdere";
      case "tax":
        return "Raport Fiscal";
      case "cash_flow":
        return "Raport Flux de Numerar";
      default:
        return `Raport ${type}`;
    }
  }
}

export default AccountingService;