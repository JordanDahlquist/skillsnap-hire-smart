
// Database operations for email processing
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const createEmailThread = async (
  supabase: any,
  userId: string,
  subject: string,
  participants: string[],
  fromEmail: string
): Promise<string> => {
  const { data: thread, error: threadError } = await supabase
    .from('email_threads')
    .insert({
      user_id: userId,
      subject: subject,
      participants: participants,
      reply_to_email: fromEmail,
      last_message_at: new Date().toISOString(),
      unread_count: 0,
      status: 'active'
    })
    .select('id')
    .single();

  if (threadError) {
    console.error('Failed to create thread:', threadError);
    throw threadError;
  }

  console.log('Created thread:', thread.id);
  return thread.id;
};

export const storeEmailMessage = async (
  supabase: any,
  threadId: string,
  fromEmail: string,
  recipientEmail: string,
  subject: string,
  content: string
): Promise<void> => {
  console.log('Storing message in database for thread:', threadId);
  const { error: messageError } = await supabase
    .from('email_messages')
    .insert({
      thread_id: threadId,
      sender_email: fromEmail,
      recipient_email: recipientEmail,
      subject: subject,
      content: content,
      direction: 'outbound',
      message_type: 'original',
      is_read: true
    });

  if (messageError) {
    console.error('Failed to store message:', messageError);
    throw messageError;
  } else {
    console.log('Message stored successfully in database');
  }
};

export const logEmailAttempt = async (
  supabase: any,
  userId: string,
  threadId: string | null,
  recipientEmail: string,
  recipientName: string,
  subject: string,
  content: string,
  templateId: string | null,
  status: 'sent' | 'failed'
): Promise<void> => {
  const { error: logError } = await supabase
    .from('email_logs')
    .insert({
      user_id: userId,
      thread_id: threadId,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject: subject,
      content: content,
      template_id: templateId || null,
      status: status,
      sent_at: new Date().toISOString()
    });

  if (logError) {
    console.error('Failed to log email:', logError);
  }
};
