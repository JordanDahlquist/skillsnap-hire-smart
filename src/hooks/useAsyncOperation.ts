
import { useState, useCallback, useEffect, useRef } from "react";
import { logger } from "@/services/loggerService";
import { useErrorHandler } from "./useErrorHandler";

export const useAsyncOperation = <T = any>() => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  useEffect(() => {
    // Cleanup function to abort all pending operations
    return () => {
      abortControllersRef.current.forEach(controller => {
        controller.abort();
      });
      abortControllersRef.current.clear();
    };
  }, []);

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
    abortControllersRef.current.add(controller);

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
      abortControllersRef.current.delete(controller);
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
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
