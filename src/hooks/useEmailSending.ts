
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from './useOptimizedAuth';
import { useToast } from '@/hooks/use-toast';
import { validateEmailForm } from '@/utils/emailValidation';
import type { Application, Job } from '@/types/emailComposer';

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  path?: string;
  file?: File;
}

export const useEmailSending = () => {
  const { user, profile } = useOptimizedAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const getCompanyName = (job: Job) => {
    return job.company_name || profile?.company_name || 'Our Company';
  };

  const getUserUniqueEmail = () => {
    return profile?.unique_email || 'user@atract.ai';
  };

  const sendBulkEmail = async (
    applications: Application[],
    job: Job,
    subject: string,
    content: string,
    templateId?: string,
    attachments?: AttachmentFile[]
  ) => {
    const validation = validateEmailForm(subject, content);
    if (!validation.isValid) {
      toast({
        title: "Missing Information",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return false;
    }

    if (!user?.id || !profile?.unique_email) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in with a valid profile to send emails.",
        variant: "destructive",
      });
      return false;
    }

    setIsSending(true);
    
    try {
      const companyName = getCompanyName(job);
      const userUniqueEmail = getUserUniqueEmail();
      
      // Prepare attachments data with proper structure
      const attachmentsData = attachments ? attachments.map(att => ({
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type,
        url: att.url,
        path: att.path
      })) : [];

      console.log('Sending bulk email with attachments:', {
        user_id: user.id,
        applications_count: applications.length,
        attachments_count: attachmentsData.length,
        attachments: attachmentsData.map(a => ({ name: a.name, size: a.size }))
      });
      
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          user_id: user.id,
          applications: applications,
          job: job,
          subject: subject,
          content: content,
          template_id: templateId || null,
          company_name: companyName,
          reply_to_email: userUniqueEmail,
          create_threads: true,
          attachments: attachmentsData
        }
      });

      if (error) {
        console.error('Email sending error:', error);
        throw error;
      }

      console.log('Bulk email response:', data);

      // Check for attachment errors in the response
      const attachmentErrors = data?.attachment_errors || [];
      const summary = data?.summary;

      let successMessage = `Successfully sent emails to ${applications.length} candidate${applications.length > 1 ? 's' : ''} from ${userUniqueEmail}.`;
      
      if (summary?.attachments_processed > 0) {
        successMessage += ` ${summary.attachments_processed} attachments included.`;
      }

      if (attachmentErrors.length > 0) {
        console.warn('Some attachments failed:', attachmentErrors);
        toast({
          title: "Emails Sent with Attachment Issues",
          description: `${successMessage} However, ${attachmentErrors.length} attachment(s) failed to process.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Emails Sent",
          description: successMessage,
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Send Failed",
        description: "There was an error sending the emails. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    sendBulkEmail,
    getCompanyName,
    getUserUniqueEmail
  };
};
