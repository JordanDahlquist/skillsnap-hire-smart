import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EdenAIResponse {
  extracted_data: Array<{
    personal_infos?: {
      name?: { value?: string };
      address?: { value?: string };
      phone?: { value?: string };
      mail?: { value?: string };
    };
    work_experience?: Array<{
      title?: string;
      company?: string;
      location?: string;
      start_date?: string;
      end_date?: string;
      description?: string;
    }>;
    education?: Array<{
      title?: string;
      establishment?: string;
      location?: string;
      start_date?: string;
      end_date?: string;
      description?: string;
    }>;
    skills?: Array<{
      name?: string;
    }>;
    languages?: Array<{
      name?: string;
      level?: string;
    }>;
  }>;
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

    const edenApiKey = Deno.env.get('EDEN_AI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!edenApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    console.log('Parsing resume with Eden AI:', resumeUrl);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the resume file from Supabase Storage
    const fileName = resumeUrl.split('/').pop();
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('application-files')
      .download(fileName);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    console.log('File downloaded, sending to Eden AI...');

    // Convert blob to form data for Eden AI
    const formData = new FormData();
    formData.append('file', fileData, fileName);
    formData.append('providers', 'microsoft,google,affinda'); // Use multiple providers for better accuracy
    formData.append('fallback_providers', 'amazon,ibm');

    // Send to Eden AI Resume Parser API
    const edenResponse = await fetch('https://api.edenai.run/v2/ocr/resume_parser', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${edenApiKey}`,
      },
      body: formData,
    });

    if (!edenResponse.ok) {
      const errorText = await edenResponse.text();
      throw new Error(`Eden AI API error: ${errorText}`);
    }

    const edenData: EdenAIResponse = await edenResponse.json();
    console.log('Eden AI response received');

    // Extract data from the first provider result
    const extractedData = edenData.extracted_data?.[0];
    
    if (!extractedData) {
      throw new Error('No data extracted from resume');
    }

    // Map Eden AI response to our schema
    const personalInfo = {
      name: extractedData.personal_infos?.name?.value || '',
      email: extractedData.personal_infos?.mail?.value || '',
      phone: extractedData.personal_infos?.phone?.value || '',
      location: extractedData.personal_infos?.address?.value || '',
    };

    const workExperience = extractedData.work_experience?.map(exp => ({
      company: exp.company || '',
      position: exp.title || '',
      startDate: exp.start_date || '',
      endDate: exp.end_date || 'Present',
      description: exp.description || '',
    })) || [];

    const education = extractedData.education?.map(edu => ({
      institution: edu.establishment || '',
      degree: edu.title || '',
      graduationDate: edu.end_date || '',
      description: edu.description || '',
    })) || [];

    const skills = extractedData.skills?.map(skill => skill.name || '').filter(Boolean) || [];
    const languages = extractedData.languages?.map(lang => `${lang.name} (${lang.level})`).filter(Boolean) || [];

    // Calculate total experience
    const totalExperience = workExperience.length > 0 
      ? `${workExperience.length} position${workExperience.length > 1 ? 's' : ''}`
      : 'No experience listed';

    // Generate a professional summary
    const summary = generateProfessionalSummary({
      personalInfo,
      workExperience,
      education,
      skills,
      languages,
    });

    const parsedData = {
      personalInfo,
      workExperience,
      education,
      skills: [...skills, ...languages],
      summary,
      totalExperience,
    };

    console.log('Successfully parsed resume with Eden AI');

    return new Response(JSON.stringify({
      parsedData,
      resumeSummary: summary,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-resume-eden function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to parse resume with Eden AI'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateProfessionalSummary(data: any): string {
  const { personalInfo, workExperience, education, skills } = data;
  
  let summary = '';
  
  if (personalInfo.name) {
    summary += `${personalInfo.name} is `;
  }
  
  if (workExperience.length > 0) {
    const latestJob = workExperience[0];
    summary += `a ${latestJob.position}`;
    if (latestJob.company) {
      summary += ` at ${latestJob.company}`;
    }
    summary += ` with ${workExperience.length} position${workExperience.length > 1 ? 's' : ''} of experience. `;
  }
  
  if (education.length > 0) {
    const latestEdu = education[0];
    summary += `They hold ${latestEdu.degree}`;
    if (latestEdu.institution) {
      summary += ` from ${latestEdu.institution}`;
    }
    summary += '. ';
  }
  
  if (skills.length > 0) {
    summary += `Key skills include: ${skills.slice(0, 5).join(', ')}.`;
  }
  
  return summary.trim() || 'Professional with relevant experience and qualifications.';
}