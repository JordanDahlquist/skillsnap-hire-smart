
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { productionLogger } from "@/services/productionLoggerService";
import { environment } from "@/config/environment";
import { getProfileQueryDefaults } from "@/config/query/queryDefaults";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  company_size: string | null;
  job_title: string | null;
  phone: string | null;
  profile_picture_url: string | null;
  company_website: string | null;
  default_location: string | null;
  industry: string | null;
  daily_briefing_regenerations: number | null;
  last_regeneration_date: string | null;
  unique_email: string | null;
  status: 'active' | 'inactive' | 'deleted';
}

export const useOptimizedProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const startTime = Date.now();
      productionLogger.debug('Loading optimized profile', {
        component: 'useOptimizedProfile',
        action: 'LOAD_START',
        metadata: { userId }
      });

      try {
        // Use Promise.race for timeout handling
        const profileData = await Promise.race([
          authService.fetchProfile(userId),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Profile loading timeout')), environment.profileTimeout)
          )
        ]);

        const duration = Date.now() - startTime;
        
        if (profileData) {
          productionLogger.info('Optimized profile loaded successfully', {
            component: 'useOptimizedProfile',
            action: 'LOAD_SUCCESS',
            metadata: { 
              userId,
              fullName: (profileData as UserProfile)?.full_name || 'No name',
              duration 
            }
          });
          
          if (environment.enablePerformanceMonitoring) {
            productionLogger.performance('loadOptimizedProfile', duration, { userId });
          }
        }

        return profileData as UserProfile | null;
      } catch (error) {
        const duration = Date.now() - startTime;
        productionLogger.warn('Optimized profile loading failed, continuing without profile', {
          component: 'useOptimizedProfile',
          action: 'LOAD_ERROR',
          metadata: { userId, error: (error as Error).message, duration }
        });
        // Return null instead of throwing to prevent auth chain breaks
        return null;
      }
    },
    enabled: !!userId,
    ...getProfileQueryDefaults(),
    // Add select to only return what we need and prevent unnecessary re-renders
    select: (data) => data,
    // Prevent refetching on every mount
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Add retry configuration to prevent infinite loops
    retry: (failureCount, error) => {
      // Don't retry if it's a timeout or if we've already tried 2 times
      if (error.message?.includes('timeout') || failureCount >= 2) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
