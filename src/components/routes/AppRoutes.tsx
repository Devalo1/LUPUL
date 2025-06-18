import { Routes, Route, Navigate } from "react-router-dom";

// Protecție rute
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AccountantRoute from "./AccountantRoute";

// Import rute admin și contabilitate centralizate
import adminRoutes from "../../routes/adminRoutes";
import accountingRoutes from "../../routes/accountingRoutes";

// Pagini publice
import HomePage from "../../pages/HomePage";
import AboutUs from "../../pages/AboutUs";
import Services from "../../pages/Services";
import Shop from "../../pages/Shop";
import Products from "../../pages/Products";
import ProductDetails from "../../pages/ProductDetails";
import Events from "../../pages/Events";
import EventDetails from "../../pages/EventDetails";
import LoginPage from "../../pages/LoginPage";
import RegisterPage from "../../pages/RegisterPage";
import ForgotPassword from "../../pages/ForgotPassword";
import ResetPassword from "../../pages/ResetPassword";
import Contact from "../../pages/Contact";
import NotFound from "../../pages/NotFound";
import PrivacyPolicy from "../../pages/PrivacyPolicy";
import Ong from "../../pages/Ong";
import Partners from "../../pages/Partners";

// Pagini protejate (necesită autentificare)
import Dashboard from "../../pages/Dashboard";
import UserHome from "../../pages/UserHome";
import Profile from "../../pages/Profile";
import Cart from "../../pages/Cart";
import Checkout from "../../pages/Checkout";
import OrderSuccess from "../../pages/OrderSuccess";
import CheckoutSuccess from "../../pages/CheckoutSuccess";
import Orders from "../../pages/Orders";
import Account from "../../pages/Account";
import Appointments from "../../pages/Appointments";

// Pagini AI
import AIMessenger from "../../pages/ai/AIMessenger";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rute publice */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/services" element={<Services />} />
      <Route path="/magazin" element={<Shop />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/ong" element={<Ong />} />
      <Route path="/partners" element={<Partners />} />
      {/* Rute protejate (necesită autentificare) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-home"
        element={
          <ProtectedRoute>
            <UserHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-success"
        element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout-success"
        element={
          <ProtectedRoute>
            <CheckoutSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-messenger"
        element={
          <ProtectedRoute>
            <AIMessenger />
          </ProtectedRoute>
        }
      />{" "}
      {/* Rute admin - folosind configurația centralizată din adminRoutes.tsx */}
      {adminRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<AdminRoute>{route.element}</AdminRoute>}
        />
      ))}
      {/* Rute contabilitate - folosind configurația centralizată din accountingRoutes.tsx */}
      {accountingRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<AccountantRoute>{route.element}</AccountantRoute>}
        />
      ))}
      {/* Redirecționări pentru compatibilitate */}
      <Route path="/admin/panel" element={<Navigate to="/admin" replace />} />
      <Route path="/adminpanel" element={<Navigate to="/admin" replace />} />
      <Route path="/produse" element={<Navigate to="/products" replace />} />
      <Route path="/evenimente" element={<Navigate to="/events" replace />} />
      <Route path="/cos" element={<Navigate to="/cart" replace />} />
      <Route path="/cont" element={<Navigate to="/account" replace />} />
      {/* Rută 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
