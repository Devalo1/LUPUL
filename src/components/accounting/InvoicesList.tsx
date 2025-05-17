import React from "react";
import { Link } from "react-router-dom";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  issueDate: any; // Timestamp
  dueDate: any; // Timestamp
  status: "paid" | "unpaid" | "overdue" | "draft";
}

interface InvoicesListProps {
  invoices: Invoice[];
}

const InvoicesList: React.FC<InvoicesListProps> = ({ invoices }) => {
  const getStatusClass = (status: string): string => {
    switch (status) {
      case "paid":
        return "status-paid";
      case "unpaid":
        return "status-unpaid";
      case "overdue":
        return "status-overdue";
      case "draft":
        return "status-draft";
      default:
        return "";
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "N/A";
    
    // Handle Firestore Timestamp or JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
  };

  return (
    <div className="invoices-list">
      {invoices.length === 0 ? (
        <p className="no-invoices">Nu există facturi de afișat</p>
      ) : (
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Număr</th>
              <th>Client</th>
              <th>Sumă</th>
              <th>Emisă la</th>
              <th>Scadentă</th>
              <th>Status</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>{invoice.invoiceNumber || `#${invoice.id.slice(0, 6)}`}</td>
                <td>{invoice.clientName}</td>
                <td>{formatCurrency(invoice.amount)}</td>
                <td>{formatDate(invoice.issueDate)}</td>
                <td>{formatDate(invoice.dueDate)}</td>
                <td>
                  <span className={`invoice-status ${getStatusClass(invoice.status)}`}>
                    {invoice.status === "paid" && "Plătită"}
                    {invoice.status === "unpaid" && "Neplătită"}
                    {invoice.status === "overdue" && "Întârziată"}
                    {invoice.status === "draft" && "Ciornă"}
                  </span>
                </td>
                <td className="invoice-actions">
                  <Link to={`/accounting/invoices/${invoice.id}`} className="view-action">
                    Vezi
                  </Link>
                  <Link to={`/accounting/invoices/${invoice.id}/edit`} className="edit-action">
                    Editează
                  </Link>
                  <button className="print-action">
                    Printează
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div className="invoices-footer">
        <Link to="/accounting/invoices" className="view-all-link">
          Vezi toate facturile
        </Link>
      </div>
    </div>
  );
};

export default InvoicesList;