
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MailerSendWebhook {
  type: string;
  inbound_id: string;
  url: string;
  created_at: string;
  data: {
    object: string;
    id: string;
    recipients: {
      to: {
        raw: string;
        data: Array<{
          name: string;
          email: string;
        }>;
      };
      rcptTo: Array<{
        email: string;
      }>;
    };
    from: {
      raw: string;
      name: string;
      email: string;
    };
    sender: {
      email: string;
    };
    subject: string;
    date: string;
    headers: Record<string, any>;
    text: string;
    html: string;
    raw: string;
  };
}

interface IncomingEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  reply_to?: string;
  in_reply_to?: string;
  references?: string;
  message_id?: string;
}

// Simple content cleaning function for webhook use
const cleanEmailContent = (content: string): string => {
  if (!content) return '';

  let cleanedContent = content;

  // Remove common email headers and metadata
  cleanedContent = cleanedContent.replace(/^(From|To|Subject|Date|Sent|Reply-To|Cc|Bcc):.*$/gm, '');
  
  // Remove "On [date] at [time], [sender] wrote:" patterns
  cleanedContent = cleanedContent.replace(/On .+? at .+?, .+? wrote:/g, '');
  cleanedContent = cleanedContent.replace(/On .+?, .+? wrote:/g, '');
  cleanedContent = cleanedContent.replace(/\d{1,2}\/\d{1,2}\/\d{4}.*?wrote:/g, '');
  
  // Remove email signatures
  cleanedContent = cleanedContent.replace(/--\s*\n[\s\S]*$/m, '');
  cleanedContent = cleanedContent.replace(/Best regards?,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Sincerely,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Thanks?,?\s*\n[\s\S]*$/mi, '');
  
  // Remove Superhuman signatures
  cleanedContent = cleanedContent.replace(/Sent via Superhuman.*$/mi, '');
  cleanedContent = cleanedContent.replace(/https:\/\/sprh\.mn\/.*$/gm, '');
  
  // Remove mobile signatures
  cleanedContent = cleanedContent.replace(/Sent from my iPhone.*$/mi, '');
  cleanedContent = cleanedContent.replace(/Sent from my Android.*$/mi, '');
  cleanedContent = cleanedContent.replace(/Get Outlook for.*$/mi, '');
  
  // Remove quoted text markers
  cleanedContent = cleanedContent.replace(/^>\s?/gm, '');
  cleanedContent = cleanedContent.replace(/^>+.*$/gm, '');
  
  // Remove forwarded message indicators
  cleanedContent = cleanedContent.replace(/---------- Forwarded message ---------/g, '');
  cleanedContent = cleanedContent.replace(/----- Original Message -----/g, '');
  
  // Remove excessive whitespace
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n+/g, '\n\n');
  cleanedContent = cleanedContent.replace(/^\s+|\s+$/g, '');
  
  return cleanedContent.trim();
};

const handler = async (req: Request): Promise<Response> => {
  console.log('=== Email Webhook Called ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log('Raw webhook body received:', rawBody.substring(0, 500) + '...');
    
    let webhookData: MailerSendWebhook;
    
    try {
      webhookData = JSON.parse(rawBody);
      console.log('Parsed webhook data type:', webhookData.type);
      console.log('Webhook data keys:', Object.keys(webhookData));
    } catch (parseError) {
      console.error('Failed to parse webhook body as JSON:', parseError);
      console.log('Raw body that failed to parse:', rawBody);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON payload' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if this is an inbound message webhook
    if (webhookData.type !== 'inbound.message' || !webhookData.data) {
      console.log('Not an inbound message webhook, ignoring. Type:', webhookData.type);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook received but not an inbound message' 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Processing inbound message webhook...');
    console.log('From:', webhookData.data.from.email);
    console.log('To:', webhookData.data.recipients.to.data[0]?.email || webhookData.data.recipients.rcptTo[0]?.email);
    console.log('Subject:', webhookData.data.subject);

    // Extract email data from MailerSend's nested structure
    const emailData: IncomingEmail = {
      from: webhookData.data.from.email,
      to: webhookData.data.recipients.to.data[0]?.email || webhookData.data.recipients.rcptTo[0]?.email,
      subject: webhookData.data.subject,
      text: webhookData.data.text || '',
      html: webhookData.data.html || '',
      message_id: webhookData.data.headers?.['Message-ID'] || webhookData.data.id,
      in_reply_to: webhookData.data.headers?.['In-Reply-To'],
      references: webhookData.data.headers?.['References']
    };

    console.log('Extracted email data:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      messageId: emailData.message_id
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // IMPROVED duplicate detection - check by external_message_id first
    console.log('Checking for duplicate messages by external_message_id...');
    if (emailData.message_id) {
      const { data: existingByMessageId, error: messageIdError } = await supabase
        .from('email_messages')
        .select('id, sender_email, subject, created_at')
        .eq('external_message_id', emailData.message_id)
        .maybeSingle();

      if (messageIdError) {
        console.error('Error checking for duplicates by message_id:', messageIdError);
      }

      if (existingByMessageId) {
        console.log('Duplicate message detected by external_message_id, ignoring:', {
          existingId: existingByMessageId.id,
          existingCreatedAt: existingByMessageId.created_at,
          duplicateMessageId: emailData.message_id
        });
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Duplicate message ignored (by external_message_id)',
            message_id: emailData.message_id
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Secondary duplicate check by sender, subject, and time window
    console.log('Performing secondary duplicate check...');
    const { data: existingMessage, error: duplicateCheckError } = await supabase
      .from('email_messages')
      .select('id, sender_email, subject, created_at')
      .eq('sender_email', emailData.from)
      .eq('subject', emailData.subject)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Within last 5 minutes
      .maybeSingle();

    if (duplicateCheckError) {
      console.error('Error checking for duplicates:', duplicateCheckError);
    }

    if (existingMessage) {
      console.log('Duplicate message detected by sender/subject/time, ignoring:', {
        existingId: existingMessage.id,
        existingCreatedAt: existingMessage.created_at,
        newMessageId: emailData.message_id
      });
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Duplicate message ignored (by sender/subject/time)',
          message_id: emailData.message_id
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Find user by their unique email address
    console.log('Looking up user by unique email:', emailData.to);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id: id')
      .eq('unique_email', emailData.to)
      .maybeSingle();

    if (profileError || !profileData) {
      console.error('No user found for email:', emailData.to, profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `No user found for email address: ${emailData.to}` 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userId = profileData.id;
    console.log('Found user for email:', userId);

    let threadId: string | null = null;
    
    // Try to extract thread ID from subject
    const threadMatch = emailData.subject.match(/\[Thread:([^\]]+)\]/);
    if (threadMatch) {
      threadId = threadMatch[1];
      console.log('Found thread ID in subject:', threadId);
      
      // Verify the thread belongs to this user
      const { data: threadData, error: threadError } = await supabase
        .from('email_threads')
        .select('user_id')
        .eq('id', threadId)
        .eq('user_id', userId)
        .maybeSingle();

      if (threadError || !threadData) {
        console.error('Thread not found or does not belong to user:', threadId, userId);
        threadId = null;
      }
    }

    // If no thread ID found, try to find existing thread by subject and participants
    if (!threadId) {
      const normalizedSubject = emailData.subject
        .replace(/^(Re:|RE:|Fwd:|FWD:)\s*/gi, '')
        .replace(/\[Thread:[^\]]+\]/g, '')
        .trim();

      console.log('Searching for thread with normalized subject:', normalizedSubject);

      const { data: existingThreads, error: searchError } = await supabase
        .from('email_threads')
        .select('id, user_id, participants')
        .eq('user_id', userId)
        .ilike('subject', `%${normalizedSubject}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchError) {
        console.error('Error searching for threads:', searchError);
      } else if (existingThreads && existingThreads.length > 0) {
        console.log(`Found ${existingThreads.length} potential matching threads`);
        
        for (const thread of existingThreads) {
          const participants = Array.isArray(thread.participants) 
            ? thread.participants 
            : [];
          
          console.log('Checking thread:', thread.id, 'participants:', participants);
          
          if (participants.includes(emailData.from)) {
            threadId = thread.id;
            console.log('Found matching thread by participants:', threadId);
            break;
          }
        }
      }
    }

    // If still no thread found, create a new one
    if (!threadId) {
      console.log('No existing thread found, creating new thread');
      
      const { data: newThread, error: createError } = await supabase
        .from('email_threads')
        .insert({
          user_id: userId,
          subject: emailData.subject,
          participants: [emailData.from, emailData.to],
          reply_to_email: emailData.to,
          last_message_at: new Date().toISOString(),
          unread_count: 1,
          status: 'active'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Failed to create new thread:', createError);
        throw createError;
      }

      threadId = newThread.id;
      console.log('Created new thread:', threadId);
    }

    if (!threadId) {
      console.error('Could not determine thread for incoming email');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Could not determine thread for incoming email' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Clean the email content before storing
    const cleanedContent = cleanEmailContent(emailData.text || emailData.html || '');

    // CRITICAL FIX: Insert the new message with is_read: false for inbound messages
    console.log('Inserting new inbound message for thread:', threadId);
    const { error: messageError } = await supabase
      .from('email_messages')
      .insert({
        thread_id: threadId,
        sender_email: emailData.from,
        recipient_email: emailData.to,
        subject: emailData.subject,
        content: cleanedContent,
        direction: 'inbound',
        message_type: 'reply',
        is_read: false, // CRITICAL: Mark as unread for inbound messages
        external_message_id: emailData.message_id || null
      });

    if (messageError) {
      console.error('Failed to insert message:', messageError);
      throw messageError;
    }

    console.log('Successfully inserted inbound message as UNREAD');

    // FIXED: Update thread with proper unread count increment
    console.log('Updating thread last message time and incrementing unread count');
    
    // Get the current unread count and increment it
    const { data: currentThread, error: getCurrentError } = await supabase
      .from('email_threads')
      .select('unread_count')
      .eq('id', threadId)
      .single();

    if (getCurrentError) {
      console.error('Failed to get current thread:', getCurrentError);
      throw getCurrentError;
    }

    const newUnreadCount = (currentThread?.unread_count || 0) + 1;
    console.log('Incrementing unread count from', currentThread?.unread_count, 'to', newUnreadCount);

    // Update with the new unread count
    const { error: updateError } = await supabase
      .from('email_threads')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: newUnreadCount
      })
      .eq('id', threadId);

    if (updateError) {
      console.error('Failed to update thread:', updateError);
      throw updateError;
    } else {
      console.log('Thread updated successfully with unread count:', newUnreadCount);
    }

    console.log('Successfully processed incoming email for thread:', threadId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        thread_id: threadId,
        unread_count: newUnreadCount,
        message: 'Email processed successfully and marked as UNREAD'
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error handling email webhook:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
