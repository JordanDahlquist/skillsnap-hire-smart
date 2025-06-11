
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createCandidateProfiles, detectMentionedCandidates, detectJobIds } from './candidateDetection.ts'
import { buildSystemPrompt } from './contextBuilder.ts'
import { callOpenAI } from './openaiService.ts'
import { storeConversationMessages, getCardData } from './conversationStorage.ts'
import { getUserProfile, getUserJobs, getConversationHistory } from './dataFetchers.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const triggerTitleGeneration = async (supabase: any, conversationId: string, messageCount: number) => {
  // Only generate title after the first AI response (when we have 2+ messages)
  if (messageCount === 2) {
    try {
      console.log('Triggering title generation for conversation:', conversationId)
      
      // Call the title generation function asynchronously
      await supabase.functions.invoke('generate-conversation-title', {
        body: { conversation_id: conversationId }
      })
      
      console.log('Title generation triggered successfully')
    } catch (error) {
      console.error('Error triggering title generation:', error)
      // Don't throw - title generation failure shouldn't break the main chat flow
    }
  }
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

    // Fetch all necessary data
    const [profile, jobs, conversationHistory] = await Promise.all([
      getUserProfile(supabase, user.id),
      getUserJobs(supabase, user.id),
      getConversationHistory(supabase, user.id, conversation_id)
    ])

    // Process applications and create candidate profiles
    const allApplications = jobs?.flatMap(job => job.applications || []) || []
    const candidateProfiles = createCandidateProfiles(allApplications)

    // Build system prompt with comprehensive context
    const systemPrompt = buildSystemPrompt(profile, jobs, candidateProfiles)

    // Prepare OpenAI messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    console.log('Calling OpenAI with comprehensive candidate data:', candidateProfiles.length, 'candidates')

    // Call OpenAI
    const aiMessage = await callOpenAI(messages, openaiApiKey)

    console.log('AI response received:', aiMessage.substring(0, 100))

    // Detect mentioned candidates and jobs
    const jobIds = detectJobIds(aiMessage, jobs || [])
    const applicationIds = detectMentionedCandidates(aiMessage, allApplications)

    // Store conversation messages
    await storeConversationMessages(
      supabase,
      user.id,
      conversation_id,
      message,
      aiMessage,
      jobIds,
      applicationIds
    )

    // Get current message count and trigger title generation if needed
    const currentMessageCount = conversationHistory.length + 2 // +2 for user message and AI response
    await triggerTitleGeneration(supabase, conversation_id, currentMessageCount)

    // Get card data for response
    const { jobCards, candidateCards } = await getCardData(
      supabase,
      user.id,
      jobIds,
      applicationIds
    )

    console.log('Response prepared with enhanced context:', { 
      candidateProfiles: candidateProfiles.length,
      jobCards: jobCards.length, 
      candidateCards: candidateCards.length,
      detectedCandidates: applicationIds.length
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
