import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import LoginPage from './pages/Login';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import Products from './pages/Products';
import Community from './pages/Community';
import Contact from './pages/Contact';
// Import AuthProvider from the correct path
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  console.log('App component rendering');
  
  return (
    <div className="app-container">
      {/* Add AuthProvider to wrap all routes */}
      <AuthProvider>
        <Routes>
          {/* Use Layout component for pages that need header and footer */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/despre-noi" element={
            <Layout>
              <AboutUs />
            </Layout>
          } />
          <Route path="/servicii" element={
            <Layout>
              <Services />
            </Layout>
          } />
          <Route path="/produse" element={
            <Layout>
              <Products />
            </Layout>
          } />
          <Route path="/comunitate" element={
            <Layout>
              <Community />
            </Layout>
          } />
          <Route path="/contact" element={
            <Layout>
              <Contact />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </div>
  );
};

export default App;