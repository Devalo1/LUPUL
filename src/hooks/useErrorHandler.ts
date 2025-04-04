import { useState, useCallback } from 'react';

/**
 * Custom hook for handling errors in components
 * @returns error handling utilities
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((err: unknown) => {
    console.error('Error caught by useErrorHandler:', err);
    const formattedError = err instanceof Error ? err : new Error(String(err));
    setError(formattedError);
    setIsLoading(false);
    return formattedError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wraps an async function with error handling and loading state
   */
  const withErrorHandling = useCallback(<T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    clearError();
    
    return asyncFn()
      .catch(handleError)
      .finally(() => {
        setIsLoading(false);
      });
  }, [clearError, handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling
  };
}
