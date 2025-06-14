
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Post-processing function to remove any application instructions
const cleanJobPost = (content: string): string => {
  let cleaned = content;
  
  // Remove "How to Apply" sections and everything after them
  cleaned = cleaned.replace(/\*\*How to Apply\*\*[\s\S]*$/i, '');
  cleaned = cleaned.replace(/\*\*Application Process\*\*[\s\S]*$/i, '');
  cleaned = cleaned.replace(/\*\*Apply Now\*\*[\s\S]*$/i, '');
  
  // Remove specific forbidden phrases
  const forbiddenPatterns = [
    /send your resume to[\s\S]*$/i,
    /email your application to[\s\S]*$/i,
    /submit your application to[\s\S]*$/i,
    /apply by emailing[\s\S]*$/i,
    /contact us at[\s\S]*$/i,
    /please send[\s\S]*resume[\s\S]*$/i,
    /apply via email[\s\S]*$/i,
    /send your cv[\s\S]*$/i,
    /apply through our website[\s\S]*$/i,
    /visit our careers page[\s\S]*$/i
  ];
  
  forbiddenPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Ensure it ends with the correct call-to-action
  cleaned = cleaned.trim();
  if (!cleaned.endsWith('Ready to make an impact? Click the apply button below!')) {
    // Remove any existing call-to-action that might be wrong
    cleaned = cleaned.replace(/ready to[\s\S]*$/i, '');
    cleaned = cleaned.replace(/interested\?[\s\S]*$/i, '');
    cleaned = cleaned.replace(/apply now[\s\S]*$/i, '');
    cleaned = cleaned.trim();
    
    // Add the correct ending
    cleaned += '\n\nReady to make an impact? Click the apply button below!';
  }
  
  return cleaned;
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
      
      // Format work arrangement display
      const workArrangementDisplay = jobData.locationType === 'on-site' ? 'On-site' : 
                                   jobData.locationType === 'remote' ? 'Remote' : 
                                   jobData.locationType === 'hybrid' ? 'Hybrid' : jobData.locationType;
      
      // Build comprehensive location string
      const locationParts = [];
      if (jobData.location) locationParts.push(jobData.location);
      if (jobData.city) locationParts.push(jobData.city);
      if (jobData.state) locationParts.push(jobData.state);
      if (jobData.country) locationParts.push(jobData.country);
      const fullLocation = locationParts.length > 0 ? locationParts.join(', ') : 'Location to be determined';
      
      // Determine if this is project-based or employee position
      const isProjectBased = jobData.employmentType === 'project';
      
      prompt = `CRITICAL WARNING: You MUST NOT include any application instructions, email addresses, or "How to Apply" sections. The job posting MUST end with the exact phrase specified below and NOTHING ELSE.

Create a compelling and comprehensive job posting for a ${jobData.title} position at ${jobData.companyName}. 

**COMPANY AND ROLE DETAILS:**
- Company: ${jobData.companyName}
- Job Title: ${jobData.title}
- Employment Type: ${jobData.employmentType} (CRITICAL: Must be clearly stated throughout)
- Experience Level: ${jobData.experienceLevel}
- Work Arrangement: ${workArrangementDisplay} (CRITICAL: Must be prominently featured)
- Location: ${fullLocation}

**JOB DESCRIPTION:**
${jobData.description ? `User-provided description: "${jobData.description}"` : 'No specific description provided - create a compelling one based on the role.'}

**REQUIREMENTS AND SKILLS:**
- Required Skills: ${jobData.skills || 'To be determined based on role'}

**COMPENSATION AND BENEFITS:**`;

      if (isProjectBased) {
        prompt += `
- Budget: ${jobData.budget || 'Competitive project rate'}
- Duration: ${jobData.duration || 'Project timeline to be discussed'}`;
      } else {
        prompt += `
- Salary: ${jobData.salary || 'Competitive salary based on experience'}
- Benefits: ${jobData.benefits || 'Comprehensive benefits package'}`;
      }

      prompt += `

**CRITICAL FORMATTING AND ENDING REQUIREMENTS:**
1. Employment Type (${jobData.employmentType}) must be clearly stated in the opening section
2. Work Arrangement (${workArrangementDisplay}) must be prominently featured in both the summary and requirements
3. Include ALL provided information in appropriate sections
4. If user provided a description, incorporate it meaningfully into the job posting
5. Create distinct sections for: Job Summary, Key Responsibilities, Requirements, and Compensation
6. Make the posting engaging and specific to ${jobData.companyName}
7. For ${isProjectBased ? 'project-based' : 'employee'} positions, emphasize ${isProjectBased ? 'project scope and deliverables' : 'career growth and company culture'}

**STRUCTURE THE POSTING WITH THESE SECTIONS ONLY:**
- **Job Summary** (include work arrangement and employment type)
- **About ${jobData.companyName}** (brief company section)
- **Key Responsibilities** 
- **Requirements** (include experience level and required skills)
- **What We Offer** (compensation and benefits)

**ABSOLUTELY FORBIDDEN - DO NOT INCLUDE:**
- "How to Apply" sections
- Email addresses for applications
- "Send your resume to" instructions
- "Submit your application to" instructions
- "Contact us at" for applications
- Any application submission instructions
- Links to external application sites
- References to emailing CVs or resumes

**MANDATORY ENDING:**
End the job posting immediately after the "What We Offer" section with EXACTLY this call-to-action:
"Ready to make an impact? Click the apply button below!"

Do NOT add any additional sections, application instructions, or contact information after this call-to-action.

Make this posting comprehensive, professional, and attractive to qualified ${jobData.experienceLevel} candidates for a ${workArrangementDisplay} ${jobData.employmentType} position.`;

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
- Work Arrangement: ${jobData.locationType}
- Experience Level: ${jobData.experienceLevel}
- Required Skills: ${jobData.skills}

Create questions that:
1. Test deep understanding of the role and industry
2. Evaluate problem-solving and critical thinking
3. Assess experience with relevant challenges
4. Reveal personality and work style fit
5. Are specific to the ${jobData.title} position at ${jobData.companyName}
6. Consider the ${jobData.locationType} work arrangement requirements

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
            content: 'You are an expert HR professional who creates job postings. CRITICAL RULE: NEVER include application instructions, email addresses, or "How to Apply" sections in job postings. Job postings must end with the exact call-to-action specified in the prompt and NOTHING ELSE. Candidates apply through the platform, not via email.'
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
    let generatedContent = data.choices[0].message.content;

    // Apply post-processing for job posts to remove any application instructions
    if (type === 'job-post') {
      generatedContent = cleanJobPost(generatedContent);
    }

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
