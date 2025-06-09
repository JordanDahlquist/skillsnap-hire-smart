
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

    // Get user's jobs with comprehensive application data
    const { data: jobs } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        status,
        created_at,
        role_type,
        experience_level,
        required_skills,
        description,
        employment_type,
        applications(
          id, 
          name, 
          email, 
          status, 
          ai_rating, 
          manual_rating, 
          created_at,
          ai_summary,
          work_experience,
          education,
          skills,
          experience,
          portfolio_url,
          github_url,
          linkedin_url,
          location,
          phone,
          pipeline_stage,
          rejection_reason,
          parsed_resume_data,
          cover_letter,
          available_start_date
        )
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

    // Build comprehensive context about hiring data
    const totalJobs = jobs?.length || 0
    const activeJobs = jobs?.filter(job => job.status === 'active').length || 0
    const allApplications = jobs?.flatMap(job => job.applications || []) || []
    const pendingApplications = allApplications.filter(app => app.status === 'pending').length
    const reviewedApplications = allApplications.filter(app => app.status === 'reviewed').length
    const topRatedCandidates = allApplications
      .filter(app => (app.ai_rating && app.ai_rating >= 2.5) || (app.manual_rating && app.manual_rating >= 2))
      .sort((a, b) => {
        const aRating = a.manual_rating || a.ai_rating || 0
        const bRating = b.manual_rating || b.ai_rating || 0
        return bRating - aRating
      })
      .slice(0, 10)

    // Create detailed candidate profiles for AI context
    const candidateProfiles = allApplications.map(app => {
      const skillsArray = Array.isArray(app.skills) ? app.skills : []
      const workExperience = Array.isArray(app.work_experience) ? app.work_experience : []
      const education = Array.isArray(app.education) ? app.education : []
      
      return {
        id: app.id,
        name: app.name,
        email: app.email,
        status: app.status,
        ai_rating: app.ai_rating,
        manual_rating: app.manual_rating,
        pipeline_stage: app.pipeline_stage,
        rejection_reason: app.rejection_reason,
        ai_summary: app.ai_summary,
        location: app.location,
        skills: skillsArray.map(skill => typeof skill === 'string' ? skill : skill?.name || skill?.skill).filter(Boolean),
        experience_years: app.experience,
        work_history: workExperience.map(exp => ({
          company: exp?.company || exp?.employer,
          title: exp?.title || exp?.position,
          duration: exp?.duration || `${exp?.start_date} - ${exp?.end_date}`,
          description: exp?.description
        })).filter(exp => exp.company || exp.title),
        education_background: education.map(edu => ({
          institution: edu?.institution || edu?.school,
          degree: edu?.degree,
          field: edu?.field || edu?.major,
          year: edu?.year || edu?.graduation_year
        })).filter(edu => edu.institution || edu.degree),
        portfolio_url: app.portfolio_url,
        github_url: app.github_url,
        linkedin_url: app.linkedin_url,
        available_start_date: app.available_start_date,
        cover_letter_excerpt: app.cover_letter ? app.cover_letter.substring(0, 200) + '...' : null
      }
    })

    // Create job context with requirements
    const jobContext = jobs?.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      role_type: job.role_type,
      experience_level: job.experience_level,
      required_skills: job.required_skills,
      employment_type: job.employment_type,
      application_count: job.applications?.length || 0,
      description_excerpt: job.description ? job.description.substring(0, 300) + '...' : null
    })) || []

    const systemPrompt = `You are Scout, an AI hiring assistant for ${profile?.full_name || 'the user'} at ${profile?.company_name || 'their company'}. You help analyze candidates, make hiring recommendations, and optimize the recruitment process.

CURRENT HIRING CONTEXT:
- Total jobs: ${totalJobs} (${activeJobs} active)
- Total applications: ${allApplications.length}
- Pending reviews: ${pendingApplications}
- Reviewed applications: ${reviewedApplications}
- Top-rated candidates: ${topRatedCandidates.length}

AVAILABLE JOBS:
${jobContext.map(job => `
• ${job.title} (ID: ${job.id})
  - Status: ${job.status}
  - Type: ${job.role_type} | ${job.employment_type}
  - Experience Level: ${job.experience_level}
  - Required Skills: ${job.required_skills}
  - Applications: ${job.application_count}
  ${job.description_excerpt ? `- Description: ${job.description_excerpt}` : ''}
`).join('\n')}

CANDIDATE PROFILES:
${candidateProfiles.slice(0, 20).map(candidate => `
• ${candidate.name}
  - Status: ${candidate.status} | Stage: ${candidate.pipeline_stage || 'applied'}
  - Ratings: Your=${candidate.manual_rating || 'unrated'}, AI=${candidate.ai_rating || 'unrated'}
  - Location: ${candidate.location || 'Not specified'}
  - Skills: ${candidate.skills.join(', ') || 'Not specified'}
  - Experience: ${candidate.experience_years || 'Not specified'} years
  ${candidate.ai_summary ? `- AI Summary: ${candidate.ai_summary}` : ''}
  ${candidate.work_history.length > 0 ? `- Recent Role: ${candidate.work_history[0]?.title} at ${candidate.work_history[0]?.company}` : ''}
  ${candidate.education_background.length > 0 ? `- Education: ${candidate.education_background[0]?.degree} from ${candidate.education_background[0]?.institution}` : ''}
  ${candidate.portfolio_url ? `- Portfolio: ${candidate.portfolio_url}` : ''}
  ${candidate.github_url ? `- GitHub: ${candidate.github_url}` : ''}
  ${candidate.rejection_reason ? `- Rejection Reason: ${candidate.rejection_reason}` : ''}
`).join('\n')}

YOUR CAPABILITIES:
1. **Candidate Analysis**: Analyze individual candidates' qualifications, experience, and fit for specific roles
2. **Comparative Assessment**: Compare multiple candidates and recommend the best fits
3. **Hiring Recommendations**: Suggest who to interview, hire, or reject based on comprehensive data
4. **Pipeline Optimization**: Recommend improvements to your hiring process
5. **Skill Matching**: Match candidate skills with job requirements
6. **Decision Support**: Provide data-driven insights for hiring decisions

CONVERSATION GUIDELINES:
- Speak naturally about candidates using their names (e.g., "Sarah Johnson shows great potential")
- When discussing specific candidates in detail, I will show their candidate cards automatically
- You can reference job IDs when helpful for job-specific discussions
- Focus on actionable insights and clear recommendations
- Be conversational and personable while remaining professional

IMPORTANT CARD DISPLAY RULES:
- Whenever you mention a specific candidate by name in a substantive way (analyzing them, comparing them, recommending them), their card will be displayed
- If you discuss multiple candidates, cards for all mentioned candidates will be shown
- Cards help users quickly access candidate details and navigate to their applications
- Always use candidate names naturally in conversation rather than avoiding them

IMPORTANT INSTRUCTIONS:
- Provide actionable recommendations with reasoning based on the actual candidate data
- Be specific about why you recommend certain candidates over others
- Consider both technical skills and cultural fit when making recommendations
- Suggest specific next steps for each candidate (interview, technical assessment, hire, reject)
- If asked about top candidates, rank them by fit and explain your reasoning
- Always ground your recommendations in the actual candidate data provided

Be conversational, insightful, and proactive. Ask follow-up questions to better understand hiring needs. Provide specific, actionable advice based on the comprehensive candidate data available.`

    // Prepare OpenAI messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    console.log('Calling OpenAI with comprehensive candidate data:', candidateProfiles.length, 'candidates')

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
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const aiMessage = aiResponse.choices[0].message.content

    console.log('AI response received:', aiMessage.substring(0, 100))

    // Enhanced candidate detection - look for candidate names mentioned in AI response
    const jobIds: string[] = []
    const applicationIds: string[] = []
    
    // Extract job IDs from response (matches: job ID: uuid, job id: uuid, etc.)
    const jobMatches = aiMessage.match(/job\s+(?:ID|id)[:\s]+([a-f0-9-]{36})/gi)
    if (jobMatches) {
      jobMatches.forEach((match: string) => {
        const id = match.match(/([a-f0-9-]{36})/)?.[1]
        if (id && jobs?.some(job => job.id === id)) {
          jobIds.push(id)
        }
      })
    }

    // Enhanced candidate detection by name
    allApplications.forEach(app => {
      const candidateName = app.name.toLowerCase()
      const responseText = aiMessage.toLowerCase()
      
      // Look for full name or first/last name mentions
      const nameParts = candidateName.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts[nameParts.length - 1]
      
      // Check for full name, first name, or last name in context
      const namePatterns = [
        candidateName,
        firstName.length > 2 ? firstName : null,
        lastName.length > 2 ? lastName : null
      ].filter(Boolean)
      
      const isNameMentioned = namePatterns.some(name => {
        // Look for name with word boundaries and context keywords
        const nameRegex = new RegExp(`\\b${name}\\b`, 'i')
        return nameRegex.test(responseText)
      })
      
      if (isNameMentioned) {
        applicationIds.push(app.id)
      }
    })

    // Also check for UUID mentions (legacy support)
    const appMatches = aiMessage.match(/(?:candidate|application|ID)[:\s]+([a-f0-9-]{36})/gi)
    if (appMatches) {
      appMatches.forEach((match: string) => {
        const id = match.match(/([a-f0-9-]{36})/)?.[1]
        if (id && allApplications.some(app => app.id === id)) {
          applicationIds.push(id)
        }
      })
    }

    // Remove duplicates
    const uniqueApplicationIds = [...new Set(applicationIds)]

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
        message_type: jobIds.length > 0 || uniqueApplicationIds.length > 0 ? 'with_cards' : 'text',
        is_ai_response: true,
        related_job_ids: jobIds,
        related_application_ids: uniqueApplicationIds
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

    if (uniqueApplicationIds.length > 0) {
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
        .in('id', uniqueApplicationIds)
      
      candidateCards = applicationsData || []
    }

    console.log('Response prepared with enhanced context:', { 
      candidateProfiles: candidateProfiles.length,
      jobCards: jobCards.length, 
      candidateCards: candidateCards.length,
      detectedCandidates: uniqueApplicationIds.length
    })

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
