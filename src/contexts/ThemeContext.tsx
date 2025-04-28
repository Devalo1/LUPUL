import React, { createContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for stored theme or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme as Theme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    
    return "light";
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
