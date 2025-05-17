import { Timestamp } from "firebase/firestore";

/**
 * Represents a financial transaction
 */
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  date: Timestamp;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
}

/**
 * Transaction category
 */
export interface TransactionCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  description?: string;
}

/**
 * Valid invoice statuses
 */
export type InvoiceStatus = "paid" | "unpaid" | "overdue";

/**
 * Client contact details
 */
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  companyName?: string;
  notes?: string;
}

/**
 * Invoice item line
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

/**
 * Complete invoice information
 */
export interface Invoice {
  id: string;
  number: string;
  client: {
    id: string;
    name: string;
    email: string;
    address?: string;
  };
  date: Timestamp;
  dueDate: Timestamp;
  items: InvoiceItem[];
  amount: number;
  status: InvoiceStatus;
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Financial report types
 */
export type ReportType = "income" | "expense" | "profit" | "tax";

/**
 * Report period types
 */
export type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

/**
 * Financial report structure
 */
export interface FinancialReport {
  id: string;
  name: string;
  type: ReportType;
  period: ReportPeriod;
  startDate: Timestamp;
  endDate: Timestamp;
  data: any;
  createdAt: Timestamp;
  createdBy: string;
}