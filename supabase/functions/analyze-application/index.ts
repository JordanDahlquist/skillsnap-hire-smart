
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

    // Helper function to format data sections
    const formatSection = (title: string, data: any): string => {
      if (!data) return `${title}: Not provided`;
      if (Array.isArray(data) && data.length === 0) return `${title}: Not provided`;
      if (typeof data === 'object' && Object.keys(data).length === 0) return `${title}: Not provided`;
      return `${title}: ${JSON.stringify(data, null, 2)}`;
    };

    // Build comprehensive analysis prompt
    const analysisPrompt = `You are an expert technical recruiter conducting a comprehensive analysis of a job application. Analyze ALL available candidate data to provide the most accurate assessment possible.

JOB REQUIREMENTS:
- Position: ${jobData.title}
- Role Type: ${jobData.roleType || jobData.role_type}
- Experience Level: ${jobData.experienceLevel || jobData.experience_level}
- Employment Type: ${jobData.employmentType || jobData.employment_type}
- Required Skills: ${jobData.required_skills}
- Company: ${jobData.company_name || 'Not specified'}
- Budget: ${jobData.budget || 'Not specified'}
- Duration: ${jobData.duration || 'Not specified'}
- Location Type: ${jobData.location_type || 'Not specified'}

Job Description:
${jobData.description}

CANDIDATE PROFILE:
=================

BASIC INFORMATION:
- Name: ${applicationData.name}
- Email: ${applicationData.email}
- Phone: ${applicationData.phone || 'Not provided'}
- Location: ${applicationData.location || 'Not provided'}
- Available Start Date: ${applicationData.available_start_date || 'Not provided'}

PROFESSIONAL BACKGROUND:
${formatSection('Experience Level', applicationData.experience)}
${formatSection('Work Experience', applicationData.work_experience)}
${formatSection('Education', applicationData.education)}
${formatSection('Skills', applicationData.skills)}

PORTFOLIO & PROFILES:
- Portfolio: ${applicationData.portfolio || 'Not provided'}
- Portfolio URL: ${applicationData.portfolio_url || 'Not provided'}
- LinkedIn: ${applicationData.linkedin_url || 'Not provided'}
- GitHub: ${applicationData.github_url || 'Not provided'}

COVER LETTER:
${applicationData.cover_letter || 'No cover letter provided'}

SKILLS ASSESSMENT RESPONSES:
1. Technical Challenge: ${applicationData.answer_1 || 'Not answered'}
2. Problem Solving: ${applicationData.answer_2 || 'Not answered'}
3. Communication: ${applicationData.answer_3 || 'Not answered'}

ADVANCED SKILLS TEST RESPONSES:
${formatSection('Skills Test Responses', applicationData.skills_test_responses)}

VIDEO CONTENT ANALYSIS:
- Has Video Content: ${applicationData.has_video_content ? 'Yes' : 'No'}
- Video Response Count: ${applicationData.video_response_count || 0}
- Interview Video URL: ${applicationData.interview_video_url ? 'Provided' : 'Not provided'}
${formatSection('Video Interview Responses', applicationData.interview_video_responses)}

RESUME DATA:
- Resume File: ${applicationData.resume_file_path ? 'Provided' : 'Not provided'}
${formatSection('Parsed Resume Data', applicationData.parsed_resume_data)}

PREVIOUS AI ANALYSIS (for reference):
- Previous Rating: ${applicationData.existing_ai_rating || 'None'}
- Previous Summary: ${applicationData.existing_ai_summary || 'None'}

COMPREHENSIVE EVALUATION FRAMEWORK:
===================================

Analyze the candidate across these dimensions with specific weighting:

1. TECHNICAL COMPETENCY (30%):
   - Skill alignment with job requirements
   - Technical experience depth and relevance
   - Portfolio/GitHub quality and relevance
   - Skills assessment performance

2. EXPERIENCE FIT (25%):
   - Years of experience vs. job requirements
   - Industry experience relevance
   - Role progression and career growth
   - Project complexity and impact

3. COMMUNICATION & ENGAGEMENT (20%):
   - Cover letter quality, motivation, and cultural fit indicators
   - Skills assessment written responses quality
   - Video content presence and completion (shows engagement)
   - Professional presentation across all materials

4. CULTURAL & SOFT SKILLS (15%):
   - Problem-solving approach demonstrated
   - Initiative and proactivity shown
   - Attention to detail in application
   - Professional communication style

5. COMPLETENESS & EFFORT (10%):
   - Application completeness (more complete = higher score)
   - Quality of responses across all sections
   - Evidence of research about the role/company
   - Effort invested in application process

RATING SCALE (1.0 - 3.0):
- 1.0-1.5: Below expectations - significant gaps in requirements or poor application quality
- 1.6-2.4: Meets expectations - adequate fit with some strengths and/or minor gaps
- 2.5-3.0: Exceeds expectations - strong fit across multiple dimensions, standout candidate

DELIVERABLES:
Provide a comprehensive 3-4 sentence summary highlighting:
1. Key strengths and standout qualities
2. How well they align with the specific job requirements
3. Any notable concerns or gaps
4. Overall recommendation and next steps

Then provide a precise numerical rating between 1.0 and 3.0 based on the weighted evaluation framework above.

Consider ALL provided data in your analysis. A candidate with more complete information and stronger responses across multiple dimensions should score higher than one with limited data or weak responses.

Format your response as JSON:
{
  "summary": "Your comprehensive 3-4 sentence analysis summary here",
  "rating": 2.8
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical recruiter with 15+ years of experience in comprehensive candidate assessment. You excel at analyzing all available candidate data to provide nuanced, accurate evaluations that predict job success. Your assessments are thorough, fair, and highly predictive of candidate performance.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    let analysis;
    try {
      analysis = JSON.parse(data.choices[0].message.content)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', data.choices[0].message.content)
      throw new Error('Invalid JSON response from AI analysis')
    }

    // Validate the response structure
    if (!analysis.summary || typeof analysis.rating !== 'number') {
      throw new Error('AI analysis response missing required fields')
    }

    // Ensure rating is within valid range
    if (analysis.rating < 1.0 || analysis.rating > 3.0) {
      console.warn('AI rating out of range, clamping:', analysis.rating)
      analysis.rating = Math.max(1.0, Math.min(3.0, analysis.rating))
    }

    console.log('Comprehensive analysis completed. Rating:', analysis.rating, 'Summary length:', analysis.summary.length)

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in comprehensive application analysis:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
