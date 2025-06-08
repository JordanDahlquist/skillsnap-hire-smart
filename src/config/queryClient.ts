
import { QueryClient } from "@tanstack/react-query";
import { logger } from "@/services/loggerService";
import { errorTrackingService } from "@/services/errorTrackingService";

// Enhanced error type with optional status
interface QueryError extends Error {
  status?: number;
}

// Optimized query client with better defaults for performance
export const createOptimizedQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Reduced retry logic for better performance
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
        
        // Reduced from 2 to 1 retry for better performance
        return failureCount < 1;
      },
      
      // Optimized retry delay
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000), // Faster retries, lower max
      
      // Optimized cache settings for performance
      staleTime: 2 * 60 * 1000, // Reduced to 2 minutes
      gcTime: 5 * 60 * 1000, // Reduced to 5 minutes
      
      // Optimized refetch settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false, // Changed to false to reduce initial requests
      refetchInterval: false, // Disable polling by default
    },
    mutations: {
      // Reduced mutation retry for performance
      retry: (failureCount, error) => {
        const mutationError = error as QueryError;
        
        // Don't retry auth or validation errors
        if (mutationError?.message?.includes('JWT') || 
            mutationError?.message?.includes('auth') ||
            mutationError?.status === 422 || 
            mutationError?.status === 400) {
          return false;
        }
        return false; // Disabled retries for mutations for better UX
      },
      
      // Optimized error handling for mutations
      onError: (error, variables, context) => {
        // Only track high-priority errors
        if (error instanceof Error && !error.message.includes('auth')) {
          errorTrackingService.trackError(
            error,
            {
              component: 'React Query',
              action: 'Mutation failed',
              metadata: { variables, context }
            },
            'medium' // Reduced from 'high' to 'medium'
          );
        }
      },
    },
  },
});
