import { logger } from './debug';

export const performance = {
  mark: (name: string) => {
    try {
      performance.mark(name);
      logger.info(`Performance mark: ${name}`);
    } catch (e) {
      logger.error(`Error creating performance mark ${name}:`, e);
    }
  },
  
  measure: (name: string, startMark: string, endMark: string) => {
    try {
      const measure = performance.measure(name, startMark, endMark);
      logger.info(`Performance measure: ${name}`, measure.duration);
      return measure.duration;
    } catch (e) {
      logger.error(`Error creating performance measure ${name}:`, e);
      return 0;
    }
  },
  
  logNavigation: () => {
    if (window.performance && window.performance.timing) {
      const t = window.performance.timing;
      const pageloadTime = t.loadEventEnd - t.navigationStart;
      logger.info(`Page load time: ${pageloadTime}ms`);
    }
  }
};

// Call this when the application loads
export const initPerformanceMonitoring = () => {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performance.logNavigation();
    }, 0);
  });
};
