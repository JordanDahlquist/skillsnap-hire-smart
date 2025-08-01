
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface DailyBriefing {
  id: string;
  briefing_content: string;
  briefing_data: {
    total_jobs: number;
    active_jobs: number;
    total_applications: number;
    pending_applications: number;
    jobs_needing_attention: number;
    high_rated_applications: number;
    recent_applications: number;
  };
  created_at: string;
  expires_at: string;
}

export const useDailyBriefing = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily-briefing', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Check if we have fresh data in cache first
      const cacheKey = `daily-briefing-${user.id}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}-timestamp`);
      
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        // If cache is less than 24 hours old, use it
        if (age < 24 * 60 * 60 * 1000) {
          console.log('🤖 Using cached daily briefing data');
          return JSON.parse(cachedData);
        }
      }

      console.log('🤖 Daily briefing API call triggered');
      const { data, error } = await supabase.functions.invoke('generate-daily-briefing');
      
      if (error) {
        console.error('Error fetching daily briefing:', error);
        throw error;
      }

      // Cache the fresh data
      if (data?.briefing) {
        localStorage.setItem(cacheKey, JSON.stringify(data.briefing));
        localStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString());
      }

      console.log('🤖 Daily briefing API response received');
      return data?.briefing as DailyBriefing;
    },
    enabled: !!user?.id, // More specific check
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 2, // Keep in cache for 48 hours
    retry: 1,
    placeholderData: (previousData) => previousData, // Maintain data during transitions
    // Explicitly prevent unnecessary refetches
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};
