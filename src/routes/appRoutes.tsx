import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "../components";
import { lazyLoad, LazyComponent } from "../utils/lazyLoad";

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

// Import lazy pentru paginile administrative
const AdminPanel = lazyLoad(() => import("../pages/AdminPanel"));
const AdminInventory = lazyLoad(() => import("../pages/AdminInventory"));
const AdminUsers = lazyLoad(() => import("../pages/AdminUsers"));
const AdminCategories = lazyLoad(() => import("../pages/AdminCategories"));
const AddProduct = lazyLoad(() => import("../pages/AddProduct"));
const EditProduct = lazyLoad(() => import("../pages/EditProduct"));
const AddEvent = lazyLoad(() => import("../pages/AddEvent"));

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
      
      {/* Rute administrative (necesită rol de admin) */}
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <LazyComponent component={<AdminPanel />} />
        </AdminRoute>
      } />
      <Route path="/admin/inventory" element={
        <AdminRoute>
          <LazyComponent component={<AdminInventory />} />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <LazyComponent component={<AdminUsers />} />
        </AdminRoute>
      } />
      <Route path="/admin/categories" element={
        <AdminRoute>
          <LazyComponent component={<AdminCategories />} />
        </AdminRoute>
      } />
      <Route path="/admin/products/add" element={
        <AdminRoute>
          <LazyComponent component={<AddProduct />} />
        </AdminRoute>
      } />
      <Route path="/admin/products/edit/:id" element={
        <AdminRoute>
          <LazyComponent component={<EditProduct />} />
        </AdminRoute>
      } />
      <Route path="/admin/events/add" element={
        <AdminRoute>
          <LazyComponent component={<AddEvent />} />
        </AdminRoute>
      } />
      {/* Rută pentru admin dashboard */}
      <Route path="/admin" element={
        <AdminRoute>
          <LazyComponent component={<AdminPanel />} />
        </AdminRoute>
      } />
      
      {/* Rută alternativă pentru adăugarea produselor */}
      <Route path="/admin/add-product" element={
        <AdminRoute>
          <LazyComponent component={<AddProduct />} />
        </AdminRoute>
      } />
      
      {/* Rută pentru programări admin */}
      <Route path="/admin/appointments" element={
        <AdminRoute>
          <LazyComponent component={<AdminPanel />} />
        </AdminRoute>
      } />
      
      {/* Rută alternativă pentru adăugarea evenimentelor */}
      <Route path="/admin/add-event" element={
        <AdminRoute>
          <LazyComponent component={<AddEvent />} />
        </AdminRoute>
      } />
      
      {/* Ruta pentru pagini inexistente */}
      <Route path="*" element={<LazyComponent component={<NotFound />} />} />
    </Routes>
  );
};

export default AppRoutes;