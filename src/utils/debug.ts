// Flag to determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development" || import.meta.env.DEV;

// Logger implementation
export const logger = {
  debug: (_message: string, _options?: Record<string, unknown>) => {
    if (isDevelopment) {
      // Removed console.debug statement
    }
  },
  info: (_message: string, _options?: Record<string, unknown>) => {
    if (isDevelopment) {
      // Removed console.info statement
    }
  },
  warn: (_message: string, _options?: Record<string, unknown>) => {
    // Removed console.warn statement
  },
  error: (_message: string, _error?: unknown, _options?: Record<string, unknown>) => {
    // Removed console.error statement
  },
  time: (_label: string) => {
    if (isDevelopment) {
      // Removed console.time statement
    }
  },
  timeEnd: (_label: string) => {
    if (isDevelopment) {
      // Removed console.timeEnd statement
    }
  }
};

// Component event logger
export const logComponentEvent = (
  componentName: string,
  event: "mount" | "update" | "unmount" | "render" | "error",
  _details?: Record<string, unknown>
): void => {
  if (!isDevelopment) return;

  logger.debug(
    `Component ${componentName} - ${event}`,
    { context: "Component", data: _details }
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
    context: "ErrorBoundary",
    data: { componentStack: errorInfo.componentStack }
  });
};
