
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/services/loggerService";

export const useApplicationActions = (onUpdate?: () => void) => {
  const updateApplicationRating = async (applicationId: string, rating: number) => {
    try {
      logger.debug('Updating application rating', { applicationId, rating });
      
      const { error } = await supabase
        .from('applications')
        .update({ 
          manual_rating: rating,
          status: 'reviewed',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        logger.error('Failed to update application rating', error);
        throw error;
      }

      toast.success(`Rating updated to ${rating} star${rating !== 1 ? 's' : ''}`);
      
      // Small delay before calling onUpdate to ensure database consistency
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
      logger.debug('Application rating updated successfully', { applicationId, rating });
    } catch (error) {
      logger.error('Failed to update application rating', error);
      toast.error('Failed to update rating');
      throw error; // Re-throw so the calling component can handle it
    }
  };

  const rejectApplication = async (applicationId: string, reason?: string) => {
    try {
      logger.debug('Rejecting application', { applicationId, reason });
      
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          pipeline_stage: 'rejected',
          rejection_reason: reason || 'No reason provided',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        logger.error('Failed to reject application', error);
        throw error;
      }

      toast.success('Application rejected');
      
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
      logger.debug('Application rejected successfully', { applicationId });
    } catch (error) {
      logger.error('Failed to reject application', error);
      toast.error('Failed to reject application');
      throw error;
    }
  };

  const unrejectApplication = async (applicationId: string) => {
    try {
      logger.debug('Unrejecting application', { applicationId });
      
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'pending',
          pipeline_stage: 'applied',
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        logger.error('Failed to unreject application', error);
        throw error;
      }

      toast.success('Application unrejected');
      
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
      logger.debug('Application unrejected successfully', { applicationId });
    } catch (error) {
      logger.error('Failed to unreject application', error);
      toast.error('Failed to unreject application');
      throw error;
    }
  };

  return {
    updateApplicationRating,
    rejectApplication,
    unrejectApplication
  };
};
