
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    if (!edenApiKey) {
      throw new Error('Missing EDEN_AI_API_KEY environment variable');
    }

    console.log('Parsing resume with Eden AI:', resumeUrl);

    // Use JSON payload with file_url as shown in Eden AI example
    const jsonPayload = {
      providers: "affinda",
      fallback_providers: "klippa",
      file_url: resumeUrl
    };

    // Send to Eden AI Resume Parser API
    const edenResponse = await fetch('https://api.edenai.run/v2/ocr/resume_parser', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${edenApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonPayload),
    });

    if (!edenResponse.ok) {
      const errorText = await edenResponse.text();
      console.error('Eden AI API error:', errorText);
      throw new Error(`Eden AI API error: ${errorText}`);
    }

    const edenData = await edenResponse.json();
    console.log('Eden AI response received:', JSON.stringify(edenData, null, 2));

    // Extract data from the primary provider (affinda) first
    let dataToUse = null;
    
    if (edenData.affinda?.extracted_data) {
      console.log('Using primary provider (affinda) data');
      dataToUse = edenData.affinda.extracted_data;
    } else if (edenData.klippa?.extracted_data) {
      console.log('Using fallback provider (klippa) data');
      dataToUse = edenData.klippa.extracted_data;
    }
    
    if (!dataToUse) {
      console.error('No extracted data found in response:', edenData);
      throw new Error('No data extracted from resume by any provider');
    }

    console.log('Data to use:', JSON.stringify(dataToUse, null, 2));

    // Map Eden AI response to our schema with proper null checks
    const parsedData = {
      personalInfo: {
        name: dataToUse.personal_infos?.name?.value || '',
        email: dataToUse.personal_infos?.mail?.value || '',
        phone: dataToUse.personal_infos?.phone?.value || '',
        location: dataToUse.personal_infos?.address?.value || '',
      },
      workExperience: Array.isArray(dataToUse.work_experience) 
        ? dataToUse.work_experience.map(exp => ({
            company: exp?.company || '',
            position: exp?.title || '',
            startDate: exp?.start_date || '',
            endDate: exp?.end_date || 'Present',
            description: exp?.description || '',
          }))
        : [],
      education: Array.isArray(dataToUse.education)
        ? dataToUse.education.map(edu => ({
            institution: edu?.establishment || '',
            degree: edu?.title || '',
            graduationDate: edu?.end_date || '',
            description: edu?.description || '',
          }))
        : [],
      skills: Array.isArray(dataToUse.skills)
        ? dataToUse.skills.map(skill => skill?.name || '').filter(Boolean)
        : [],
    };

    console.log('Parsed data:', JSON.stringify(parsedData, null, 2));

    // Generate a professional summary
    const summary = generateProfessionalSummary(parsedData);

    // Calculate experience level based on work history
    const totalYearsExperience = calculateTotalExperience(parsedData.workExperience);
    
    // Generate AI rating based on experience and skills
    const aiRating = calculateAIRating(parsedData, totalYearsExperience);

    return new Response(JSON.stringify({
      parsedData,
      aiRating,
      summary
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
    summary += `. `;
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

function calculateTotalExperience(workExperience: any[]): number {
  let totalYears = 0;
  
  workExperience.forEach(exp => {
    const startYear = exp.startDate ? parseInt(exp.startDate.split('-')[0]) : null;
    const endYear = exp.endDate && exp.endDate !== 'Present' 
      ? parseInt(exp.endDate.split('-')[0])
      : new Date().getFullYear();
      
    if (startYear && endYear) {
      totalYears += endYear - startYear;
    }
  });
  
  return totalYears;
}

function calculateAIRating(parsedData: any, yearsExperience: number): number {
  let score = 0;
  
  // Experience points (max 1 point)
  score += Math.min(yearsExperience / 10, 1);
  
  // Skills points (max 1 point)
  const skillsCount = parsedData.skills.length;
  score += Math.min(skillsCount / 10, 1);
  
  // Education points (max 0.5 points)
  if (parsedData.education.length > 0) {
    score += 0.5;
  }
  
  // Scale to 3-point system
  return Math.max(1, Math.min(3, Math.round(score * 3)));
}
