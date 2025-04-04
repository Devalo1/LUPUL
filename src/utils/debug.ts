// Flag to determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || import.meta.env.DEV;

// Logger implementation
export const logger = {
  debug: (message: string, options?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, options || '');
    }
  },
  info: (message: string, options?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, options || '');
    }
  },
  warn: (message: string, options?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, options || '');
  },
  error: (message: string, error?: unknown, options?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, error || '', options || '');
  },
  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },
  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
};

// Component event logger
export const logComponentEvent = (
  componentName: string,
  event: 'mount' | 'update' | 'unmount' | 'render' | 'error',
  details?: Record<string, unknown>
): void => {
  if (!isDevelopment) return;

  logger.debug(
    `Component ${componentName} - ${event}`,
    { context: 'Component', data: details }
  );
};

/**
 * Performance logger for timing operations
 */
export const measurePerformance = (
  operationName: string,
  operation: () => unknown
): unknown => {
  if (!isDevelopment) return operation();

  const label = `⏱️ ${operationName}`;
  logger.time(label);
  const result = operation();
  logger.timeEnd(label);
  return result;
};

/**
 * Error boundary logger
 */
export const logErrorBoundary = (
  componentName: string,
  error: Error,
  errorInfo: { componentStack: string }
): void => {
  logger.error(`Error Boundary (${componentName})`, error, {
    context: 'ErrorBoundary',
    data: { componentStack: errorInfo.componentStack }
  });
};
