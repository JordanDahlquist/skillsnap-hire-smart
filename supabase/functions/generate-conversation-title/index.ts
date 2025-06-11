
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

    // Get the first few messages from the conversation
    const { data: messages, error } = await supabase
      .from('scout_conversations')
      .select('message_content, is_ai_response')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .limit(4)

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

    // Call OpenAI to generate title
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
            content: `You are tasked with creating concise, descriptive titles for hiring assistant conversations. 
            
            Based on the conversation excerpt, generate a title that:
            - Is 2-5 words maximum
            - Captures the main topic or candidate being discussed
            - Uses proper title case
            - Is specific and helpful for navigation
            
            Examples:
            - "Frontend Developer Review"
            - "Sarah Johnson Interview"
            - "Q4 Hiring Pipeline"
            - "React Candidates"
            - "Technical Assessment"
            
            Return only the title, nothing else.`
          },
          {
            role: 'user',
            content: `Generate a title for this conversation:\n\n${conversationContext}`
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
    const generatedTitle = aiResponse.choices[0].message.content.trim()

    console.log('Generated title:', generatedTitle)

    // Update the conversation with the generated title
    const { error: updateError } = await supabase
      .from('scout_conversations')
      .update({ title: generatedTitle })
      .eq('conversation_id', conversation_id)

    if (updateError) {
      throw new Error(`Failed to update conversation title: ${updateError.message}`)
    }

    console.log('Successfully updated conversation title')

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
