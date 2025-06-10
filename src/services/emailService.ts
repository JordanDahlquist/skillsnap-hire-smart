
import { supabase } from "@/integrations/supabase/client";
import { processEmailSubject } from "@/utils/emailTemplateUtils";

export interface EmailThreadData {
  userId: string;
  applicationId?: string;
  jobId?: string;
  subject: string;
  participants: string[];
  userUniqueEmail: string;
}

export interface SendEmailData {
  threadId?: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  applicationId?: string;
  jobId?: string;
  userUniqueEmail: string;
}

export const emailService = {
  async createEmailThread(data: EmailThreadData): Promise<string> {
    console.log('Creating email thread:', data);
    
    // Process the subject to replace template variables
    const processedSubject = await processEmailSubject(
      data.subject,
      data.applicationId,
      data.jobId
    );
    
    const { data: thread, error } = await supabase
      .from('email_threads')
      .insert({
        user_id: data.userId,
        application_id: data.applicationId || null,
        job_id: data.jobId || null,
        subject: processedSubject,
        participants: data.participants,
        reply_to_email: data.userUniqueEmail,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) throw error;
    console.log('Created thread:', thread);
    return thread.id;
  },

  async sendEmail(data: SendEmailData): Promise<void> {
    let threadId = data.threadId;
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // Process the subject to replace template variables
    const processedSubject = await processEmailSubject(
      data.subject,
      data.applicationId,
      data.jobId,
      { candidateName: data.recipientName }
    );

    // Create thread if it doesn't exist
    if (!threadId) {
      threadId = await this.createEmailThread({
        userId: user.data.user.id,
        applicationId: data.applicationId,
        jobId: data.jobId,
        subject: processedSubject,
        participants: [data.userUniqueEmail, data.recipientEmail],
        userUniqueEmail: data.userUniqueEmail
      });
    }

    // Convert rich text to plain text for email
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.content;
    const plainTextContent = tempDiv.textContent || tempDiv.innerText || data.content;

    // Store the outbound message
    const { error: messageError } = await supabase
      .from('email_messages')
      .insert({
        thread_id: threadId,
        sender_email: data.userUniqueEmail,
        recipient_email: data.recipientEmail,
        subject: processedSubject,
        content: data.content,
        direction: 'outbound',
        message_type: 'original',
        is_read: true
      });

    if (messageError) throw messageError;

    // Send the actual email via existing edge function with thread tracking
    const { error: emailError } = await supabase.functions.invoke('send-bulk-email', {
      body: {
        user_id: user.data.user.id,
        applications: [{
          email: data.recipientEmail,
          name: data.recipientName
        }],
        job: { title: 'Email' },
        subject: `${processedSubject} [Thread:${threadId}]`,
        content: plainTextContent,
        reply_to_email: data.userUniqueEmail,
        thread_id: threadId
      }
    });

    if (emailError) throw emailError;

    // Log the email
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: user.data.user.id,
        application_id: data.applicationId || null,
        thread_id: threadId,
        recipient_email: data.recipientEmail,
        recipient_name: data.recipientName,
        subject: processedSubject,
        content: plainTextContent,
        status: 'sent'
      });

    if (logError) console.error('Failed to log email:', logError);
  }
};
