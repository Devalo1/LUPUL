import { LoggingOptions } from '../types/common';

// Enable logging only in non-production environments
const isDevelopment = import.meta.env.DEV;

// Disable console logs for production
const noop = (): void => {};

// Safe wrappers for console methods that respect ESLint rules
/* eslint-disable no-console */
const safeConsoleDebug = isDevelopment ? console.debug : noop;
const safeConsoleInfo = isDevelopment ? console.info : noop;
const safeConsoleWarn = console.warn; // Warnings are allowed in production
const safeConsoleError = console.error; // Errors are allowed in production
const safeConsoleGroup = isDevelopment ? console.group : noop;
const safeConsoleGroupEnd = isDevelopment ? console.groupEnd : noop;
const safeConsoleTime = isDevelopment ? console.time : noop;
const safeConsoleTimeEnd = isDevelopment ? console.timeEnd : noop;
const safeConsoleTrace = isDevelopment ? console.trace : noop;
/* eslint-enable no-console */

/**
 * Safe console wrapper to avoid console statements in production
 */
export const logger = {
  debug: (message: string, options?: LoggingOptions): void => {
    if (isDevelopment && options?.level !== 'error') {
      // Only log debug messages in development
      safeConsoleDebug(`[DEBUG]${options?.context ? ` [${options.context}]` : ''}: ${message}`, options?.data || '');
    }
  },
  
  info: (message: string, options?: LoggingOptions): void => {
    if (isDevelopment && options?.level !== 'error') {
      safeConsoleInfo(`[INFO]${options?.context ? ` [${options.context}]` : ''}: ${message}`, options?.data || '');
    }
  },
  
  warn: (message: string, options?: LoggingOptions): void => {
    // Warnings can be useful in production but can be filtered
    if (isDevelopment || options?.level === 'warn') {
      safeConsoleWarn(`[WARN]${options?.context ? ` [${options.context}]` : ''}: ${message}`, options?.data || '');
    }
  },
  
  error: (message: string, error?: Error, options?: LoggingOptions): void => {
    // Always log errors
    safeConsoleError(`[ERROR]${options?.context ? ` [${options.context}]` : ''}: ${message}`, error || '', options?.data || '');
  },
  
  // Group related logs
  group: safeConsoleGroup,
  groupEnd: safeConsoleGroupEnd,
  
  // Performance measurements
  time: safeConsoleTime,
  timeEnd: safeConsoleTimeEnd,
  
  // Development-only trace
  trace: (message: string): void => safeConsoleTrace(`[TRACE]: ${message}`)
};

/**
 * Log specific component lifecycle events
 */
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
