import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingFallback from './components/ui/LoadingFallback';
import ProtectedRoute from './components/routes/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const UserHome = lazy(() => import('./pages/UserHome'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const App = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  console.log('App render - Loading:', loading, 'Current User:', currentUser);

  // Redirecționare activă pentru utilizatorii autentificați
  useEffect(() => {
    if (!loading && currentUser && window.location.pathname === '/') {
      console.log('Logged in user detected at root, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  // Show loading screen while checking authentication status
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Se încarcă aplicația...</div>;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Navbar />
      <div className="pt-16">
        <Routes>
          {/* Public routes, accessible to all */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* These routes will automatically redirect to dashboard if user is logged in */}
          <Route path="/login" element={
            currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="/register" element={
            currentUser ? <Navigate to="/dashboard" replace /> : <Register />
          } />
          <Route path="/" element={
            currentUser ? <Navigate to="/dashboard" replace /> : <HomePage />
          } />
          
          {/* Protected routes, only for authenticated users */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/user-home" element={
            <ProtectedRoute>
              <UserHome />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </Suspense>
  );
};

export default App;