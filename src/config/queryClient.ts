
import { QueryClient } from "@tanstack/react-query";
import { logger } from "@/services/loggerService";
import { errorTrackingService } from "@/services/errorTrackingService";

// Enhanced error type with optional status
interface QueryError extends Error {
  status?: number;
}

// Enhanced error handling for React Query
const queryErrorHandler = (error: unknown, query: any) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  // Track query errors
  errorTrackingService.trackError(
    error instanceof Error ? error : new Error(errorMessage),
    {
      component: 'React Query',
      action: `Query: ${query.queryKey?.join(' - ')}`,
      metadata: { queryKey: query.queryKey }
    },
    'medium'
  );

  logger.error('Query failed:', { error: errorMessage, queryKey: query.queryKey });
};

// Optimized query client with better defaults
export const createOptimizedQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Retry logic
      retry: (failureCount, error) => {
        const queryError = error as QueryError;
        
        // Don't retry auth-related errors
        if (queryError?.message?.includes('JWT') || 
            queryError?.message?.includes('auth') ||
            queryError?.message?.includes('unauthorized')) {
          return false;
        }
        
        // Don't retry 4xx errors (except 408, 429)
        if (queryError?.status && queryError.status >= 400 && queryError.status < 500 && 
            queryError.status !== 408 && queryError.status !== 429) {
          return false;
        }
        
        return failureCount < 2;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Cache settings
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      
      // Refetch settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: true,
    },
    mutations: {
      // Mutation retry
      retry: (failureCount, error) => {
        const mutationError = error as QueryError;
        
        // Don't retry auth or validation errors
        if (mutationError?.message?.includes('JWT') || 
            mutationError?.message?.includes('auth') ||
            mutationError?.status === 422 || 
            mutationError?.status === 400) {
          return false;
        }
        return failureCount < 1; // Only retry once for mutations
      },
      
      // Error handling for mutations
      onError: (error, variables, context) => {
        errorTrackingService.trackError(
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'React Query',
            action: 'Mutation failed',
            metadata: { variables, context }
          },
          'high'
        );
      },
    },
  },
});
