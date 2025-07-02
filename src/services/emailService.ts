
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
    console.log('=== EMAIL SERVICE: Creating email thread ===');
    console.log('Thread data:', data);
    
    const processedSubject = await processEmailSubject(
      data.subject,
      data.applicationId,
      data.jobId
    );
    
    console.log('Processed subject:', processedSubject);
    
    const threadData = {
      user_id: data.userId,
      application_id: data.applicationId || null,
      job_id: data.jobId || null,
      subject: processedSubject,
      participants: data.participants,
      reply_to_email: data.userUniqueEmail,
      last_message_at: new Date().toISOString(),
      unread_count: 0,
      status: 'active'
    };
    
    console.log('Inserting thread data:', threadData);
    
    const { data: thread, error } = await supabase
      .from('email_threads')
      .insert(threadData)
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create thread:', error);
      throw error;
    }
    
    console.log('Successfully created thread:', thread);
    return thread.id;
  },

  async sendEmail(data: SendEmailData): Promise<void> {
    console.log('=== EMAIL SERVICE: Sending email ===');
    console.log('Send email data:', data);
    
    let threadId = data.threadId;
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const processedSubject = await processEmailSubject(
      data.subject,
      data.applicationId,
      data.jobId,
      { candidateName: data.recipientName }
    );

    console.log('Processed email subject:', processedSubject);

    // Create thread if it doesn't exist - CRITICAL: Link to application_id
    if (!threadId) {
      console.log('No thread ID provided, creating new thread with application link');
      threadId = await this.createEmailThread({
        userId: user.data.user.id,
        applicationId: data.applicationId, // CRITICAL: This ensures thread is linked to candidate
        jobId: data.jobId,
        subject: processedSubject,
        participants: [data.userUniqueEmail, data.recipientEmail],
        userUniqueEmail: data.userUniqueEmail
      });
    }

    console.log('Using thread ID:', threadId);

    // Store the outbound message with HTML formatting preserved
    const messageData = {
      thread_id: threadId,
      sender_email: data.userUniqueEmail,
      recipient_email: data.recipientEmail,
      subject: processedSubject,
      content: data.content,
      direction: 'outbound',
      message_type: 'original',
      is_read: true
    };
    
    console.log('Storing outbound message:', messageData);
    
    const { error: messageError } = await supabase
      .from('email_messages')
      .insert(messageData);

    if (messageError) {
      console.error('Failed to store message:', messageError);
      throw messageError;
    }

    console.log('Message stored successfully');

    // Send the actual email via existing edge function with thread tracking
    const emailPayload = {
      user_id: user.data.user.id,
      applications: [{
        email: data.recipientEmail,
        name: data.recipientName
      }],
      job: { title: 'Email' },
      subject: `${processedSubject} [Thread:${threadId}]`, // CRITICAL: Add thread tracking
      content: data.content,
      reply_to_email: data.userUniqueEmail,
      thread_id: threadId,
      application_id: data.applicationId, // CRITICAL: Pass application_id
      job_id: data.jobId,
      create_threads: false // Don't create new thread, we already have one
    };
    
    console.log('Sending email via edge function with payload:', emailPayload);

    const { error: emailError } = await supabase.functions.invoke('send-bulk-email', {
      body: emailPayload
    });

    if (emailError) {
      console.error('Failed to send email via edge function:', emailError);
      throw emailError;
    }

    console.log('Email sent successfully via edge function');

    // Log the email with HTML content for consistency
    const logData = {
      user_id: user.data.user.id,
      application_id: data.applicationId || null,
      thread_id: threadId,
      recipient_email: data.recipientEmail,
      recipient_name: data.recipientName,
      subject: processedSubject,
      content: data.content,
      status: 'sent'
    };
    
    console.log('Logging email:', logData);

    const { error: logError } = await supabase
      .from('email_logs')
      .insert(logData);

    if (logError) {
      console.error('Failed to log email:', logError);
    } else {
      console.log('Email logged successfully');
    }
  }
};
