
import { productionLogger } from "@/services/productionLoggerService";
import { environment } from "@/config/environment";
import type { QueryError } from "./types";

export const getQueryRetryFn = () => (failureCount: number, error: unknown) => {
  const queryError = error as QueryError;
  
  // Don't retry auth-related errors
  if (queryError?.message?.includes('JWT') || 
      queryError?.message?.includes('auth') ||
      queryError?.message?.includes('unauthorized') ||
      queryError?.status === 401 || 
      queryError?.status === 403) {
    productionLogger.warn('Auth error detected, skipping retry', {
      component: 'QueryClient',
      metadata: { error: queryError.message, status: queryError.status }
    });
    return false;
  }
  
  // Don't retry client errors (4xx except retryable ones)
  if (queryError?.status && queryError.status >= 400 && queryError.status < 500 && 
      queryError.status !== 408 && // Request Timeout
      queryError.status !== 429 && // Too Many Requests
      queryError.status !== 409) { // Conflict (sometimes retryable)
    productionLogger.warn('Client error detected, skipping retry', {
      component: 'QueryClient',
      metadata: { error: queryError.message, status: queryError.status }
    });
    return false;
  }
  
  const shouldRetry = failureCount < environment.retryAttempts;
  if (!shouldRetry) {
    productionLogger.warn('Max retries exceeded', {
      component: 'QueryClient',
      metadata: { failureCount, maxRetries: environment.retryAttempts }
    });
  }
  
  return shouldRetry;
};

export const getQueryRetryDelay = () => (attemptIndex: number) => {
  const delay = Math.min(environment.retryDelay * Math.pow(2, attemptIndex), 10000);
  productionLogger.debug('Query retry delay', {
    component: 'QueryClient',
    metadata: { attemptIndex, delay }
  });
  return delay;
};

export const getMutationRetryFn = () => (failureCount: number, error: unknown) => {
  const mutationError = error as QueryError;
  
  // Never retry auth errors or validation errors
  if (mutationError?.message?.includes('JWT') || 
      mutationError?.message?.includes('auth') ||
      mutationError?.status === 401 ||
      mutationError?.status === 403 ||
      mutationError?.status === 422 || 
      mutationError?.status === 400) {
    productionLogger.warn('Non-retryable mutation error', {
      component: 'QueryClient',
      metadata: { error: mutationError.message, status: mutationError.status }
    });
    return false;
  }
  
  // Only retry server errors (5xx) and network errors
  const shouldRetry = failureCount === 0 && (
    !mutationError?.status || 
    mutationError.status >= 500 ||
    mutationError.message?.includes('network') ||
    mutationError.message?.includes('timeout')
  );
  
  if (shouldRetry) {
    productionLogger.info('Retrying mutation', {
      component: 'QueryClient',
      metadata: { error: mutationError.message, attempt: failureCount + 1 }
    });
  }
  
  return shouldRetry;
};

export const getMutationRetryDelay = () => () => environment.retryDelay;
