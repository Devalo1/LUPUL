import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingFallback from './components/ui/LoadingFallback'; // Updated import

// Lazy loaded components to improve initial load time
const HomePage = lazy(() => import('./pages/HomePage'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Account = lazy(() => import('./pages/Account'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Admin = lazy(() => import('./pages/Admin'));
const Events = lazy(() => import('./pages/Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Router>
            <div className="app-container">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="about" element={<About />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="reset-password" element={<ForgotPassword />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/:id" element={<ProductDetails />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="events" element={<Events />} />
                  <Route path="events/:id" element={<EventDetails />} />
                  
                  {/* Protected routes */}
                  <Route 
                    path="checkout" 
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="account" 
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="orders" 
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="order-success" 
                    element={
                      <ProtectedRoute>
                        <OrderSuccess />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="admin/*" 
                    element={
                      <ProtectedRoute adminOnly>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </Suspense>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;