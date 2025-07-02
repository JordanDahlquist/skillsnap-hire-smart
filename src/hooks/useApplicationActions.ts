
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
    const startTime = Date.now();
    
    try {
      logger.debug('=== STARTING ENHANCED REJECTION PROCESS ===', { 
        applicationId, 
        reason,
        timestamp: new Date().toISOString(),
        hasUser: !!user,
        hasProfile: !!profile,
        userUniqueEmail: profile?.unique_email
      });
      
      // Detailed authentication checks
      if (!user?.id) {
        logger.error('REJECTION FAILED: No authenticated user found');
        toast.error('Authentication required to reject application');
        return;
      }

      if (!profile?.unique_email) {
        logger.error('REJECTION FAILED: No unique email found in profile', { 
          profileExists: !!profile,
          profileKeys: profile ? Object.keys(profile) : []
        });
        toast.error('Profile setup incomplete - cannot send rejection email');
        return;
      }

      logger.debug('Authentication checks passed', {
        userId: user.id,
        userEmail: user.email,
        profileUniqueEmail: profile.unique_email
      });

      // Get application and job details for email
      logger.debug('Fetching application details...');
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
        logger.error('Failed to fetch application details', { 
          error: appError, 
          applicationExists: !!application 
        });
        toast.error('Failed to load application details');
        throw appError || new Error('Application not found');
      }

      logger.debug('Application details fetched successfully', { 
        applicationId, 
        candidateName: application.name,
        candidateEmail: application.email,
        jobTitle: application.jobs.title,
        companyName: application.jobs.company_name,
        fetchDuration: Date.now() - startTime
      });

      // Update database status FIRST
      logger.debug('Updating application status to rejected...');
      const updateStartTime = Date.now();
      
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
        logger.error('Failed to update application status', { 
          error: updateError,
          applicationId 
        });
        toast.error('Failed to update application status');
        throw updateError;
      }

      logger.debug('Application status updated successfully', {
        applicationId,
        updateDuration: Date.now() - updateStartTime
      });

      // Enhanced email sending with detailed logging
      logger.debug('=== STARTING EMAIL SENDING PROCESS ===', {
        candidateEmail: application.email,
        candidateName: application.name,
        rejectionReason: reason || 'No reason provided',
        userUniqueEmail: profile.unique_email
      });

      try {
        const emailStartTime = Date.now();
        
        // Enhanced email templates with better fallback
        const getEmailSubject = (rejectionReason: string, jobTitle: string) => {
          const subject = `Update on your ${jobTitle} application`;
          logger.debug('Generated email subject', { subject, rejectionReason, jobTitle });
          return subject;
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
          
          const selectedTemplate = templates[rejectionReason as keyof typeof templates] || `
            <p>Dear {name},</p>
            <p>Thank you for your interest in the {position} role at {company}. After careful consideration, we have decided to move forward with other candidates.</p>
            <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
            <p>Best regards,<br>The {company} Team</p>
          `;
          
          logger.debug('Selected email template', { 
            rejectionReason, 
            templateFound: !!templates[rejectionReason as keyof typeof templates],
            templatePreview: selectedTemplate.substring(0, 100) + '...'
          });
          
          return selectedTemplate;
        };

        const emailSubject = getEmailSubject(reason || 'No reason provided', application.jobs.title);
        const emailContent = getEmailContent(reason || 'No reason provided');

        logger.debug('Email content prepared', {
          subject: emailSubject,
          contentLength: emailContent.length,
          hasVariables: emailContent.includes('{name}')
        });

        // Enhanced emailService call with detailed logging
        logger.debug('Calling emailService.sendEmail with payload:', {
          recipientEmail: application.email,
          recipientName: application.name,
          subject: emailSubject,
          contentPreview: emailContent.substring(0, 200) + '...',
          applicationId: applicationId,
          jobId: application.jobs.id,
          userUniqueEmail: profile.unique_email
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

        const emailDuration = Date.now() - emailStartTime;
        logger.debug('Rejection email sent successfully', { 
          applicationId, 
          recipientEmail: application.email,
          emailDuration,
          totalDuration: Date.now() - startTime
        });

        toast.success('Application rejected and candidate notified via email');

      } catch (emailError: any) {
        logger.error('CRITICAL: Rejection email failed to send', {
          error: emailError,
          errorMessage: emailError?.message,
          errorStack: emailError?.stack,
          applicationId,
          candidateEmail: application.email,
          userUniqueEmail: profile.unique_email
        });
        
        // Show specific error message to user
        toast.error(`Application rejected, but email failed: ${emailError?.message || 'Unknown error'}`);
      }
      
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
      logger.debug('Rejection process completed', { 
        applicationId,
        totalDuration: Date.now() - startTime
      });
      
    } catch (error: any) {
      logger.error('FATAL: Rejection process failed completely', {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        applicationId,
        reason,
        totalDuration: Date.now() - startTime
      });
      toast.error(`Failed to reject application: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  };

  const unrejectApplication = async (applicationId: string) => {
    const startTime = Date.now();
    
    try {
      logger.debug('=== STARTING UNREJECT PROCESS ===', { 
        applicationId,
        timestamp: new Date().toISOString()
      });
      
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
        logger.error('Failed to unreject application', { 
          error, 
          applicationId,
          duration: Date.now() - startTime
        });
        toast.error(`Failed to unreject application: ${error.message}`);
        throw error;
      }

      logger.debug('Application unrejected successfully', { 
        applicationId,
        duration: Date.now() - startTime
      });
      
      toast.success('Application unrejected successfully');
      
      setTimeout(() => {
        onUpdate?.();
      }, 100);
      
    } catch (error: any) {
      logger.error('FATAL: Unreject process failed', {
        error,
        errorMessage: error?.message,
        applicationId,
        duration: Date.now() - startTime
      });
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
