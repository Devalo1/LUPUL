import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import ErrorBoundary from './components/layout/ErrorBoundary';
import LandingPage from './LandingPage';
import SideNavigation from './components/navigation/SideNavigation';

// Add custom styles to force transparency
const appStyle = {
  backgroundColor: 'transparent',
  background: 'none',
  height: '100%',
  width: '100%'
};

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Check if this is the first visit using localStorage
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowLanding(false);
    } else {
      // Mark as visited for future
      localStorage.setItem('hasVisited', 'true');
    }

    // Add event listener for navigation
    const handleNavigation = () => {
      setShowLanding(false);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  return (
    <>
      {showLanding && <LandingPage />}
      {!showLanding && (
        <>
          <ErrorBoundary>
            <Router>
              <AuthProvider>
                <ThemeProvider>
                  <NavigationProvider>
                    <header className="navbar-romanian-flag">
                      {/* Navbar content */}
                    </header>
                    <main>
                      <div className="content-overlay">
                        <h1>Your content here</h1>
                      </div>
                      <button className="btn-primary">Button Example</button>
                    </main>
                    <footer>
                      {/* Footer content */}
                    </footer>
                    <div style={appStyle} className="app-container">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        {/* ...other routes */}
                      </Routes>
                    </div>
                    <SideNavigation />
                  </NavigationProvider>
                </ThemeProvider>
              </AuthProvider>
            </Router>
          </ErrorBoundary>
        </>
      )}
    </>
  );
};

export default App;
