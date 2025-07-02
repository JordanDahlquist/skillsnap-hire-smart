
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
      
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
      logger.debug('Application rating updated successfully', { applicationId, rating });
    } catch (error) {
      logger.error('Failed to update application rating', error);
      toast.error('Failed to update rating');
      throw error;
    }
  };

  // Simplified rejection that only updates database - no email sending
  const rejectApplication = async (applicationId: string, reason?: string) => {
    try {
      logger.debug('Updating application status to rejected', { applicationId, reason });
      
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          pipeline_stage: 'rejected',
          rejection_reason: reason || 'No reason provided',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) {
        logger.error('Failed to update application status', updateError);
        throw updateError;
      }

      toast.success('Application rejected');
      
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
      logger.debug('Application status updated successfully', { applicationId });
      
    } catch (error: any) {
      logger.error('Failed to reject application', error);
      toast.error(`Failed to reject application: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  };

  const unrejectApplication = async (applicationId: string) => {
    try {
      logger.debug('Updating application status to unreject', { applicationId });
      
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

      logger.debug('Application unrejected successfully', { applicationId });
      toast.success('Application unrejected successfully');
      
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
    } catch (error: any) {
      logger.error('Failed to unreject application', error);
      toast.error(`Failed to unreject application: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  };

  return {
    updateApplicationRating,
    rejectApplication,
    unrejectApplication
  };
};
