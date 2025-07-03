
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { conversationEmailService } from "@/services/conversationEmailService";
import type { Application, Job } from '@/types';

export const useSmartRejection = (
  application: Application,
  job: Job,
  sendReplyFunction: (threadId: string, content: string) => Promise<void>,
  onUpdate?: () => void
) => {
  const [isRejecting, setIsRejecting] = useState(false);

  const rejectWithEmail = async (rejectionReason: string) => {
    console.log('=== STARTING SMART REJECTION PROCESS ===');
    console.log('Application ID:', application.id);
    console.log('Current stage:', application.pipeline_stage);
    console.log('Rejection reason:', rejectionReason);
    
    setIsRejecting(true);
    
    try {
      // First, send the rejection email via conversation system
      console.log('Sending rejection email...');
      await conversationEmailService.sendRejectionEmail(
        application,
        job,
        rejectionReason,
        sendReplyFunction
      );
      
      // Store the current stage before rejection (if not already rejected)
      const previousStage = application.status !== 'rejected' ? application.pipeline_stage : null;
      
      // Then update the application status in database
      console.log('Updating application status with previous stage tracking...');
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          pipeline_stage: 'rejected',
          previous_pipeline_stage: previousStage,
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) {
        console.error('Failed to update application status:', updateError);
        throw updateError;
      }

      console.log('Application status updated successfully with previous stage:', previousStage);
      
      toast.success('Application rejected and candidate notified via email');
      
      // Trigger update callback
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
    } catch (error: any) {
      console.error('Rejection process failed:', error);
      toast.error(`Failed to reject application: ${error?.message || 'Unknown error'}`);
      throw error;
    } finally {
      setIsRejecting(false);
    }
  };

  const smartUnrejectApplication = async () => {
    console.log('=== STARTING SMART UNREJECT PROCESS ===');
    console.log('Application ID:', application.id);
    console.log('Previous stage:', application.previous_pipeline_stage);
    
    setIsRejecting(true);
    
    try {
      // Determine the best stage to restore to
      const restoreStage = application.previous_pipeline_stage || 'applied';
      
      // Determine appropriate status based on restore stage and manual rating
      let newStatus = 'pending';
      if (restoreStage === 'applied') {
        newStatus = 'pending';
      } else if (application.manual_rating && application.manual_rating > 0) {
        newStatus = 'reviewed';
      } else {
        newStatus = 'pending';
      }

      console.log('Restoring to stage:', restoreStage, 'with status:', newStatus);

      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          pipeline_stage: restoreStage,
          previous_pipeline_stage: null, // Clear the previous stage tracking
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) {
        console.error('Failed to unreject application:', error);
        throw error;
      }

      console.log('Application unrejected successfully to stage:', restoreStage);
      
      // More informative success message
      const stageDisplayName = restoreStage.charAt(0).toUpperCase() + restoreStage.slice(1).replace('_', ' ');
      toast.success(`Application unrejected and moved to ${stageDisplayName} stage`);
      
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
    } catch (error: any) {
      console.error('Unreject process failed:', error);
      toast.error(`Failed to unreject application: ${error?.message || 'Unknown error'}`);
      throw error;
    } finally {
      setIsRejecting(false);
    }
  };

  return {
    rejectWithEmail,
    smartUnrejectApplication,
    isRejecting
  };
};
