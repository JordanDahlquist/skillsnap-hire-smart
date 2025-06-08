
import { productionLogger } from "@/services/productionLoggerService";
import { errorTrackingService } from "@/services/errorTrackingService";
import { environment } from "@/config/environment";
import { getMutationRetryFn, getMutationRetryDelay } from "./retryConfig";
import type { QueryError } from "./types";

export const getMutationDefaults = () => ({
  retry: getMutationRetryFn(),
  retryDelay: getMutationRetryDelay(),
  
  onError: (error: Error, variables: any, context: any) => {
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
  
  onSuccess: (data: any, variables: any, context: any) => {
    if (environment.isDevelopment) {
      productionLogger.debug('Mutation succeeded', {
        component: 'QueryClient',
        metadata: { variables, context }
      });
    }
  }
});
