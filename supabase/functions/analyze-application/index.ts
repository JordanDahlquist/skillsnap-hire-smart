
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

    // Helper function to format data sections efficiently
    const formatSection = (title: string, data: any): string => {
      if (!data) return `${title}: Not provided`;
      if (Array.isArray(data) && data.length === 0) return `${title}: Not provided`;
      if (typeof data === 'object' && Object.keys(data).length === 0) return `${title}: Not provided`;
      
      // Truncate large objects to prevent payload bloat
      const dataStr = JSON.stringify(data, null, 1);
      if (dataStr.length > 1000) {
        return `${title}: ${dataStr.substring(0, 1000)}... [truncated]`;
      }
      return `${title}: ${dataStr}`;
    };

    // Helper function to format video transcripts more efficiently
    const formatTranscripts = (transcripts: any[]): string => {
      if (!transcripts || transcripts.length === 0) return 'No transcripts available';
      
      return transcripts.slice(0, 3).map((transcript, index) => {
        const transcriptText = transcript.transcript || 'No transcript';
        const truncatedTranscript = transcriptText.length > 500 
          ? transcriptText.substring(0, 500) + '...' 
          : transcriptText;
        
        return `Q${index + 1}: ${transcript.questionText || 'Unknown Question'}
Response: "${truncatedTranscript}"
Quality: ${transcript.confidence ? `${Math.round(transcript.confidence * 100)}%` : 'Standard'}
---`;
      }).join('\n');
    };

    // Build streamlined analysis prompt
    const analysisPrompt = `You are an expert technical recruiter. Analyze this job application comprehensively.

JOB REQUIREMENTS:
Position: ${jobData.title}
Role: ${jobData.roleType || jobData.role_type}
Experience: ${jobData.experienceLevel || jobData.experience_level}
Skills: ${jobData.required_skills}
Company: ${jobData.company_name || 'Not specified'}

Description: ${jobData.description?.substring(0, 800) || 'Not provided'}

CANDIDATE PROFILE:
Name: ${applicationData.name}
Email: ${applicationData.email}
Experience: ${applicationData.experience || 'Not provided'}

${applicationData.has_parsed_resume ? 'RESUME DATA (Extracted from PDF):' : ''}
${applicationData.professional_summary ? `Professional Summary: ${applicationData.professional_summary.substring(0, 400)}` : ''}
${applicationData.total_experience ? `Total Experience: ${applicationData.total_experience}` : ''}

PROFESSIONAL BACKGROUND:
${formatSection('Work Experience', applicationData.work_experience)}
${formatSection('Education', applicationData.education)}
${formatSection('Skills', applicationData.skills)}

RESPONSES:
Cover Letter: ${applicationData.cover_letter?.substring(0, 500) || 'Not provided'}
Tech Challenge: ${applicationData.answer_1?.substring(0, 300) || 'Not answered'}
Problem Solving: ${applicationData.answer_2?.substring(0, 300) || 'Not answered'}
Communication: ${applicationData.answer_3?.substring(0, 300) || 'Not answered'}

VIDEO ANALYSIS:
Has Video: ${applicationData.has_video_content ? 'Yes' : 'No'}
Video Count: ${applicationData.video_response_count || 0}

${applicationData.has_video_transcripts ? 
  `VIDEO TRANSCRIPTS:\n${formatTranscripts(applicationData.skills_video_transcripts || [])}${formatTranscripts(applicationData.interview_video_transcripts || [])}` : 
  'No video transcripts available'}

EVALUATION FRAMEWORK:
1. Technical Competency (25%): Skill alignment, experience depth, portfolio quality
2. Communication & Video (30%): Clarity, technical explanation ability, professional presentation  
3. Experience Fit (20%): Years of experience, industry relevance, role progression
4. Problem-Solving (15%): Technical challenges, analytical thinking, creativity
5. Completeness (10%): Application effort, response quality, attention to detail

${applicationData.has_video_transcripts ? 
  'FOCUS: Weight video analysis heavily as it provides authentic candidate insight.' : 
  'NOTE: Focus on written responses and traditional materials.'}

RATING SCALE (1.0-3.0):
- 1.0-1.5: Below expectations - significant gaps
- 1.6-2.4: Meets expectations - adequate fit  
- 2.5-3.0: Exceeds expectations - strong candidate

Provide JSON response:
{
  "summary": "3-4 sentence analysis highlighting key strengths, job alignment, and recommendation",
  "rating": 2.8
}`

    console.log('Calling OpenAI for application analysis:', applicationData.name)

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
            content: 'You are an expert technical recruiter with 15+ years of experience. Provide accurate, fair candidate assessments in the exact JSON format requested.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 600,
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    let analysis;
    try {
      const content = data.choices[0].message.content.trim()
      console.log('Raw OpenAI response:', content)
      
      // Try to extract JSON if it's wrapped in markdown
      const jsonMatch = content.match(/```json\n?(.*?)\n?```/s) || content.match(/\{.*\}/s)
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content
      
      analysis = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse AI response:', data.choices[0].message.content)
      throw new Error('Invalid JSON response from AI analysis')
    }

    // Validate the response structure
    if (!analysis.summary || typeof analysis.rating !== 'number') {
      console.error('AI analysis missing required fields:', analysis)
      throw new Error('AI analysis response missing required fields')
    }

    // Ensure rating is within valid range
    if (analysis.rating < 1.0 || analysis.rating > 3.0) {
      console.warn('AI rating out of range, clamping:', analysis.rating)
      analysis.rating = Math.max(1.0, Math.min(3.0, analysis.rating))
    }

    console.log('Analysis completed successfully:', {
      name: applicationData.name,
      rating: analysis.rating,
      summaryLength: analysis.summary.length
    })

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in application analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack?.substring(0, 500)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
