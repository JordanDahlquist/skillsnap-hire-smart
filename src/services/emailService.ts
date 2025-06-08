
import { supabase } from "@/integrations/supabase/client";

export interface EmailThreadData {
  userId: string;
  applicationId?: string;
  jobId?: string;
  subject: string;
  participants: string[];
}

export interface SendEmailData {
  threadId?: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  applicationId?: string;
  jobId?: string;
}

export const emailService = {
  async createEmailThread(data: EmailThreadData): Promise<string> {
    const { data: thread, error } = await supabase
      .from('email_threads')
      .insert({
        user_id: data.userId,
        application_id: data.applicationId || null,
        job_id: data.jobId || null,
        subject: data.subject,
        participants: data.participants,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) throw error;
    return thread.id;
  },

  async sendEmail(data: SendEmailData): Promise<void> {
    let threadId = data.threadId;

    // Create thread if it doesn't exist
    if (!threadId) {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      threadId = await this.createEmailThread({
        userId: user.data.user.id,
        applicationId: data.applicationId,
        jobId: data.jobId,
        subject: data.subject,
        participants: [user.data.user.email!, data.recipientEmail]
      });
    }

    // Store the outbound message
    const { error: messageError } = await supabase
      .from('email_messages')
      .insert({
        thread_id: threadId,
        sender_email: (await supabase.auth.getUser()).data.user?.email || '',
        recipient_email: data.recipientEmail,
        subject: data.subject,
        content: data.content,
        direction: 'outbound',
        message_type: 'original',
        is_read: true
      });

    if (messageError) throw messageError;

    // Send the actual email via existing edge function
    const { error: emailError } = await supabase.functions.invoke('send-bulk-email', {
      body: {
        emails: [{
          recipient_email: data.recipientEmail,
          recipient_name: data.recipientName,
          subject: `${data.subject} [Thread:${threadId}]`, // Include thread ID for tracking
          content: data.content
        }]
      }
    });

    if (emailError) throw emailError;

    // Log the email
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        application_id: data.applicationId || null,
        thread_id: threadId,
        recipient_email: data.recipientEmail,
        recipient_name: data.recipientName,
        subject: data.subject,
        content: data.content,
        status: 'sent'
      });

    if (logError) console.error('Failed to log email:', logError);
  }
};
