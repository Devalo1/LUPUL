import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

// Create a portal-based landing page that will be displayed outside the React tree
const LandingPage: React.FC = () => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create the portal container
    const landingPageElement = document.createElement('div');
    landingPageElement.id = 'landing-page-portal';
    
    // Apply styles to ensure it covers the entire viewport
    Object.assign(landingPageElement.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '9999',
      backgroundImage: 'url("/images/background.jpeg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    });

    // Add it to the DOM
    document.body.appendChild(landingPageElement);
    setPortalElement(landingPageElement);

    // Hide the app root
    const appRoot = document.getElementById('root');
    if (appRoot) {
      appRoot.style.display = 'none';
    }

    // Clean up function
    return () => {
      document.body.removeChild(landingPageElement);
      if (appRoot) {
        appRoot.style.display = 'block';
      }
    };
  }, []);

  const buttonStyles: React.CSSProperties = {
    display: 'block',
    width: '80%',
    maxWidth: '400px',
    padding: '16px',
    margin: '10px 0',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(5px)',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)'
  };

  // Define the buttons with their colors
  const buttons = [
    { text: 'Lupul și Corbul', color: 'rgba(5, 150, 105, 0.8)', path: '/home' },
    { text: 'Empatie, Conexiune, Echilibru', color: 'rgba(124, 58, 237, 0.8)', path: '/values' },
    { text: 'LOG-IN', color: 'rgba(59, 130, 246, 0.8)', path: '/login' },
    { text: 'Creare Cont', color: 'rgba(236, 72, 153, 0.8)', path: '/register' },
    { text: 'Despre Serviciile Noastre', color: 'rgba(245, 158, 11, 0.8)', path: '/services' },
    { text: 'Vezi Produsele Noastre', color: 'rgba(6, 182, 212, 0.8)', path: '/products' }
  ];

  const handleButtonClick = (path: string) => {
    // Show the app root again
    const appRoot = document.getElementById('root');
    if (appRoot) {
      appRoot.style.display = 'block';
    }

    // Remove the landing page
    if (portalElement) {
      document.body.removeChild(portalElement);
    }

    // Navigate to the requested path
    window.location.href = path;
  };

  if (!portalElement) return null;

  // Use ReactDOM.createPortal to render outside the React tree
  return ReactDOM.createPortal(
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '800px'
    }}>
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => handleButtonClick(button.path)}
          style={{ ...buttonStyles, backgroundColor: button.color }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
        >
          {button.text}
        </button>
      ))}
    </div>,
    portalElement
  );
};

export default LandingPage;
