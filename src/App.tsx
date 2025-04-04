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

  useEffect(() => {
    if (!loading && currentUser && window.location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Se încarcă aplicația...</div>;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Navbar /> {/* Navbar este inclus o singură dată aici */}
      <div className="pt-16">
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={currentUser ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <HomePage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/user-home" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </Suspense>
  );
};

export default App;