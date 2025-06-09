
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const { force_regenerate } = await req.json().catch(() => ({}))

    // Check for existing non-expired briefing (unless force regenerate)
    if (!force_regenerate) {
      const { data: existingBriefing } = await supabase
        .from('daily_briefings')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingBriefing) {
        console.log('Returning existing briefing')
        return new Response(
          JSON.stringify({ briefing: existingBriefing }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('Generating new daily briefing for user:', user.id)

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, company_name')
      .eq('id', user.id)
      .single()

    const userDisplayName = profile?.full_name || 'there'
    const companyName = profile?.company_name || 'Your Company'

    // Get comprehensive job and application data using LEFT JOIN instead of INNER JOIN
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        status,
        created_at,
        view_count,
        applications(id, status, ai_rating, created_at)
      `)
      .eq('user_id', user.id)

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError)
      throw jobsError
    }

    console.log('Raw jobs data:', jobs?.length, 'jobs found')

    // Process the data to calculate metrics
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const totalJobs = jobs?.length || 0
    const activeJobs = jobs?.filter(job => job.status === 'active').length || 0
    
    // Get all applications across all jobs
    const allApplications = jobs?.flatMap(job => job.applications || []) || []
    const totalApplications = allApplications.length
    const pendingApplications = allApplications.filter(app => app.status === 'pending').length
    const recentApplications = allApplications.filter(app => 
      new Date(app.created_at) >= oneWeekAgo
    ).length
    const highRatedApplications = allApplications.filter(app => 
      app.ai_rating && app.ai_rating >= 2.5
    ).length

    // Calculate jobs needing attention (active jobs with applications that need review)
    const jobsNeedingAttention = jobs?.filter(job => {
      if (job.status !== 'active') return false
      const jobApplications = job.applications || []
      return jobApplications.some(app => app.status === 'pending')
    }).length || 0

    const briefingData = {
      total_jobs: totalJobs,
      active_jobs: activeJobs,
      total_applications: totalApplications,
      pending_applications: pendingApplications,
      jobs_needing_attention: jobsNeedingAttention,
      high_rated_applications: highRatedApplications,
      recent_applications: recentApplications
    }

    console.log('Briefing data:', briefingData)

    // Get job titles for more context
    const activeJobTitles = jobs?.filter(job => job.status === 'active').map(job => job.title) || []
    const jobsWithoutApplications = jobs?.filter(job => 
      job.status === 'active' && (!job.applications || job.applications.length === 0)
    ) || []

    // Generate briefing content with OpenAI
    const briefingPrompt = `Generate a personalized daily hiring briefing for ${userDisplayName} at ${companyName}.

Current hiring metrics:
- Total jobs posted: ${totalJobs}
- Active job postings: ${activeJobs}
- Total applications received: ${totalApplications}
- Applications awaiting review: ${pendingApplications}
- Jobs requiring attention: ${jobsNeedingAttention}
- High-rated candidates (2.5+ stars): ${highRatedApplications}
- New applications this week: ${recentApplications}

Active job titles: ${activeJobTitles.join(', ')}
Jobs still waiting for applications: ${jobsWithoutApplications.map(j => j.title).join(', ')}

Create a brief, friendly morning briefing (2-3 sentences) that:
1. Starts with a personalized greeting
2. Highlights the most important metrics and actionable items
3. Mentions specific job titles when relevant
4. Provides encouragement and next steps
5. Notes if any jobs are still waiting for their first applications

Keep it conversational, positive, and focused on what ${userDisplayName} should prioritize today.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful hiring assistant that creates personalized daily briefings for recruiters and hiring managers. Focus on actionable insights and maintain an encouraging, professional tone.'
          },
          {
            role: 'user',
            content: briefingPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const briefingContent = aiResponse.choices[0].message.content

    // Update regeneration tracking if this was forced
    if (force_regenerate) {
      const today = new Date().toDateString()
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('last_regeneration_date, daily_briefing_regenerations')
        .eq('id', user.id)
        .single()

      const lastRegenDate = currentProfile?.last_regeneration_date ? 
        new Date(currentProfile.last_regeneration_date).toDateString() : null
      
      const currentCount = lastRegenDate === today ? 
        (currentProfile?.daily_briefing_regenerations || 0) : 0

      await supabase
        .from('profiles')
        .update({
          last_regeneration_date: new Date().toISOString().split('T')[0],
          daily_briefing_regenerations: currentCount + 1
        })
        .eq('id', user.id)
    }

    // Store the new briefing
    const { data: newBriefing, error: insertError } = await supabase
      .from('daily_briefings')
      .insert({
        user_id: user.id,
        briefing_content: briefingContent,
        briefing_data: briefingData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error storing briefing:', insertError)
      throw insertError
    }

    console.log('New briefing generated and stored')

    return new Response(
      JSON.stringify({ briefing: newBriefing }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-daily-briefing:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
