
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { conversationEmailService } from "@/services/conversationEmailService";
import type { Application, Job } from '@/types';

export const useSimpleRejection = (
  application: Application,
  job: Job,
  sendReplyFunction: (threadId: string, content: string) => Promise<void>,
  onUpdate?: () => void
) => {
  const [isRejecting, setIsRejecting] = useState(false);

  const rejectWithEmail = async (rejectionReason: string) => {
    console.log('=== STARTING SIMPLE REJECTION PROCESS ===');
    console.log('Application ID:', application.id);
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
      
      // Then update the application status in database
      console.log('Updating application status...');
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          pipeline_stage: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) {
        console.error('Failed to update application status:', updateError);
        throw updateError;
      }

      console.log('Application status updated successfully');
      
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

  const unrejectApplication = async () => {
    console.log('=== STARTING UNREJECT PROCESS ===');
    console.log('Application ID:', application.id);
    
    setIsRejecting(true);
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'pending',
          pipeline_stage: 'applied',
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) {
        console.error('Failed to unreject application:', error);
        throw error;
      }

      console.log('Application unrejected successfully');
      toast.success('Application unrejected successfully');
      
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
    unrejectApplication,
    isRejecting
  };
};
