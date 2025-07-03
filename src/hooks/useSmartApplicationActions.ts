import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/services/loggerService";

export const useSmartApplicationActions = (onUpdate?: () => void) => {
  const updateApplicationRating = async (applicationId: string, rating: number | null) => {
    try {
      logger.debug('Updating application rating', { applicationId, rating });
      
      // If rating is null, we're clearing the rating
      const updateData = rating === null 
        ? { 
            manual_rating: null,
            status: 'pending',
            updated_at: new Date().toISOString()
          }
        : {
            manual_rating: rating,
            status: 'reviewed',
            updated_at: new Date().toISOString()
          };

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) {
        logger.error('Failed to update application rating', error);
        throw error;
      }

      const successMessage = rating === null 
        ? 'Rating cleared' 
        : `Rating updated to ${rating} star${rating !== 1 ? 's' : ''}`;
      
      toast.success(successMessage);
      
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
          previous_pipeline_stage: currentStage,
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
      
      const restoreStage = previousStage || 'applied';
      
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
          previous_pipeline_stage: null,
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        logger.error('Failed to unreject application', error);
        throw error;
      }

      logger.debug('Application unrejected successfully', { applicationId, restoreStage });
      
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
