import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/AppLayout';
import './index.css';
// ...other imports...

// Initialize app first, then try to initialize articles
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  
  // Try to initialize articles after app is rendered
  import('./utils/initializeArticles')
    .then(module => {
      const { initializeArticles } = module;
      if (typeof initializeArticles === 'function') {
        initializeArticles()
          .then(created => {
            console.log(created ? "Sample articles created" : "Articles already exist");
          })
          .catch(err => {
            console.error("Error initializing articles:", err);
          });
      }
    })
    .catch(err => {
      console.error("Error importing initializeArticles:", err);
    });
}