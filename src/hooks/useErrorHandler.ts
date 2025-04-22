import { useState } from "react";

interface ErrorState {
  error: string | null;
  isError: boolean;
}

type ErrorHandlerHook = {
  errorState: ErrorState;
  setError: (message: string) => void;
  clearError: () => void;
  handleError: (error: Error | string, _context: Record<string, unknown>) => void;
  withErrorHandling: <T>(fn: (...args: unknown[]) => T) => (...args: unknown[]) => T;
};

export const useErrorHandler = (): ErrorHandlerHook => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false
  });

  const setError = (message: string) => {
    setErrorState({
      error: message,
      isError: true
    });
  };

  const clearError = () => {
    setErrorState({
      error: null,
      isError: false
    });
  };

  const handleError = (error: Error | string, _context: Record<string, unknown>) => {
    if (error instanceof Error) {
      setError(error.message);
    } else if (typeof error === "string") {
      setError(error);
    } else {
      setError("A apărut o eroare neașteptată");
    }
  };

  const withErrorHandling = <T,>(fn: (...args: unknown[]) => T) => {
    return (...args: unknown[]): T => {
      try {
        return fn(...args);
      } catch (error) {
        handleError(error as Error | string, {});
        throw error;
      }
    };
  };

  return {
    errorState,
    setError,
    clearError,
    handleError,
    withErrorHandling
  };
};

/**
 * Custom hook for handling async operations with error handling and loading state
 */
export const useAsyncHandler = <T>(asyncFn: () => Promise<T>): [
  () => Promise<T | null>,
  boolean,
  Error | null
] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      return await asyncFn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return [execute, loading, error];
};
