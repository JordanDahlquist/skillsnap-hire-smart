
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

// Helper function to process template variables in content
const processTemplateVariables = (content: string, application: Application, job: Job): string => {
  if (!content) return content;
  
  return content
    .replace(/\{name\}/g, application.name)
    .replace(/\{candidateName\}/g, application.name)
    .replace(/\{position\}/g, job.title)
    .replace(/\{jobTitle\}/g, job.title)
    .replace(/\{email\}/g, application.email)
    .replace(/\{candidateEmail\}/g, application.email)
    .replace(/\{company\}/g, job.company_name || 'Company')
    .replace(/\{companyName\}/g, job.company_name || 'Company');
};

// Get rejection email template based on reason
const getRejectionEmailTemplate = (reason: string): string => {
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
  
  return templates[reason as keyof typeof templates] || `
    <p>Dear {name},</p>
    <p>Thank you for your interest in the {position} role at {company}. After careful consideration, we have decided to move forward with other candidates.</p>
    <p>We appreciate the time and effort you put into your application and wish you the best of luck in your job search.</p>
    <p>Best regards,<br>The {company} Team</p>
  `;
};

export const conversationEmailService = {
  async sendRejectionEmail(
    application: Application,
    job: Job,
    rejectionReason: string,
    sendReplyFunction: (threadId: string, content: string) => Promise<void>
  ): Promise<void> {
    console.log('=== SENDING REJECTION EMAIL VIA CONVERSATION SYSTEM ===');
    console.log('Application:', application.id, application.name);
    console.log('Rejection reason:', rejectionReason);
    
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      // Get user profile for unique email
      const { data: profile } = await supabase
        .from('profiles')
        .select('unique_email')
        .eq('id', user.data.user.id)
        .single();

      if (!profile?.unique_email) {
        throw new Error('User profile not found or missing unique email');
      }

      console.log('User profile found:', profile.unique_email);

      // Find or create email thread for this candidate
      let { data: existingThreads } = await supabase
        .from('email_threads')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('application_id', application.id);

      let threadId: string;

      if (existingThreads && existingThreads.length > 0) {
        // Use existing thread
        threadId = existingThreads[0].id;
        console.log('Using existing thread:', threadId);
      } else {
        // Create new thread
        console.log('Creating new thread for application:', application.id);
        
        const { data: newThread, error: threadError } = await supabase
          .from('email_threads')
          .insert({
            user_id: user.data.user.id,
            application_id: application.id,
            job_id: job.id,
            subject: `Regarding ${job.title} Application`,
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
      const processedContent = processTemplateVariables(emailTemplate, application, job);
      
      console.log('Processed email content:', processedContent.substring(0, 100) + '...');

      // Send email using the existing conversation system
      await sendReplyFunction(threadId, processedContent);
      
      console.log('Rejection email sent successfully via conversation system');
      
    } catch (error) {
      console.error('Failed to send rejection email:', error);
      throw error;
    }
  }
};
