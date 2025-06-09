
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

    const { message, conversation_id } = await req.json()

    console.log('Scout AI request:', { userId: user.id, message, conversation_id })

    // Get user profile and recent context
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, company_name')
      .eq('id', user.id)
      .single()

    // Get user's jobs and applications for context
    const { data: jobs } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        status,
        created_at,
        role_type,
        experience_level,
        applications(id, name, email, status, ai_rating, manual_rating, created_at)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get recent conversation history for context
    const { data: recentMessages } = await supabase
      .from('scout_conversations')
      .select('message_content, is_ai_response, created_at')
      .eq('user_id', user.id)
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .limit(10)

    const conversationHistory = recentMessages?.reverse().map(msg => ({
      role: msg.is_ai_response ? 'assistant' : 'user',
      content: msg.message_content
    })) || []

    // Build context about user's hiring data
    const totalJobs = jobs?.length || 0
    const activeJobs = jobs?.filter(job => job.status === 'active').length || 0
    const allApplications = jobs?.flatMap(job => job.applications || []) || []
    const pendingApplications = allApplications.filter(app => app.status === 'pending').length
    const topCandidates = allApplications
      .filter(app => (app.ai_rating && app.ai_rating >= 2.5) || (app.manual_rating && app.manual_rating >= 2))
      .slice(0, 5)

    const systemPrompt = `You are Scout, an AI hiring assistant for ${profile?.full_name || 'the user'} at ${profile?.company_name || 'their company'}. You help with hiring decisions, candidate analysis, and job management.

Current hiring context:
- Total jobs: ${totalJobs} (${activeJobs} active)
- Total applications: ${allApplications.length}
- Pending reviews: ${pendingApplications}
- Top candidates available: ${topCandidates.length}

You can reference specific jobs and candidates in your responses. When discussing jobs or candidates, you can suggest showing them as interactive cards by mentioning job IDs or application IDs in your response.

Be conversational, helpful, and proactive. Ask follow-up questions. Offer specific insights about their hiring pipeline. If they ask about jobs or candidates, provide relevant analysis and suggest actionable next steps.

Available jobs: ${jobs?.map(job => `${job.title} (ID: ${job.id}, Status: ${job.status}, ${job.applications?.length || 0} applications)`).join(', ')}

Respond naturally and conversationally. Keep responses concise but informative.`

    // Prepare OpenAI messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    console.log('Calling OpenAI with messages:', messages.length)

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const aiMessage = aiResponse.choices[0].message.content

    console.log('AI response received:', aiMessage.substring(0, 100))

    // Parse AI response to extract job/candidate mentions
    const jobIds: string[] = []
    const applicationIds: string[] = []
    
    // Extract job IDs from response
    const jobMatches = aiMessage.match(/job(?:\s+ID)?[:\s]+([a-f0-9-]{36})/gi)
    if (jobMatches) {
      jobMatches.forEach((match: string) => {
        const id = match.match(/([a-f0-9-]{36})/)?.[1]
        if (id && jobs?.some(job => job.id === id)) {
          jobIds.push(id)
        }
      })
    }

    // Extract application IDs from response  
    const appMatches = aiMessage.match(/(?:candidate|application)(?:\s+ID)?[:\s]+([a-f0-9-]{36})/gi)
    if (appMatches) {
      appMatches.forEach((match: string) => {
        const id = match.match(/([a-f0-9-]{36})/)?.[1]
        if (id && allApplications.some(app => app.id === id)) {
          applicationIds.push(id)
        }
      })
    }

    // Store user message
    await supabase
      .from('scout_conversations')
      .insert({
        user_id: user.id,
        conversation_id,
        message_content: message,
        message_type: 'text',
        is_ai_response: false
      })

    // Store AI response
    await supabase
      .from('scout_conversations')
      .insert({
        user_id: user.id,
        conversation_id,
        message_content: aiMessage,
        message_type: jobIds.length > 0 || applicationIds.length > 0 ? 'with_cards' : 'text',
        is_ai_response: true,
        related_job_ids: jobIds,
        related_application_ids: applicationIds
      })

    // Get full job and application data for cards
    let jobCards = []
    let candidateCards = []

    if (jobIds.length > 0) {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          status,
          role_type,
          experience_level,
          created_at,
          applications(count)
        `)
        .in('id', jobIds)
        .eq('user_id', user.id)
      
      jobCards = jobsData || []
    }

    if (applicationIds.length > 0) {
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          id,
          name,
          email,
          status,
          ai_rating,
          manual_rating,
          created_at,
          pipeline_stage,
          ai_summary,
          job_id,
          jobs(title)
        `)
        .in('id', applicationIds)
      
      candidateCards = applicationsData || []
    }

    console.log('Response prepared with cards:', { jobCards: jobCards.length, candidateCards: candidateCards.length })

    return new Response(
      JSON.stringify({
        message: aiMessage,
        jobCards,
        candidateCards,
        conversationId: conversation_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in scout-ai-chat:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
