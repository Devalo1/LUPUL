import { logger } from "./debug";

// Define window performance wrapper to prevent name conflicts
export const performanceUtil = {
  mark: (name: string): void => {
    try {
      window.performance.mark(name);
      logger.info(`Performance mark: ${name}`);
    } catch (e: unknown) {
      logger.error(`Error creating performance mark ${name}:`, e as Error);
    }
  },
  measure: (name: string, startMark: string, endMark: string): number => {
    try {
      const measure = window.performance.measure(name, startMark, endMark);
      logger.info(`Performance measure: ${name}`, { data: { duration: measure.duration } });
      return measure.duration;
    } catch (e: unknown) {
      logger.error(`Error creating performance measure ${name}:`, e as Error);
      return 0;
    }
  },
  logNavigation: (): void => {
    if (window.performance && window.performance.timing) {
      const t = window.performance.timing;
      const pageloadTime = t.loadEventEnd - t.navigationStart;
      logger.info(`Page load time: ${pageloadTime}ms`);
    }
  }
};

// This should be used inside a component, not at module level
export const initPerformanceMonitoring = (): void => {
  if (typeof window === "undefined") return;
  
  window.addEventListener("load", () => {
    setTimeout(() => {
      performanceUtil.logNavigation();
    }, 0);
    
    logger.info("Performance monitoring initialized");
  });
};

// Hook for use in React components
export const usePerformanceMonitoring = () => {
  // This is a custom hook to be used within components
  return performanceUtil;
};
