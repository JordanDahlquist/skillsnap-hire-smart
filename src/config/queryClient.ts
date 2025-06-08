
import { QueryClient } from "@tanstack/react-query";
import { productionLogger } from "@/services/productionLoggerService";
import { errorTrackingService } from "@/services/errorTrackingService";
import { environment } from "@/config/environment";

interface QueryError extends Error {
  status?: number;
  code?: string;
}

// Performance monitoring utility
const withPerformanceTracking = (operation: string) => {
  const startTime = Date.now();
  return () => {
    const duration = Date.now() - startTime;
    if (environment.enablePerformanceMonitoring) {
      productionLogger.performance(operation, duration);
    }
  };
};

export const createOptimizedQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
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
      },
      
      retryDelay: (attemptIndex) => {
        const delay = Math.min(environment.retryDelay * Math.pow(2, attemptIndex), 10000);
        productionLogger.debug('Query retry delay', {
          component: 'QueryClient',
          metadata: { attemptIndex, delay }
        });
        return delay;
      },
      
      // Optimized cache settings
      staleTime: 3 * 60 * 1000, // 3 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Network-aware settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: true,
      refetchInterval: false,
      
      // Global error handler for queries
      onError: (error, query) => {
        const trackPerformance = withPerformanceTracking(`Query: ${query.queryKey.join('/')}`);
        trackPerformance();
        
        if (environment.enableErrorTracking && error instanceof Error) {
          const queryError = error as QueryError;
          
          // Only track significant errors
          if (!error.message.includes('auth') && !error.message.includes('JWT')) {
            errorTrackingService.trackError(
              error,
              {
                component: 'React Query',
                action: 'Query failed',
                metadata: { 
                  queryKey: query.queryKey,
                  status: queryError.status
                }
              },
              queryError.status && queryError.status >= 500 ? 'high' : 'low'
            );
          }
        }
        
        productionLogger.error('Query failed', {
          component: 'QueryClient',
          metadata: { 
            queryKey: query.queryKey,
            error: error.message
          }
        });
      },
      
      onSuccess: (data, query) => {
        const trackPerformance = withPerformanceTracking(`Query: ${query.queryKey.join('/')}`);
        trackPerformance();
        
        if (environment.isDevelopment) {
          productionLogger.debug('Query succeeded', {
            component: 'QueryClient',
            metadata: { queryKey: query.queryKey }
          });
        }
      },
      
      // Add timeout for queries
      meta: {
        timeout: environment.apiTimeout
      }
    },
    
    mutations: {
      retry: (failureCount, error) => {
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
      },
      
      retryDelay: () => environment.retryDelay,
      
      onError: (error, variables, context) => {
        if (environment.enableErrorTracking && error instanceof Error) {
          const queryError = error as QueryError;
          
          // Only track non-auth errors to reduce noise
          if (!error.message.includes('auth') && !error.message.includes('JWT')) {
            errorTrackingService.trackError(
              error,
              {
                component: 'React Query Mutation',
                action: 'Mutation failed',
                metadata: { 
                  variables: environment.isDevelopment ? variables : '[REDACTED]',
                  context,
                  status: queryError.status
                }
              },
              queryError.status && queryError.status >= 500 ? 'high' : 'medium'
            );
          }
        }
        
        productionLogger.error('Mutation failed', {
          component: 'QueryClient',
          metadata: { 
            error: error.message,
            variables: environment.isDevelopment ? variables : '[REDACTED]'
          }
        });
      },
      
      onSuccess: (data, variables, context) => {
        if (environment.isDevelopment) {
          productionLogger.debug('Mutation succeeded', {
            component: 'QueryClient',
            metadata: { variables, context }
          });
        }
      }
    }
  }
});
