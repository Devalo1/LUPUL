/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig } from '../types';

// Default theme configuration
const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#0288D1',   // Trusted Blue
    secondary: '#2E7D32', // Trustful Green
    accent: '#00ACC1',    // Light Blue-Green
    background: '#E0F2F1',// Light teal
    text: '#1e293b',
    error: '#ef4444',
    success: '#2E7D32',
    warning: '#f59e0b',
    info: '#0288D1',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
  },
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

type ThemeContextType = {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Check if the user prefers dark mode
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
    
    // Apply dark mode settings if needed
    if (prefersDarkMode) {
      applyDarkMode();
    }
  }, []);

  const applyDarkMode = () => {
    setTheme({
      ...theme,
      colors: {
        ...theme.colors,
        background: '#1e293b',
        text: '#f8fafc',
      },
    });
    document.documentElement.classList.add('dark');
  };

  const applyLightMode = () => {
    setTheme(defaultTheme);
    document.documentElement.classList.remove('dark');
  };

  const toggleDarkMode = () => {
    if (isDarkMode) {
      applyLightMode();
    } else {
      applyDarkMode();
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
