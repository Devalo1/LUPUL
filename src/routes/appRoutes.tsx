import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "../components";
import { lazyLoad, LazyComponent } from "../utils/lazyLoad";
import SpecialistRoute from "../components/routes/SpecialistRoute";
import AdminLayout from "../layouts/AdminLayout";

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

// Import lazy pentru paginile ce necesită autentificare
const Dashboard = lazyLoad(() => import("../pages/Dashboard"));
const UserHome = lazyLoad(() => import("../pages/UserHome"));
const Profile = lazyLoad(() => import("../pages/Profile"));
const Checkout = lazyLoad(() => import("../pages/Checkout"));
const CheckoutSuccess = lazyLoad(() => import("../pages/CheckoutSuccess"));
const _Appointments = lazyLoad(() => import("../pages/Appointments")); // Prefix with underscore

// Import direct pentru panoul de specialist pentru a evita probleme cu lazy loading
import SpecialistPanel from "../pages/SpecialistPanel";
import EditSessionPage from "../pages/EditSessionPage"; // Adăugăm importul pentru pagina de editare a sesiunilor
import CreateSessionPage from "../pages/CreateSessionPage"; // Adăugăm importul pentru pagina de creare a sesiunilor

// Import direct pentru AdminDashboard pentru a evita probleme cu lazy loading
import AdminDashboard from "../pages/AdminDashboard";

// Import lazy pentru paginile administrative
const _AdminPanel = lazyLoad(() => import("../pages/AdminPanel")); // Prefix with underscore
const AdminInventory = lazyLoad(() => import("../pages/AdminInventory"));
const AdminUsers = lazyLoad(() => import("../pages/AdminUsers"));
const AdminCategories = lazyLoad(() => import("../pages/AdminCategories"));
const AddProduct = lazyLoad(() => import("../pages/AddProduct"));
const EditProduct = lazyLoad(() => import("../pages/EditProduct"));
const AddEvent = lazyLoad(() => import("../pages/AddEvent"));
const AdminAppointments = lazyLoad(() => import("../pages/AdminAppointments"));
const AdminEvents = lazyLoad(() => import("../pages/AdminEvents"));
const AdminArticles = lazyLoad(() => import("../pages/AdminArticles"));
const ArticleEdit = lazyLoad(() => import("../pages/ArticleEdit"));
const AdminSettings = lazyLoad(() => import("../pages/AdminSettings"));
const AdminOrders = lazyLoad(() => import("../pages/AdminOrders"));
const AdminSpecialists = lazyLoad(() => import("../pages/AdminSpecialists"));
const AdminSpecializations = lazyLoad(() => import("../pages/AdminSpecializations"));
const AdminServices = lazyLoad(() => import("../pages/AdminServices"));
const EditSpecialist = lazyLoad(() => import("../pages/EditSpecialist"));
const AddSpecialist = lazyLoad(() => import("../pages/AddSpecialist"));

// Import direct pentru pagina principală de programări
import AppointmentsPage from "../pages/AppointmentsPage";

// Import direct pentru fiecare pagină de programare individual
import SpecialistSelection from "../pages/appointments/SpecialistSelection";
import ServiceSelection from "../pages/appointments/ServiceSelection";
import DateSelection from "../pages/appointments/DateSelection";
import TimeSelection from "../pages/appointments/TimeSelection";
import AppointmentConfirmation from "../pages/appointments/AppointmentConfirmation";
import SpecialistProfile from "../pages/appointments/specialist"; // Adăugat import pentru profil specialist

/**
 * Componenta principală pentru definirea rutelor aplicației
 * Toate componentele sunt încărcate lazy pentru performanță optimizată
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rute publice */}
      <Route path="/" element={<LazyComponent component={<HomePage />} />} />
      <Route path="/about" element={<LazyComponent component={<AboutUs />} />} />
      <Route path="/contact" element={<LazyComponent component={<Contact />} />} />
      <Route path="/login" element={<LazyComponent component={<LoginPage />} />} />
      <Route path="/register" element={<LazyComponent component={<RegisterPage />} />} />
      <Route path="/forgot-password" element={<LazyComponent component={<ForgotPassword />} />} />
      <Route path="/reset-password" element={<LazyComponent component={<ResetPassword />} />} />
      <Route path="/events" element={<LazyComponent component={<EventsPage />} />} />
      <Route path="/events/:id" element={<LazyComponent component={<EventDetails />} />} />
      
      {/* Redirecționăm /products către /magazin pentru a unifica experiența */}
      <Route path="/products" element={<Navigate replace to="/magazin" />} />
      <Route path="/products/:categorySlug" element={<Navigate replace to="/magazin?category=:categorySlug" />} />
      
      {/* Magazin rămâne ruta principală pentru vizualizarea produselor */}
      <Route path="/magazin" element={<LazyComponent component={<Shop />} />} />
      
      <Route path="/cart" element={<LazyComponent component={<Cart />} />} />
      <Route path="/servicii" element={<LazyComponent component={<Services />} />} />
      <Route path="/privacy-policy" element={<LazyComponent component={<PrivacyPolicy />} />} />
      
      {/* Rută alternativă pentru detalii produs la singular */}
      <Route path="/product/:id" element={<LazyComponent component={<ProductDetails />} />} />
      
      {/* Rută pentru ONG */}
      <Route path="/ong" element={<LazyComponent component={<Ong />} />} />
      
      {/* Rute protejate (necesită autentificare) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <LazyComponent component={<Dashboard />} />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <LazyComponent component={<Profile />} />
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <LazyComponent component={<Checkout />} />
        </ProtectedRoute>
      } />
      
      {/* Pagina de confirmare comandă - accesibilă fără autentificare */}
      <Route path="/checkout/success" element={<LazyComponent component={<CheckoutSuccess />} />} />
      
      {/* Rută alternativă pentru checkout success (cu liniuță) */}
      <Route path="/checkout-success" element={<LazyComponent component={<CheckoutSuccess />} />} />
      
      <Route path="/user-home" element={
        <ProtectedRoute>
          <LazyComponent component={<UserHome />} />
        </ProtectedRoute>
      } />
      
      {/* Rută pentru programări - folosim importuri directe fără lazy loading */}
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/programari" element={<Navigate replace to="/appointments" />} />
      
      {/* Rute pentru pașii procesului de programare */}
      <Route path="/appointments/specialist" element={<SpecialistSelection />} />
      <Route path="/appointments/specialist/:specialistId" element={<SpecialistProfile />} /> {/* Nouă rută pentru profilul specialistului */}
      <Route path="/appointments/service" element={<ServiceSelection />} />
      <Route path="/appointments/date" element={<DateSelection />} />
      <Route path="/appointments/time" element={<TimeSelection />} />
      <Route path="/appointments/confirm" element={<AppointmentConfirmation />} />
      
      {/* Rută pentru panoul de specialist - folosim import direct în loc de lazy loading */}
      <Route path="/specialist" element={
        <SpecialistRoute>
          <SpecialistPanel />
        </SpecialistRoute>
      } />
      <Route path="/specialist/dashboard" element={
        <SpecialistRoute>
          <SpecialistPanel />
        </SpecialistRoute>
      } />
      
      {/* Rută pentru editarea sesiunilor de specialist */}
      <Route path="/edit-session/:sessionId" element={
        <SpecialistRoute>
          <EditSessionPage />
        </SpecialistRoute>
      } />
      
      {/* Rută pentru crearea unei sesiuni noi */}
      <Route path="/create-session" element={
        <SpecialistRoute>
          <CreateSessionPage />
        </SpecialistRoute>
      } />
      
      {/* Rute administrative (necesită rol de admin) - Cu layout admin comun */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="inventory" element={<LazyComponent component={<AdminInventory />} />} />
        <Route path="users" element={<LazyComponent component={<AdminUsers />} />} />
        <Route path="categories" element={<LazyComponent component={<AdminCategories />} />} />
        <Route path="products/add" element={<LazyComponent component={<AddProduct />} />} />
        <Route path="products/edit/:id" element={<LazyComponent component={<EditProduct />} />} />
        <Route path="events/add" element={<LazyComponent component={<AddEvent />} />} />
        <Route path="add-product" element={<LazyComponent component={<AddProduct />} />} />
        <Route path="appointments" element={<LazyComponent component={<AdminAppointments />} />} />
        <Route path="add-event" element={<LazyComponent component={<AddEvent />} />} />
        <Route path="orders" element={<LazyComponent component={<AdminOrders />} />} />
        <Route path="events" element={<LazyComponent component={<AdminEvents />} />} />
        <Route path="articles" element={<LazyComponent component={<AdminArticles />} />} />
        <Route path="articles/add" element={<LazyComponent component={<ArticleEdit />} />} />
        <Route path="articles/edit/:id" element={<LazyComponent component={<ArticleEdit />} />} />
        <Route path="specialists" element={<LazyComponent component={<AdminSpecialists />} />} />
        <Route path="specialists/add" element={<LazyComponent component={<AddSpecialist />} />} />
        <Route path="specialists/edit/:id" element={<LazyComponent component={<EditSpecialist />} />} />
        <Route path="specializations" element={<LazyComponent component={<AdminSpecializations />} />} />
        <Route path="services" element={<LazyComponent component={<AdminServices />} />} />
        <Route path="settings" element={<LazyComponent component={<AdminSettings />} />} />
      </Route>
      
      {/* Ruta pentru pagini inexistente */}
      <Route path="*" element={<LazyComponent component={<NotFound />} />} />
    </Routes>
  );
};

export default AppRoutes;