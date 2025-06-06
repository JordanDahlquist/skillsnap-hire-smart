
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
    const { resumeText } = await req.json();

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
            content: `You are a resume parser. Extract structured information from the resume text and return it in the exact JSON format below. If any information is not found, use null.

Return JSON in this exact format:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State/Country"
  },
  "workExperience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "description": "Brief description of role and achievements"
    }
  ],
  "education": [
    {
      "institution": "School/University Name",
      "degree": "Degree Type and Field",
      "graduationDate": "MM/YYYY",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": [
    "Skill 1", "Skill 2", "Skill 3"
  ],
  "summary": "Professional summary or objective statement",
  "totalExperience": "X years"
}`
          },
          {
            role: 'user',
            content: `Parse this resume and extract the information:\n\n${resumeText}`
          }
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const parsedData = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ parsedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
