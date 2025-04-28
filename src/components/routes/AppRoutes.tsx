import { Routes, Route, Navigate } from "react-router-dom";

// Protecție rute
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Import rute admin centralizate
import adminRoutes from "../../routes/adminRoutes";

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

// Import-uri pentru paginile de programări
import AppointmentsPage from "../../pages/AppointmentsPage";
import SpecialistSelection from "../../pages/appointments/SpecialistSelection";
import ServiceSelection from "../../pages/appointments/ServiceSelection";
import DateSelection from "../../pages/appointments/DateSelection";
import TimeSelection from "../../pages/appointments/TimeSelection";
import AppointmentConfirmation from "../../pages/appointments/AppointmentConfirmation";
import Appointments from "../../pages/Appointments";
import _Login from "../../pages/Login"; // Add underscore to mark as unused

// Either comment this out if the file doesn't exist
// import Register from "../../pages/Register";
// Or create a mock component if needed
const _Register = () => <div>Register Page</div>;

// Fix the unused Appointments warning by adding underscore
const _Appointments = Appointments;

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
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/user-home" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
      <Route path="/checkout-success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      
      {/* Noile rute pentru programări - împărțite pe pași */}
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/appointments/specialist" element={<SpecialistSelection />} />
      <Route path="/appointments/service" element={<ServiceSelection />} />
      <Route path="/appointments/date" element={<DateSelection />} />
      <Route path="/appointments/time" element={<TimeSelection />} />
      <Route path="/appointments/confirm" element={<AppointmentConfirmation />} />
      
      {/* Rute admin - folosind configurația centralizată din adminRoutes.tsx */}
      {adminRoutes.map((route) => (
        <Route 
          key={route.path} 
          path={route.path} 
          element={<AdminRoute>{route.element}</AdminRoute>} 
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