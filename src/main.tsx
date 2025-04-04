import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import App from './App';
import './index.css';
import './assets/styles/main.css';
import LoadingFallback from './components/ui/LoadingFallback';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<LoadingFallback />}>
            <div className="app-container">
              <App />
            </div>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);