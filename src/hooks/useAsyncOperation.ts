
import { useState, useCallback } from "react";
import { logger } from "@/services/loggerService";
import { useErrorHandler } from "./useErrorHandler";

export const useAsyncOperation = <T = any>() => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
      logOperation?: string;
    }
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (options?.logOperation) {
        logger.info(`Starting operation: ${options.logOperation}`);
      }

      const result = await operation();

      if (options?.logOperation) {
        logger.info(`Operation completed successfully: ${options.logOperation}`);
      }

      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);

      if (options?.logOperation) {
        logger.error(`Operation failed: ${options.logOperation}`, error);
      }

      if (options?.onError) {
        options.onError(error);
      } else {
        handleError(error);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset
  };
};
