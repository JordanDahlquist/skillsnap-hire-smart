
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/services/loggerService";
import { emailService } from "@/services/emailService";
import { useOptimizedAuth } from "./useOptimizedAuth";

export const useApplicationActions = (onUpdate?: () => void) => {
  const { user, profile } = useOptimizedAuth();

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
      
      // First, get the application and job details for email
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            id,
            title,
            company_name,
            user_id
          )
        `)
        .eq('id', applicationId)
        .single();

      if (appError || !application) {
        logger.error('Failed to fetch application details', appError);
        throw appError || new Error('Application not found');
      }

      // Update database status first
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

      // Send rejection email if user authentication is available
      if (user?.id && profile?.unique_email) {
        try {
          // Map rejection reasons to email templates
          const getEmailTemplate = (rejectionReason: string) => {
            const templates = {
              'Insufficient Experience': 'Thank you for your interest in the {position} role at {company}. After careful consideration, we have decided to move forward with candidates who more closely match our current experience requirements.',
              'Skills Mismatch': 'Thank you for applying to the {position} position at {company}. While we were impressed with your background, we have decided to proceed with candidates whose skills more closely align with our specific requirements.',
              'Unsuccessful Assessment': 'Thank you for taking the time to complete our assessment for the {position} role at {company}. After reviewing your responses, we have decided to move forward with other candidates.',
              'Unsuccessful Interview': 'Thank you for interviewing for the {position} position at {company}. After careful consideration, we have decided to proceed with other candidates.',
              'Overqualified': 'Thank you for your interest in the {position} role at {company}. While your qualifications are impressive, we believe this role may not provide the challenge and growth opportunities you are seeking.',
              'Position Filled': 'Thank you for your interest in the {position} role at {company}. We have decided to move forward with another candidate for this position.',
              'Budget Constraints': 'Thank you for your interest in the {position} role at {company}. Unfortunately, we are unable to proceed due to budget constraints.',
              'Timeline Mismatch': 'Thank you for your interest in the {position} role at {company}. Unfortunately, our timeline requirements do not align with your availability.'
            };
            
            return templates[rejectionReason as keyof typeof templates] || 
              'Thank you for your interest in the {position} role at {company}. After careful consideration, we have decided to move forward with other candidates.';
          };

          const emailContent = `
            <p>Dear {name},</p>
            
            <p>${getEmailTemplate(reason || 'No reason provided')}</p>
            
            <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
            
            <p>Best regards,<br>
            The {company} Team</p>
          `;

          await emailService.sendEmail({
            recipientEmail: application.email,
            recipientName: application.name,
            subject: 'Update on your {position} application',
            content: emailContent,
            applicationId: applicationId,
            jobId: application.jobs.id,
            userUniqueEmail: profile.unique_email
          });

          logger.debug('Rejection email sent successfully', { applicationId, recipientEmail: application.email });
        } catch (emailError) {
          logger.error('Failed to send rejection email', emailError);
          // Don't throw here - we still want to show success for the database update
          toast.error('Application rejected, but email failed to send');
        }
      }

      toast.success('Application rejected and candidate notified');
      
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
