
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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Parse request body for force regenerate option
    let forceRegenerate = false;
    try {
      const body = await req.json();
      forceRegenerate = body.force_regenerate || false;
    } catch {
      // No body or invalid JSON, continue with normal flow
    }

    // If force regenerate, check and update daily limits
    if (forceRegenerate) {
      // Get user profile to check regeneration limits
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('daily_briefing_regenerations, last_regeneration_date')
        .eq('id', user.id)
        .single();

      if (profile) {
        const today = new Date().toISOString().split('T')[0];
        const lastRegenDate = profile.last_regeneration_date;
        
        let currentCount = profile.daily_briefing_regenerations || 0;
        
        // Reset count if it's a new day
        if (lastRegenDate !== today) {
          currentCount = 0;
        }
        
        // Check if user has exceeded daily limit
        if (currentCount >= 3) {
          throw new Error('Daily regeneration limit reached (3 per day)');
        }
        
        // Update regeneration count
        await supabaseClient
          .from('profiles')
          .update({
            daily_briefing_regenerations: currentCount + 1,
            last_regeneration_date: today
          })
          .eq('id', user.id);
      }

      // Delete existing briefing to force regeneration
      await supabaseClient
        .from('daily_briefings')
        .delete()
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString());
    }

    // Check for existing valid briefing (unless force regenerate)
    if (!forceRegenerate) {
      const { data: existingBriefing } = await supabaseClient
        .from('daily_briefings')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingBriefing) {
        return new Response(JSON.stringify({ briefing: existingBriefing }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch user's jobs and applications data
    const { data: jobs } = await supabaseClient
      .from('jobs')
      .select(`
        id, title, status, created_at,
        applications!inner(id, status, ai_rating, created_at)
      `)
      .eq('user_id', user.id);

    if (!jobs || jobs.length === 0) {
      const fallbackBriefing = {
        briefing_content: "Good morning! Ready to kickstart your hiring journey? Create your first job posting to begin building your dream team.",
        briefing_data: { jobs_count: 0, applications_count: 0 }
      };

      const { data: newBriefing } = await supabaseClient
        .from('daily_briefings')
        .insert({
          user_id: user.id,
          briefing_content: fallbackBriefing.briefing_content,
          briefing_data: fallbackBriefing.briefing_data
        })
        .select()
        .single();

      return new Response(JSON.stringify({ briefing: newBriefing }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze the data
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let totalApplications = 0;
    let pendingApplications = 0;
    let approvedApplications = 0;
    let highRatedApplications = 0;
    let recentApplications = 0;
    let jobsNeedingAttention = 0;
    
    const jobAnalysis = jobs.map(job => {
      const applications = job.applications || [];
      const pending = applications.filter(app => app.status === 'pending').length;
      const approved = applications.filter(app => app.status === 'approved').length;
      const recent = applications.filter(app => new Date(app.created_at) >= weekAgo).length;
      const highRated = applications.filter(app => app.ai_rating && app.ai_rating >= 8).length;
      
      totalApplications += applications.length;
      pendingApplications += pending;
      approvedApplications += approved;
      recentApplications += recent;
      highRatedApplications += highRated;
      
      if (pending >= 10) {
        jobsNeedingAttention++;
      }
      
      return {
        title: job.title,
        status: job.status,
        applications_count: applications.length,
        pending_count: pending,
        approved_count: approved,
        recent_count: recent,
        high_rated_count: highRated,
        needs_attention: pending >= 10
      };
    });

    const briefingData = {
      total_jobs: jobs.length,
      active_jobs: jobs.filter(j => j.status === 'active').length,
      total_applications: totalApplications,
      pending_applications: pendingApplications,
      approved_applications: approvedApplications,
      recent_applications: recentApplications,
      high_rated_applications: highRatedApplications,
      jobs_needing_attention: jobsNeedingAttention,
      job_analysis: jobAnalysis
    };

    // Generate AI briefing using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a hiring assistant providing a daily briefing to a recruiter. Be conversational, encouraging, and specific with numbers. Focus on actionable insights and mention specific jobs by name when relevant. Keep it concise but informative (2-3 sentences max).`;
    
    const userPrompt = `Generate a daily hiring briefing based on this data:
- ${briefingData.total_jobs} total jobs (${briefingData.active_jobs} active)
- ${briefingData.total_applications} total applications
- ${briefingData.pending_applications} pending, ${briefingData.approved_applications} approved
- ${briefingData.recent_applications} new applications this week
- ${briefingData.high_rated_applications} high-rated candidates (8+ AI score)
- ${briefingData.jobs_needing_attention} jobs need attention (10+ pending)

Jobs analysis: ${JSON.stringify(jobAnalysis)}

Make it personal and actionable. If there are jobs needing attention, mention them specifically. If there are high-rated candidates, highlight the opportunity.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const aiResponse = await response.json();
    const briefingContent = aiResponse.choices[0].message.content;

    // Store the briefing
    const { data: newBriefing } = await supabaseClient
      .from('daily_briefings')
      .insert({
        user_id: user.id,
        briefing_content: briefingContent,
        briefing_data: briefingData
      })
      .select()
      .single();

    return new Response(JSON.stringify({ briefing: newBriefing }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-daily-briefing function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
