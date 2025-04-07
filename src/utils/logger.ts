export const logger = {
  debug: (_message: string, ..._args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // Removed console statement
    }
  },
  info: (_message: string, ..._args: unknown[]) => {
    console.info(`[INFO] ${_message}`, ..._args);
  },
  warn: (_message: string, ..._args: unknown[]) => {
    console.warn(`[WARN] ${_message}`, ..._args);
  },
  error: (_message: string, _error?: unknown, ..._args: unknown[]) => {
    console.error(
      `[ERROR] ${_message}`,
      _error instanceof Error ? { message: _error.message, stack: _error.stack } : _error,
      ..._args
    );
  }
};
