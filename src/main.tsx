import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Add console logs for debugging
console.log('Main.tsx: Starting app initialization');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found in the DOM');
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Root element not found!</div>';
} else {
  console.log('Root element found, rendering React app');
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log('React app rendered');
}