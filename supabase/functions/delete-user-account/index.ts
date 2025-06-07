
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Create client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create client with user auth for verification
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user to verify authentication
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting account deletion for user: ${user.id}`);

    // Parse confirmation text from request body
    let confirmationText = '';
    try {
      const body = await req.json();
      confirmationText = body.confirmationText || '';
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify confirmation text
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return new Response(JSON.stringify({ error: 'Invalid confirmation text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Start deletion process - delete related data first
    console.log('Fetching user jobs to find related applications...');
    const { data: userJobs, error: jobsFetchError } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('user_id', user.id);

    if (jobsFetchError) {
      console.error('Error fetching user jobs:', jobsFetchError);
    }

    const jobIds = userJobs?.map(job => job.id) || [];
    console.log(`Found ${jobIds.length} jobs for user`);

    // Delete applications related to user's jobs
    if (jobIds.length > 0) {
      console.log('Deleting user applications...');
      const { error: applicationsError } = await supabaseAdmin
        .from('applications')
        .delete()
        .in('job_id', jobIds);

      if (applicationsError) {
        console.error('Error deleting applications:', applicationsError);
      } else {
        console.log('Applications deleted successfully');
      }
    } else {
      console.log('No jobs found, skipping applications deletion');
    }

    console.log('Deleting user jobs...');
    const { error: jobsError } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('user_id', user.id);

    if (jobsError) {
      console.error('Error deleting jobs:', jobsError);
    } else {
      console.log('Jobs deleted successfully');
    }

    console.log('Deleting email logs...');
    const { error: emailLogsError } = await supabaseAdmin
      .from('email_logs')
      .delete()
      .eq('user_id', user.id);

    if (emailLogsError) {
      console.error('Error deleting email logs:', emailLogsError);
    } else {
      console.log('Email logs deleted successfully');
    }

    console.log('Deleting email templates...');
    const { error: emailTemplatesError } = await supabaseAdmin
      .from('email_templates')
      .delete()
      .eq('user_id', user.id);

    if (emailTemplatesError) {
      console.error('Error deleting email templates:', emailTemplatesError);
    } else {
      console.log('Email templates deleted successfully');
    }

    console.log('Deleting daily briefings...');
    const { error: briefingsError } = await supabaseAdmin
      .from('daily_briefings')
      .delete()
      .eq('user_id', user.id);

    if (briefingsError) {
      console.error('Error deleting daily briefings:', briefingsError);
    } else {
      console.log('Daily briefings deleted successfully');
    }

    console.log('Deleting organization memberships...');
    const { error: membershipsError } = await supabaseAdmin
      .from('organization_memberships')
      .delete()
      .eq('user_id', user.id);

    if (membershipsError) {
      console.error('Error deleting organization memberships:', membershipsError);
    } else {
      console.log('Organization memberships deleted successfully');
    }

    console.log('Deleting invitations...');
    const { error: invitationsError } = await supabaseAdmin
      .from('invitations')
      .delete()
      .eq('invited_by', user.id);

    if (invitationsError) {
      console.error('Error deleting invitations:', invitationsError);
    } else {
      console.log('Invitations deleted successfully');
    }

    console.log('Deleting user profile...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    } else {
      console.log('Profile deleted successfully');
    }

    // Finally, delete the user from auth
    console.log('Deleting user from auth...');
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error('Error deleting user from auth:', authError);
      return new Response(JSON.stringify({ error: 'Failed to delete user account' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Account deletion completed successfully for user: ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Account deleted successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in delete-user-account function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error during account deletion' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
