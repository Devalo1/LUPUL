import { Timestamp } from "firebase/firestore";

export type TransactionType = "income" | "expense";
export type ReportType = "profit_loss" | "tax" | "cash_flow" | string;
// Convert from type to enum to support InvoiceStatus.DRAFT-style usage
export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PENDING = "sent", // Adding PENDING as an alias for 'sent' based on code usage
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled"
}
export type PaymentMethod = "cash" | "bank_transfer" | "card" | "other";

export interface Transaction {
  id: string;
  date: Timestamp;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  reference?: string;
  notes?: string;
  attachments?: string[];
  createdAt: Timestamp;
  createdBy: string;
  relatedInvoice?: string;
  tags?: string[];
}

export interface FinancialTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Timestamp | Date;
  createdAt: Timestamp | Date;
  paymentMethod?: string;
  reference?: string;
  attachments?: string[];
  tags?: string[];
  userId?: string;
  metadata?: Record<string, any>;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType;
  description?: string;
  isSystem?: boolean;
  parentId?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  number: string;
  date: Timestamp;
  issueDate: Timestamp | Date;
  dueDate: Timestamp | Date;
  client: string;
  clientId: string;
  clientName: string;
  clientDetails: {
    address: string;
    taxId?: string;
    email?: string;
    phone?: string;
  };
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientTaxId?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  notes?: string;
  terms?: string;
  termsAndConditions?: string;
  paymentMethod?: PaymentMethod;
  paymentDetails?: {
    method: string;
    reference?: string;
    date?: Timestamp | Date;
  };
  paymentDate?: Timestamp;
  attachments?: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp;
  createdBy: string;
  currency: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  fiscalCode?: string;
  vatNumber?: string;
  registrationNumber?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
}

export interface AccountingSettings {
  currency: string;
  taxRate: number;
  fiscalYear: {
    startMonth: number; // 1-12
    startDay: number; // 1-31
  };
  invoicePrefix: string;
  invoiceNumbering: {
    currentNumber: number;
    resetYearly: boolean;
  };
  companyDetails?: {
    name: string;
    taxId: string;
    registrationNumber: string;
    address: string;
    bankAccount: string;
    bankName: string;
    email: string;
    phone: string;
    logo: string;
  };
  invoiceSettings?: {
    prefix: string;
    startNumber: number;
    dueDays: number;
    notes: string;
    termsAndConditions: string;
  };
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
}

export interface FinancialReport {
  id: string;
  type: ReportType;
  title: string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  createdAt: Timestamp | Date;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    incomeByCategory: Record<string, number>;
    expenseByCategory: Record<string, number>;
  };
  data: Record<string, any>; // Date specifice pentru fiecare tip de raport
}

// Dashboard data interfaces for widgets
export interface FinancialSnapshot {
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthProfit: number;
  previousMonthIncome: number;
  previousMonthExpense: number;
  previousMonthProfit: number;
  changePercentage: {
    income: number;
    expense: number;
    profit: number;
  };
}

export interface InvoicesSummary {
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  totalOutstanding: number;
}

export interface RecentActivity {
  id: string;
  type: "transaction" | "invoice" | "client" | "report";
  action: "created" | "updated" | "deleted";
  entityId: string;
  entityName: string;
  timestamp: Timestamp;
  user: string;
}