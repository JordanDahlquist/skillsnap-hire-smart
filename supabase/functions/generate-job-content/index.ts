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
  
  cleaned = cleaned.replace(/\*\*How to Apply\*\*[\s\S]*$/i, '');
  cleaned = cleaned.replace(/\*\*Application Process\*\*[\s\S]*$/i, '');
  cleaned = cleaned.replace(/\*\*Apply Now\*\*[\s\S]*$/i, '');
  
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
  
  cleaned = cleaned.trim();
  if (!cleaned.endsWith('Ready to make an impact? Click the apply button below!')) {
    cleaned = cleaned.replace(/ready to[\s\S]*$/i, '');
    cleaned = cleaned.replace(/interested\?[\s\S]*$/i, '');
    cleaned = cleaned.replace(/apply now[\s\S]*$/i, '');
    cleaned = cleaned.trim();  
    cleaned += '\n\nReady to make an impact? Click the apply button below!';
  }
  
  return cleaned;
};

// Function to build tone instructions based on slider values
const buildToneInstructions = (writingTone: any) => {
  if (!writingTone) return '';
  
  const { professional = 3, friendly = 3, excited = 3 } = writingTone;
  
  console.log('Building tone instructions with values:', { professional, friendly, excited });
  
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

// ENHANCED function to build compelling company context from comprehensive website analysis
const buildCompanyContext = (websiteAnalysisData: any) => {
  if (!websiteAnalysisData) return '';
  
  console.log('Building enhanced company context from analysis data:', {
    companyName: websiteAnalysisData.companyName,
    hasAchievements: websiteAnalysisData.achievements?.length > 0,
    hasUniquePoints: websiteAnalysisData.uniqueSellingPoints?.length > 0,
    hasClients: websiteAnalysisData.notableClients?.length > 0,
    hasNews: websiteAnalysisData.recentNews?.length > 0
  });
  
  let context = `
**COMPREHENSIVE COMPANY INTELLIGENCE FOR COMPELLING JOB POST CREATION:**

**Company Profile:**
- Company: ${websiteAnalysisData.companyName || 'Unknown'}
- Industry: ${websiteAnalysisData.industry || 'Not specified'}
- Size: ${websiteAnalysisData.companySize || 'Not specified'}
- Location: ${websiteAnalysisData.location || 'Not specified'}
- Market Position: ${websiteAnalysisData.marketPosition || 'Not specified'}

**WHAT MAKES ${websiteAnalysisData.companyName?.toUpperCase() || 'THIS COMPANY'} ABSOLUTELY INCREDIBLE:**`;

  if (websiteAnalysisData.achievements && websiteAnalysisData.achievements.length > 0) {
    context += `
🏆 **Awards & Recognition**: ${websiteAnalysisData.achievements.join(', ')}`;
  }

  if (websiteAnalysisData.growthMetrics && websiteAnalysisData.growthMetrics.length > 0) {
    context += `
📈 **Impressive Growth & Metrics**: ${websiteAnalysisData.growthMetrics.join(', ')}`;
  }

  if (websiteAnalysisData.notableClients && websiteAnalysisData.notableClients.length > 0) {
    context += `
🤝 **Elite Clients & Partners**: ${websiteAnalysisData.notableClients.join(', ')}`;
  }

  if (websiteAnalysisData.recentNews && websiteAnalysisData.recentNews.length > 0) {
    context += `
🚀 **Recent Exciting Developments**: ${websiteAnalysisData.recentNews.join(', ')}`;
  }

  if (websiteAnalysisData.uniqueSellingPoints && websiteAnalysisData.uniqueSellingPoints.length > 0) {
    context += `
⭐ **What Makes Them Industry Leaders**: ${websiteAnalysisData.uniqueSellingPoints.join(', ')}`;
  }

  if (websiteAnalysisData.socialProof && websiteAnalysisData.socialProof.length > 0) {
    context += `
💬 **Client Success & Social Proof**: ${websiteAnalysisData.socialProof.join(', ')}`;
  }

  if (websiteAnalysisData.leadershipHighlights && websiteAnalysisData.leadershipHighlights.length > 0) {
    context += `
👥 **Leadership Excellence**: ${websiteAnalysisData.leadershipHighlights.join(', ')}`;
  }

  context += `

**Company Culture & Work Environment:**
${websiteAnalysisData.culture || 'Dynamic and innovative culture focused on excellence'}

**Products/Services Excellence:**
${websiteAnalysisData.products || 'Cutting-edge solutions and services'}

**Technology Stack & Tools:**
${websiteAnalysisData.technologies ? websiteAnalysisData.technologies.join(', ') : 'Modern technology stack'}

**MISSION-CRITICAL INSTRUCTION FOR JOB POST CREATION:**
Use this rich intelligence to create an IRRESISTIBLY COMPELLING job summary and "About ${websiteAnalysisData.companyName || 'Company'}" section that:

1. **LEADS WITH THE MOST EXCITING FACTS**: Start with awards, achievements, growth metrics, or impressive clients
2. **CREATES GENUINE EXCITEMENT**: Use specific accomplishments that make candidates think "Wow, I want to be part of this!"
3. **SHOWS INDUSTRY LEADERSHIP**: Highlight what makes them unique, innovative, or market-leading
4. **BUILDS CREDIBILITY**: Use concrete proof points like awards, notable clients, or growth metrics
5. **CONVEYS MOMENTUM**: Show they're growing, winning, and doing exciting things

DO NOT create generic company descriptions. Instead, weave these compelling details into engaging, persuasive content that makes top talent excited to apply. Every sentence should add genuine value and excitement about joining this incredible company.

**EXCITEMENT LEVEL TARGET**: Make candidates feel like they're applying to join something truly special and prestigious.`;

  console.log('Enhanced company context built successfully');
  return context;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, jobData, formData, existingJobPost, existingSkillsTest, websiteAnalysisData, writingTone } = await req.json();
    console.log('Received request type:', type);
    console.log('Enhanced website analysis data available:', !!websiteAnalysisData);
    console.log('Company analysis preview:', websiteAnalysisData ? {
      companyName: websiteAnalysisData.companyName,
      achievementsCount: websiteAnalysisData.achievements?.length || 0,
      uniquePointsCount: websiteAnalysisData.uniqueSellingPoints?.length || 0
    } : 'No analysis data');

    let prompt = '';
    let responseKey = '';

    if (type === 'job-post') {
      responseKey = 'jobPost';
      
      const workArrangementDisplay = jobData.locationType === 'on-site' ? 'On-site' : 
                                   jobData.locationType === 'remote' ? 'Remote' : 
                                   jobData.locationType === 'hybrid' ? 'Hybrid' : jobData.locationType;
      
      const locationParts = [];
      if (jobData.location) locationParts.push(jobData.location);
      if (jobData.city) locationParts.push(jobData.city);
      if (jobData.state) locationParts.push(jobData.state);
      if (jobData.country) locationParts.push(jobData.country);
      const fullLocation = locationParts.length > 0 ? locationParts.join(', ') : 'Location to be determined';
      
      const isProjectBased = jobData.employmentType === 'project';
      
      const toneInstructions = buildToneInstructions(writingTone);
      const companyContext = buildCompanyContext(websiteAnalysisData);
      
      prompt = `CRITICAL WARNING: You MUST NOT include any application instructions, email addresses, or "How to Apply" sections. The job posting MUST end with the exact phrase specified below and NOTHING ELSE.

**MISSION**: Create a job posting so compelling and exciting that top talent will be genuinely thrilled to apply. Use the rich company intelligence provided to showcase what makes this company absolutely incredible to work for.

${toneInstructions}

${companyContext}

**CORE JOB DETAILS:**
- Company: ${jobData.companyName}
- Job Title: ${jobData.title}
- Employment Type: ${jobData.employmentType} (CRITICAL: Must be clearly stated throughout)
- Experience Level: ${jobData.experienceLevel}
- Work Arrangement: ${workArrangementDisplay} (CRITICAL: Must be prominently featured)
- Location: ${fullLocation}

**JOB DESCRIPTION:**
${jobData.jobOverview ? `User-provided overview: "${jobData.jobOverview}"` : 'Create a compelling description based on the role and company context.'}

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

**CRITICAL CONTENT CREATION REQUIREMENTS:**

1. **IRRESISTIBLE JOB SUMMARY**: Create an opening that makes candidates think "I MUST work here!" by:
   - Leading with the most exciting company achievements, awards, or growth metrics
   - Highlighting what makes this role at THIS specific company incredibly special
   - Using specific proof points that build genuine excitement
   - Clearly stating employment type (${jobData.employmentType}) and work arrangement (${workArrangementDisplay})
   - Making it feel like joining a winning, prestigious, innovative team

2. **SHOW-STOPPING "About ${jobData.companyName}" SECTION**: Create content that makes candidates excited by:
   - STARTING with the most impressive facts (awards, achievements, notable clients, growth)
   - Showcasing what makes them industry leaders or innovators
   - Including specific accomplishments that build credibility and excitement
   - Highlighting company culture elements that top talent values
   - Using concrete details rather than generic corporate speak
   - Making it clear this is a prestigious place to work

3. **COMPELLING KEY RESPONSIBILITIES**: Make the role sound impactful, growth-oriented, and meaningful

4. **OPPORTUNITY-FOCUSED REQUIREMENTS**: Present requirements as exciting challenges and growth opportunities

5. **ATTRACTIVE "What We Offer"**: Highlight the best aspects of compensation, benefits, and career growth

**FORBIDDEN CONTENT - NEVER INCLUDE:**
- Generic, boring company descriptions
- "How to Apply" sections or application instructions
- Email addresses or contact information
- Copying website content verbatim without making it compelling

**MANDATORY STRUCTURE:**
- **Job Summary** (exciting opening with work arrangement and employment type)
- **About ${jobData.companyName}** (compelling company section using rich intelligence)
- **Key Responsibilities** (impactful role description)
- **Requirements** (presented as exciting opportunities)
- **What We Offer** (attractive compensation and career growth)

**MANDATORY ENDING:**
End immediately after "What We Offer" with EXACTLY: "Ready to make an impact? Click the apply button below!"

**SUCCESS CRITERIA**: This job posting should make qualified candidates genuinely excited about the opportunity and proud to potentially join ${jobData.companyName}. Use every compelling detail from the company analysis to create something truly special.`;

    } else if (type === 'skills-test') {
      responseKey = 'skillsTest';
      
      const currentFormData = formData || {};
      const title = currentFormData.title || 'Unknown Role';
      const skills = currentFormData.skills || '';
      const experienceLevel = currentFormData.experienceLevel || 'intermediate';
      const employmentType = currentFormData.employmentType || 'full-time';
      const companyName = currentFormData.companyName || 'the company';
      
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

**MANDATORY SUBMISSION INSTRUCTIONS - MUST INCLUDE THESE EXACT GUIDELINES:**

ALL skills assessments MUST include these submission guidelines in the candidateInstructions:

"**How to Submit Your Work:**

1. **Upload to Cloud Storage**: Upload your completed work to Google Drive, Dropbox, OneDrive, or similar platform
2. **Set Public Access**: Make sure the sharing settings allow 'Anyone with the link' to view your work
3. **Copy the Link**: Copy the shareable public link to your work
4. **Paste Below**: Paste the link in the submission field below
5. **Test the Link**: Before submitting, test your link in an incognito/private browser window to ensure it works

**Accepted Formats**: Documents, presentations, images, videos, code repositories, design files, or any format relevant to your work.

**Important**: Your submission link must be publicly accessible for our review team to evaluate your work."

**CRITICAL MARKDOWN FORMATTING REQUIREMENTS - FOLLOW THESE EXACTLY:**
THE candidateInstructions FIELD **MUST** USE PROPER MARKDOWN FORMATTING. THIS IS NON-NEGOTIABLE.

**REQUIRED MARKDOWN STRUCTURE FOR candidateInstructions:**
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

## How to Submit Your Work
**Upload to Cloud Storage**: Upload your completed work to Google Drive, Dropbox, OneDrive, or similar platform

**Set Public Access**: Make sure the sharing settings allow 'Anyone with the link' to view your work

**Copy the Link**: Copy the shareable public link to your work

**Paste Below**: Paste the link in the submission field below

**Test the Link**: Before submitting, test your link in an incognito/private browser window to ensure it works

**Accepted Formats**: Documents, presentations, images, videos, code repositories, design files, or any format relevant to your work.

**Important**: Your submission link must be publicly accessible for our review team to evaluate your work.

## Evaluation Criteria
- **Quality**: Technical execution and attention to detail
- **Creativity**: Original thinking and innovative approach
- **Relevance**: How well it addresses the business need
\`\`\`

**MANDATORY FORMATTING RULES:**
1. **USE ## HEADERS**: Each major section MUST start with ## (Overview, Steps, Deliverables, How to Submit Your Work, Evaluation Criteria)
2. **NUMBERED STEPS**: Use numbered lists (1., 2., 3.) for sequential tasks
3. **BOLD SUB-HEADERS**: Use **bold text** for phase names and criteria names
4. **BULLET POINTS**: Use - for lists within sections
5. **LINE BREAKS**: Include blank lines between sections for readability
6. **NO WALL OF TEXT**: Break everything into structured sections with clear headers

**CRITICAL DESIGN PRINCIPLES:**
1. **SINGLE INTEGRATED PROJECT**: Create ONE cohesive task, not multiple separate challenges
2. **TIME-BOUNDED**: Must be completable in 60-90 minutes maximum
3. **MULTI-SKILL DEMONSTRATION**: The single task should naturally require multiple skills from the job requirements
4. **REALISTIC WORK SCENARIO**: Mirror actual work they'd do at ${companyName}
5. **CLEAR SCOPE BOUNDARIES**: Prevent over-engineering with specific deliverable requirements
6. **PROPERLY FORMATTED INSTRUCTIONS**: candidateInstructions MUST follow the exact markdown template above
7. **CLEAR SUBMISSION PROCESS**: MUST include detailed submission instructions about sharing public links

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
        "type": "url_submission",
        "candidateInstructions": "PROPERLY FORMATTED instructions using the EXACT markdown structure shown above. Must include: ## Overview, ## Steps (numbered with **bold** phase headers), ## Deliverables (bullet points), ## How to Submit Your Work (with detailed submission instructions), ## Evaluation Criteria (**bold** criteria names). Use line breaks between sections. Minimum 300 words. MUST BE STRUCTURED WITH HEADERS.",
        "evaluationGuidelines": "Detailed criteria for evaluating this integrated project across multiple skill dimensions with specific examples",
        "scoringCriteria": "Clear explanation of what constitutes good vs. excellent submissions with specific examples",
        "required": true,
        "timeLimit": 90,
        "characterLimit": null,
        "allowedFileTypes": [],
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
- The "candidateInstructions" field MUST use the exact Markdown structure shown above with ## headers, numbered steps, **bold** text, bullet points, proper line breaks, and DETAILED submission instructions
- NO WALL OF TEXT allowed in candidateInstructions - it must be properly structured with clear headers
- MUST include comprehensive submission guidelines about sharing public links
- If you don't follow the formatting template exactly, the instructions will be unreadable

Create an integrated project that candidates will find engaging, realistic, and directly relevant to the actual work they'll do at ${companyName}.`;

    } else if (type === 'interview-questions') {
      responseKey = 'questions';
      
      let companyContext = '';
      if (websiteAnalysisData) {
        companyContext = `
**COMPANY INTELLIGENCE:**
- Company: ${websiteAnalysisData.companyName || jobData.companyName}
- Industry: ${websiteAnalysisData.industry || 'Not specified'}
- Company Size: ${websiteAnalysisData.companySize || 'Not specified'}
- Culture: ${websiteAnalysisData.culture || 'Not specified'}
- Products/Services: ${websiteAnalysisData.products || 'Not specified'}
- Technologies: ${websiteAnalysisData.technologies ? websiteAnalysisData.technologies.join(', ') : 'Not specified'}
- Notable Achievements: ${websiteAnalysisData.achievements ? websiteAnalysisData.achievements.join(', ') : 'Not specified'}
- Unique Selling Points: ${websiteAnalysisData.uniqueSellingPoints ? websiteAnalysisData.uniqueSellingPoints.join(', ') : 'Not specified'}

`;
      }
      
      prompt = `Create 3-5 hard-hitting interview questions for video responses based on this job posting and company context:

${companyContext}

**JOB POSTING:**

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
7. Leverage company-specific context (achievements, culture, industry position)

**FORMATTING REQUIREMENTS:**
Each question MUST include substantial content - no blank or minimal questions allowed.

**QUALITY STANDARDS:**
- Each question must be fully developed with specific, relevant content
- Questions should be challenging but fair
- Must be answerable within a 3-15 minute video response
- Use company intelligence to make questions more specific and relevant
- Ensure all questions have substantial, meaningful content - NO blank or incomplete questions

Format each question clearly with context and what you're looking for in the response. These will be answered via video submission, so make them engaging and thought-provoking.

Example format:
**Question [Number]: [Descriptive Title]**
[Detailed question text with specific context about the role, company, or industry challenges]
*What we're looking for: [Brief explanation of ideal response]*

Format each question clearly with context and what you're looking for in the response. These will be answered via video submission, so make them engaging and thought-provoking.

Example format:
**Question 1: [Title]**
[Question text with context]
*What we're looking for: [Brief explanation of ideal response]*

Make the questions challenging but fair, and ensure they can be answered well within a 3-15 minute video response.`;

    } else {
      throw new Error('Invalid request type');
    }

    console.log('Enhanced prompt for', type, 'generation prepared');

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
              ? 'You are an expert skills assessment designer. Create ONE comprehensive, integrated project that demonstrates multiple skills within a realistic 60-90 minute timeframe. CRITICAL: Titles must be SHORT (maximum 10 words). CRITICAL: candidateInstructions must use proper Markdown formatting with ## headers, numbered steps with **bold** phase names, bullet points, clear line breaks between sections, and DETAILED submission instructions about sharing public links. NO WALL OF TEXT ALLOWED - instructions must be properly structured and scannable with clear headers. MUST include comprehensive submission guidelines. ALWAYS return valid JSON in the exact format specified.'
              : type === 'job-post' 
                ? 'You are an elite job posting creator who makes companies irresistible to top talent. Your mission is to transform company intelligence into compelling, exciting job postings that make qualified candidates genuinely thrilled to apply. CRITICAL RULE: NEVER include application instructions, email addresses, or "How to Apply" sections. Job postings must end with the exact call-to-action specified and NOTHING ELSE. Use the rich company analysis data to create specific, engaging content that highlights achievements, awards, growth, and what makes the company amazing. Pay attention to writing tone requirements and make every job posting sound exciting and prestigious using factual company accomplishments.'
                : 'You are an expert HR professional who creates job postings. CRITICAL RULE: NEVER include application instructions, email addresses, or "How to Apply" sections in job postings. Job postings must end with the exact call-to-action specified in the prompt and NOTHING ELSE. Candidates apply through the platform, not via email. Pay close attention to the writing tone requirements and adjust your language style accordingly.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: type === 'job-post' ? 0.7 : 0.8,
        max_tokens: type === 'skills-test' ? 2000 : type === 'job-post' ? 2200 : 1500
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
      console.log('Enhanced job post generated and cleaned, preview:', generatedContent.substring(0, 200) + '...');
    }

    if (type === 'skills-test') {
      try {
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
    console.error('Error in enhanced generate-job-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
