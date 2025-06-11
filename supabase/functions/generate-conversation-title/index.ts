
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

    const { conversation_id } = await req.json()

    if (!conversation_id) {
      throw new Error('Conversation ID is required')
    }

    console.log('Generating title for conversation:', conversation_id)

    // Check if conversation already has a title
    const { data: existingTitle, error: titleCheckError } = await supabase
      .from('scout_conversations')
      .select('title')
      .eq('conversation_id', conversation_id)
      .not('title', 'is', null)
      .limit(1)
      .single()

    if (titleCheckError && titleCheckError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing title: ${titleCheckError.message}`)
    }

    if (existingTitle && existingTitle.title && existingTitle.title !== 'New Conversation') {
      console.log('Conversation already has title:', existingTitle.title)
      return new Response(
        JSON.stringify({ title: existingTitle.title, skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the first few messages from the conversation
    const { data: messages, error } = await supabase
      .from('scout_conversations')
      .select('message_content, is_ai_response')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .limit(6)

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    if (!messages || messages.length < 2) {
      throw new Error('Not enough messages to generate title')
    }

    // Prepare conversation context for OpenAI
    const conversationContext = messages
      .map(msg => `${msg.is_ai_response ? 'Scout AI' : 'User'}: ${msg.message_content}`)
      .join('\n')

    console.log('Conversation context:', conversationContext.substring(0, 200))

    // Enhanced OpenAI prompt for better title generation
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
            content: `You are a title generator for hiring assistant conversations. Create concise, specific titles that capture the essence of the conversation.

Rules:
- Use EXACTLY 3-6 words
- Focus on hiring, recruitment, candidates, or job-related topics
- Use proper title case
- Be specific and descriptive
- Avoid generic words like "conversation", "chat", "discussion"
- Prioritize candidate names, job roles, or specific hiring activities

Examples:
- "Frontend Developer Interview Prep"
- "Q4 Engineering Pipeline Review"
- "React Developer Screening"
- "Marketing Manager Requirements"
- "Technical Assessment Questions"
- "John Smith Background"

Return ONLY the title, nothing else.`
          },
          {
            role: 'user',
            content: `Generate a 3-6 word title for this hiring conversation:\n\n${conversationContext}`
          }
        ],
        max_tokens: 20,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    let generatedTitle = aiResponse.choices[0].message.content.trim()

    // Clean and validate title
    generatedTitle = generatedTitle.replace(/['"]/g, '').trim()
    
    // Ensure title doesn't exceed 6 words
    const words = generatedTitle.split(' ')
    if (words.length > 6) {
      generatedTitle = words.slice(0, 6).join(' ')
    }

    // Ensure minimum 3 words
    if (words.length < 3) {
      generatedTitle = 'New Hiring Conversation'
    }

    console.log('Generated title:', generatedTitle)

    // Update ALL messages in the conversation with the generated title
    const { error: updateError } = await supabase
      .from('scout_conversations')
      .update({ title: generatedTitle })
      .eq('conversation_id', conversation_id)

    if (updateError) {
      throw new Error(`Failed to update conversation title: ${updateError.message}`)
    }

    console.log('Successfully updated conversation title for all messages')

    return new Response(
      JSON.stringify({ title: generatedTitle }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-conversation-title:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
