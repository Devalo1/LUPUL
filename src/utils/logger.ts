/**
 * Application logger utility
 * Provides consistent logging across the application with different log levels
 * and component identification. In production, low-level logs are suppressed.
 */

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== "production";

// Log levels with numeric priorities
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Current log level - DEBUG in development, INFO in production
const currentLogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

// Console style configurations for different log levels
const logStyles = {
  debug: "color: #6b7280", // gray
  info: "color: #3b82f6",  // blue
  warn: "color: #f59e0b",  // amber
  error: "color: #ef4444", // red
  component: "color: #10b981; font-weight: bold" // green, bold
};

/**
 * Main logger implementation
 */
class Logger {
  private component: string;
  
  constructor(component = "App") {
    this.component = component;
  }
  
  /**
   * Create a new logger instance for a specific component
   */
  createLogger(component: string): Logger {
    return new Logger(component);
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(
        `%c[DEBUG]%c [${this.component}]: ${message}`, 
        logStyles.debug, 
        logStyles.component, 
        ...args
      );
    }
  }
  
  /**
   * Log an info message
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(
        `%c[INFO]%c [${this.component}]: ${message}`, 
        logStyles.info, 
        logStyles.component, 
        ...args
      );
    }
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(
        `%c[WARN]%c [${this.component}]: ${message}`, 
        logStyles.warn, 
        logStyles.component, 
        ...args
      );
    }
  }
  
  /**
   * Log an error message
   */
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(
        `%c[ERROR]%c [${this.component}]: ${message}`, 
        logStyles.error, 
        logStyles.component, 
        ...args
      );
    }
  }
  
  /**
   * Start a timer for performance measurement
   */
  time(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(label);
    }
  }
  
  /**
   * End a timer and log the elapsed time
   */
  timeEnd(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(label);
    }
  }
  
  /**
   * Determine if a message at the given level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= currentLogLevel;
  }
}

// Export a singleton instance
const logger = new Logger();

// Export createLogger function directly at module level
export const createLogger = (component: string): Logger => {
  return logger.createLogger(component);
};

export default logger;
