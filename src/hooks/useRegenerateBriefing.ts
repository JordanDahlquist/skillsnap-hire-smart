
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/use-toast";

export const useRegenerateBriefing = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Calculate remaining regenerations for today
  const getRemainingRegenerations = () => {
    if (!profile) return 0;
    
    const today = new Date().toDateString();
    const lastRegenDate = profile.last_regeneration_date ? new Date(profile.last_regeneration_date).toDateString() : null;
    
    // Reset count if it's a new day
    if (lastRegenDate !== today) {
      return 3;
    }
    
    return Math.max(0, 3 - (profile.daily_briefing_regenerations || 0));
  };

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const remaining = getRemainingRegenerations();
      if (remaining <= 0) {
        throw new Error('Daily regeneration limit reached (3 per day)');
      }

      const { data, error } = await supabase.functions.invoke('generate-daily-briefing', {
        body: { force_regenerate: true }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the daily briefing
      queryClient.invalidateQueries({ queryKey: ['daily-briefing'] });
      // Refresh profile to get updated regeneration count
      refreshProfile();
      
      toast({
        title: "Scout's Got Fresh Insights! 🎉",
        description: "Your daily update has been refreshed with new energy and perspective!",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes('limit reached')) {
        toast({
          title: "Scout Needs a Break! 😅",
          description: "You've used all 3 regenerations for today. Scout will be back tomorrow with fresh updates!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scout Hit a Snag",
          description: "Oops! Something went wrong while getting fresh insights. Let me try that again!",
          variant: "destructive",
        });
      }
    },
  });

  const regenerate = () => {
    setIsRegenerating(true);
    regenerateMutation.mutate();
    setTimeout(() => setIsRegenerating(false), 2000); // Minimum loading time for UX
  };

  return {
    regenerate,
    isRegenerating: isRegenerating || regenerateMutation.isPending,
    remainingRegenerations: getRemainingRegenerations(),
    canRegenerate: getRemainingRegenerations() > 0,
  };
};
