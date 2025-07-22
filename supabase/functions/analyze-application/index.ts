
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

    // Enhanced work experience formatting to highlight leadership roles
    const formatWorkExperience = (workExp: any[]): string => {
      if (!workExp || workExp.length === 0) return 'No work experience provided';
      
      return workExp.map((exp, index) => {
        const position = exp.position || exp.title || 'Unknown Position';
        const company = exp.company || exp.employer || 'Unknown Company';
        const duration = exp.duration || `${exp.startDate || exp.start_date || 'Unknown'} - ${exp.endDate || exp.end_date || 'Present'}`;
        const description = exp.description || 'No description provided';
        
        // Highlight leadership positions
        const isLeadershipRole = /CEO|Chief Executive|President|Founder|Co-Founder|Director|VP|Vice President|Head of|Manager|Lead/i.test(position);
        const roleHighlight = isLeadershipRole ? ' ⭐ LEADERSHIP ROLE' : '';
        
        return `${index + 1}. ${position}${roleHighlight}
   Company: ${company}
   Duration: ${duration}
   Description: ${description.substring(0, 400)}${description.length > 400 ? '...' : ''}
   ---`;
      }).join('\n');
    };

    // Log the work experience data being sent for debugging
    console.log('Work experience data being analyzed:', JSON.stringify(applicationData.work_experience, null, 2));

    // Build enhanced analysis prompt with better leadership recognition
    const analysisPrompt = `You are an expert technical recruiter with deep expertise in evaluating executive and leadership candidates. Analyze this job application comprehensively.

JOB REQUIREMENTS:
Position: ${jobData.title}
Role: ${jobData.roleType || jobData.role_type}
Experience Level: ${jobData.experienceLevel || jobData.experience_level}
Required Skills: ${jobData.required_skills}
Company: ${jobData.company_name || 'Not specified'}

Description: ${jobData.description?.substring(0, 800) || 'Not provided'}

CANDIDATE PROFILE:
Name: ${applicationData.name}
Email: ${applicationData.email}
Experience: ${applicationData.experience || 'Not provided'}

${applicationData.has_parsed_resume ? 'RESUME DATA (Extracted and Parsed):' : ''}
${applicationData.professional_summary ? `Professional Summary: ${applicationData.professional_summary.substring(0, 400)}` : ''}
${applicationData.total_experience ? `Total Experience: ${applicationData.total_experience}` : ''}

DETAILED WORK EXPERIENCE ANALYSIS:
${formatWorkExperience(applicationData.work_experience || [])}

ADDITIONAL PROFESSIONAL BACKGROUND:
${formatSection('Education', applicationData.education)}
${formatSection('Skills', applicationData.skills)}

APPLICATION RESPONSES:
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

CRITICAL EVALUATION INSTRUCTIONS:
For leadership/executive roles (CEO, Director, VP, etc.), pay special attention to:
1. **Previous Leadership Experience**: Look for CEO, Founder, Co-Founder, President, Director, VP, or similar titles
2. **Company Growth & Revenue**: Evidence of scaling businesses, revenue growth, team building
3. **Strategic Experience**: Business development, operational improvements, strategic planning
4. **Industry Relevance**: Relevant industry experience and transferable skills
5. **Team Management**: Evidence of leading and managing teams effectively

EVALUATION FRAMEWORK:
1. **Leadership Experience Match (35%)**: Direct leadership roles, executive experience, company building
2. **Technical/Industry Competency (25%)**: Skill alignment, industry knowledge, domain expertise
3. **Growth & Achievement Track Record (20%)**: Measurable business outcomes, scaling success
4. **Communication & Presentation (15%)**: Video analysis, written responses, professional communication
5. **Application Completeness (5%)**: Effort, response quality, attention to detail

${applicationData.has_video_transcripts ? 
  'FOCUS: Weight video analysis heavily as it provides authentic leadership presence insight.' : 
  'NOTE: Focus on written responses and track record evidence.'}

RATING SCALE (1.0-3.0):
- 1.0-1.5: Below expectations - significant gaps in leadership experience or skills
- 1.6-2.4: Meets expectations - adequate leadership background with some relevant experience
- 2.5-3.0: Exceeds expectations - strong leadership track record with directly relevant experience

IMPORTANT: If a candidate has multiple CEO/Founder roles or significant leadership experience that directly matches the job requirements, they should receive a HIGH rating (2.5-3.0). Do not undervalue proven leadership experience.

Provide JSON response:
{
  "summary": "3-4 sentence analysis highlighting key leadership strengths, relevant experience, and clear recommendation",
  "rating": 2.8
}`

    console.log('Calling OpenAI for enhanced leadership analysis:', applicationData.name)

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
            content: 'You are an expert executive recruiter with 20+ years of experience evaluating C-suite and leadership candidates. You understand the value of proven leadership experience and track records. Provide accurate, fair candidate assessments that properly weight leadership experience in the exact JSON format requested.'
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
      console.log('Raw OpenAI response for leadership analysis:', content)
      
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

    console.log('Enhanced leadership analysis completed:', {
      name: applicationData.name,
      rating: analysis.rating,
      summaryLength: analysis.summary.length,
      workExperienceCount: applicationData.work_experience?.length || 0
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
