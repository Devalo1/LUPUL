import React from "react";
import { Navigate } from "react-router-dom";
import AccountingDashboard from "../components/accounting/AccountingDashboard";

/**
 * Definirea structurii pentru rutele de contabilitate
 */
interface AccountingRoute {
  path: string;
  element: React.ReactNode;
  title?: string;
  description?: string;
  icon?: string;
}

/**
 * Lista rutelor de contabilitate pentru aplicație.
 * Aceasta este singura sursă de adevăr pentru rutele de contabilitate,
 * astfel încât reorganizarea rutelor să fie mai simplă.
 */
export const accountingRoutes: AccountingRoute[] = [
  {
    path: "/accounting",
    element: <AccountingDashboard />,
    title: "Panou Contabilitate",
    description: "Pagina principală a panoului de contabilitate",
    icon: "dashboard",
  },
  {
    path: "/accounting/dashboard",
    element: <Navigate to="/accounting" replace />,
    title: "Panou Contabilitate",
    description: "Redirecționare către panoul principal de contabilitate",
  },
  {
    path: "/accounting/reports",
    element: <AccountingDashboard activeTab="zreports" />,
    title: "Rapoarte Z",
    description: "Gestionează rapoartele Z zilnice",
    icon: "reports",
  },
  {
    path: "/accounting/settlements",
    element: <AccountingDashboard activeTab="settlements" />,
    title: "Decontări",
    description: "Gestionează decontările angajaților",
    icon: "settlements",
  },
  {
    path: "/accounting/invoices",
    element: <AccountingDashboard activeTab="invoices" />,
    title: "Facturi",
    description: "Gestionează facturile și documentele fiscale",
    icon: "invoices",
  },
  {
    path: "/accounting/stock",
    element: <AccountingDashboard activeTab="stock" />,
    title: "Gestiune Stocuri",
    description: "Gestionează inventarul și mișcările de stoc",
    icon: "stock",
  },
  {
    path: "/accounting/calendar",
    element: <AccountingDashboard activeTab="calendar" />,
    title: "Calendar Contabil",
    description: "Vizualizare calendar cu toate evenimentele contabile",
    icon: "calendar",
  },
];

export default accountingRoutes;
