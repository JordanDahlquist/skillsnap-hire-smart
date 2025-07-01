
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

const handler = async (req: Request): Promise<Response> => {
  console.log('=== Email Webhook Called ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log('Raw webhook body received');
    
    let webhookData: MailerSendWebhook;
    
    try {
      webhookData = JSON.parse(rawBody);
      console.log('Parsed webhook data type:', webhookData.type);
    } catch (parseError) {
      console.error('Failed to parse webhook body as JSON:', parseError);
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
      console.log('Not an inbound message webhook, ignoring');
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

    // Check for duplicate messages first
    const { data: existingMessage, error: duplicateCheckError } = await supabase
      .from('email_messages')
      .select('id')
      .eq('external_message_id', emailData.message_id)
      .single();

    if (existingMessage) {
      console.log('Duplicate message detected, ignoring:', emailData.message_id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Duplicate message ignored',
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
      .single();

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

    // Extract thread information from subject or references
    let threadId: string | null = null;
    
    // Try to extract thread ID from subject (if it contains a thread identifier)
    const threadMatch = emailData.subject.match(/\[Thread:([^\]]+)\]/);
    if (threadMatch) {
      threadId = threadMatch[1];
      console.log('Found thread ID in subject:', threadId);
    }

    // If no thread ID found, try to find existing thread by subject and participants
    if (!threadId) {
      // Remove "Re:" prefixes and normalize subject
      const normalizedSubject = emailData.subject
        .replace(/^(Re:|RE:|Fwd:|FWD:)\s*/gi, '')
        .replace(/\[Thread:[^\]]+\]/g, '')
        .trim();

      console.log('Searching for thread with normalized subject:', normalizedSubject);

      // Find thread by subject and check if sender is a participant
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
        
        // Find a thread where the sender is a participant
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
    } else {
      // Verify the thread belongs to this user
      const { data: threadData, error: threadError } = await supabase
        .from('email_threads')
        .select('user_id')
        .eq('id', threadId)
        .eq('user_id', userId)
        .single();

      if (threadError || !threadData) {
        console.error('Thread not found or does not belong to user:', threadId, userId);
        threadId = null;
      }
    }

    // If still no thread found, create a new one
    if (!threadId) {
      console.log('No existing thread found, creating new thread');
      
      // Create new thread
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

    // Insert the new message
    console.log('Inserting new message for thread:', threadId);
    const { error: messageError } = await supabase
      .from('email_messages')
      .insert({
        thread_id: threadId,
        sender_email: emailData.from,
        recipient_email: emailData.to,
        subject: emailData.subject,
        content: emailData.text || emailData.html,
        direction: 'inbound',
        message_type: 'reply',
        is_read: false,
        external_message_id: emailData.message_id || null
      });

    if (messageError) {
      console.error('Failed to insert message:', messageError);
      throw messageError;
    }

    // Update thread last message time and increment unread count using proper SQL
    const { error: updateError } = await supabase
      .from('email_threads')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: supabase.rpc('increment_unread_count', { thread_id: threadId })
      })
      .eq('id', threadId);

    // If RPC doesn't work, use a direct update with a subquery
    if (updateError) {
      console.log('RPC failed, using direct update approach');
      const { data: currentThread } = await supabase
        .from('email_threads')
        .select('unread_count')
        .eq('id', threadId)
        .single();

      const newUnreadCount = (currentThread?.unread_count || 0) + 1;

      const { error: directUpdateError } = await supabase
        .from('email_threads')
        .update({
          last_message_at: new Date().toISOString(),
          unread_count: newUnreadCount
        })
        .eq('id', threadId);

      if (directUpdateError) {
        console.error('Failed to update thread:', directUpdateError);
      }
    }

    console.log('Successfully processed incoming email for thread:', threadId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        thread_id: threadId,
        message: 'Email processed successfully'
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
