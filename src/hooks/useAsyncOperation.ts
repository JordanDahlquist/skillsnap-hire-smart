
import { useState, useCallback, useEffect } from "react";
import { logger } from "@/services/loggerService";
import { useErrorHandler } from "./useErrorHandler";
import { useCleanup } from "@/utils/cleanupUtils";
import { PERFORMANCE_CONSTANTS } from "@/constants/ui";

export const useAsyncOperation = <T = any>() => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();
  const { addAbortController, cleanup } = useCleanup();

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
      logOperation?: string;
      timeout?: number;
    }
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    addAbortController(controller);

    try {
      if (options?.logOperation) {
        logger.info(`Starting operation: ${options.logOperation}`);
      }

      // Add timeout if specified
      const timeoutPromise = options?.timeout 
        ? new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), options.timeout)
          )
        : null;

      const operationPromise = operation();
      
      const result = timeoutPromise 
        ? await Promise.race([operationPromise, timeoutPromise])
        : await operationPromise;

      if (controller.signal.aborted) {
        logger.warn('Operation was aborted');
        return null;
      }

      if (options?.logOperation) {
        logger.info(`Operation completed successfully: ${options.logOperation}`);
      }

      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      if (controller.signal.aborted) {
        logger.warn('Operation was aborted');
        return null;
      }

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
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [handleError, addAbortController]);

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
