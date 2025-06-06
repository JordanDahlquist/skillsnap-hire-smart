
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
    const { jobData } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate job post
    const jobPostPrompt = `Create a compelling job posting for a ${jobData.title} position. 

Role details:
- Title: ${jobData.title}
- Type: ${jobData.roleType}
- Experience: ${jobData.experience}
- Duration: ${jobData.duration}
- Budget: ${jobData.budget}
- Required skills: ${jobData.skills}
- Description: ${jobData.description}

Format as a professional job posting with sections for responsibilities, requirements, and project details. Make it engaging and specific to attract quality candidates.`

    const jobPostResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert recruiter creating compelling job postings.'
          },
          {
            role: 'user',
            content: jobPostPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    const jobPostData = await jobPostResponse.json()
    const generatedJobPost = jobPostData.choices[0].message.content

    // Generate skills test
    const testPrompt = `Create a comprehensive skills assessment for a ${jobData.title} position.

Role details:
- Title: ${jobData.title}
- Type: ${jobData.roleType}
- Experience: ${jobData.experience}
- Required skills: ${jobData.skills}
- Description: ${jobData.description}

Create 3 questions:
1. A practical challenge (60-90 minutes) - specific, hands-on task relevant to the role
2. A problem-solving question (30 minutes) - scenario-based technical challenge
3. A communication question (15 minutes) - behavioral/experience question

Make questions specific to the role type and experience level. Include clear instructions and time estimates.`

    const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating skills assessments for hiring.'
          },
          {
            role: 'user',
            content: testPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    const testData = await testResponse.json()
    const generatedTest = testData.choices[0].message.content

    return new Response(
      JSON.stringify({
        jobPost: generatedJobPost,
        test: generatedTest
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating job content:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
