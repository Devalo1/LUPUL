// Rename this file to routes.tsx or remove TypeScript annotations

import React, { createElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import SpecialistRoute from './components/routes/SpecialistRoute';
import { 
  Home,
  About,
  Contact,
  Products,
  ProductDetail,
  Login,
  Register,
  Dashboard,
  SpecialistPanel,
  Cart,
  Checkout,
  OrderSuccess,
  NotFound
} from './pages';
import AppointmentsPage from './pages/AppointmentsPage';
import SpecialistSelection from './pages/appointments/SpecialistSelection';
import ServiceSelection from './pages/appointments/ServiceSelection';
import DateSelection from './pages/appointments/DateSelection';
import TimeSelection from './pages/appointments/TimeSelection';
import AppointmentConfirmation from './pages/appointments/AppointmentConfirmation';
import EditSessionPage from './pages/EditSessionPage';

// Import the admin routes from the dedicated file
import adminRoutes from './routes/adminRoutes';

/**
 * Rutele principale ale aplicației
 */
export const routes = [
  { path: "/", element: createElement(Home) },
  { path: "/about", element: createElement(About) },
  { path: "/contact", element: createElement(Contact) },
  { path: "/products", element: createElement(Products) },
  { path: "/products/:productId", element: createElement(ProductDetail) },
  { path: "/login", element: createElement(Login) },
  { path: "/register", element: createElement(Register) },
  { path: "/appointments", element: createElement(AppointmentsPage) },
  { path: "/appointments/specialist", element: createElement(SpecialistSelection) },
  { path: "/appointments/service", element: createElement(ServiceSelection) },
  { path: "/appointments/date", element: createElement(DateSelection) },
  { path: "/appointments/time", element: createElement(TimeSelection) },
  { path: "/appointments/confirm", element: createElement(AppointmentConfirmation) },
  { path: "/cart", element: createElement(Cart) },
  { path: "/checkout", element: createElement(Checkout) },
  { path: "/order-success", element: createElement(OrderSuccess) },
  { path: "/dashboard", element: createElement(Dashboard) },
  { path: "/specialist", element: createElement(SpecialistRoute, null, createElement(SpecialistPanel)) },
  { path: "/edit-session/:sessionId", element: createElement(SpecialistRoute, null, createElement(EditSessionPage)) },
  ...adminRoutes.map((route) => ({
    path: route.path,
    element: createElement(AdminRoute, null, route.element)
  })),
  { path: "/admin-panel", element: createElement(Navigate, { to: "/admin", replace: true }) },
  { path: "/specialist-panel", element: createElement(Navigate, { to: "/specialist", replace: true }) },
  { path: "*", element: createElement(NotFound) }
];

export default routes;
