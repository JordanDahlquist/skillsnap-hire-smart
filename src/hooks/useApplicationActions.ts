
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/services/loggerService";

export const useApplicationActions = (onUpdate?: () => void) => {
  const updateApplicationRating = async (applicationId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          manual_rating: rating,
          status: 'reviewed',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success(`Rating updated to ${rating} star${rating !== 1 ? 's' : ''}`);
      onUpdate?.();
      
      logger.debug('Application rating updated', { applicationId, rating });
    } catch (error) {
      logger.error('Failed to update application rating', error);
      toast.error('Failed to update rating');
    }
  };

  const rejectApplication = async (applicationId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          rejection_reason: reason || 'No reason provided',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Application rejected');
      onUpdate?.();
      
      logger.debug('Application rejected', { applicationId, reason });
    } catch (error) {
      logger.error('Failed to reject application', error);
      toast.error('Failed to reject application');
    }
  };

  const unrejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'pending',
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Application unrejected');
      onUpdate?.();
      
      logger.debug('Application unrejected', { applicationId });
    } catch (error) {
      logger.error('Failed to unreject application', error);
      toast.error('Failed to unreject application');
    }
  };

  return {
    updateApplicationRating,
    rejectApplication,
    unrejectApplication
  };
};
