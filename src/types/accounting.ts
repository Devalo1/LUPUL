// Tipuri pentru modulul de contabilitate

// Tipuri pentru documente și atașamente
export interface DocumentAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  url: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: Date;
  storagePath?: string; // Optional: for internal use to enable deletion from Firebase Storage
}

export interface PrintableReport {
  id: string;
  type: "zreport" | "settlement" | "invoice" | "stock";
  title: string;
  data: any;
  template: string;
  createdAt: Date;
  createdBy: string;
}

export interface ZReport {
  id?: string;
  date: Date;
  cashRegisterId: string;
  cashRegisterName: string;
  openingAmount: number;
  totalSales: number;
  totalDiscounts: number;
  totalRefunds: number;
  totalCash: number;
  totalCard: number;
  totalOther: number;
  closingAmount: number;
  difference: number;
  transactions: Transaction[];
  attachments?: DocumentAttachment[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id: string;
  type: "sale" | "refund" | "discount";
  amount: number;
  paymentMethod: "cash" | "card" | "other";
  description?: string;
  timestamp: Date;
  receiptNumber?: string;
}

export interface Settlement {
  id?: string;
  date: Date;
  type: "daily" | "weekly" | "monthly";
  cashRegisterId: string;
  totalAmount: number;
  bankDeposit: number;
  remainingCash: number;
  notes?: string;
  attachments?: DocumentAttachment[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientTaxId?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paymentMethod?: string;
  paymentDate?: Date;
  notes?: string;
  attachments?: DocumentAttachment[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Stock {
  id?: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  quantity: number;
  minimumLevel: number;
  unit: string;
  unitPrice: number;
  supplier?: string;
  lastRestockDate?: Date;
  lastSaleDate?: Date;
  location?: string;
  barcode?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface StockMovement {
  id?: string;
  productId: string;
  productName: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  reference?: string;
  unitPrice?: number;
  totalValue: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface CashRegister {
  id?: string;
  name: string;
  location: string;
  isActive: boolean;
  currentAmount: number;
  lastZReportDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AccountingPermissions {
  canViewReports: boolean;
  canCreateReports: boolean;
  canEditReports: boolean;
  canDeleteReports: boolean;
  canManageInvoices: boolean;
  canManageStock: boolean;
  canManageSettlements: boolean;
}

export interface AccountingSettings {
  taxRate: number;
  currency: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  companyInfo: {
    name: string;
    address: string;
    taxId: string;
    phone?: string;
    email?: string;
  };
}

// Tipuri pentru statusuri
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type SettlementType = "daily" | "weekly" | "monthly";

// Extindere InvoiceItem pentru UI (cu total)
export interface InvoiceItemUI extends InvoiceItem {
  total: number;
}

// Extindere Invoice pentru UI (proprietăți opționale pentru UI)
// For UI, date and dueDate are always string (YYYY-MM-DD)
export interface InvoiceUI extends Omit<Invoice, "date" | "dueDate"> {
  date: string;
  dueDate: string;
  description?: string;
  clientPhone?: string;
  taxRate?: number;
  items: InvoiceItemUI[];
}

// Extindere Settlement pentru UI (proprietăți opționale pentru UI)
export interface SettlementUI extends Settlement {
  startDate?: string; // for UI form compatibility
  endDate?: string; // for UI form compatibility
  description?: string;
  employeeName?: string;
  employeeId?: string;
  expenseDetails?: Array<{
    category: string;
    description: string;
    amount: number;
    receiptNumber?: string;
  }>;
  status?: string;
  notes?: string;
}

// Extindere ZReport pentru UI (proprietăți opționale pentru UI)
export interface ZReportUI extends Omit<ZReport, "date"> {
  date: string; // string for UI compatibility
  operatorName?: string;
  startingCash?: number;
  endingCash?: number;
  totalVAT?: number;
  reportNumber?: string;
  notes?: string;
}
