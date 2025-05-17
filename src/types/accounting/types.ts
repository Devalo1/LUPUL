export interface Transaction {
  id: string;
  date: Date | string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense";
  paymentMethod?: string;
  reference?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: Date | string;
  dueDate: Date | string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  fiscalCode?: string;  // CUI/CIF for Romanian companies
  regNumber?: string;   // Reg Com for Romanian companies
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AccountingReport {
  id: string;
  name: string;
  type: "income" | "expense" | "profit-loss" | "vat" | "custom";
  startDate: Date | string;
  endDate: Date | string;
  data: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}