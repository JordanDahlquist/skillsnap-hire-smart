
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

// Function to build tone instructions based on slider values
const buildToneInstructions = (writingTone: any) => {
  if (!writingTone) return '';
  
  const { professional = 3, friendly = 3, excited = 3 } = writingTone;
  
  console.log('Building tone instructions with values:', { professional, friendly, excited });
  
  // Convert 1-5 scale to descriptive instructions
  const getProfessionalTone = (level: number) => {
    if (level <= 2) return "use casual, conversational language with contractions and informal phrasing. Avoid corporate jargon and stiff formal language.";
    if (level <= 3) return "use balanced professional tone with clear, straightforward communication that's neither too casual nor overly formal.";
    if (level <= 4) return "use formal business language with professional terminology and structured communication.";
    return "use highly formal, sophisticated corporate language with advanced business terminology and polished communication style.";
  };
  
  const getFriendlyTone = (level: number) => {
    if (level <= 2) return "keep communication neutral and direct without personal warmth or emotional language.";
    if (level <= 3) return "use approachable, welcoming language that shows genuine interest in candidates.";
    if (level <= 4) return "use warm, personable language that builds connection. Include words like 'we're excited,' 'love to have you,' and 'amazing team.'";
    return "use exceptionally warm, inviting language with phrases like 'we absolutely love,' 'incredible opportunity,' 'fantastic team,' and 'can't wait to meet you!'";
  };
  
  const getExcitedTone = (level: number) => {
    if (level <= 2) return "use calm, measured language without enthusiasm or energy words.";
    if (level <= 3) return "use positive, optimistic language that shows confidence in the opportunity.";
    if (level <= 4) return "use energetic language with words like 'exciting,' 'dynamic,' 'innovative,' and 'thriving.'";
    return "use highly energetic, passionate language with phrases like 'incredible opportunity,' 'game-changing,' 'revolutionary,' 'explosive growth,' and exclamation points where appropriate!";
  };
  
  const instructions = `
**CRITICAL WRITING TONE REQUIREMENTS - FOLLOW THESE EXACTLY:**

Professional Level (${professional}/5): ${getProfessionalTone(professional)}

Friendliness Level (${friendly}/5): ${getFriendlyTone(friendly)}

Excitement Level (${excited}/5): ${getExcitedTone(excited)}

**TONE IMPLEMENTATION RULES:**
- These tone requirements MUST be consistently applied throughout the ENTIRE job posting
- Adjust your word choice, sentence structure, and overall communication style to match these specific tone levels
- The combination of these three dimensions should create a distinct voice that matches the slider settings
- Pay special attention to adjectives, verbs, and overall energy of the language used
`;

  console.log('Generated tone instructions:', instructions);
  return instructions;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, jobData, formData, existingJobPost, existingSkillsTest, websiteAnalysisData, writingTone } = await req.json();
    console.log('Received request type:', type);
    console.log('Received job data:', jobData || formData);
    console.log('Received writing tone:', writingTone);

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
      
      // Build tone instructions
      const toneInstructions = buildToneInstructions(writingTone);
      
      prompt = `CRITICAL WARNING: You MUST NOT include any application instructions, email addresses, or "How to Apply" sections. The job posting MUST end with the exact phrase specified below and NOTHING ELSE.

Create a compelling and comprehensive job posting for a ${jobData.title} position at ${jobData.companyName}.

${toneInstructions}

**COMPANY AND ROLE DETAILS:**
- Company: ${jobData.companyName}
- Job Title: ${jobData.title}
- Employment Type: ${jobData.employmentType} (CRITICAL: Must be clearly stated throughout)
- Experience Level: ${jobData.experienceLevel}
- Work Arrangement: ${workArrangementDisplay} (CRITICAL: Must be prominently featured)
- Location: ${fullLocation}

**JOB DESCRIPTION:**
${jobData.jobOverview ? `User-provided overview: "${jobData.jobOverview}"` : 'No specific description provided - create a compelling one based on the role.'}

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
      responseKey = 'skillsTest';
      
      // Extract all available context
      const currentFormData = formData || {};
      const title = currentFormData.title || 'Unknown Role';
      const skills = currentFormData.skills || '';
      const experienceLevel = currentFormData.experienceLevel || 'intermediate';
      const employmentType = currentFormData.employmentType || 'full-time';
      const companyName = currentFormData.companyName || 'the company';
      
      // Company context from website analysis
      let companyContext = '';
      if (websiteAnalysisData) {
        companyContext = `
**COMPANY CONTEXT (from website analysis):**
- Company: ${websiteAnalysisData.companyName || companyName}
- Industry: ${websiteAnalysisData.industry || 'Not specified'}
- Company Size: ${websiteAnalysisData.companySize || 'Not specified'}
- Tech Stack: ${websiteAnalysisData.techStack || 'Not specified'}
- Culture: ${websiteAnalysisData.culture || 'Not specified'}
- Products/Services: ${websiteAnalysisData.products || 'Not specified'}`;
      }

      prompt = `You are an expert skills assessment designer. Create ONE comprehensive, integrated project challenge for a ${title} position that can be completed in 60-90 minutes and demonstrates multiple key competencies.

**ROLE CONTEXT:**
- Job Title: ${title}
- Experience Level: ${experienceLevel}
- Employment Type: ${employmentType}
- Required Skills: ${skills}
- Company: ${companyName}

${companyContext}

**JOB DESCRIPTION CONTEXT:**
${existingJobPost}

**CRITICAL TITLE REQUIREMENTS:**
1. **TITLE MUST BE SHORT**: Maximum 10 words, preferably 5-8 words
2. **TITLE FORMAT**: "Action + Object" (e.g., "Build Customer Dashboard", "Design Landing Page", "Create Marketing Campaign")
3. **NO DETAILED INSTRUCTIONS IN TITLE**: The title should only describe WHAT they're creating, not HOW
4. **EXAMPLES OF GOOD TITLES**:
   - "Build Analytics Dashboard"
   - "Create Marketing Video"
   - "Design User Interface"
   - "Develop API Integration"
   - "Plan Content Strategy"

**CRITICAL INSTRUCTION FORMATTING REQUIREMENTS:**
1. **USE PROPER MARKDOWN FORMATTING**: Structure instructions with clear headers, numbered steps, and bullet points
2. **INCLUDE THESE SECTIONS**: Overview, Steps, Deliverables, Evaluation Criteria
3. **USE BOLD HEADERS**: Mark section headers with **bold** formatting
4. **NUMBER THE STEPS**: Use numbered lists for sequential tasks
5. **BULLET POINTS**: Use bullet points for requirements and deliverables
6. **PROPER LINE BREAKS**: Include line breaks between sections for readability

**INSTRUCTION FORMATTING EXAMPLE:**
\`\`\`
## Overview
Brief description of what they're creating and why it matters for the role.

## Steps
1. **Research Phase (20 minutes)**
   - Research current trends in the industry
   - Analyze competitor examples
   - Identify key requirements

2. **Planning Phase (15 minutes)**
   - Create a project outline
   - Define scope and priorities
   - Set clear objectives

3. **Execution Phase (45 minutes)**
   - Implement the main deliverable
   - Focus on core functionality
   - Apply best practices

## Deliverables
- Primary deliverable in specified format
- Supporting documentation (if needed)
- Brief explanation of approach

## Evaluation Criteria
- **Quality**: Technical execution and attention to detail
- **Creativity**: Original thinking and innovative approach
- **Relevance**: How well it addresses the business need
\`\`\`

**CRITICAL DESIGN PRINCIPLES:**
1. **SINGLE INTEGRATED PROJECT**: Create ONE cohesive task, not multiple separate challenges
2. **TIME-BOUNDED**: Must be completable in 60-90 minutes maximum
3. **MULTI-SKILL DEMONSTRATION**: The single task should naturally require multiple skills from the job requirements
4. **REALISTIC WORK SCENARIO**: Mirror actual work they'd do at ${companyName}
5. **CLEAR SCOPE BOUNDARIES**: Prevent over-engineering with specific deliverable requirements
6. **WELL-FORMATTED INSTRUCTIONS**: Use the formatting example above as a template

**COMPANY INTEGRATION:**
${websiteAnalysisData ? `
- Create a task directly relevant to ${websiteAnalysisData.companyName}'s business: ${websiteAnalysisData.products}
- Incorporate their industry context: ${websiteAnalysisData.industry}
- Reference relevant tools from their tech stack: ${websiteAnalysisData.techStack}
- Align with company culture: ${websiteAnalysisData.culture}` : `
- Create a task that reflects real work at ${companyName}
- Use specific business scenarios relevant to their industry
- Reference the skills they actually need: ${skills}`}

**REQUIRED JSON RESPONSE FORMAT:**
Return a JSON object with this exact structure:

{
  "skillsTest": {
    "questions": [
      {
        "title": "SHORT, descriptive title (5-10 words max, e.g., 'Build Customer Analytics Dashboard')",
        "question": "Brief project overview that summarizes the challenge in 1-2 sentences",
        "type": "choose appropriate type based on deliverable (portfolio_link, pdf_upload, file_upload, video_upload, etc.)",
        "candidateInstructions": "PROPERLY FORMATTED instructions using the markdown structure shown above. Must include: ## Overview, ## Steps (numbered with bold headers), ## Deliverables (bullet points), ## Evaluation Criteria (bold headers). Use line breaks between sections. Minimum 250 words.",
        "evaluationGuidelines": "Detailed criteria for evaluating this integrated project across multiple skill dimensions with specific examples",
        "scoringCriteria": "Clear explanation of what constitutes good vs. excellent submissions with specific examples",
        "required": true,
        "timeLimit": 90,
        "characterLimit": null,
        "allowedFileTypes": ["appropriate file types for deliverable"],
        "maxFileSize": 25
      }
    ],
    "maxQuestions": 1,
    "estimatedCompletionTime": 75,
    "instructions": "Complete this integrated project to demonstrate your qualifications for the ${title} role at ${companyName}. Focus on quality over perfection - this should take no more than 90 minutes to complete."
  }
}

**CRITICAL REMINDER**: 
- The "title" field MUST be short (10 words maximum)
- The "candidateInstructions" field MUST use proper Markdown formatting with the structure shown above
- Include clear sections with bold headers, numbered steps, and bullet points
- Ensure proper line breaks between sections for readability

Create an integrated project that candidates will find engaging, realistic, and directly relevant to the actual work they'll do at ${companyName}.`;

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
            content: type === 'skills-test' 
              ? 'You are an expert skills assessment designer. Create ONE comprehensive, integrated project that demonstrates multiple skills within a realistic 60-90 minute timeframe. CRITICAL: Titles must be SHORT (maximum 10 words). CRITICAL: candidateInstructions must use proper Markdown formatting with clear sections, bold headers, numbered steps, and bullet points. ALWAYS return valid JSON in the exact format specified.'
              : 'You are an expert HR professional who creates job postings. CRITICAL RULE: NEVER include application instructions, email addresses, or "How to Apply" sections in job postings. Job postings must end with the exact call-to-action specified in the prompt and NOTHING ELSE. Candidates apply through the platform, not via email. Pay close attention to the writing tone requirements and adjust your language style accordingly.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: type === 'skills-test' ? 2000 : 1500
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

    // For enhanced skills-test, parse the JSON response
    if (type === 'skills-test') {
      try {
        // Try to extract JSON from the response
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const skillsTestData = JSON.parse(jsonMatch[0]);
          console.log('Parsed integrated skills project:', skillsTestData);
          
          return new Response(
            JSON.stringify({ skillsTest: skillsTestData.skillsTest }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('No JSON found in skills test response');
        }
      } catch (parseError) {
        console.error('Error parsing skills test JSON:', parseError);
        // Fallback to simple question parsing
        const lines = generatedContent.split('\n').filter(line => line.trim().length > 0);
        const questions = lines
          .filter(line => line.match(/^\d+\./))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(q => q.length > 0);
        
        console.log('Fallback parsed questions:', questions);
        
        return new Response(
          JSON.stringify({ questions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
