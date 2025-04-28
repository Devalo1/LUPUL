import { useState, useEffect } from "react";

/**
 * Breakpoints for responsive design
 */
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect screen size and provide responsive utilities
 */
export function useResponsive() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Handler to update state on window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Call handler right away to update initial state
    handleResize();
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /**
   * Check if the current screen size matches a breakpoint
   * @param breakpoint The breakpoint to check
   * @param mode The comparison mode
   * @returns Whether the current screen size matches the breakpoint
   */
  const isBreakpoint = (
    breakpoint: Breakpoint, 
    mode: "min" | "max" = "min"
  ): boolean => {
    const breakpointValue = breakpoints[breakpoint];
    
    if (mode === "min") {
      return windowWidth >= breakpointValue;
    } else {
      return windowWidth < breakpointValue;
    }
  };

  // Pre-calculated breakpoint checks
  const isMobile = windowWidth < breakpoints.md;
  const isTablet = windowWidth >= breakpoints.md && windowWidth < breakpoints.lg;
  const isDesktop = windowWidth >= breakpoints.lg;

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    breakpoints
  };
}
