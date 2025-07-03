
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/services/loggerService";

export const useSmartApplicationActions = (onUpdate?: () => void) => {
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

  // Smart rejection that tracks previous stage
  const smartRejectApplication = async (applicationId: string, currentStage: string, reason?: string) => {
    try {
      logger.debug('Smart rejecting application', { applicationId, currentStage, reason });
      
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          pipeline_stage: 'rejected',
          previous_pipeline_stage: currentStage, // Track where they were before rejection
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

  // Smart unreject that restores to previous stage
  const smartUnrejectApplication = async (applicationId: string, previousStage?: string, manualRating?: number) => {
    try {
      logger.debug('Smart unreject application', { applicationId, previousStage, manualRating });
      
      // Determine the best stage to restore to
      const restoreStage = previousStage || 'applied';
      
      // Determine appropriate status based on restore stage and manual rating
      let newStatus = 'pending';
      if (restoreStage === 'applied') {
        newStatus = 'pending';
      } else if (manualRating && manualRating > 0) {
        newStatus = 'reviewed';
      } else {
        newStatus = 'pending';
      }

      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          pipeline_stage: restoreStage,
          previous_pipeline_stage: null, // Clear the tracking
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        logger.error('Failed to unreject application', error);
        throw error;
      }

      logger.debug('Application unrejected successfully', { applicationId, restoreStage });
      
      // More informative success message
      const stageDisplayName = restoreStage.charAt(0).toUpperCase() + restoreStage.slice(1).replace('_', ' ');
      toast.success(`Application unrejected and moved to ${stageDisplayName} stage`);
      
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
    smartRejectApplication,
    smartUnrejectApplication
  };
};
