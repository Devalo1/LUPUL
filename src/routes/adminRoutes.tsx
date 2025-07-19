import React from "react";
import Admin from "../pages/Admin";
import AdminUsers from "../pages/AdminUsers";
import AdminInventory from "../pages/AdminInventory";
import AdminCategories from "../pages/AdminCategories";
import AdminAppointments from "../pages/AdminAppointments";
import AddProduct from "../pages/AddProduct";
import EditProduct from "../pages/EditProduct";
import AddEvent from "../pages/AddEvent";
import MakeAdmin from "../pages/MakeAdmin";
import AdminArticles from "../pages/AdminArticles";
import ArticleEdit from "../pages/ArticleEdit";
import AdminEvents from "../pages/AdminEvents"; // Adăugat import pentru AdminEvents
import AdminAnalytics from "../pages/AdminAnalytics";
import AdminSpecialists from "../pages/AdminSpecialists";
import AdminSettings from "../pages/AdminSettings";
import AdminOrders from "../pages/AdminOrders";
import AdminAccounting from "../pages/AdminAccounting";
import { Navigate } from "react-router-dom";

/**
 * Definirea structurii pentru rutele de administrare
 */
interface AdminRoute {
  path: string;
  element: React.ReactNode;
  title?: string;
  description?: string;
  icon?: string;
}

/**
 * Lista rutelor de administrare pentru aplicație.
 * Aceasta este singura sursă de adevăr pentru rutele admin,
 * astfel încât reorganizarea rutelor să fie mai simplă.
 */
export const adminRoutes: AdminRoute[] = [
  {
    path: "/admin",
    element: <Admin />,
    title: "Panou Principal",
    description: "Pagina principală a panoului de administrare",
    icon: "dashboard",
  },
  {
    path: "/admin/dashboard",
    element: <Navigate to="/admin" replace />,
    title: "Panou Principal",
    description: "Redirecționare către panoul principal",
  },
  {
    path: "/admin/users",
    element: <AdminUsers />,
    title: "Utilizatori",
    description: "Gestionează utilizatorii aplicației",
    icon: "users",
  },
  {
    path: "/admin/inventory",
    element: <AdminInventory />,
    title: "Inventar",
    description: "Gestionează inventarul produselor",
    icon: "inventory",
  },
  {
    path: "/admin/categories",
    element: <AdminCategories />,
    title: "Categorii",
    description: "Gestionează categoriile de produse",
    icon: "categories",
  },
  {
    path: "/admin/appointments",
    element: <AdminAppointments />,
    title: "Programări",
    description: "Gestionează programările clienților",
    icon: "calendar",
  },
  {
    path: "/admin/add-product",
    element: <AddProduct />,
    title: "Adaugă Produs",
    description: "Adaugă un produs nou în magazin",
    icon: "add-product",
  },
  {
    path: "/admin/edit-product/:id",
    element: <EditProduct />,
    title: "Editează Produs",
    description: "Editează informațiile unui produs existent",
    icon: "edit",
  },
  {
    path: "/admin/events",
    element: <AdminEvents />,
    title: "Evenimente",
    description: "Gestionează evenimentele și participanții",
    icon: "event-list",
  },
  {
    path: "/admin/add-event",
    element: <AddEvent />,
    title: "Adaugă Eveniment",
    description: "Adaugă un eveniment nou",
    icon: "event",
  },
  {
    path: "/admin/specialists",
    element: <AdminSpecialists />,
    title: "Specialiști",
    description: "Gestionează specialiștii",
    icon: "specialists",
  },
  {
    path: "/admin/make-admin",
    element: <MakeAdmin />,
    title: "Permisiuni Admin",
    description: "Gestionează permisiunile de administrator",
    icon: "admin",
  },
  {
    path: "/admin/articles",
    element: <AdminArticles />,
    title: "Articole",
    description: "Gestionează articolele",
    icon: "articles",
  },
  {
    path: "/admin/articles/add",
    element: <ArticleEdit />,
    title: "Adaugă Articol",
    description: "Adaugă un articol nou",
    icon: "add-article",
  },
  {
    path: "/admin/articles/edit/:id",
    element: <ArticleEdit />,
    title: "Editează Articol",
    description: "Editează informațiile unui articol existent",
    icon: "edit-article",
  },
  {
    path: "/admin/userinfo",
    element: <AdminAnalytics />,
    title: "Informații Utilizatori",
    description: "Analizează comportamentul utilizatorilor și statistici",
    icon: "userinfo",
  },
  {
    path: "/admin/settings",
    element: <AdminSettings />,
    title: "Setări",
    description: "Configurează setările aplicației",
    icon: "settings",
  },
  {
    path: "/admin/orders",
    element: <AdminOrders />,
    title: "Comenzi",
    description: "Gestionează comenzile clienților",
    icon: "orders",
  },
  {
    path: "/admin/accounting",
    element: <AdminAccounting />,
    title: "Contabilitate",
    description: "Gestionează aspectele contabile",
    icon: "accounting",
  },
  {
    path: "/admin/invoices",
    element: <AdminAccounting />,
    title: "Facturi",
    description: "Gestionează facturile (redirecționare către contabilitate)",
    icon: "invoices",
  },
  {
    path: "/admin/settings/payment",
    element: <AdminSettings />,
    title: "Setări Plăți",
    description: "Configurează setările pentru plăți",
  },
  {
    path: "/admin/edit-article/:id",
    element: <ArticleEdit />,
    title: "Editează Articol",
    description:
      "Editează informațiile unui articol existent (compatibilitate)",
    icon: "edit-article",
  },
];

/**
 * Obținem lista de elemente de navigare pentru panoul de admin
 * (acestea sunt rutele care trebuie să apară în meniul de navigare)
 */
export const getAdminNavItems = () => {
  return adminRoutes.filter((route) => route.icon && !route.path.includes(":"));
};

/**
 * Funcție helper pentru a găsi ruta admin după URL path
 */
export const findAdminRouteByPath = (path: string) => {
  return adminRoutes.find((route) => route.path === path);
};

export default adminRoutes;
