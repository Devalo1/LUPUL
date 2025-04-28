import React, { useState, useCallback, useMemo, ReactNode } from "react";
import { NavigationContext } from "./navigation/NavigationContextValue";

// Only export the provider from this file
export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  // Memoize functions to prevent unnecessary recreation on renders
  const openSideNav = useCallback(() => setIsSideNavOpen(true), []);
  const closeSideNav = useCallback(() => setIsSideNavOpen(false), []);
  const toggleSideNav = useCallback(() => setIsSideNavOpen(prev => !prev), []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    isSideNavOpen,
    openSideNav,
    closeSideNav,
    toggleSideNav
  }), [isSideNavOpen, openSideNav, closeSideNav, toggleSideNav]);

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};