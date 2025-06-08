
import { environment } from "@/config/environment";
import { getQueryRetryFn, getQueryRetryDelay } from "./retryConfig";

export const getQueryDefaults = () => ({
  retry: getQueryRetryFn(),
  retryDelay: getQueryRetryDelay(),
  
  // Optimized cache settings for better performance
  staleTime: environment.cacheStaleTime, // 10 minutes instead of 3
  gcTime: environment.cacheGcTime, // 20 minutes instead of 10
  
  // Network-aware settings
  refetchOnWindowFocus: false,
  refetchOnReconnect: 'always' as const,
  refetchOnMount: false, // Changed from true to prevent unnecessary refetches
  refetchInterval: false as const,
  
  // Background refetching for better UX
  refetchIntervalInBackground: false,
  refetchOnReconnect: true,
  
  // Add timeout for queries
  meta: {
    timeout: environment.apiTimeout
  }
});

// Profile-specific query defaults with shorter timeout
export const getProfileQueryDefaults = () => ({
  ...getQueryDefaults(),
  staleTime: environment.cacheStaleTime * 2, // 20 minutes for profiles (more stable)
  gcTime: environment.cacheGcTime * 2, // 40 minutes
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  meta: {
    timeout: environment.profileTimeout // 3 seconds for profiles
  }
});
