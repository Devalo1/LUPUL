import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "../components";
import { lazyLoad, LazyComponent } from "../utils/lazyLoad";
import SpecialistRoute from "../components/routes/SpecialistRoute";
import AccountantRoute from "../components/routes/AccountantRoute";

// Import lazy pentru paginile publice
const HomePage = lazyLoad(() => import("../pages/HomePage"));
const AboutUs = lazyLoad(() => import("../pages/AboutUs"));
const Contact = lazyLoad(() => import("../pages/Contact"));
const LoginPage = lazyLoad(() => import("../pages/LoginPage"));
const RegisterPage = lazyLoad(() => import("../pages/RegisterPage"));
const ForgotPassword = lazyLoad(() => import("../pages/ForgotPassword"));
const ResetPassword = lazyLoad(() => import("../pages/ResetPassword"));
const EventsPage = lazyLoad(() => import("../pages/EventsPage"));
const EventDetails = lazyLoad(() => import("../pages/EventDetails"));
const Shop = lazyLoad(() => import("../pages/Shop"));
const ProductDetails = lazyLoad(() => import("../pages/ProductDetails"));
const Cart = lazyLoad(() => import("../pages/Cart"));
const NotFound = lazyLoad(() => import("../pages/NotFound"));
const Services = lazyLoad(() => import("../pages/Services"));
const PrivacyPolicy = lazyLoad(() => import("../pages/PrivacyPolicy"));
const Ong = lazyLoad(() => import("../pages/Ong"));
const Terapie = lazyLoad(() => import("../pages/Terapie"));
const TerapiePsihica = lazyLoad(() => import("../pages/terapie/Psihica"));
const TerapieFizica = lazyLoad(() => import("../pages/terapie/Fizica"));
const AIAdmin = lazyLoad(() => import("../pages/AIAdmin"));

// Import lazy pentru paginile ce necesită autentificare
const Dashboard = lazyLoad(() => import("../pages/Dashboard"));
const UserHome = lazyLoad(() => import("../pages/UserHome"));
const Profile = lazyLoad(() => import("../pages/Profile"));
const ProfileInfo = lazyLoad(() => import("../pages/ProfileInfo"));
const Checkout = lazyLoad(() => import("../pages/Checkout"));
const CheckoutSuccess = lazyLoad(() => import("../pages/CheckoutSuccess"));
const Appointments = lazyLoad(() => import("../pages/Appointments"));

// Import lazy pentru paginile administrative
const AdminPanel = lazyLoad(() => import("../pages/AdminPanel"));
const AdminInventory = lazyLoad(() => import("../pages/AdminInventory"));
const AdminUsers = lazyLoad(() => import("../pages/AdminUsers"));
const AdminCategories = lazyLoad(() => import("../pages/AdminCategories"));
const AddProduct = lazyLoad(() => import("../pages/AddProduct"));
const EditProduct = lazyLoad(() => import("../pages/EditProduct"));
const AddEvent = lazyLoad(() => import("../pages/AddEvent"));
const AdminAppointments = lazyLoad(() => import("../pages/AdminAppointments"));
// Import pentru noile pagini admin create
const AdminEvents = lazyLoad(() => import("../pages/AdminEvents"));
const AdminArticles = lazyLoad(() => import("../pages/AdminArticles"));
const ArticleEdit = lazyLoad(() => import("../pages/ArticleEdit")); // Adăugăm componenta ArticleEdit
const AdminSettings = lazyLoad(() => import("../pages/AdminSettings"));
// Import pentru pagina de administrare comenzi
const AdminOrders = lazyLoad(() => import("../pages/AdminOrders"));
const AdminAccounting = lazyLoad(() => import("../pages/AdminAccounting"));
const AdminAnalytics = lazyLoad(() => import("../pages/AdminAnalytics"));
// Import for specialist panel
const SpecialistPanel = lazyLoad(() => import("../pages/SpecialistPanel"));
// Import for user profiles admin
const UserProfilesAdmin = lazyLoad(() => import("../pages/UserProfilesAdmin"));

/**
 * Componenta principală pentru definirea rutelor aplicației
 * Toate componentele sunt încărcate lazy pentru performanță optimizată
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rute publice */}
      <Route path="/" element={<LazyComponent component={<HomePage />} />} />
      <Route
        path="/about"
        element={<LazyComponent component={<AboutUs />} />}
      />
      <Route
        path="/contact"
        element={<LazyComponent component={<Contact />} />}
      />
      <Route
        path="/login"
        element={<LazyComponent component={<LoginPage />} />}
      />
      <Route
        path="/register"
        element={<LazyComponent component={<RegisterPage />} />}
      />
      <Route
        path="/forgot-password"
        element={<LazyComponent component={<ForgotPassword />} />}
      />
      <Route
        path="/reset-password"
        element={<LazyComponent component={<ResetPassword />} />}
      />
      <Route
        path="/events"
        element={<LazyComponent component={<EventsPage />} />}
      />
      <Route
        path="/events/:id"
        element={<LazyComponent component={<EventDetails />} />}
      />
      {/* Redirecționăm /products către /magazin pentru a unifica experiența */}
      <Route path="/products" element={<Navigate replace to="/magazin" />} />
      <Route
        path="/products/:categorySlug"
        element={<Navigate replace to="/magazin?category=:categorySlug" />}
      />
      {/* Magazin rămâne ruta principală pentru vizualizarea produselor */}
      <Route path="/magazin" element={<LazyComponent component={<Shop />} />} />
      <Route path="/cart" element={<LazyComponent component={<Cart />} />} />
      <Route
        path="/servicii"
        element={<LazyComponent component={<Services />} />}
      />
      <Route
        path="/privacy-policy"
        element={<LazyComponent component={<PrivacyPolicy />} />}
      />
      {/* Rută alternativă pentru detalii produs la singular */}
      <Route
        path="/product/:id"
        element={<LazyComponent component={<ProductDetails />} />}
      />
      {/* Rută pentru ONG */}
      <Route path="/ong" element={<LazyComponent component={<Ong />} />} />{" "}
      {/* Rută pentru Terapie */}
      <Route
        path="/terapie"
        element={<LazyComponent component={<Terapie />} />}
      />
      <Route
        path="/terapie/psihica"
        element={<LazyComponent component={<TerapiePsihica />} />}
      />{" "}
      <Route
        path="/terapie/fizica"
        element={<LazyComponent component={<TerapieFizica />} />}
      />
      <Route
        path="/ai-admin"
        element={<LazyComponent component={<AIAdmin />} />}
      />
      {/* Rute protejate (necesită autentificare) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <LazyComponent component={<Dashboard />} />
          </ProtectedRoute>
        }
      />{" "}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <LazyComponent component={<Profile />} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/info"
        element={
          <ProtectedRoute>
            <LazyComponent component={<ProfileInfo />} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <LazyComponent component={<Checkout />} />
          </ProtectedRoute>
        }
      />
      {/* Pagina de confirmare comandă - accesibilă fără autentificare */}
      <Route
        path="/checkout/success"
        element={<LazyComponent component={<CheckoutSuccess />} />}
      />
      {/* Rută alternativă pentru checkout success (cu liniuță) */}
      <Route
        path="/checkout-success"
        element={<LazyComponent component={<CheckoutSuccess />} />}
      />
      <Route
        path="/user-home"
        element={
          <ProtectedRoute>
            <LazyComponent component={<UserHome />} />
          </ProtectedRoute>
        }
      />
      {/* Rută pentru programări */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <LazyComponent component={<Appointments />} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/programari"
        element={
          <ProtectedRoute>
            <LazyComponent component={<Appointments />} />
          </ProtectedRoute>
        }
      />
      {/* Rută pentru panoul de specialist */}
      <Route
        path="/specialist"
        element={
          <SpecialistRoute>
            <LazyComponent component={<SpecialistPanel />} />
          </SpecialistRoute>
        }
      />
      <Route
        path="/specialist/dashboard"
        element={
          <SpecialistRoute>
            <LazyComponent component={<SpecialistPanel />} />
          </SpecialistRoute>
        }
      />
      {/* Rută pentru panoul de contabilitate */}
      <Route
        path="/accounting/:panel"
        element={
          <AccountantRoute>
            <LazyComponent component={<AdminAccounting />} />
          </AccountantRoute>
        }
      />
      <Route
        path="/accounting"
        element={<Navigate to="/accounting/dashboard" replace />}
      />
      {/* Rute administrative (necesită rol de admin) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminPanel />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminPanel />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminInventory />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminUsers />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminCategories />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/add"
        element={
          <AdminRoute>
            <LazyComponent component={<AddProduct />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/edit/:id"
        element={
          <AdminRoute>
            <LazyComponent component={<EditProduct />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/events/add"
        element={
          <AdminRoute>
            <LazyComponent component={<AddEvent />} />
          </AdminRoute>
        }
      />
      {/* Rută alternativă pentru adăugarea produselor */}
      <Route
        path="/admin/add-product"
        element={
          <AdminRoute>
            <LazyComponent component={<AddProduct />} />
          </AdminRoute>
        }
      />
      {/* Rută pentru programări admin */}
      <Route
        path="/admin/appointments"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminAppointments />} />
          </AdminRoute>
        }
      />
      {/* Rută alternativă pentru adăugarea evenimentelor */}
      <Route
        path="/admin/add-event"
        element={
          <AdminRoute>
            <LazyComponent component={<AddEvent />} />
          </AdminRoute>
        }
      />
      {/* Rută pentru comenzi admin */}
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminOrders />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/accounting"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminAccounting />} />
          </AdminRoute>
        }
      />
      {/* Rute pentru noile pagini admin create */}
      <Route
        path="/admin/events"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminEvents />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/articles"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminArticles />} />
          </AdminRoute>
        }
      />
      {/* Adăugăm rutele pentru adăugarea și editarea articolelor */}
      <Route
        path="/admin/articles/add"
        element={
          <AdminRoute>
            <LazyComponent component={<ArticleEdit />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/articles/edit/:id"
        element={
          <AdminRoute>
            <LazyComponent component={<ArticleEdit />} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminSettings />} />
          </AdminRoute>
        }
      />{" "}
      {/* Ruta pentru profilurile utilizatorilor cu analytics */}
      <Route
        path="/admin/users-profiles"
        element={
          <AdminRoute>
            <LazyComponent component={<UserProfilesAdmin />} />
          </AdminRoute>
        }
      />
      {/* Ruta pentru analytics/info utilizatori */}
      <Route
        path="/admin/userinfo"
        element={
          <AdminRoute>
            <LazyComponent component={<AdminAnalytics />} />
          </AdminRoute>
        }
      />
      {/* Ruta pentru pagini inexistente */}
      <Route path="*" element={<LazyComponent component={<NotFound />} />} />
    </Routes>
  );
};

export default AppRoutes;
