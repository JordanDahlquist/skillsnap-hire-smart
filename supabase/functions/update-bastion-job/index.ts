
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Professional CEO interview questions
    const interviewQuestions = `1. Tell us about your leadership philosophy and how you've successfully built and scaled teams in previous roles.

2. Describe a time when you had to make a difficult strategic decision that significantly impacted your organization. What was your process and what were the results?

3. How do you approach building company culture and ensuring alignment across all levels of an organization?

4. What's your experience with driving growth and profitability? Can you share specific examples of how you've achieved measurable business results?

5. How do you stay current with industry trends and competitive landscape, and how do you incorporate this knowledge into strategic planning?`;

    // Update the Bastion Agency CEO job
    const { data, error } = await supabaseClient
      .from('jobs')
      .update({
        generated_interview_questions: interviewQuestions,
        updated_at: new Date().toISOString()
      })
      .eq('title', 'CEO')
      .eq('company_name', 'Bastion Agency')
      .select()

    if (error) {
      console.error('Error updating job:', error)
      throw error
    }

    console.log('Updated jobs:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bastion Agency CEO job updated with interview questions',
        updatedJobs: data?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
