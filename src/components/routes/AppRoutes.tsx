import { Suspense } from "react";
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
import EventsPage from "../../pages/EventsPage";
import EventDetails from "../../pages/EventDetails";
import PaymentPage from "../../pages/PaymentPage";
import NetopiaVerificationPage from "../../pages/NetopiaVerificationPage";
import LoginPage from "../../pages/LoginPage";
import RegisterPage from "../../pages/RegisterPage";
import ForgotPassword from "../../pages/ForgotPassword";
import ResetPassword from "../../pages/ResetPassword";
import Contact from "../../pages/Contact";
import NotFound from "../../pages/NotFound";
import PrivacyPolicy from "../../pages/PrivacyPolicy";
import CookiePolicy from "../../pages/CookiePolicy";
import GDPRPolicy from "../../pages/GDPRPolicy";
import TermsAndConditions from "../../pages/TermsAndConditions";
import ShippingPolicy from "../../pages/ShippingPolicy";
import CancellationPolicy from "../../pages/CancellationPolicy";
import DataProtection from "../../pages/DataProtection";
import Accessibility from "../../pages/Accessibility";
import ANPCConsumerInfo from "../../pages/ANPCConsumerInfo";
import PaymentSecurityPage from "../../pages/PaymentSecurityPage";
import Ong from "../../pages/Ong";
import Partners from "../../pages/Partners";
import PaymentSimulation from "../../pages/PaymentSimulation";
import Formular230Page from "../../pages/Formular230Page";
import Terapie from "../../pages/Terapie";
import TerapiePsihica from "../../pages/terapie/Psihica";
import TerapieFizica from "../../pages/terapie/Fizica";

// Pagini protejate (necesită autentificare)
import Dashboard from "../../pages/Dashboard";
import DashboardAISettings from "../../pages/dashboard/AIsettings";
import UserHome from "../../pages/UserHome";
import Profile from "../../pages/Profile";
import Cart from "../../pages/Cart";
import Checkout from "../../pages/Checkout";
import OrderSuccess from "../../pages/OrderSuccess";
import CheckoutSuccess from "../../pages/CheckoutSuccess";
import Orders from "../../pages/Orders";
import Account from "../../pages/Account";
import Appointments from "../../pages/Appointments";
import ProfileInfo from "../../pages/ProfileInfo";

// Pagini AI
import AIMessenger from "../../pages/ai/AIMessenger";

// Pagini medicale AI
import MedicalRoutes from "../../routes/MedicalRoutes";

// Pagini embleme
import { EmblemMintingPage, EmblemDashboard } from "../../components/emblems";

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Se încarcă...</div>}>
      <Routes>
        {/* Rute publice */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/servicii" element={<Services />} />
        <Route path="/terapie" element={<Terapie />} />
        <Route path="/terapie/psihica" element={<TerapiePsihica />} />
        <Route path="/terapie/fizica" element={<TerapieFizica />} />
        <Route path="/magazin" element={<Shop />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route
          path="/netopia-verification"
          element={<NetopiaVerificationPage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/gdpr-policy" element={<GDPRPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/data-protection" element={<DataProtection />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/anpc-consumer-info" element={<ANPCConsumerInfo />} />
        <Route path="/payment-security" element={<PaymentSecurityPage />} />
        <Route path="/payment-simulation" element={<PaymentSimulation />} />
        <Route path="/ong" element={<Ong />} />
        <Route path="/formular-230" element={<Formular230Page />} />
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
          path="/dashboard/AIsettings"
          element={
            <ProtectedRoute>
              <DashboardAISettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/AIsetting"
          element={
            <ProtectedRoute>
              <DashboardAISettings />
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
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/info"
          element={
            <ProtectedRoute>
              <ProfileInfo />
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
          path="/order-confirmation"
          element={
            <ProtectedRoute>
              <CheckoutSuccess />
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
          path="/programari"
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
        />

        {/* Rute sistem medical AI (necesită autentificare) */}
        <Route
          path="/medical/*"
          element={
            <ProtectedRoute>
              <MedicalRoutes />
            </ProtectedRoute>
          }
        />

        {/* Rute embleme (necesită autentificare) */}
        <Route
          path="/emblems/mint"
          element={
            <ProtectedRoute>
              <EmblemMintingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emblems/dashboard"
          element={
            <ProtectedRoute>
              <EmblemDashboard />
            </ProtectedRoute>
          }
        />
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
        <Route path="/despre" element={<Navigate to="/about" replace />} />
        <Route path="/despre-noi" element={<Navigate to="/about" replace />} />
        <Route path="/contacte" element={<Navigate to="/contact" replace />} />
        <Route
          path="/parteneri"
          element={<Navigate to="/partners" replace />}
        />
        <Route
          path="/servicii-medicale"
          element={<Navigate to="/terapie" replace />}
        />
        <Route path="/therapy" element={<Navigate to="/terapie" replace />} />
        <Route
          path="/appointments-list"
          element={<Navigate to="/appointments" replace />}
        />
        <Route
          path="/programari-lista"
          element={<Navigate to="/programari" replace />}
        />
        <Route path="/shop" element={<Navigate to="/magazin" replace />} />
        <Route path="/store" element={<Navigate to="/magazin" replace />} />
        <Route path="/magazine" element={<Navigate to="/magazin" replace />} />
        <Route path="/user" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/my-account"
          element={<Navigate to="/account" replace />}
        />
        <Route path="/my-profile" element={<Navigate to="/profil" replace />} />
        <Route
          path="/appointments/list"
          element={<Navigate to="/appointments" replace />}
        />
        <Route
          path="/programari/lista"
          element={<Navigate to="/programari" replace />}
        />
        {/* Rută 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
