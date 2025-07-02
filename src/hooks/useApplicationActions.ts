
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

  const rejectApplication = async (applicationId: string, reason?: string) => {
    try {
      logger.debug('=== STARTING REJECTION PROCESS ===', { applicationId, reason });
      
      // Get application and job details for email
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

      logger.debug('Application details fetched', { 
        applicationId, 
        candidateEmail: application.email,
        jobTitle: application.jobs.title,
        companyName: application.jobs.company_name
      });

      // Update database status FIRST
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

      logger.debug('Application status updated to rejected');

      // Send rejection email if user authentication is available
      if (user?.id && profile?.unique_email) {
        try {
          logger.debug('Starting rejection email process', {
            userUniqueEmail: profile.unique_email,
            candidateEmail: application.email
          });

          // Map rejection reasons to email templates
          const getEmailSubject = (rejectionReason: string, jobTitle: string) => {
            return `Update on your ${jobTitle} application`;
          };

          const getEmailContent = (rejectionReason: string) => {
            const templates = {
              'Insufficient Experience': `
                <p>Dear {name},</p>
                <p>Thank you for your interest in the {position} role at {company}. After careful consideration, we have decided to move forward with candidates who more closely match our current experience requirements.</p>
                <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
                <p>Best regards,<br>The {company} Team</p>
              `,
              'Skills Mismatch': `
                <p>Dear {name},</p>
                <p>Thank you for applying to the {position} position at {company}. While we were impressed with your background, we have decided to proceed with candidates whose skills more closely align with our specific requirements.</p>
                <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
                <p>Best regards,<br>The {company} Team</p>
              `,
              'Unsuccessful Assessment': `
                <p>Dear {name},</p>
                <p>Thank you for taking the time to complete our assessment for the {position} role at {company}. After reviewing your responses, we have decided to move forward with other candidates.</p>
                <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
                <p>Best regards,<br>The {company} Team</p>
              `,
              'Unsuccessful Interview': `
                <p>Dear {name},</p>
                <p>Thank you for interviewing for the {position} position at {company}. After careful consideration, we have decided to proceed with other candidates.</p>
                <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
                <p>Best regards,<br>The {company} Team</p>
              `,
              'Overqualified': `
                <p>Dear {name},</p>
                <p>Thank you for your interest in the {position} role at {company}. While your qualifications are impressive, we believe this role may not provide the challenge and growth opportunities you are seeking.</p>
                <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
                <p>Best regards,<br>The {company} Team</p>
              `,
              'Position Filled': `
                <p>Dear {name},</p>
                <p>Thank you for your interest in the {position} role at {company}. We have decided to move forward with another candidate for this position.</p>
                <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
                <p>Best regards,<br>The {company} Team</p>
              `,
              'Budget Constraints': `
                <p>Dear {name},</p>
                <p>Thank you for your interest in the {position} role at {company}. Unfortunately, we are unable to proceed due to budget constraints.</p>
                <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
                <p>Best regards,<br>The {company} Team</p>
              `,
              'Timeline Mismatch': `
                <p>Dear {name},</p>
                <p>Thank you for your interest in the {position} role at {company}. Unfortunately, our timeline requirements do not align with your availability.</p>
                <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
                <p>Best regards,<br>The {company} Team</p>
              `
            };
            
            return templates[rejectionReason as keyof typeof templates] || `
              <p>Dear {name},</p>
              <p>Thank you for your interest in the {position} role at {company}. After careful consideration, we have decided to move forward with other candidates.</p>
              <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
              <p>Best regards,<br>The {company} Team</p>
            `;
          };

          const emailSubject = getEmailSubject(reason || 'No reason provided', application.jobs.title);
          const emailContent = getEmailContent(reason || 'No reason provided');

          logger.debug('Sending rejection email via emailService', {
            subject: emailSubject,
            contentPreview: emailContent.substring(0, 100) + '...'
          });

          await emailService.sendEmail({
            recipientEmail: application.email,
            recipientName: application.name,
            subject: emailSubject,
            content: emailContent,
            applicationId: applicationId,
            jobId: application.jobs.id,
            userUniqueEmail: profile.unique_email
          });

          logger.debug('Rejection email sent successfully', { 
            applicationId, 
            recipientEmail: application.email 
          });

        } catch (emailError) {
          logger.error('Failed to send rejection email', emailError);
          // Don't throw here - we still want to show success for the database update
          toast.error('Application rejected, but email failed to send');
        }
      } else {
        logger.warn('Cannot send rejection email - user authentication missing', {
          hasUser: !!user?.id,
          hasProfile: !!profile,
          hasUniqueEmail: !!profile?.unique_email
        });
      }

      toast.success('Application rejected and candidate notified');
      
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
      logger.debug('Rejection process completed successfully', { applicationId });
    } catch (error) {
      logger.error('Failed to reject application', error);
      toast.error('Failed to reject application');
      throw error;
    }
  };

  const unrejectApplication = async (applicationId: string) => {
    try {
      logger.debug('=== STARTING UNREJECT PROCESS ===', { applicationId });
      
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

      toast.success('Application unrejected successfully');
      
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
