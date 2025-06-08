
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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const emailData: IncomingEmail = await req.json();
    console.log('Received email webhook:', emailData);

    // Extract thread information from subject or references
    let threadId: string | null = null;
    
    // Try to extract thread ID from subject (if it contains a thread identifier)
    const threadMatch = emailData.subject.match(/\[Thread:([^\]]+)\]/);
    if (threadMatch) {
      threadId = threadMatch[1];
    }

    // If no thread ID found, try to find existing thread by subject
    if (!threadId) {
      // Remove "Re:" prefixes and normalize subject
      const normalizedSubject = emailData.subject
        .replace(/^(Re:|RE:|Fwd:|FWD:)\s*/gi, '')
        .trim();

      const { data: existingThreads } = await supabase
        .from('email_threads')
        .select('id, user_id')
        .ilike('subject', `%${normalizedSubject}%`)
        .limit(1);

      if (existingThreads && existingThreads.length > 0) {
        threadId = existingThreads[0].id;
      }
    }

    // If still no thread found, we might need to create a new one
    // This would require more context about which user this email belongs to
    if (!threadId) {
      console.log('No existing thread found for email:', emailData.subject);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No thread found for incoming email' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Insert the new message
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
        external_message_id: emailData.in_reply_to || null
      });

    if (messageError) {
      throw messageError;
    }

    console.log('Successfully stored incoming email message');

    return new Response(
      JSON.stringify({ success: true }),
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
