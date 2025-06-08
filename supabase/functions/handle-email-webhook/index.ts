
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Email Webhook Called ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const emailData: IncomingEmail = await req.json();
    console.log('Received email webhook data:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      hasText: !!emailData.text,
      hasHtml: !!emailData.html
    });

    // Extract thread information from subject or references
    let threadId: string | null = null;
    let userId: string | null = null;
    
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
            userId = thread.user_id;
            console.log('Found matching thread by participants:', threadId);
            break;
          }
        }
      }
    } else {
      // Get user ID from the found thread
      const { data: threadData, error: threadError } = await supabase
        .from('email_threads')
        .select('user_id')
        .eq('id', threadId)
        .single();

      if (threadError) {
        console.error('Error fetching thread data:', threadError);
      } else if (threadData) {
        userId = threadData.user_id;
        console.log('Retrieved user ID from thread:', userId);
      }
    }

    // If still no thread found, create a new one
    if (!threadId) {
      console.log('No existing thread found, attempting to create new thread');
      
      // Try to find user by checking if the "to" email is hiring@atract.ai
      if (emailData.to === 'hiring@atract.ai') {
        // For now, we'll need to find a way to associate this with a user
        // This could be improved by having a mapping or looking at recent outbound emails
        console.log('Email sent to hiring@atract.ai - need to determine target user');
        
        // Look for recent outbound emails to this sender to find the user
        const { data: recentMessages } = await supabase
          .from('email_messages')
          .select('thread_id, email_threads!inner(user_id)')
          .eq('recipient_email', emailData.from)
          .eq('direction', 'outbound')
          .order('created_at', { ascending: false })
          .limit(1);

        if (recentMessages && recentMessages.length > 0) {
          userId = (recentMessages[0] as any).email_threads.user_id;
          console.log('Found user from recent outbound message:', userId);
        }
      }

      if (userId) {
        // Create new thread
        const { data: newThread, error: createError } = await supabase
          .from('email_threads')
          .insert({
            user_id: userId,
            subject: emailData.subject,
            participants: [emailData.from, emailData.to],
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
      } else {
        console.log('No user found for email:', emailData.to);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No user found for incoming email' 
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
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
        external_message_id: emailData.message_id || emailData.in_reply_to || null
      });

    if (messageError) {
      console.error('Failed to insert message:', messageError);
      throw messageError;
    }

    // Update thread last message time and unread count
    const { error: updateError } = await supabase
      .from('email_threads')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: supabase.raw('unread_count + 1')
      })
      .eq('id', threadId);

    if (updateError) {
      console.error('Failed to update thread:', updateError);
    }

    console.log('Successfully processed incoming email for thread:', threadId);

    return new Response(
      JSON.stringify({ success: true, thread_id: threadId }),
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
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
