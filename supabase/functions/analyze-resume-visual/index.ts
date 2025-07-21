
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  summary: string;
  totalExperience: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeUrl } = await req.json();
    
    if (!resumeUrl) {
      throw new Error('Resume URL is required');
    }

    console.log('Analyzing resume at URL:', resumeUrl);

    // Create Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Extract filename from URL - handle both full URLs and relative paths
    let fileName: string;
    if (resumeUrl.includes('/storage/v1/object/public/application-files/')) {
      fileName = resumeUrl.split('/').pop() || '';
    } else if (resumeUrl.startsWith('http')) {
      fileName = resumeUrl.split('/').pop() || '';
    } else {
      // Assume it's already a filename
      fileName = resumeUrl;
    }

    console.log('Downloading file:', fileName);

    // Download the PDF file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('application-files')
      .download(fileName);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error(`Failed to download resume: ${downloadError.message}`);
    }

    // Convert file to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log('File converted to base64, size:', base64File.length);

    // Analyze the PDF with OpenAI Vision API
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
            content: `You are an expert resume parser. Analyze the provided resume document and extract structured information. 

Return the information in this exact JSON format:
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
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "summary": "Professional summary or objective statement",
  "totalExperience": "X years"
}

If any information is not found, use empty string or empty array as appropriate. Be thorough and extract as much relevant information as possible.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this resume and extract all the information according to the format specified.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64File}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('No response from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('OpenAI response:', content);

    // Parse the JSON response
    let parsedData: ParsedResumeData;
    try {
      // Try to extract JSON if it's wrapped in markdown
      const jsonMatch = content.match(/```json\n?(.*?)\n?```/s) || content.match(/\{.*\}/s);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from AI analysis');
    }

    // Validate the response structure
    if (!parsedData.personalInfo || !parsedData.workExperience || !parsedData.education) {
      console.error('AI analysis missing required fields:', parsedData);
      throw new Error('AI analysis response missing required fields');
    }

    console.log('Successfully parsed resume data:', {
      name: parsedData.personalInfo.name,
      experienceCount: parsedData.workExperience.length,
      educationCount: parsedData.education.length,
      skillsCount: parsedData.skills.length
    });

    return new Response(JSON.stringify({ parsedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack?.substring(0, 500)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
