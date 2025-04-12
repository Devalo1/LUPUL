import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from '../pages/HomePage'; // Fix the import path to point to src/pages folder
import About from '../pages/About';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Dashboard from '../pages/Dashboard';
import UserHome from '../pages/UserHome';
import EventDetails from '../pages/EventDetails'; // Adaug importul pentru EventDetails
import Events from '../pages/Events'; // Adaug importul pentru pagina de evenimente
import AdminPanel from '../pages/AdminPanel'; // Adaug importul pentru AdminPanel
import AddBusinessEvent from '../pages/AddBusinessEvent'; // Adaug importul pentru AddBusinessEvent
import MakeAdmin from '../pages/MakeAdmin'; // Adaug importul pentru MakeAdmin
import Products from '../pages/Products'; // Adaug importul pentru pagina de produse
import ProductDetails from '../pages/ProductDetails'; // Adaug importul pentru pagina de detalii a produsului
import AddProduct from '../pages/AddProduct'; // Import pentru pagina AddProduct
import Ong from '../pages/Ong'; // Import pentru pagina ONG
import Checkout from '../pages/Checkout'; // Import pentru pagina Checkout
import CheckoutSuccess from '../pages/CheckoutSuccess'; // Import pentru pagina CheckoutSuccess
import ProtectedRoute from './ProtectedRoute';
import NotFound from '../pages/NotFound';
import PrivacyPolicy from '../pages/PrivacyPolicy'; // Import pentru pagina Privacy Policy
import { useAuth } from '../contexts/AuthContext'; // Fix the import path to match main.tsx
import { CartProvider } from '../contexts/CartContext'; // Adaug importul pentru CartProvider
import { NavigationProvider } from '../contexts/NavigationContext';
import SideNavigation from './navigation/SideNavigation';
import Cart from '../pages/Cart'; // Adaug componenta Cart la importuri
import Admin from '../pages/Admin'; // Add import for Admin page

const AppLayout = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    // Log pentru debugging
    useEffect(() => {
        console.log('Current path:', location.pathname);
    }, [location]);

    // Redirecționare automată dacă utilizatorul este autentificat
    useEffect(() => {
        if (isAuthenticated && !loading) {
            // Verifică dacă utilizatorul nu este deja pe o pagină protejată
            const currentPath = window.location.pathname;
            if (currentPath === '/' || currentPath === '/login' || currentPath === '/register') {
                navigate('/user-home');
            }
        }
    }, [isAuthenticated, loading, navigate]);

    // Set a loading timeout to avoid infinite spinner
    useEffect(() => {
        if (loading) {
            setLoadingTimeout(true);
            const timer = setTimeout(() => {
                setLoadingTimeout(false);
            }, 5000); // Force loading to end after 5 seconds
            return () => clearTimeout(timer);
        } else {
            setLoadingTimeout(false);
        }
    }, [loading]);

    // Afișăm un indicator de încărcare până când starea de autentificare este determinată
    if (loading && loadingTimeout) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" 
                     style={{transform: 'translateZ(0)', willChange: 'transform'}}></div>
            </div>
        );
    }

    // Verifică dacă suntem pe pagina de politică de confidențialitate pentru a o gestiona special
    const isPrivacyPage = location.pathname === '/privacy-policy';

    return (
        <NavigationProvider>
            <CartProvider>
                {/* Componenta SideNavigation este poziționată în afara Layout pentru a fi disponibilă peste tot */}
                <SideNavigation />
                
                {location.pathname === '/' ? (
                    // Render HomePage directly without Layout
                    <HomePage />
                ) : isPrivacyPage ? (
                    // Render Privacy Policy with regular Layout
                    <Layout>
                        <PrivacyPolicy />
                    </Layout>
                ) : (
                    // Render Layout for all other routes
                    <Layout>
                        <Routes>
                            <Route path="/" element={isAuthenticated ? <Navigate to="/user-home" replace /> : <HomePage />} />
                            <Route path="/about" element={<About />} />
                            <Route 
                                path="/login" 
                                element={isAuthenticated ? <Navigate to="/user-home" replace /> : <LoginPage />} 
                            />
                            <Route 
                                path="/register" 
                                element={isAuthenticated ? <Navigate to="/user-home" replace /> : <RegisterPage />} 
                            />
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
                            {/* Adaug rutele pentru evenimente */}
                            <Route path="/events" element={<Events />} />
                            <Route path="/events/:id" element={<EventDetails />} />
                            {/* Adaug ruta pentru panoul de administrare */}
                            <Route
                                path="/admin-panel"
                                element={
                                    <ProtectedRoute>
                                        <AdminPanel />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute>
                                        <Admin />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Adaug ruta temporară pentru adăugarea evenimentului */}
                            <Route path="/add-business-event" element={<AddBusinessEvent />} />
                            {/* Adaug ruta pentru crearea unui admin */}
                            <Route path="/make-admin" element={<MakeAdmin />} />
                            {/* Rute pentru produse cu gestionare îmbunătățită pentru compatibilitate */}
                            <Route path="/products" element={<Products />} />
                            <Route path="/Products" element={<Navigate to="/products" replace />} />
                            <Route path="/PRODUCTS" element={<Navigate to="/products" replace />} />
                            <Route path="/ong" element={<Ong />} />
                            <Route path="/product/:id" element={<ProductDetails />} />
                            <Route path="/Product/:id" element={<Navigate to={`/product/${location.pathname.split('/')[2]}`} replace />} />
                            {/* Ruta pentru adăugarea unui produs */}
                            <Route path="/add-product" element={<AddProduct />} />
                            {/* Adaug ruta pentru coșul de cumpărături */}
                            <Route path="/cart" element={<Cart />} />
                            {/* Adaug rutele pentru procesul de checkout */}
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/checkout-success" element={<CheckoutSuccess />} />
                            {/* Politica de confidențialitate */}
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Layout>
                )}
            </CartProvider>
        </NavigationProvider>
    );
};

export default AppLayout;
