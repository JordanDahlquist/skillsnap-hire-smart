
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
    const lastRegenDate = profile.last_regeneration_date ? 
      new Date(profile.last_regeneration_date).toDateString() : null;
    
    // If it's a new day, user gets fresh 3 regenerations
    if (lastRegenDate !== today) {
      return 3;
    }
    
    // If same day, subtract from daily limit
    const usedToday = profile.daily_briefing_regenerations || 0;
    return Math.max(0, 3 - usedToday);
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
        title: "Briefing Regenerated",
        description: "Your daily briefing has been updated with fresh insights",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Regeneration Failed",
        description: error.message,
        variant: "destructive",
      });
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
