
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
    const { applicationData, jobData } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const analysisPrompt = `Analyze this job application for a ${jobData.title} position.

Job Requirements:
- Title: ${jobData.title}
- Type: ${jobData.roleType}
- Experience Level: ${jobData.experience}
- Required Skills: ${jobData.required_skills}

Application Details:
- Name: ${applicationData.name}
- Experience: ${applicationData.experience}
- Portfolio: ${applicationData.portfolio}

Test Answers:
1. Practical Challenge: ${applicationData.answer_1}
2. Problem Solving: ${applicationData.answer_2}
3. Communication: ${applicationData.answer_3}

Provide:
1. A comprehensive summary (2-3 sentences) of the candidate's strengths and fit for the role
2. A rating from 1.0 to 5.0 based on:
   - Technical skills demonstration
   - Problem-solving approach
   - Communication quality
   - Overall fit for the role

Format your response as JSON:
{
  "summary": "Your analysis summary here",
  "rating": 4.2
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert technical recruiter analyzing job applications. Provide honest, detailed assessments.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    const analysis = JSON.parse(data.choices[0].message.content)

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error analyzing application:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
