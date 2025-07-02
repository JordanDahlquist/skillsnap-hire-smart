
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import type { Application, Job } from '@/types';

// Helper function to extract plain text from HTML content
const extractTextFromHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Helper function to get proper company name with fallback hierarchy
const getCompanyName = (job: Job, profile?: any): string => {
  // Priority: job.company_name -> profile.company_name -> "Your Company"
  return job.company_name || profile?.company_name || "Your Company";
};

// Helper function to process template variables in content
const processTemplateVariables = (content: string, application: Application, job: Job, companyName: string): string => {
  if (!content) return content;
  
  return content
    .replace(/\{name\}/g, application.name)
    .replace(/\{candidateName\}/g, application.name)
    .replace(/\{position\}/g, job.title)
    .replace(/\{jobTitle\}/g, job.title)
    .replace(/\{email\}/g, application.email)
    .replace(/\{candidateEmail\}/g, application.email)
    .replace(/\{company\}/g, companyName)
    .replace(/\{companyName\}/g, companyName);
};

// Get rejection email template based on reason with professional styling
const getRejectionEmailTemplate = (reason: string): string => {
  const baseTemplate = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 24px;">Update on your {position} application</h2>
        <div style="background: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="margin-bottom: 16px; font-size: 16px;">Dear {name},</p>
          <div style="margin-bottom: 20px;">
            {content}
          </div>
          <p style="margin-bottom: 16px;">We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">Best regards,<br>The {company} Team</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const contentMap = {
    'Insufficient Experience': 'Thank you for your interest in the {position} role at {company}. After careful consideration, we have decided to move forward with candidates who more closely match our current experience requirements.',
    'Skills Mismatch': 'Thank you for applying to the {position} position at {company}. While we were impressed with your background, we have decided to proceed with candidates whose skills more closely align with our specific requirements.',
    'Unsuccessful Assessment': 'Thank you for taking the time to complete our assessment for the {position} role at {company}. After reviewing your responses, we have decided to move forward with other candidates.',
    'Unsuccessful Interview': 'Thank you for interviewing for the {position} position at {company}. After careful consideration, we have decided to proceed with other candidates.',
    'Overqualified': 'Thank you for your interest in the {position} role at {company}. While your qualifications are impressive, we believe this role may not provide the challenge and growth opportunities you are seeking.',
    'Position Filled': 'Thank you for your interest in the {position} role at {company}. We have decided to move forward with another candidate for this position.',
    'Budget Constraints': 'Thank you for your interest in the {position} role at {company}. Unfortunately, we are unable to proceed due to budget constraints.',
    'Timeline Mismatch': 'Thank you for your interest in the {position} role at {company}. Unfortunately, our timeline requirements do not align with your availability.'
  };

  const content = contentMap[reason as keyof typeof contentMap] || 
    'Thank you for your interest in the {position} role at {company}. After careful consideration, we have decided to move forward with other candidates.';

  return baseTemplate.replace('{content}', content);
};

export const conversationEmailService = {
  async sendRejectionEmail(
    application: Application,
    job: Job,
    rejectionReason: string,
    sendReplyFunction: (threadId: string, content: string) => Promise<void>
  ): Promise<void> {
    console.log('=== SENDING PROFESSIONAL REJECTION EMAIL ===');
    console.log('Application:', application.id, application.name);
    console.log('Job:', job.title, 'at', job.company_name);
    console.log('Rejection reason:', rejectionReason);
    
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      // Get user profile for company name and unique email
      const { data: profile } = await supabase
        .from('profiles')
        .select('unique_email, company_name')
        .eq('id', user.data.user.id)
        .single();

      if (!profile?.unique_email) {
        throw new Error('User profile not found or missing unique email');
      }

      console.log('User profile found:', profile.unique_email, profile.company_name);

      // Get proper company name with fallback hierarchy
      const companyName = getCompanyName(job, profile);
      console.log('Using company name:', companyName);

      // Create clean, professional subject line without thread ID
      const cleanSubject = `Update on your ${job.title} application`;
      console.log('Clean subject line:', cleanSubject);

      // Find or create email thread for this candidate
      let { data: existingThreads } = await supabase
        .from('email_threads')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('application_id', application.id);

      let threadId: string;

      if (existingThreads && existingThreads.length > 0) {
        threadId = existingThreads[0].id;
        console.log('Using existing thread:', threadId);
      } else {
        console.log('Creating new thread for application:', application.id);
        
        const { data: newThread, error: threadError } = await supabase
          .from('email_threads')
          .insert({
            user_id: user.data.user.id,
            application_id: application.id,
            job_id: job.id,
            subject: cleanSubject,
            participants: [profile.unique_email, application.email],
            reply_to_email: profile.unique_email,
            last_message_at: new Date().toISOString(),
            unread_count: 0,
            status: 'active'
          })
          .select('id')
          .single();

        if (threadError || !newThread) {
          console.error('Failed to create thread:', threadError);
          throw new Error('Failed to create email thread');
        }

        threadId = newThread.id;
        console.log('Created new thread:', threadId);
      }

      // Get rejection email template and process variables
      const emailTemplate = getRejectionEmailTemplate(rejectionReason);
      const processedContent = processTemplateVariables(emailTemplate, application, job, companyName);
      
      console.log('Processed professional email content generated');

      // Send email using the existing conversation system
      await sendReplyFunction(threadId, processedContent);
      
      console.log('Professional rejection email sent successfully');
      
    } catch (error) {
      console.error('Failed to send rejection email:', error);
      throw error;
    }
  }
};
