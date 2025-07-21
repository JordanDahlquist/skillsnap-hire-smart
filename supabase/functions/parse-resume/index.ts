
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
    
    if (!resumeText || resumeText.length < 10) {
      throw new Error('No valid resume text provided');
    }
    
    console.log(`Processing resume text of length: ${resumeText.length}`);

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
            content: `You are a resume parser. Extract structured information from the resume text and return it in valid JSON format only. No markdown, no explanations, just the JSON.

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
}

If information is missing, use empty strings for strings, empty arrays for arrays, null for optional fields.`
          },
          {
            role: 'user',
            content: `Parse this resume text and extract the information in JSON format:\n\n${resumeText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    const content = data.choices[0].message.content.trim();
    console.log('OpenAI response:', content);
    
    // Try to extract JSON from the response
    let parsedData;
    try {
      // First try direct parsing
      parsedData = JSON.parse(content);
    } catch (error) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || 
                       content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        try {
          parsedData = JSON.parse(jsonString);
        } catch (innerError) {
          console.error('Failed to parse extracted JSON:', innerError);
          console.error('JSON string was:', jsonString);
          throw new Error('Could not extract valid JSON from AI response');
        }
      } else {
        console.error('No JSON found in AI response:', content);
        throw new Error('AI response does not contain valid JSON');
      }
    }

    // Validate the parsed data structure
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Parsed data is not a valid object');
    }

    // Ensure required structure exists
    if (!parsedData.personalInfo) {
      parsedData.personalInfo = {
        name: '',
        email: '',
        phone: '',
        location: ''
      };
    }

    if (!Array.isArray(parsedData.workExperience)) {
      parsedData.workExperience = [];
    }

    if (!Array.isArray(parsedData.education)) {
      parsedData.education = [];
    }

    if (!Array.isArray(parsedData.skills)) {
      parsedData.skills = [];
    }

    if (!parsedData.summary) {
      parsedData.summary = '';
    }

    if (!parsedData.totalExperience) {
      parsedData.totalExperience = '';
    }

    console.log('Successfully parsed resume data');
    return new Response(JSON.stringify({ parsedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Resume parsing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
