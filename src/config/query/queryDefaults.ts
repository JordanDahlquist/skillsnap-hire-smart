
import { environment } from "@/config/environment";
import { getQueryRetryFn, getQueryRetryDelay } from "./retryConfig";

export const getQueryDefaults = () => ({
  retry: getQueryRetryFn(),
  retryDelay: getQueryRetryDelay(),
  
  // Optimized cache settings
  staleTime: 3 * 60 * 1000, // 3 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  
  // Network-aware settings
  refetchOnWindowFocus: false,
  refetchOnReconnect: 'always' as const,
  refetchOnMount: true,
  refetchInterval: false as const, // Fix: explicitly type as false
  
  // Add timeout for queries
  meta: {
    timeout: environment.apiTimeout
  }
});
