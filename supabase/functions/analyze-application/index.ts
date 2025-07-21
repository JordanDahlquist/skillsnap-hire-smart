
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
      
      const dataStr = JSON.stringify(data, null, 1);
      if (dataStr.length > 1200) {
        return `${title}: ${dataStr.substring(0, 1200)}... [truncated]`;
      }
      return `${title}: ${dataStr}`;
    };

    // Helper function to format video transcripts
    const formatTranscripts = (transcripts: any[]): string => {
      if (!transcripts || transcripts.length === 0) return 'No transcripts available';
      
      return transcripts.slice(0, 3).map((transcript, index) => {
        const transcriptText = transcript.transcript || 'No transcript';
        const truncatedTranscript = transcriptText.length > 600 
          ? transcriptText.substring(0, 600) + '...' 
          : transcriptText;
        
        return `Q${index + 1}: ${transcript.questionText || 'Unknown Question'}
Response: "${truncatedTranscript}"
Quality: ${transcript.confidence ? `${Math.round(transcript.confidence * 100)}%` : 'Standard'}
---`;
      }).join('\n');
    };

    // Determine data source priority and quality
    const dataSourceInfo = (() => {
      const sources = [];
      let dataQuality = 'Basic';
      
      if (applicationData.has_parsed_resume && applicationData.resume_parsing_status === 'success') {
        sources.push('✓ Professional Resume (PDF parsed)');
        dataQuality = 'Comprehensive';
      } else if (applicationData.resume_file_path) {
        sources.push('⚠ Resume file present but parsing failed');
        dataQuality = 'Limited';
      }
      
      if (applicationData.has_video_transcripts) {
        sources.push('✓ Video Interview Transcripts');
        dataQuality = dataQuality === 'Comprehensive' ? 'Excellent' : 'Good';
      }
      
      if (applicationData.work_experience?.length > 0) {
        sources.push('✓ Work Experience Details');
      }
      
      if (applicationData.education?.length > 0) {
        sources.push('✓ Education Background');
      }
      
      return { sources, dataQuality };
    })();

    // Build comprehensive analysis prompt with prioritized resume data
    const analysisPrompt = `You are an expert technical recruiter analyzing a job application. 

DATA QUALITY: ${dataSourceInfo.dataQuality}
DATA SOURCES: ${dataSourceInfo.sources.join(', ')}

JOB REQUIREMENTS:
Position: ${jobData.title}
Role Type: ${jobData.role_type}
Experience Level: ${jobData.experience_level}
Required Skills: ${jobData.required_skills}
Company: ${jobData.company_name || 'Not specified'}
Employment: ${jobData.employment_type}

Job Description: ${jobData.description?.substring(0, 1000) || 'Not provided'}

CANDIDATE PROFILE:
Name: ${applicationData.name}
Email: ${applicationData.email}
Location: ${applicationData.location || 'Not provided'}

${applicationData.has_parsed_resume ? 'RESUME DATA (PRIMARY SOURCE - PDF Parsed):' : 'MANUAL APPLICATION DATA:'}
${applicationData.professional_summary ? `Professional Summary: ${applicationData.professional_summary.substring(0, 600)}` : ''}
${applicationData.total_experience ? `Total Experience: ${applicationData.total_experience}` : ''}

WORK EXPERIENCE ${applicationData.has_parsed_resume ? '(From Resume)' : '(Manual Entry)'}:
${formatSection('Experience', applicationData.work_experience)}

EDUCATION ${applicationData.has_parsed_resume ? '(From Resume)' : '(Manual Entry)'}:
${formatSection('Education', applicationData.education)}

SKILLS ${applicationData.has_parsed_resume ? '(From Resume)' : '(Manual Entry)'}:
${formatSection('Technical Skills', applicationData.skills)}

ADDITIONAL RESPONSES:
Cover Letter: ${applicationData.cover_letter?.substring(0, 700) || 'Not provided'}
Portfolio: ${applicationData.portfolio_url || 'Not provided'}
LinkedIn: ${applicationData.linkedin_url || 'Not provided'}
GitHub: ${applicationData.github_url || 'Not provided'}

ASSESSMENT RESPONSES:
Tech Challenge: ${applicationData.answer_1?.substring(0, 400) || 'Not answered'}
Problem Solving: ${applicationData.answer_2?.substring(0, 400) || 'Not answered'}
Communication: ${applicationData.answer_3?.substring(0, 400) || 'Not answered'}

VIDEO ANALYSIS:
Has Video Content: ${applicationData.has_video_content ? 'Yes' : 'No'}
Video Response Count: ${applicationData.video_response_count || 0}

${applicationData.has_video_transcripts ? 
  `VIDEO TRANSCRIPTS (High Value Data):\n${formatTranscripts(applicationData.skills_video_transcripts || [])}${formatTranscripts(applicationData.interview_video_transcripts || [])}` : 
  'No video transcripts available'}

EVALUATION FRAMEWORK:
1. Technical Competency (30%): Skills alignment, experience depth, technical knowledge
2. Experience Match (25%): Years of experience, industry relevance, role progression
3. Communication & Presentation (20%): Video performance, written communication, clarity
4. Problem-Solving Ability (15%): Technical challenges, analytical thinking, creativity
5. Application Quality (10%): Completeness, effort, professionalism

${applicationData.has_parsed_resume ? 
  'ANALYSIS PRIORITY: Resume data is primary source (PDF parsed). Weight heavily.' : 
  'ANALYSIS NOTE: Limited to manual application data. Resume parsing failed or unavailable.'}

${applicationData.has_video_transcripts ? 
  'FOCUS: Video analysis available - assess communication skills and technical explanation ability.' : 
  'FOCUS: No video content - rely on written materials and structured responses.'}

RATING SCALE (1.0-3.0):
- 1.0-1.5: Below expectations - significant gaps or poor fit
- 1.6-2.4: Meets expectations - adequate fit with some strengths
- 2.5-3.0: Exceeds expectations - strong candidate with excellent fit

Provide comprehensive analysis in JSON format:
{
  "summary": "4-5 sentence analysis highlighting key strengths, experience relevance, skill alignment, and overall recommendation based on available data",
  "rating": 2.4
}`

    console.log('Calling OpenAI for enhanced application analysis:', applicationData.name)

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
            content: 'You are an expert technical recruiter with 20+ years of experience in candidate evaluation. Provide thorough, fair, and actionable candidate assessments. Focus on job-relevance and potential. Return only valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 800,
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
      
      // Extract JSON from various formats
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

    console.log('Enhanced analysis completed successfully:', {
      name: applicationData.name,
      rating: analysis.rating,
      summaryLength: analysis.summary.length,
      dataQuality: dataSourceInfo.dataQuality,
      hasParsedResume: applicationData.has_parsed_resume
    })

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in enhanced application analysis:', error)
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
