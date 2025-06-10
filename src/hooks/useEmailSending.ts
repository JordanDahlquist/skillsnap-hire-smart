
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from './useOptimizedAuth';
import { useToast } from '@/hooks/use-toast';
import { validateEmailForm } from '@/utils/emailValidation';
import type { Application, Job } from '@/types/emailComposer';

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
    attachments?: any[]
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
          attachments: attachments || []
        }
      });

      if (error) throw error;

      toast({
        title: "Emails Sent",
        description: `Successfully sent emails to ${applications.length} candidate${applications.length > 1 ? 's' : ''} from ${userUniqueEmail}.`,
      });

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
