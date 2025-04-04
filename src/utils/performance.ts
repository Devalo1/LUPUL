import { logger } from './debug';
import useAuth from '../contexts/AuthContext'; // default import

export const performance = {
  mark: (name: string): void => {
    try {
      performance.mark(name);
      logger.info(`Performance mark: ${name}`);
    } catch (e: unknown) {
      logger.error(`Error creating performance mark ${name}:`, e as Error);
    }
  },
  measure: (name: string, startMark: string, endMark: string): number => {
    try {
      const measure = performance.measure(name, startMark, endMark); // ideally type this measure
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

export const initPerformanceMonitoring = (): void => {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performance.logNavigation();
    }, 0);

    // Use hook to get current user info
    const { currentUser } = useAuth();
    logger.info('Performance monitoring initialized', { data: { user: currentUser?.email } });
  });
};
