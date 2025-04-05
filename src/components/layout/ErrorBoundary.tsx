import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { CartProvider } from '../../contexts/CartContext';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'; // Importă funcțiile Firebase
import { signInWithGoogle } from '../../services/Index'; // Importă funcția pentru autentificarea cu Google
import ProtectedRoute from '../../components/routes/ProtectedRoute';
import Layout from '../layout/Layout'; // Add this import

// Lazy-loaded pages
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const RegisterPage = lazy(() => import('../../pages/RegisterPage'));
const HomePage = lazy(() => import('../../pages/HomePage'));
const Dashboard = lazy(() => import('../../pages/Dashboard'));
const UserHome = lazy(() => import('../../pages/UserHome')); // Pagina pentru utilizatori autentificați

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error; errorInfo?: ErrorInfo }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h1 className="text-xl font-bold text-red-800 mb-2">A apărut o eroare</h1>
          {process.env.NODE_ENV === 'development' && (
            <div>
              <p className="text-red-600">{this.state.error?.message}</p>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const { currentUser, setCurrentUser, setLoading, loading } = useAuth(); // Asigură-te că setCurrentUser și setLoading sunt disponibile
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        setCurrentUser(user);
        setLoading(false);
      } catch (error) {
        console.error('Eroare la verificarea autentificării:', error);
      }
    });

    return () => unsubscribe();
  }, [setCurrentUser, setLoading]);

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        navigate('/userhome'); // Redirecționează utilizatorii autentificați către UserHome
      }
    }
  }, [currentUser, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Autentificare reușită:', userCredential.user);
      navigate('/userhome'); // Redirecționează utilizatorul
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Utilizatorul nu există.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Parola este incorectă.');
      } else {
        console.error('Eroare la autentificare:', err);
        setError('A apărut o eroare la autentificare.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/userhome'); // Redirecționează utilizatorul
    } catch (err) {
      console.error('Eroare la autentificarea cu Google:', err);
      setError('A apărut o eroare la autentificarea cu Google.');
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/userhome"
        element={
          <ProtectedRoute>
            <Layout><UserHome /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function Root() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <React.Suspense fallback={<div>Loading...</div>}>
            <App />
          </React.Suspense>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default Root;
