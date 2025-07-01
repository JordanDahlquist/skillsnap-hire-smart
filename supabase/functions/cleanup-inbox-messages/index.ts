
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting inbox cleanup...');

    // 1. Mark all inbound messages as unread that were incorrectly marked as read
    console.log('Fixing inbound message read status...');
    const { data: fixedMessages, error: fixReadError } = await supabase
      .from('email_messages')
      .update({ is_read: false })
      .eq('direction', 'inbound')
      .eq('is_read', true)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .select('id, thread_id');

    if (fixReadError) {
      console.error('Error fixing read status:', fixReadError);
    } else {
      console.log('Fixed read status for', fixedMessages?.length || 0, 'messages');
    }

    // 2. Recalculate unread counts for all threads
    console.log('Recalculating thread unread counts...');
    const { data: threads, error: threadsError } = await supabase
      .from('email_threads')
      .select('id');

    if (threadsError) {
      console.error('Error getting threads:', threadsError);
      throw threadsError;
    }

    let updatedThreads = 0;
    for (const thread of threads || []) {
      // Count unread inbound messages for this thread
      const { count, error: countError } = await supabase
        .from('email_messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
        .eq('direction', 'inbound')
        .eq('is_read', false);

      if (countError) {
        console.error('Error counting unread messages for thread', thread.id, countError);
        continue;
      }

      // Update the thread's unread count
      const { error: updateError } = await supabase
        .from('email_threads')
        .update({ unread_count: count || 0 })
        .eq('id', thread.id);

      if (updateError) {
        console.error('Error updating thread unread count:', updateError);
      } else {
        updatedThreads++;
        console.log('Updated thread', thread.id, 'unread count to', count);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Inbox cleanup completed',
        stats: {
          fixedMessages: fixedMessages?.length || 0,
          updatedThreads
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in cleanup:", error);
    
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
