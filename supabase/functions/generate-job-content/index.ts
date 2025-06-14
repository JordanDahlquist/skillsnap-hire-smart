
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, jobData, existingJobPost, existingSkillsTest } = await req.json();
    console.log('Received request type:', type);
    console.log('Received job data:', jobData);

    let prompt = '';
    let responseKey = '';

    if (type === 'job-post') {
      responseKey = 'jobPost';
      prompt = `Create a compelling job posting for a ${jobData.title} position at ${jobData.companyName}. 

Company and Role details:
- Company: ${jobData.companyName}
- Title: ${jobData.title}
- Employment Type: ${jobData.employmentType} (IMPORTANT: This must be reflected accurately in the job posting)
- Experience Level: ${jobData.experienceLevel}
- Duration: ${jobData.duration || 'Not specified'}
- Budget: ${jobData.budget || 'Not specified'}
- Location: ${jobData.location}
- Required skills: ${jobData.skills || 'Not specified'}
- Description: ${jobData.description}

CRITICAL INSTRUCTIONS:
1. The employment type is ${jobData.employmentType} - make sure this is clearly stated and reflected throughout the job posting
2. If employment type is "full-time", this is a permanent full-time employee position, NOT freelance or contract work
3. If employment type is "part-time", this is a part-time employee position
4. If employment type is "contract", this is contract/freelance work
5. If employment type is "project", this is project-based work
6. Prominently feature ${jobData.companyName} as the hiring company throughout the posting

Format as a professional job posting with sections for responsibilities, requirements, and project details. Make it engaging and specific to attract quality candidates for a ${jobData.employmentType} position at ${jobData.companyName}.`;

    } else if (type === 'skills-test') {
      responseKey = 'questions';
      prompt = `Based on this job posting, create 5-7 specific skills assessment questions:

${existingJobPost}

Create practical questions that test:
1. Technical skills relevant to the role
2. Problem-solving abilities
3. Industry knowledge
4. Practical application of skills

Return ONLY a numbered list of questions, one per line, in this exact format:
1. [First question here]
2. [Second question here]
3. [Third question here]

Make each question clear, specific, and directly relevant to the job requirements. Questions should be answerable in a text response format.`;

    } else if (type === 'interview-questions') {
      responseKey = 'questions';
      prompt = `Create 3-5 hard-hitting interview questions for video responses based on this job posting:

${existingJobPost}

${existingSkillsTest ? `Additional context from skills test:\n${existingSkillsTest}\n` : ''}

Job details:
- Company: ${jobData.companyName}
- Title: ${jobData.title}
- Employment Type: ${jobData.employmentType}
- Experience Level: ${jobData.experienceLevel}
- Required Skills: ${jobData.skills}

Create questions that:
1. Test deep understanding of the role and industry
2. Evaluate problem-solving and critical thinking
3. Assess experience with relevant challenges
4. Reveal personality and work style fit
5. Are specific to the ${jobData.title} position at ${jobData.companyName}

Format each question clearly with context and what you're looking for in the response. These will be answered via video submission, so make them engaging and thought-provoking.

Example format:
**Question 1: [Title]**
[Question text with context]
*What we're looking for: [Brief explanation of ideal response]*

Make the questions challenging but fair, and ensure they can be answered well within a 3-15 minute video response.`;

    } else {
      throw new Error('Invalid request type');
    }

    console.log('Using prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR professional and recruiter who creates compelling job postings, comprehensive skills assessments, and insightful interview questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log(`Generated ${type} preview:`, generatedContent.substring(0, 200) + '...');

    // For skills-test, parse the numbered list into an array
    if (type === 'skills-test') {
      const lines = generatedContent.split('\n').filter(line => line.trim().length > 0);
      const questions = lines
        .filter(line => line.match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(q => q.length > 0);
      
      console.log('Parsed questions:', questions);
      
      return new Response(
        JSON.stringify({ questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ [responseKey]: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-job-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
