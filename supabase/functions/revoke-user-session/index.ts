import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's sessions and revoke them
    const { data: sessions, error: sessionsError } = await supabaseAdmin.auth.admin.listSessions();
    
    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sessions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Find and revoke sessions for the target user
    const userSessions = sessions?.filter(session => session.user_id === userId) || [];
    const revokePromises = userSessions.map(session =>
      supabaseAdmin.auth.admin.deleteSession(session.id)
    );

    const revokeResults = await Promise.allSettled(revokePromises);
    const revokedCount = revokeResults.filter(result => result.status === 'fulfilled').length;
    const failedCount = revokeResults.filter(result => result.status === 'rejected').length;

    console.log(`Session revocation for user ${userId}: ${revokedCount} revoked, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        revokedSessions: revokedCount,
        failedRevocations: failedCount,
        message: `Successfully revoked ${revokedCount} sessions for user`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in revoke-user-session function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});